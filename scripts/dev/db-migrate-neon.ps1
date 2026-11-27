<#
.SYNOPSIS  Prepara tu base de Neon para FITona: crea el rol sin privilegios, aplica las migraciones, verifica todo y (opcional) prueba el backend.
.DESCRIPTION  Lee .env.neon (copia de .env.neon.example, fuera de Git). Solo necesitas Docker Desktop abierto.
              Es seguro repetirlo: crea lo que falte y no toca los datos existentes.
              1) crea (o actualiza la clave de) el rol fitona_app: solo LOGIN, sin superusuario, sin crear bases ni roles, sin DDL
              2) aplica database\migrations-pg con Flyway (esquema + catálogo + permisos de fitona_app)
              3) verifica tablas, disparadores, datos, flags del rol y que fitona_app NO puede alterar el esquema
              4) con -TestBackend: construye backend\Dockerfile.render, lo arranca contra Neon y comprueba salud, registro e inicio de sesión
.EXAMPLE   .\scripts\dev\db-migrate-neon.ps1
.EXAMPLE   .\scripts\dev\db-migrate-neon.ps1 -TestBackend
#>
[CmdletBinding()]
param([switch]$TestBackend)
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker no está instalado o no está en el PATH. Abra Docker Desktop.' }
# Ejecuta un programa externo SIN que su stderr se convierta en excepción: Windows PowerShell 5.1 con $ErrorActionPreference = 'Stop'
# trata como error terminante cualquier línea de stderr redirigida (p. ej. «Unable to find image» al descargar, o un fallo esperado).
# Devuelve el código de salida y la salida (stdout + stderr) como texto.
function Invoke-Native([scriptblock]$Command) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $lines = & $Command 2>&1 | ForEach-Object { "$_" }
        $code = $LASTEXITCODE
    } finally { $ErrorActionPreference = $prev }
    return [pscustomobject]@{ Code = $code; Out = (($lines | Out-String).Trim()) }
}
$info = Invoke-Native { docker info }
if ($info.Code -ne 0) { throw 'Docker Desktop no está en marcha. Ábralo y espere a que diga Engine running.' }

$envFile = Join-Path $root '.env.neon'
if (-not (Test-Path $envFile)) { throw 'Falta .env.neon: copie .env.neon.example a .env.neon y rellénelo con los datos de Neon.' }
function Read-Cfg {
    $c = @{}
    Get-Content $envFile | Where-Object { $_ -match '^\s*[A-Z_]+=' } | ForEach-Object { $k, $v = $_ -split '=', 2; $c[$k.Trim()] = $v.Trim() }
    return $c
}
$cfg = Read-Cfg
foreach ($k in 'NEON_HOST', 'NEON_DB', 'NEON_OWNER_USER', 'NEON_OWNER_PASSWORD') { if (-not $cfg[$k]) { throw "Falta $k en .env.neon" } }
if ($cfg.NEON_HOST -match 'pooler') { throw 'NEON_HOST es el de conexión con pool (lleva -pooler). Usa el host DIRECTO: en Neon, Connect, desactiva «Connection pooling».' }
if ($cfg.NEON_HOST -match '[/@:]') { throw 'NEON_HOST debe ser solo el nombre del servidor (p. ej. ep-xxx.eu-west-2.aws.neon.tech), sin usuario, clave ni postgresql://' }

# Clave del rol de la aplicación: se genera una vez (aleatoria, solo letras y números) y se guarda en .env.neon
if (-not $cfg.NEON_APP_PASSWORD) {
    $chars = [char[]]('abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789')
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $pw = -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })
    Add-Content -Path $envFile -Value "NEON_APP_PASSWORD=$pw"
    $cfg = Read-Cfg
    Write-Host 'Se generó la clave de fitona_app y se guardó en .env.neon (NEON_APP_PASSWORD).' -ForegroundColor Yellow
}
if ($cfg.NEON_APP_PASSWORD -notmatch '^[A-Za-z0-9]{16,}$') { throw 'NEON_APP_PASSWORD debe tener solo letras y números (16 o más). Bórrela de .env.neon para que se genere otra.' }

$psqlImage = if ($env:PSQL_IMAGE) { $env:PSQL_IMAGE } else { 'postgres:17-alpine' }
$flywayImage = if ($env:FLYWAY_IMAGE) { $env:FLYWAY_IMAGE } else { 'flyway/flyway:13.12.2' }

