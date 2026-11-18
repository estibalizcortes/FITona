<#
.SYNOPSIS  Construye y levanta FITona completo (Oracle + migraciones + backend + frontend) con Docker.
.EXAMPLE   .\scripts\dev\app-up.ps1
#>
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker no está instalado o no está en el PATH.' }
docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'El motor de Docker no responde. Abra Docker Desktop y espere a que diga "Engine running".' }

if (-not (Test-Path (Join-Path $root '.env'))) {
    Copy-Item (Join-Path $root '.env.example') (Join-Path $root '.env')
    Write-Host 'Se ha creado .env desde .env.example (claves de ejemplo para desarrollo local).' -ForegroundColor Yellow
}

Write-Host 'Construyendo y levantando (la primera vez descarga imágenes y compila: varios minutos)...' -ForegroundColor Cyan
docker compose up -d --build --wait frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Algo ha fallado. Últimos registros:' -ForegroundColor Red
    docker compose logs --tail 40
    throw "docker compose up falló (código $LASTEXITCODE)."
}
$port = 4200
$line = Select-String -Path (Join-Path $root '.env') -Pattern '^WEB_PORT=(\d+)$' -ErrorAction SilentlyContinue
if ($line) { $port = $line.Matches.Groups[1].Value }
Write-Host "FITona está lista: http://localhost:$port" -ForegroundColor Green
Write-Host 'Versión de DESARROLLO: sin cuenta real; cada navegador tiene su propio identificador local.' -ForegroundColor Yellow
