<#
.SYNOPSIS  BORRA la base de datos local (volumen incluido) y la recrea desde cero. Solo desarrollo.
#>
[CmdletBinding()]
param([switch]$Force)
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root
if (-not $Force) {
    $answer = Read-Host 'Esto elimina TODOS los datos de la base de datos local. Escriba SI para continuar'
    if ($answer -ne 'SI') { Write-Host 'Cancelado.'; return }
}
docker compose down -v
if ($LASTEXITCODE -ne 0) { throw 'docker compose down falló.' }
& (Join-Path $PSScriptRoot 'db-up.ps1')
