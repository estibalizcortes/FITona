<#
.SYNOPSIS  Detiene FITona conservando los datos. Con -Purge borra también la base de datos local.
#>
[CmdletBinding()]
param([switch]$Purge)
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
if ($Purge) {
    $answer = Read-Host 'Esto BORRA todos los datos locales de FITona. Escriba SI para continuar'
    if ($answer -ne 'SI') { Write-Host 'Cancelado.'; return }
    docker compose down -v
} else {
    docker compose down
}