# Ejecuta SQL con psql (en un contenedor). La clave viaja por variable de entorno, no por la línea de comandos.
function Invoke-Psql([string]$user, [string]$password, [string]$sql, [switch]$AllowFailure) {
    $env:PGPASSWORD = $password
    try {
        $res = Invoke-Native { docker run --rm -e PGPASSWORD $psqlImage psql "host=$($cfg.NEON_HOST) dbname=$($cfg.NEON_DB) user=$user sslmode=require connect_timeout=30" -v ON_ERROR_STOP=1 -At -F '|' -c $sql }
        $code = $res.Code
        $out = $res.Out
    } finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
    # psql puede repetir la sentencia en sus errores (p. ej. CREATE ROLE ... PASSWORD): se enmascaran las claves antes de mostrar nada.
    if ($code -ne 0 -and -not $AllowFailure) {
        foreach ($s in @($cfg.NEON_OWNER_PASSWORD, $cfg.NEON_APP_PASSWORD)) { if ($s) { $out = $out.Replace($s, '********') } }
        throw "psql falló: $out"
    }
    return [pscustomobject]@{ Code = $code; Out = ($out -join "`n").Trim() }
}
$failures = 0
function Check([string]$what, [bool]$ok, [string]$detail = '') {
    if ($ok) { Write-Host "  OK     $what $detail" -ForegroundColor Green } else { Write-Host "  FALLO  $what $detail" -ForegroundColor Red; $script:failures++ }
}

Write-Host '1/4 Conectando a Neon y creando el rol fitona_app (si la base estaba dormida tarda unos segundos)...' -ForegroundColor Cyan
$pull = Invoke-Native { docker pull -q $psqlImage }
if ($pull.Code -ne 0) { throw "No se pudo descargar la imagen ${psqlImage}: $($pull.Out)" }
$state = Invoke-Psql $cfg.NEON_OWNER_USER $cfg.NEON_OWNER_PASSWORD 'SELECT current_user, version()'
Write-Host "  Conectado: $($state.Out)"
$roleSql = @'
DO $do$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fitona_app') THEN
        CREATE ROLE fitona_app LOGIN PASSWORD '__PW__' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    ELSE
        ALTER ROLE fitona_app LOGIN PASSWORD '__PW__' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    END IF;
END
$do$;
'@
$null = Invoke-Psql $cfg.NEON_OWNER_USER $cfg.NEON_OWNER_PASSWORD ($roleSql -replace '__PW__', $cfg.NEON_APP_PASSWORD)
Write-Host '  Rol fitona_app listo (sin superusuario, sin crear bases ni roles).'

Write-Host '2/4 Aplicando migraciones PostgreSQL (esquema, catálogo y permisos)...' -ForegroundColor Cyan
$pull = Invoke-Native { docker pull -q $flywayImage }
if ($pull.Code -ne 0) { throw "No se pudo descargar la imagen ${flywayImage}: $($pull.Out)" }
$env:FLYWAY_PASSWORD = $cfg.NEON_OWNER_PASSWORD   # por variable de entorno: no aparece en la línea de comandos
docker run --rm -e FLYWAY_PASSWORD -v "$($root.Path)\database\migrations-pg:/flyway/sql:ro" $flywayImage `
    "-url=jdbc:postgresql://$($cfg.NEON_HOST)/$($cfg.NEON_DB)?sslmode=require" `
    "-user=$($cfg.NEON_OWNER_USER)" -connectRetries=10 migrate
$flywayCode = $LASTEXITCODE
Remove-Item Env:FLYWAY_PASSWORD -ErrorAction SilentlyContinue
if ($flywayCode -ne 0) { throw "Flyway falló (código $flywayCode)" }

Write-Host '3/4 Verificando tablas, disparadores, datos y permisos...' -ForegroundColor Cyan
$q = @'
SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'),
       (SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal),
       (SELECT count(*) FROM foods WHERE owner_user_id IS NULL AND status = 'PUBLISHED'),
       (SELECT count(*) FROM food_variants v JOIN foods f ON f.id = v.food_id WHERE f.status = 'PUBLISHED' AND v.current_profile_id IS NOT NULL),
       (SELECT count(*) FROM food_categories),
       (SELECT max(version) FROM flyway_schema_history WHERE success)
'@
$r = (Invoke-Psql $cfg.NEON_OWNER_USER $cfg.NEON_OWNER_PASSWORD $q).Out -split '\|'
Check 'tablas (72 de FITona + historial de Flyway)' ($r[0] -eq '73') "[$($r[0])]"
Check 'disparadores (13)' ($r[1] -eq '13') "[$($r[1])]"
Check 'alimentos del catálogo (576)' ($r[2] -eq '576') "[$($r[2])]"
Check 'alimentos con datos nutricionales (572)' ($r[3] -eq '572') "[$($r[3])]"
Check 'categorías (33)' ($r[4] -eq '33') "[$($r[4])]"
Check 'versión de migración (014)' ($r[5] -eq '014') "[$($r[5])]"
$flags = (Invoke-Psql $cfg.NEON_OWNER_USER $cfg.NEON_OWNER_PASSWORD "SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls, pg_has_role('fitona_app','neon_superuser','member') FROM pg_roles WHERE rolname = 'fitona_app'").Out
Check 'rol fitona_app sin privilegios especiales (superuser, createdb, createrole, bypassrls, neon_superuser = todo f)' ($flags -eq 'f|f|f|f|f') "[$flags]"
$app = Invoke-Psql 'fitona_app' $cfg.NEON_APP_PASSWORD 'SELECT count(*) FROM foods' -AllowFailure
Check 'fitona_app puede leer datos' ($app.Code -eq 0 -and $app.Out -eq '576') "[$($app.Out)]"
# Pruebas negativas dentro de una transacción con ROLLBACK: si por error los permisos lo permitieran, no queda ningún cambio.
$ddl = Invoke-Psql 'fitona_app' $cfg.NEON_APP_PASSWORD 'BEGIN; CREATE TABLE zz_prueba_ddl (x int); ROLLBACK;' -AllowFailure
Check 'fitona_app NO puede crear tablas' ($ddl.Code -ne 0)
$drop = Invoke-Psql 'fitona_app' $cfg.NEON_APP_PASSWORD 'BEGIN; DROP TABLE foods; ROLLBACK;' -AllowFailure
Check 'fitona_app NO puede borrar tablas' ($drop.Code -ne 0)

