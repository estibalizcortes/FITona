# Base de datos (Oracle)

- `migrations/` — Flyway: `V001`…`V009` (esquema y datos de referencia) y `R__app_role_grants.sql` (permisos, repetible).
- `provisioning/` — crea `FITONA_APP_ROLE` y `FITONA_APP` en el contenedor local. En producción lo hace un administrador.
- `tests/schema_smoke_test.sql` — 19 comprobaciones; termina con `ROLLBACK`.

Uso: ver el README de la raíz (`scripts\dev\db-up.ps1`). Descripción completa del modelo: `docs/tecnico/F-modelo-datos.md`.

Aviso: las claves de `.env.example` son marcadores para desarrollo local. No hay ningún valor nutricional cargado: el catálogo se importa con procedencia y licencia verificadas (v0.1).
