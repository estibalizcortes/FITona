# Despliegue gratuito y sin tarjeta: Render + Neon

> Estado real (27-nov-2026): el código está adaptado y **probado en local** (backend 45/45 contra Oracle **y** contra PostgreSQL, E2E 25/25 con frontend y backend en dominios distintos y CORS, backend bajo 512 MB y 0,1 CPU). **No probado**: el despliegue real en Render/Neon (no hay cuentas desde aquí) ni la construcción de `Dockerfile.render` dentro de Render (en este entorno `docker build` falla por el certificado del proxy; el mismo jar sí se ejecutó). Si algo falla al desplegar, pega el registro del servicio y se corrige.

## 0. Compatibilidad: ¿Neon sirve? Sí, tras portar la base de datos
La app estaba escrita para Oracle. Ahora **admite las dos bases**: Oracle (local, por defecto, no cambia nada) y PostgreSQL (Neon). Esquema y catálogo portados a `database/migrations-pg` (72 tablas, 13 disparadores, 576 alimentos). El tipo de base se fija **al compilar** (`DB_KIND`), por eso hay un Dockerfile propio para Render.

## 1. Neon (base de datos)
1. neon.com → crea cuenta (sin tarjeta) → *New project*, región **EU (Frankfurt)**, Postgres 17. Anota `host` (el de conexión **directa**, sin `-pooler`), nombre de la base (`neondb`) y el usuario `neondb_owner` con su contraseña.
2. SQL Editor de Neon, ejecuta (cambia la contraseña por una tuya, solo letras y números):
   ```sql
   CREATE ROLE fitona_app LOGIN PASSWORD 'PON_AQUI_UNA_CLAVE_LARGA';
   ```
   Es el rol con el que se conecta la app: **solo lectura/escritura de datos, sin permisos para cambiar el esquema** (invariante del proyecto).
3. En tu PC (PowerShell, Docker Desktop abierto):
   ```powershell
   cd C:\Users\corte\Documents\FITona
   Copy-Item .env.neon.example .env.neon
   notepad .env.neon      # rellena NEON_HOST, NEON_DB, NEON_OWNER_USER, NEON_OWNER_PASSWORD
   .\scripts\dev\db-migrate-neon.ps1
   ```
   Crea las tablas, carga el catálogo y da permisos a `fitona_app`. `.env.neon` está en `.gitignore`: **no se sube a GitHub**.
4. Tamaño: ~14 MB (límite gratuito 0,5 GB). Neon se «duerme» tras unos minutos sin uso y despierta en 1-2 s.

## 2. Render · backend (Web Service)
| Campo | Valor |
|---|---|
| Language / Runtime | **Docker** |
| Branch | `claude-v1` |
| **Root Directory** | *(vacío: raíz del repositorio)* |
| **Dockerfile Path** | `./backend/Dockerfile.render` |
| Docker Build Context Directory | `.` |
| Instance Type | **Free** (512 MB, 0,1 CPU) |
| Health Check Path | `/q/health/live` (¡no `/ready`!: `ready` consulta la BD y mantendría Neon despierto gastando horas gratuitas) |
| **Puerto** | No hay que configurarlo: Render inyecta `PORT` (10000) y la app lo usa (`quarkus.http.port=${PORT:8080}`, escucha en `0.0.0.0`) |

**Variables de entorno** (Environment → Add):
| Variable | Valor | Nota |
|---|---|---|
| `FITONA_DB_URL` | `jdbc:postgresql://TU_HOST_NEON/neondb?sslmode=require` | host directo |
| `FITONA_DB_USER` | `fitona_app` | |
| `FITONA_DB_PASSWORD` | la clave de `fitona_app` | secreto: solo en el panel de Render |
| `FITONA_DB_INIT_SQL` | `SELECT 1` | desactiva el `ALTER SESSION` de Oracle |
| `FITONA_DB_POOL_MAX` | `3` | pocas conexiones: memoria y límites de Neon |
| `FITONA_PBKDF2_ITERATIONS` | `100000` | ver §5 (con 0,1 CPU, 600000 tarda ~18 s por inicio de sesión) |
| `FITONA_CORS_ENABLED` | `true` | |
| `FITONA_CORS_ORIGINS` | `https://TU-FRONTEND.onrender.com` | URL exacta del sitio estático, sin `/` final |
| `JAVA_OPTS` | `-Xms32m -Xmx256m -XX:MaxMetaspaceSize=128m -Xss512k -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:CICompilerCount=1 -XX:+ExitOnOutOfMemoryError` | memoria |
| **No definir** `FITONA_AUTH_DEV_ENABLED` | | (= false; si no, cualquiera entraría con una cabecera) |

