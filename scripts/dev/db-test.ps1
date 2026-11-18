<#
.SYNOPSIS  Ejecuta database/tests/schema_smoke_test.sql contra el Oracle local (deja la BD intacta: ROLLBACK).
#>
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root
$envFile = Join-Path $root '.env'
if (-not (Test-Path $envFile)) { throw 'Falta .env. Ejecute primero scripts\dev\db-up.ps1' }
$ownerPwd = (Select-String -Path $envFile -Pattern '^FITONA_OWNER_PASSWORD=(.+)$').Matches.Groups[1].Value.Trim()

docker cp (Join-Path $root 'database\tests\schema_smoke_test.sql') fitona-oracle:/tmp/schema_smoke_test.sql
if ($LASTEXITCODE -ne 0) { throw 'No se pudo copiar la prueba al contenedor (¿está fitona-oracle en marcha?).' }
docker exec fitona-oracle bash -c "sqlplus -s FITONA_OWNER/'$ownerPwd'@//localhost/FREEPDB1 @/tmp/schema_smoke_test.sql"
if ($LASTEXITCODE -ne 0) { throw "La prueba de humo del esquema ha fallado (código $LASTEXITCODE)." }
Write-Host 'Prueba de humo superada.' -ForegroundColor Green
