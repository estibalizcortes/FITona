#!/bin/bash
# =============================================================================
# FITona · Aprovisionamiento LOCAL de Oracle (se ejecuta una sola vez al crear
# el contenedor, desde /container-entrypoint-initdb.d de gvenzl/oracle-free).
# Crea el rol de aplicación y el usuario de aplicación con mínimos privilegios.
# El propietario del esquema (FITONA_OWNER) lo crea la propia imagen (APP_USER).
# En producción (Autonomous Database) se ejecuta el equivalente como ADMIN.
# =============================================================================
set -euo pipefail

: "${FITONA_APP_PASSWORD:?Defina FITONA_APP_PASSWORD en el archivo .env}"

sqlplus -s / as sysdba <<SQL
WHENEVER SQLERROR EXIT SQL.SQLCODE
ALTER SESSION SET CONTAINER = FREEPDB1;
CREATE ROLE FITONA_APP_ROLE;
CREATE USER FITONA_APP IDENTIFIED BY "${FITONA_APP_PASSWORD}" DEFAULT TABLESPACE USERS QUOTA 0 ON USERS;
GRANT CREATE SESSION TO FITONA_APP;
GRANT FITONA_APP_ROLE TO FITONA_APP;
ALTER USER FITONA_APP DEFAULT ROLE ALL;
EXIT;
SQL

echo "FITona: rol FITONA_APP_ROLE y usuario FITONA_APP creados en FREEPDB1."
