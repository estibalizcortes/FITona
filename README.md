# FITona

Aplicación de alimentación, nutrición y vida cotidiana: **tu menú se adapta a tu vida**. Organiza despensa → plan → compra → diario → sobras; los números son opcionales y no hay culpa.

> **Estado:** v0.1 en construcción. **Funciona de extremo a extremo en navegador** (crear alimento → registrar en una comida → calcular → guardar → volver a consultar; recetas; modos de uso), probado en el entorno de desarrollo remoto. **Sin autenticación real** y **catálogo compartido vacío**. Detalle honesto en [docs/estado-implementacion.md](docs/estado-implementacion.md).

## Arranque rápido (Windows 11 + PowerShell + Docker Desktop)

```powershell
cd C:\Users\corte\Documents\FITona
.\scripts\dev\app-up.ps1      # Oracle + migraciones + backend + frontend
# abrir http://localhost:4200
```

## Documentación

| Entregable | Archivo |
|---|---|
| A · Investigación competitiva | [docs/producto/A-investigacion-competitiva.md](docs/producto/A-investigacion-competitiva.md) |
| B · Visión de producto | [docs/producto/B-vision-producto.md](docs/producto/B-vision-producto.md) |
| C · Funcionalidades | [docs/producto/C-funcionalidades.md](docs/producto/C-funcionalidades.md) |
| D · Experiencia de usuario | [docs/ux/D-experiencia-usuario.md](docs/ux/D-experiencia-usuario.md) |
| E · Arquitectura técnica | [docs/tecnico/E-arquitectura.md](docs/tecnico/E-arquitectura.md) |
| F · Modelo de datos | [docs/tecnico/F-modelo-datos.md](docs/tecnico/F-modelo-datos.md) |
| G · Plan de desarrollo | [docs/plan/G-plan-desarrollo.md](docs/plan/G-plan-desarrollo.md) |
| H · Costes | [docs/producto/H-costes.md](docs/producto/H-costes.md) |
| I · Riesgos | [docs/producto/I-riesgos.md](docs/producto/I-riesgos.md) |
| **J · Propuesta final (empezar aquí)** | [docs/producto/J-propuesta-final.md](docs/producto/J-propuesta-final.md) |
| **Estado real de la implementación** | [docs/estado-implementacion.md](docs/estado-implementacion.md) |
| Decisiones (ADR) | [docs/adr/](docs/adr/README.md) |
| Investigaciones de apoyo | [docs/investigacion/](docs/investigacion/) |

## Base de datos local (Windows 11 + PowerShell + Docker Desktop)

Requisitos: Docker Desktop (WSL2) en marcha.

```powershell
cd C:\Users\corte\Documents\FITona
.\scripts\dev\db-up.ps1        # levanta Oracle, aplica migraciones y ejecuta la prueba de humo
.\scripts\dev\db-test.ps1      # repite solo la prueba de humo
.\scripts\dev\db-down.ps1      # detiene Oracle conservando datos
.\scripts\dev\db-reset.ps1     # BORRA los datos locales y recrea desde cero
```

La primera ejecución crea `.env` desde `.env.example` (cambie las claves). Conexión: `localhost:1521/FREEPDB1`, usuario de despliegue `FITONA_OWNER`, usuario de aplicación `FITONA_APP`.

> Los scripts `.ps1` se han escrito pero **no se han podido ejecutar** en el entorno de desarrollo remoto (sin PowerShell). La misma secuencia con `docker compose` sí se ejecutó y pasó (ver `docs/tecnico/F-modelo-datos.md`).

## Estructura

```
backend/       motor nutricional (Java puro) y API Quarkus
frontend/      aplicación Angular 22 y recorrido E2E (Playwright)
database/      migraciones Flyway, aprovisionamiento local y pruebas del esquema
docs/          entregables, ADR e investigaciones
scripts/dev/   scripts PowerShell de desarrollo
docker-compose.yml, .env.example
```

## Reglas de trabajo

Ver [CLAUDE.md](CLAUDE.md).
