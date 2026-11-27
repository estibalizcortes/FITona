# Rendimiento: arranque en frío y apertura de FITona

Estado a 27-nov-2026. Distingue **medido** (con la app real, en local con límites equivalentes a Render gratuito) de **no medido** (producción: desde el entorno de desarrollo no hay acceso a Render ni a Neon).

## Qué se ha medido y cómo

Emulación del servicio de Render gratuito: contenedor `eclipse-temurin:21-jre` con `--cpus=0.1 --memory=512m`, mismas opciones de JVM que `Dockerfile.render`, PostgreSQL local. Es una aproximación: Render puede asignar la CPU de otra forma y la imagen se descarga y se crea antes de arrancar.

| Configuración del backend (0,1 CPU, 512 MB) | Quarkus arrancado | Contenedor → responde `/q/health/live` |
|---|---|---|
| Antes (sin ajustes de arranque) | 37,5 s | **45,7 s** |
| + AppCDS (clases precargadas) | 28,6 s | 31,8 s |
| + AppCDS + solo compilador C1 (**actual**) | 16,1 s | **17,9–19,1 s** |

- **Primera petición con base de datos tras arrancar:** ≈1,3 s antes; ≈0,4–0,9 s ahora. Siguientes: 0,1–0,2 s.
- **Memoria:** 93–150 MiB de 512 MiB (JVM con `-Xmx256m`). **No es un problema de memoria ni hay reinicios por falta de ella en las pruebas.**
- **Inicio de sesión / registro (PBKDF2 600 000 iteraciones):** el primero tras arrancar tarda ≈20 s con 0,1 CPU (el código aún no está compilado por la JVM); con C2 los siguientes bajan a ≈2 s, con C1 se quedan en ≈17 s. Decisión: C1, porque el arranque se sufre cada vez que Render despierta y el inicio de sesión casi nunca (la sesión dura 90 días). Para volver a C2: añade `-XX:TieredStopAtLevel=4` a `JAVA_OPTS` en Render. **La seguridad no cambia: siguen 600 000 iteraciones.** Se probó calentar el hash en segundo plano al arrancar y se descartó: compite por la CPU con las primeras peticiones.
- **Frontend (compilación de producción, Chromium, caché vacía):** la interfaz (tarjetas de módulos) es visible a los **~150–170 ms** de abrir (mediana de 5); `Hoy` de Comida tarda ~150 ms tras pulsar con el backend activo; abrir FITona hace 12 peticiones estáticas (~350 kB transferidos, antes del service worker) + 5 a la API (la consulta de estado, la del resumen y sus comprobaciones CORS). Antes de este cambio: 7 a la API.
- **Tamaño de la app:** inicial 314,6 kB (84,2 kB comprimidos) con 25 trozos cargados bajo demanda por pantalla; el service worker los precarga para abrir al instante la siguiente vez.

## Qué causa la espera en producción (análisis)

No he podido reproducir los 6–7 minutos; sí he encontrado causas reales que los **agravan**, y las he corregido:

1. **Arranque de 46 s con 0,1 CPU** (medido). Render tarda además en crear el contenedor. → ahora ≈18 s.
2. **Reintentos sin límite de tiempo en el frontend (causa probable de los minutos):** cada lectura se reintentaba 3 veces y **ninguna petición tenía tiempo máximo**. Si Render retiene o devuelve 502/503/504 durante el arranque, 4 intentos de un minuto + esperas = 5-7 minutos con el mensaje «despertando». Ahora: 40 s máximo por intento, 2 reintentos, y un aviso que **no bloquea la app** y ofrece «Reintentar» y «Volver al inicio». Es una hipótesis coherente con los datos, **no está confirmada**: depende de cómo responde Render durante el arranque.
3. **El aviso «despertando» salía con cualquier petición lenta** (también un inicio de sesión de 20 s o una consulta lenta de la base de datos), aunque el servidor estuviera despierto. Ahora se distingue: servidor despertando / base de datos despertando / lento / tiempo agotado / sin respuesta / sin conexión.
4. **Neon:** se desconecta tras 5 min sin uso y tarda en despertar; el pool esperaba **5 s** por una conexión y, pasado ese tiempo, daba error 500. Ahora espera hasta 20 s (`acquisition-timeout`). El arranque no abre conexiones (`min-size=0`), así que no hay nada que falle al arrancar; el `health` de Render (`/q/health/live`) **no toca la base de datos** (no impide que Neon duerma).
5. **Peticiones al abrir:** la pantalla principal pedía 3 cosas autenticadas (preferencias, diario, trabajo): 3 comprobaciones de sesión en la base de datos y 3 vueltas CORS. Ahora es una sola (`GET /api/v1/home`).
6. **CORS:** con el frontend y el backend en dominios distintos cada petición lleva una comprobación previa (OPTIONS). Safari limita su caché a 10 minutos, así que en el iPhone se repite a menudo. Se ha subido la caché a 24 h (el máximo útil en Chrome es 2 h; en Safari seguirá en 10 min).