if ($TestBackend) {
    Write-Host '4/4 Probando el backend contra Neon (construye la imagen de Render: tarda varios minutos la primera vez)...' -ForegroundColor Cyan
    docker build -f backend/Dockerfile.render -t fitona-backend:render .
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo construir backend\Dockerfile.render' }
    $null = Invoke-Native { docker rm -f fitona-backend-neon }
    $env:FITONA_DB_PASSWORD = $cfg.NEON_APP_PASSWORD
    docker run -d --name fitona-backend-neon -p 127.0.0.1:10000:10000 -e PORT=10000 -e FITONA_DB_KIND=postgresql `
        -e "FITONA_DB_URL=jdbc:postgresql://$($cfg.NEON_HOST)/$($cfg.NEON_DB)?sslmode=require" -e FITONA_DB_USER=fitona_app `
        -e FITONA_DB_PASSWORD -e "FITONA_DB_INIT_SQL=SELECT 1" -e FITONA_DB_POOL_MAX=3 fitona-backend:render | Out-Null
    Remove-Item Env:FITONA_DB_PASSWORD -ErrorAction SilentlyContinue
    $ready = $false
    for ($i = 0; $i -lt 60 -and -not $ready; $i++) {
        Start-Sleep -Seconds 2
        try { $h = Invoke-RestMethod 'http://127.0.0.1:10000/q/health/ready' -TimeoutSec 5; $ready = ($h.status -eq 'UP') } catch { }
    }
    Check 'el backend arranca y su conexión a Neon está UP (/q/health/ready)' $ready
    if ($ready) {
        $mail = "prueba$(Get-Random)@example.com"
        try {
            $reg = Invoke-RestMethod -Method Post 'http://127.0.0.1:10000/api/v1/auth/register' -ContentType 'application/json' -TimeoutSec 120 `
                -Body (@{ email = $mail; password = 'prueba-1234'; adult = $true; healthConsent = $true } | ConvertTo-Json)
            Check 'registro de una cuenta de prueba' ([bool]$reg.token)
            $login = Invoke-RestMethod -Method Post 'http://127.0.0.1:10000/api/v1/auth/login' -ContentType 'application/json' -TimeoutSec 120 `
                -Body (@{ email = $mail; password = 'prueba-1234' } | ConvertTo-Json)
            Check 'inicio de sesión' ([bool]$login.token)
            $foods = Invoke-RestMethod 'http://127.0.0.1:10000/api/v1/foods?q=aguacate' -Headers @{ Authorization = "Bearer $($login.token)" }
            Check 'el catálogo responde desde Neon (aguacate)' (@($foods).Count -ge 1)
            Invoke-RestMethod -Method Delete 'http://127.0.0.1:10000/api/v1/me' -Headers @{ Authorization = "Bearer $($login.token)" } | Out-Null
            Write-Host '  (la cuenta de prueba se ha borrado)'
        } catch { Check 'recorrido de prueba del backend' $false $_.Exception.Message }
    } else { Write-Host (Invoke-Native { docker logs --tail 30 fitona-backend-neon }).Out }
    $null = Invoke-Native { docker rm -f fitona-backend-neon }
} else {
    Write-Host '4/4 Prueba del backend omitida (usa -TestBackend para construir y probar la imagen de Render contra Neon).' -ForegroundColor DarkGray
}

Write-Host ''
if ($failures -gt 0) { Write-Host "Hay $failures comprobaciones fallidas: copia este resultado y envíamelo." -ForegroundColor Red; exit 1 }
Write-Host 'Todo correcto. Variables para el servicio del BACKEND en Render:' -ForegroundColor Green
Write-Host "  FITONA_DB_URL             = jdbc:postgresql://$($cfg.NEON_HOST)/$($cfg.NEON_DB)?sslmode=require"
Write-Host "  FITONA_DB_USER            = fitona_app"
Write-Host "  FITONA_DB_PASSWORD        = (el valor de NEON_APP_PASSWORD en .env.neon: ábrelo con notepad .env.neon)"
Write-Host "  FITONA_DB_INIT_SQL        = SELECT 1"
Write-Host "  FITONA_DB_POOL_MAX        = 3"
Write-Host "Resto de variables y campos de Render: docs\despliegue-render-neon.md"
