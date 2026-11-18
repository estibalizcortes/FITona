# Instrucciones para Claude Code en FITona

Proyecto independiente: no reutilizar convenciones, versiones ni arquitectura de otros repositorios. Idioma de código, identificadores y commits: inglés para identificadores; documentación e interfaz en español de España.

## Qué es
App de alimentación/cocina/compra con números opcionales y filosofía **sin culpa** (sin rachas, semáforos, compensaciones por ejercicio, restricciones automáticas). Ver `docs/producto/J-propuesta-final.md`.

## Reglas de trabajo (de la propietaria)
- **No hacer** commit, push, merge, PR, despliegues ni publicaciones; tampoco reescribir historial. Dejar los cambios en el árbol local y explicar qué debe ejecutar la persona.
- Inspeccionar antes de modificar; incrementos pequeños; ejecutar y verificar las pruebas; no afirmar que algo funciona sin comprobarlo.
- Distinguir siempre: diseñado / implementado / probado / validado con personas.
- Entorno de la propietaria: Windows 11, VS Code, PowerShell, Docker. Dar rutas y comandos PowerShell concretos.
- No pasar de fase sin informar del estado real de la anterior.

## Invariantes del producto (no romper)
1. La IA **propone**; el motor determinista **calcula**; la persona **confirma**. La IA nunca consulta la BD ni escribe sin confirmación.
2. Plan (`PLANNED_*`) y diario (`FOOD_LOG_*`) son independientes.
3. Dato desconocido = `NULL`, nunca 0. Sin dato de alérgeno = desconocido, nunca «libre de».
4. Temperaturas, tiempos y plazos de conservación solo desde datos con fuente; la IA no los inventa.
5. Los registros históricos conservan su instantánea nutricional.
6. Datos de alimentación/actividad = datos de salud (RGPD art. 9): aislamiento por usuario (404 ante recurso ajeno), consentimiento por categoría, sin publicidad.
7. Sin scraping de supermercados; sin Strava en la nube.

## Base de datos
- Migraciones en `database/migrations` (Flyway). **Las publicadas no se editan**: cambios en una `V0NN` nueva. (V001–V009 aún no se han desplegado en ningún entorno, por lo que pueden corregirse mientras sea así.)
- `FITONA_OWNER` despliega; `FITONA_APP` opera sin DDL. Toda FK con índice; `COMMENT` en toda tabla.
- Tras tocar el esquema: `scripts/dev/db-up.ps1` (o `docker compose` equivalente) y `database/tests/schema_smoke_test.sql` deben pasar.
- Modificar un hijo de un agregado sincronizable obliga a actualizar la raíz (`SYNC_SEQ`).

## Versiones fijadas (verificadas 2026-11-18)
Angular 22.2.x con **TypeScript 6.0.x** (no 7), Ionic 9.0.x, Capacitor 8.6.x, Node 24 LTS, Java 25 LTS (21 válida), Quarkus 3.40.x, Flyway 13.12.x. Detalle y salvedades en `docs/tecnico/E-arquitectura.md` §10.

## Secretos
Nunca en el repositorio. `.env` está en `.gitignore`; `.env.example` solo contiene marcadores.
