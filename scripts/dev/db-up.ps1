<#
.SYNOPSIS  Levanta Oracle local, aplica las migraciones y ejecuta la prueba de humo del esquema.
.EXAMPLE   .\scripts\dev\db-up.ps1
#>
[CmdletBinding()]
param([switch]$SkipTests)
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

function Invoke-Checked([string]$what, [scriptblock]$cmd) {
    & $cmd
    if ($LASTEXITCODE -ne 0) { throw "Fallo en: $what (código $LASTEXITCODE)" }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker no está instalado o no está en el PATH. Abra Docker Desktop.' }
Invoke-Checked 'docker info' { docker info *> $null }

if (-not (Test-Path (Join-Path $root '.env'))) {
    Copy-Item (Join-Path $root '.env.example') (Join-Path $root '.env')
    Write-Host 'Se ha creado .env desde .env.example. Cambie las claves si lo desea y vuelva a ejecutar.' -ForegroundColor Yellow
}

Write-Host '1/3 Levantando Oracle (la primera vez tarda unos minutos)...' -ForegroundColor Cyan
Invoke-Checked 'docker compose up oracle' { docker compose up -d --wait oracle }

Write-Host '2/3 Aplicando migraciones Flyway...' -ForegroundColor Cyan
Invoke-Checked 'flyway migrate' { docker compose run --rm migrate }

if (-not $SkipTests) {
    Write-Host '3/3 Prueba de humo del esquema...' -ForegroundColor Cyan
    & (Join-Path $PSScriptRoot 'db-test.ps1')
}
Write-Host 'Base de datos lista en localhost:1521/FREEPDB1 (usuario de despliegue FITONA_OWNER).' -ForegroundColor Green