## Lo que NO puedo afirmar ni arreglar desde aquí

- **Región de Render.** Neon está en AWS Londres. Si el backend está en **Oregón/Ohio**, cada consulta a la base de datos cuesta ~140 ms de ida y vuelta y una pantalla con 4 consultas pierde ~0,6 s. **Comprueba en Render → `fitona-backend` → Settings → Region:** lo ideal es **Frankfurt**. Hasta donde sé, Render no permite cambiar la región de un servicio existente: habría que crear otro servicio nuevo en Frankfurt (gratis) y apuntar el frontend a él. `render.yaml` no fija región (por defecto Oregón); añadir `region: frankfurt` si se vuelve a crear.
- **El arranque en frío no desaparece.** Render gratuito duerme el servicio a los 15 minutos sin tráfico y lo despierta en ≈20-60 s. No se usa ningún sistema para mantenerlo despierto (iría contra las condiciones del plan gratuito). Lo único que cambia es que ahora la interfaz se ve al instante y el aviso es honesto.
- **Tiempo real en Render y en Neon:** hay que medirlo allí (ver abajo).

## Cómo medir producción (para ti)

1. **Desde el propio iPhone o ordenador:** *Yo → Estado del servidor → Comprobar ahora*. Muestra cuánto tardó el servidor en responder, cuánto lleva encendido (si pone «acaba de despertar» estaba dormido) y si la base de datos respondió lenta (Neon despertando).
2. **PowerShell** (primera llamada tras ≥20 min sin usar = en frío; las siguientes = en caliente):

```powershell
$u = 'https://fitona-backend.onrender.com/api/v1/status'
1..4 | ForEach-Object {
  $t = Measure-Command { $r = Invoke-RestMethod $u -TimeoutSec 400 }
  "{0:n1} s  ->  servidor encendido hace {1} s, base de datos {2} ({3} ms)" -f $t.TotalSeconds, $r.uptimeSeconds, $r.db, $r.dbMs
  Start-Sleep -Seconds 2
}
```

3. **Registros de Render** (`fitona-backend` → *Logs*): busca `started in` (tiempo de arranque de Quarkus) y *Events* (cuándo se durmió y despertó). Si ves `OutOfMemoryError` o reinicios repetidos, avísame con el texto.
4. **Neon:** en el panel, *Monitoring* → conexiones y *Operations* para ver cuándo se suspende/reactiva el cómputo.
5. Si tras actualizar sigue tardando minutos, copia el resultado del punto 2 y las líneas de *Logs* alrededor de `started in`: con eso se sabe si es Render (arranque), Neon (cómputo) o la red.

## Qué se ha cambiado

- `backend/Dockerfile.render` + `backend/cds-train.sh`: AppCDS generado en `docker build`; compilador C1 en el arranque. Las opciones van en el `ENTRYPOINT`, así que valen aunque la variable `JAVA_OPTS` del panel de Render sea la antigua. Si el archivo AppCDS no se genera, la imagen arranca igual (comprobado: la JVM ignora un archivo ausente).
- `GET /api/v1/status` (público, sin datos de nadie): estado del servidor y la base de datos. `GET /api/v1/home` (autenticado): resumen de la pantalla principal en una petición.
- `application.properties`: espera de conexión a la base de datos 20 s; caché CORS 24 h.
- Frontend: consulta de estado única al abrir (y otra si vuelves tras 10 min), tiempos máximos y reintentos acotados, aviso de conexión no bloqueante con Fiona.
- **No probado:** el `docker build` de `Dockerfile.render` (en este entorno falla por el certificado del proxy; el script de entrenamiento sí se probó dentro de la imagen del tiempo de ejecución), nada en Render ni en Neon reales.
