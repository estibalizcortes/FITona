# Despliegue gratuito y sin tarjeta: Render + Neon

> Estado real (27-nov-2026): el código está adaptado y **probado en local** (backend 45/45 contra Oracle **y** contra PostgreSQL, E2E 25/25 con frontend y backend en dominios distintos y CORS, backend bajo 512 MB y 0,1 CPU). **No probado**: el despliegue real en Render/Neon (no hay cuentas desde aquí) ni la construcción de `Dockerfile.render` dentro de Render (en este entorno `docker build` falla por el certificado del proxy; el mismo jar sí se ejecutó). Si algo falla al desplegar, pega el registro del servicio y se corrige.

## 0. Compatibilidad: ¿Neon sirve? Sí, tras portar la base de datos
La app estaba escrita para Oracle. Ahora **admite las dos bases**: Oracle (local, por defecto, no cambia nada) y PostgreSQL (Neon). Esquema y catálogo portados a `database/migrations-pg` (72 tablas, 13 disparadores, 576 alimentos). El tipo de base se fija **al compilar** (`DB_KIND`), por eso hay un Dockerfile propio para Render.

## 1. Neon (base de datos) — casi todo lo hace un script
Tu proyecto: Free, branch `production`, región AWS Europe West 2 (Londres). Desde el contenedor de desarrollo **no se puede** llegar a Neon (el proxy bloquea su API y las bases por TCP), así que lo ejecutas tú en tu PC con Docker Desktop:

1. En Neon abre tu proyecto → botón **Connect** → Branch `production`, Database `neondb`, Role `neondb_owner` y **desactiva «Connection pooling»**. De la cadena que aparece (`postgresql://usuario:clave@HOST/neondb?...`) necesitas el **HOST** (lo que va entre `@` y `/`, del tipo `ep-xxxx.eu-west-2.aws.neon.tech`, **sin** `-pooler`) y la **clave** de `neondb_owner`.
2. En PowerShell:
   ```powershell
   cd C:\Users\corte\Documents\FITona
   git fetch origin claude-v1
   git checkout claude-v1
   git pull origin claude-v1
   Copy-Item .env.neon.example .env.neon
   notepad .env.neon      # rellena NEON_HOST y NEON_OWNER_PASSWORD (el resto ya está)
   .\scripts\dev\db-migrate-neon.ps1 -TestBackend
   ```
   El script, en orden: (1) se conecta y **crea el rol `fitona_app`** con clave aleatoria (solo LOGIN: sin superusuario, sin crear bases ni roles, sin DDL; la clave se guarda en `.env.neon`, ignorado por Git); (2) **aplica las migraciones** (72 tablas, 13 disparadores, 576 alimentos) y los permisos mínimos de `fitona_app` (leer/escribir datos); (3) **verifica**: nº de tablas, disparadores, alimentos, categorías, versión, flags del rol y que `fitona_app` **no puede** crear ni borrar tablas; (4) con `-TestBackend` construye `backend\Dockerfile.render` (el mismo que usará Render), lo arranca contra Neon y comprueba `/q/health/ready` (conexión a la BD), registro, inicio de sesión y catálogo, y borra la cuenta de prueba. Al final imprime las variables de Render con tus valores reales. Es repetible.
3. Si algo marca `FALLO`, copia el resultado completo y envíamelo.

Tamaño: ~14 MB (límite gratuito 0,5 GB). Neon se «duerme» tras unos minutos sin uso y despierta en 1-2 s. Las contraseñas **no** van en la línea de comandos (se pasan por variable de entorno) ni a GitHub.

