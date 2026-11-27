# FITona como PWA (app instalable en iPhone y Android)

> Estado (27-nov-2026): **implementado y probado en Chromium** (31 comprobaciones E2E + 19 pruebas unitarias + backend 48/48 con Oracle y PostgreSQL). **No probado en un iPhone ni en un Android reales** (no hay dispositivos aquí): ver «Limitaciones».

## Qué incluye
| Requisito | Cómo está resuelto |
|---|---|
| Icono propio | Plato con «F» y hoja. Fuentes en `frontend/tools/pwa/*.svg`; PNG de 48 a 512 px, iconos *maskable* (192/512, arte en la zona segura del 80 %), `apple-touch-icon` 180/167/152, favicon SVG/PNG/ICO. Regenerar: `cd frontend; node tools/make-pwa-assets.mjs` |
| Web App Manifest | `frontend/public/manifest.webmanifest`: `id`, `standalone`, `portrait`, colores, categorías, 3 accesos directos (Registrar, Recetas, Hoy) |
| Pantalla completa sin barra del navegador | `display: standalone` (Android) y `apple-mobile-web-app-capable` (iPhone) |
| Pantalla de inicio propia | Android: la genera del manifiesto (icono + nombre + color). iPhone: 11 imágenes `apple-touch-startup-image` (una por tamaño de pantalla, `public/splash/`). Dentro de la app: pantalla de arranque en `index.html` que se ve antes de cargar Angular |
| Zonas seguras del iPhone | `viewport-fit=cover` + `env(safe-area-inset-*)` arriba, abajo, izquierda y derecha (barra superior, barra de pestañas, contenido, avisos) |
| Persistencia de la sesión | Token en `localStorage`, validado al leer (formato de token propio; si está corrupto se descarta), `navigator.storage.persist()` para que el navegador no lo borre por falta de espacio, se limpia al cerrar sesión o si el servidor responde 401 |
| Actualizaciones sin versiones antiguas | Service worker de Angular (`ngsw`): al abrir, al volver a la app y cada 30 min busca versión nueva; si hay, aviso «Hay una versión nueva · Actualizar»; si la app estuvo >10 min en segundo plano se aplica sola. `ngsw.json`, `ngsw-worker.js`, `config.js`, `index.html` y el manifiesto se sirven **sin caché** |
| Servidor gratuito despertando | Al abrir la app se envía un ping al backend para despertarlo mientras escribes; si una petición tarda más de 4 s, aviso «El servidor gratuito se está despertando…»; las lecturas se reintentan solas ante 502/503/504 |
| Sin conexión | Aviso rojo «Sin conexión a Internet…»; la app se abre desde el service worker; las acciones que necesitan red dan «Sin conexión… no se ha guardado nada» (no se encolan ni se guardan en el dispositivo) |
| Sin datos privados en cachés | El service worker **solo** guarda los archivos estáticos del build; nunca `/api`, ni `config.js`. Además toda respuesta de la API lleva `Cache-Control: no-store`. Comprobado en el E2E (0 URLs de API y el token no aparece en ninguna caché) |
| Cabeceras de seguridad | CSP estricta (`script-src 'self'`, sin scripts en línea; Angular ya no inyecta uno: `inlineCritical: false`), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (nginx local y `render.yaml`) |
| Node | `NODE_VERSION = 24.15.0` en `render.yaml` y en esta documentación; la compilación se verificó con exactamente Node 24.15.0 |

## Cómo instalarla
- **iPhone:** Safari → abrir `https://fitona-uhz0.onrender.com` → Compartir → **Añadir a pantalla de inicio**. (Solo Safari puede instalar PWAs en iOS; la app lo explica en «Yo».)
- **Android:** Chrome → menú ⋮ → **Instalar aplicación** (o el botón «Instalar FITona» de «Yo»).

## Limitaciones conocidas
- **Sin probar en dispositivos reales.** Las pantallas de inicio de iPhone solo existen para 11 tamaños (hasta iPhone 16/17 Pro Max); un modelo nuevo con otro tamaño mostrará una pantalla blanca breve hasta añadirle su imagen (`DEVICES` en `tools/make-pwa-assets.mjs`).
- El aviso de «versión nueva» necesita conexión; sin ella se sigue usando la versión instalada.
- Si cambias la URL del backend, actualiza `connect-src` de la CSP en `render.yaml` (y `FITONA_API_URL`).
- `render.yaml` (cabeceras de Render) está validado en sintaxis, **no probado en Render**: si las cabeceras no se aplican, créalas a mano en el panel (Headers).
- La sesión dura 90 días en el servidor y no se renueva sola; pasado ese plazo hay que volver a entrar.
- Seguimos sin recuperación de contraseña.