## 3. Render · frontend (Static Site)
| Campo | Valor |
|---|---|
| Branch | `claude-v1` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm ci && npm run build && echo "window.FITONA_CONFIG = { apiBase: '$FITONA_API_URL' };" > dist/frontend/browser/config.js` |
| **Publish Directory** | `dist/frontend/browser` |
| Variable `FITONA_API_URL` | `https://TU-BACKEND.onrender.com` (sin `/` final) |
| Variable `NODE_VERSION` | `22.12.0` |
| Redirects/Rewrites | **Rewrite** `/*` → `/index.html` (la app es de una sola página) |
| Headers | `/config.js` → `Cache-Control: no-cache` |

El `config.js` generado en el build le dice al navegador dónde está la API; el código no lleva ninguna URL fija. (`render.yaml` en la raíz contiene lo mismo como Blueprint, opcional y **no probado**.)

**Orden:** crea primero el backend (apúntate su URL), luego el sitio estático con `FITONA_API_URL`, y por último pon la URL del sitio en `FITONA_CORS_ORIGINS` del backend (se reinicia solo).

## 4. HTTPS, CORS y autenticación
- **HTTPS**: Render lo da gratis y automático en `*.onrender.com`. No hay que configurar certificados.
- **CORS**: el sitio estático y la API están en dominios distintos. El backend acepta **solo** el origen de `FITONA_CORS_ORIGINS` (probado: otro origen → 403) con cabeceras `Authorization` y `Content-Type`.
- **Autenticación**: correo y contraseña; token `Bearer` en cada petición (sin cookies, así que no hay riesgo de CSRF). La contraseña se guarda con PBKDF2 y sal; las sesiones duran 90 días. Mínimo 4 caracteres (decisión tuya): el bloqueo tras 5 intentos fallidos limita la fuerza bruta.

## 5. Memoria y CPU (medido en local con los límites de Render)
| Medida | Resultado |
|---|---|
| Arranque en frío del backend | ~25 s |
| Memoria en uso tras arrancar y usar | 84–102 MiB de 512 (en un recorrido completo, ~225 MiB con heap de 256 MB) |
| Registro / inicio de sesión con 100.000 iteraciones | ~3 s (con 600.000: 18-42 s) |
Lo que ahorra memoria: heap máximo 256 MB, recolector serie, compilador solo C1, pila de hilos pequeña, pool de 3 conexiones, y **no se ejecutan migraciones en Render** (se hacen desde tu PC). `FITONA_PBKDF2_ITERATIONS=100000` baja la robustez del hash frente a la recomendación (600.000): con contraseñas de 4 caracteres el límite real es la contraseña, no el hash.

## 6. Límites del plan gratuito que vas a notar
- **Render se duerme a los 15 min sin visitas**; despertar = ~25 s de arranque (+1-2 s de Neon). La pantalla de entrar avisa si tarda. Un servicio gratuito consume 750 h/mes (suficiente para uno).
- **Neon**: 0,5 GB y horas de cómputo limitadas; por eso la comprobación de salud no toca la BD.
- Los datos de tu Oracle local **no se copian** a Neon: la cuenta empieza vacía (el catálogo sí se carga).
- Copias de seguridad: no automatizadas por la app (Neon conserva un historial corto de restauración; compruébalo en su panel).

## 7. Probar en local el modo PostgreSQL
```powershell
docker run -d --name fitona-pg -e POSTGRES_USER=fitona_owner -e POSTGRES_PASSWORD=pgtest -e POSTGRES_DB=fitona -p 127.0.0.1:5433:5432 postgres:17
docker run --rm --network host -v "${PWD}\database\migrations-pg:/flyway/sql:ro" flyway/flyway:13.12.2 -url=jdbc:postgresql://localhost:5433/fitona -user=fitona_owner -password=pgtest migrate
$env:FITONA_DB_KIND='postgresql'; $env:FITONA_DB_URL='jdbc:postgresql://localhost:5433/fitona'; $env:FITONA_DB_USER='fitona_owner'; $env:FITONA_DB_PASSWORD='pgtest'; $env:FITONA_DB_INIT_SQL='SELECT 1'
cd backend; mvn test
```
