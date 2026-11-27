# Migraciones PostgreSQL (despliegue en Neon)

Pista paralela a `database/migrations` (Oracle, desarrollo local). **Oracle sigue siendo la fuente de verdad.**

- `V001–V009`, `V014`: se **generan** con `python3 database/tools/oracle_to_pg.py` a partir de las de Oracle.
- `V011–V013` (catálogo, nutrientes, medidas): se generan con `python3 database/tools/seed_to_pg.py` a partir de las semillas Oracle.
- `V010` (catálogo de arranque antiguo, ya sustituido por V011) **no existe** en PostgreSQL.
- `R__app_role_grants.sql`: escrita a mano (permisos del rol `fitona_app`).

Al añadir una migración Oracle nueva: regenerar con los dos scripts, aplicar a un PostgreSQL limpio y pasar los tests del backend con
`FITONA_DB_KIND=postgresql` (ver `docs/despliegue-render-neon.md`). **No editar a mano los archivos generados.**
