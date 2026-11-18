<#
.SYNOPSIS  Detiene Oracle local conservando los datos.
#>
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..\..'))
docker compose stop oracle