## 2. Render · backend (Web Service)
| Campo | Valor |
|---|---|
| Language / Runtime | **Docker** |
| Branch | `claude-v1` |
| **Root Directory** | *(vacío: raíz del repositorio)* |
| **Dockerfile Path** | `./backend/Dockerfile.render` |
| Docker Build Context Directory | `.` |
| Region | **Frankfurt (EU Central)** (la más cercana a Londres) |
| Instance Type | **Free** (512 MB, 0,1 CPU) |
| Health Check Path | `/q/health/live` (¡no `/ready`!: `ready` consulta la BD y mantendría Neon despierto gastando horas gratuitas) |
| **Puerto** | No hay que configurarlo: Render inyecta `PORT` (10000) y la app lo usa (`quarkus.http.port=${PORT:8080}`, escucha en `0.0.0.0`) |

**Variables de entorno** (Environment → Add):
| Variable | Valor | Nota |
|---|---|---|
| `FITONA_DB_URL` | `jdbc:postgresql://TU_HOST_NEON/neondb?sslmode=require` | host directo (sin `-pooler`); el script lo imprime ya montado |
| `FITONA_DB_USER` | `fitona_app` | |
| `FITONA_DB_PASSWORD` | `NEON_APP_PASSWORD` de tu `.env.neon` | secreto: solo en el panel de Render, nunca en GitHub |
| `FITONA_DB_INIT_SQL` | `SELECT 1` | desactiva el `ALTER SESSION` de Oracle |
| `FITONA_DB_POOL_MAX` | `3` | pocas conexiones: memoria y límites de Neon |
| `FITONA_REGISTRATION_OPEN` | `true` | pon `false` cuando hayas creado tus cuentas: nadie más podrá registrarse |
| `FITONA_CORS_ENABLED` | `true` | |
| `FITONA_CORS_ORIGINS` | `https://TU-FRONTEND.onrender.com` | URL exacta del sitio estático, sin `/` final |
| `JAVA_OPTS` | `-Xms32m -Xmx256m -XX:MaxMetaspaceSize=128m -Xss512k -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError` | memoria |
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

## 5. Memoria, CPU y seguridad del hash (medido en local con los límites de Render)
| Medida | Resultado |
|---|---|
| Arranque en frío del backend | ~25 s |
| Memoria tras arrancar y usar | 100–140 MiB de 512 |
| Hash de contraseña con **600.000 iteraciones (valor recomendado, sin tocar)** | ~3 s con la JVM calentada; **~19 s la primera vez tras cada arranque** (calentamiento del compilador con 0,1 CPU) |
Con la sesión de 90 días, el inicio de sesión es poco frecuente, así que no se debilita el hash para ganar velocidad. Si algún día fuese inaceptable, `FITONA_PBKDF2_ITERATIONS` puede bajarse, pero **nunca por debajo de 100.000** (suelo en el código) y el log avisa. Lo que ahorra memoria: heap máx. 256 MB, recolector serie, pool de 3 conexiones y **sin migraciones en Render** (se hacen desde tu PC).

### Revisión de seguridad de la autenticación (27-nov-2026)
Correcto: PBKDF2-HMAC-SHA256, sal aleatoria de 16 bytes, 256 bits de salida, comparación en tiempo constante, tokens de sesión de 256 bits guardados solo como SHA-256, mismo mensaje y tiempo para «correo desconocido» y «contraseña mala», sin contraseñas en logs, longitud máxima 128.
Corregido ahora: suelo de iteraciones 100.000 (antes 10.000) con aviso en el log; el hash se **renueva al iniciar sesión** si tenía menos iteraciones; el contador de intentos ya no crece sin límite con correos inventados; interruptor `FITONA_REGISTRATION_OPEN`; CORS sin `allow-credentials`; aviso en pantalla si la contraseña tiene menos de 8 caracteres.
**Riesgos que quedan (conscientes):** contraseña mínima de 4 caracteres (decisión tuya): con 4 caracteres el hash no protege si se filtrase la base; la defensa real es el bloqueo tras 5 fallos (en memoria: se reinicia si el servicio se duerme o reinicia, y puede usarse para bloquear a otra persona), por eso conviene **cerrar el registro** y usar contraseñas de 8+. El registro revela si un correo ya existe (409). El token vive en el almacenamiento del navegador (sin cookies). No hay recuperación de contraseña ni verificación de correo.

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
