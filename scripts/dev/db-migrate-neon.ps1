<#
.SYNOPSIS  Aplica las migraciones de FITona (PostgreSQL) a tu base de Neon. Solo necesitas Docker Desktop.
.DESCRIPTION  Lee .env.neon (copia de .env.neon.example, fuera de Git) y ejecuta Flyway con database\migrations-pg.
              Es seguro repetirlo: solo aplica lo que falte.
.EXAMPLE   .\scripts\dev\db-migrate-neon.ps1
#>
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker no está instalado o no está en el PATH. Abra Docker Desktop.' }
$envFile = Join-Path $root '.env.neon'
if (-not (Test-Path $envFile)) { throw 'Falta .env.neon: copie .env.neon.example a .env.neon y rellénelo con los datos de Neon.' }
$cfg = @{}
Get-Content $envFile | Where-Object { $_ -match '^\s*[A-Z_]+=' } | ForEach-Object { $k, $v = $_ -split '=', 2; $cfg[$k.Trim()] = $v.Trim() }
foreach ($k in 'NEON_HOST', 'NEON_DB', 'NEON_OWNER_USER', 'NEON_OWNER_PASSWORD') { if (-not $cfg[$k]) { throw "Falta $k en .env.neon" } }
$image = if ($env:FLYWAY_IMAGE) { $env:FLYWAY_IMAGE } else { 'flyway/flyway:13.12.2' }
Write-Host 'Aplicando migraciones en Neon (si la base estaba dormida puede tardar unos segundos)...' -ForegroundColor Cyan
docker run --rm -v "$($root.Path)\database\migrations-pg:/flyway/sql:ro" $image `
    "-url=jdbc:postgresql://$($cfg.NEON_HOST)/$($cfg.NEON_DB)?sslmode=require" `
    "-user=$($cfg.NEON_OWNER_USER)" "-password=$($cfg.NEON_OWNER_PASSWORD)" -connectRetries=10 migrate
if ($LASTEXITCODE -ne 0) { throw "Flyway falló (código $LASTEXITCODE)" }
Write-Host 'Listo: esquema y catálogo cargados en Neon.' -ForegroundColor Green
