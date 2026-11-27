# Estado real de la implementación (v0.1 en construcción)

> Fallos detectados, riesgos y prioridades: ver [informe-mejoras.md](informe-mejoras.md).

> Se actualiza con cada incremento. Distingue: **diseñado** (en `docs/`), **implementado** (existe el código), **probado** (se ejecutó y pasó, indicando dónde) y **pendiente**. Fecha: 18-nov-2026.

## Resumen

| Área | Estado | Dónde se probó |
|---|---|---|
| Esquema Oracle (70 tablas) + migraciones + 19 pruebas de humo | Implementado y probado | Oracle 26ai Free (contenedor remoto) |
| Motor nutricional (`backend/nutrition`) | Implementado y probado: 25 pruebas unitarias | Maven, JDK 21 (remoto) |
| API REST Quarkus (`backend/app`) | Implementado y probado: 16 pruebas de integración contra Oracle real | Remoto |
| Frontend Angular 22 (`frontend`) | Implementado; 9 pruebas unitarias; recorrido en Chromium real 18/18 | Remoto |
| Docker Compose (Oracle + migraciones + backend + nginx) | Cableado **probado** en remoto con imágenes runtime precompiladas; **la construcción multi-etapa de los Dockerfiles NO se ha ejecutado** | Remoto (parcial) |
| Scripts PowerShell | Escritos, **no ejecutados** (sin PowerShell remoto) | — |
| Todo lo anterior en **tu Windows** | **Pendiente de que lo ejecutes** | — |

## Catálogo simplificado (576 alimentos, 33 categorías)

- **Fuente de los nombres y las categorías:** `database/seed/catalogo-alimentos.md` (tu lista editorial: genéricos, sin marcas, sin variantes innecesarias; p. ej. solo «Chocolate negro» y «Chocolate negro 75 %»). La migración `V011` se genera con `database/seed/generate_catalog_v011.py`.
- **Categorías con imagen:** 33 grupos + «Mis alimentos»; cada alimento lleva un **emoji** (propio si existe uno adecuado, si no el de su categoría). Son emojis, no fotos: no hay fotos con licencia disponibles sin conexión.
- **Datos nutricionales: 572 de los 576 alimentos tienen valores, TODOS aproximados y SIN VERIFICAR** (marcados «Estimación» / «sin verificar», fuente `FITONA_EDITORIAL`). **No son la media real de las etiquetas de Mercadona, Aldi, Lidl y Día** (no hay acceso a sus datos y el scraping está descartado): son valores genéricos típicos de composición de alimentos, cargados a mano en `database/seed/valores-aproximados.txt` y validados por coherencia kcal/macros (`build_estimates.py`). Quedan **4 sin datos a propósito** por ser ambiguos (Edulcorante, Chicles, Especias para cuscús, Sopa instantánea). Cualquier valor se corrige con «Poner mis valores» al mirar una etiqueta.
- **Valores propios:** en cualquier alimento del catálogo, «Poner mis valores» crea tu versión (por 100 g, con tus medidas) que **sustituye al del catálogo solo para ti**; si la borras, vuelve el del catálogo. Los alimentos propios siguen guardándose para siempre y se pueden crear desde cero («Crear alimento») si algo poco habitual no está.
- **Cómo sustituir por datos fiables:** CSV con fuente licenciada (USDA FoodData Central, CIQUAL o BEDCA con autorización) y `python3 database/seed/apply_nutrients.py datos.csv V013 --replace` (crea perfil nuevo; el aproximado queda en el histórico). La migración `V012` se generó con `build_estimates.py` + `apply_nutrients.py`; aplicada y probada (smoke 19/19, backend 41/41, E2E 18/18). **Aún no hay ningún dato verificado.**
- El catálogo anterior de 46 alimentos (V010) queda retirado del buscador pero sigue resolviendo registros y recetas ya guardados.
- **12 recetas típicas** copiables a «Mis recetas» (tortilla de patatas, lentejas, arroz con pollo…). Cantidades orientativas; los nutrientes los calcula el motor con el catálogo (tortilla: 329 kcal/ración, probado).

## Funcionalidades utilizables hoy (verificadas en navegador)

1. **Crear un alimento propio** (nutrientes por 100 g, densidad, medidas caseras). Si no indicas kcal se calculan con los factores de la UE y se avisa; si las kcal no cuadran con los macros, se avisa sin bloquear.
2. **Buscar alimentos** (sin tildes ni mayúsculas; los más usados primero).
3. **Calculadora en vivo** al armar una comida (el cálculo lo hace el motor del servidor, nunca el navegador).
4. **Diario**: registrar comidas por franja y fecha, con alimentos, raciones de recetas o **texto sin cifras**; ver el día, borrar entradas. Cada registro guarda una **instantánea nutricional** (si luego cambias el alimento, el histórico no cambia — probado).
5. **Recetas** con ingredientes, raciones, pasos; cálculo por ración; versiones (editar crea versión nueva, vía API); ingredientes en texto libre dejan la receta como «datos incompletos». Registrar «una ración».
6. **Modos de uso**: Sencillo (sin cifras), Equilibrado (energía aproximada), Avanzado (energía y macros). Cambiar de modo no pierde datos.
7. **Fiabilidad visible**: ● contrastado, ≈ promedio/aproximado, ~ estimación, ✎ dato personalizado, ≥ valor mínimo si faltan datos.
8. **Tus datos**: descargar todo en JSON y borrar la cuenta (cascada probada).
9. **Aislamiento entre personas**: probado — recurso ajeno responde 404; sin identidad, 401.

## Limitaciones reales (no esconderlas)

- **Autenticación propia con correo y contraseña** (ver sección «Cuentas e inicio de sesión»); Keycloak/OIDC no se implementa en la v1. Sin recuperación de contraseña ni verificación de correo todavía. La identidad `X-Dev-User` solo existe con `FITONA_AUTH_DEV_ENABLED=true` (pruebas): no activarla en un servidor público.
- **El catálogo de arranque (46 alimentos) NO está verificado** (ver arriba). Faltan muchos alimentos y el importador con procedencia y licencia (BEDCA/USDA/CIQUAL). Desde este entorno la API de USDA no era accesible.
- **Solo valores por 100 g** (los líquidos usan densidad); no hay «por 100 ml».
- **Búsqueda difusa/sinónimos**: solo búsqueda por contiene, sin tolerancia a erratas ni sinónimos (batata/boniato) todavía; la tabla de nombres ya los admite.
- **Edición de recetas en la interfaz** no existe (la API crea versión nueva; la pantalla solo crea y consulta).
- **No existen todavía**: plan semanal y sustituciones, despensa, lista de la compra, precios, asistente de IA, registro por voz/foto, actividad física, offline/PWA, modo oscuro verificado, internacionalización, panel de administración, medidas personales («mi vaso»).
- **Accesibilidad**: se han usado etiquetas, foco visible, objetivos táctiles ≥ 48 px y símbolos además de color; **no** se ha auditado con lector de pantalla ni con axe.
- **Rendimiento**: sin mediciones de carga.

## Cómo comprobarlo en tu Windows (pendiente de ejecutar por ti)

Requisito: Docker Desktop con el motor en marcha.

```powershell
cd C:\Users\corte\Documents\FITona
git fetch origin claude-v1; git checkout claude-v1   # y trae los commits locales si los has copiado
.\scripts\dev\app-up.ps1       # primera vez: varios minutos (descarga imágenes y compila dentro de Docker)
# abrir http://localhost:4200
.\scripts\dev\app-down.ps1     # parar conservando datos
.\scripts\dev\app-down.ps1 -Purge   # parar y borrar datos locales
```

Si la construcción de los Dockerfiles falla en tu equipo, pásame el error: es la parte que no pude ejecutar aquí.

## Cómo ejecutar las pruebas (en cualquier equipo con Docker, Java 21+ y Node 22+)

```powershell
docker compose up -d oracle; docker compose run --rm migrate          # base de datos lista
$env:FITONA_DB_PASSWORD = '<FITONA_APP_PASSWORD de tu .env>'
cd backend; mvn test                                                   # 25 unitarias + 9 de integración (Oracle real)
cd ..\frontend; npm ci; npm test -- --watch=false                      # 6 unitarias
npx playwright install chromium                                        # una sola vez
npm start                                                              # en otra consola (con el backend en marcha)
node e2e/journey.mjs                                                   # recorrido completo en navegador (12 comprobaciones)
```

## Correcciones tras el sondeo de fallos (27-nov-2026)

Corregidos y con prueba: cantidades absurdas (antes 500 al guardar → ahora 400 con mensaje), reintentos simultáneos con el mismo id (ahora todos 201 y un solo registro), identidad de desarrollo en contextos no seguros (ya no existe el id fijo compartido), fecha inválida (400), Swagger UI fuera del contenedor, mensajes de unidad en español, orden de comprobaciones al borrar alimentos del catálogo (404 siempre) y topes de tamaño de listas. La app ya incluye manifiesto e iconos (instalable en el móvil); **no** hay service worker (sin conexión) todavía.

## Recetas: Mis recetas / Recetas típicas (27-nov-2026)

- **Implementado y probado** (backend 42/42, frontend 12/12, E2E 22/22): pestañas «Mis recetas» y «Recetas típicas» con buscador (por nombre o ingrediente, sin tildes); 44 recetas típicas con medidas naturales y pasos con alternativas (freidora de aire/olla, yogur griego casero, bol de yogur con avena); ficha de la receta típica y «Adaptar» (copia a Mis recetas y abre el editor); **editar receta** (nombre, ingredientes —quitar cebolla—, cantidades, pasos), «Guardar cambios» (nueva versión) o «Guardar como receta nueva» / «versión mía con otro nombre»; cantidades escritas como «½», «1/2», «1,5»; registrar una ración en **cualquier fecha**; registrar un alimento desde su ficha.
- **Medidas caseras** (V013): unidad pequeña/grande, chorrito, pizca, diente, onza y cucharadas de semillas. Los gramos son **aproximados** (se marcan como cantidad aproximada) y solo existen para los alimentos listados en `V013`; en el resto se usan gramos.
- Los tiempos/temperaturas de los pasos (p. ej. freidora de aire a unos 195 °C durante 10-12 min, yogur 24-48 h) son **los que indicó la propietaria**, marcados como orientativos; no proceden de una fuente verificada.
- **Pendiente:** sustituir un ingrediente directamente en el editor (hoy: quitar y añadir otro), vista de calorías en la ficha de la receta típica antes de copiarla, más recetas y fotos.

## Cuentas e inicio de sesión (27-nov-2026)
- **Implementado y probado** (backend 45/45, E2E 25/25): registro e inicio de sesión con correo y contraseña, sesiones de 90 días, cierre de sesión, borrar cuenta (elimina credenciales), aislamiento entre cuentas, límite de intentos, consentimiento de datos de salud y mayoría de edad. El frontend pide entrar antes de mostrar nada.
- **No hecho:** recuperar contraseña, verificar correo, «Entrar con Google» (se interpretó «Gmail y contraseña» como correo + contraseña; sirve cualquier correo, también Gmail), copias de seguridad, revisión legal. La política de privacidad de la app es un **borrador**.
- **Publicación:** guía en `docs/publicar.md` (servidor con HTTPS vía `docker-compose.prod.yml` + Caddy; PWABuilder para Android; PWA en iPhone). **No ejecutado**: sin servidor, dominio ni cuentas desde aquí.

## Doble base de datos: Oracle (local) y PostgreSQL (Render + Neon) (27-nov-2026)
- **Implementado y probado en local:** esquema y catálogo portados a PostgreSQL (`database/migrations-pg`, generados con `database/tools/*.py`); el backend detecta la base y adapta el SQL (JSON, claves generadas, códigos de error); la API devuelve los decimales igual con las dos bases. Backend 45/45 con Oracle **y** con PostgreSQL (también con el rol `fitona_app` sin DDL y Flyway real); E2E 25/25 en modo local y con frontend/backend en dominios distintos (CORS).
- **Configuración para Render** (`backend/Dockerfile.render`, `render.yaml`, `frontend/public/config.js`, variables en `docs/despliegue-render-neon.md`). Memoria medida bajo 512 MB y 0,1 CPU: bien; el hash de contraseñas hubo que abaratar (`FITONA_PBKDF2_ITERATIONS`).
- **No probado:** despliegue real en Render/Neon; build de `Dockerfile.render` dentro de Render. **Coste de mantenimiento:** cada migración Oracle nueva exige regenerar y probar la de PostgreSQL.

## PWA para iPhone y Android (27-nov-2026)
- **Implementado y probado en Chromium** (E2E de la PWA 31/31: manifiesto, instalabilidad, CSP, service worker, sin conexión, servidor despertando, actualización y auditoría de cachés; unitarias 19/19; backend 48/48 en Oracle y PostgreSQL; E2E de siempre 25/25). Detalle y limitaciones en `docs/pwa.md`.
- **No probado en iPhone/Android reales.** Hay que comprobarlo en tu móvil tras el despliegue (instalar, abrir a pantalla completa, probar sin conexión y una actualización).


## App modular: Comida y Trabajo (27-nov-2026)
- **Implementado y probado en local** (backend 60/60 en Oracle y PostgreSQL; unitarias 19/19; E2E de módulos 24/24 y recorrido completo 26/26): pantalla inicial con selector de módulos; **Comida** (Hoy, Plan, Registrar, Recetas, Yo) con perfil nutricional, modos mantenimiento/déficit, objetivo calórico de referencia (Mifflin-St Jeor × actividad + deporte; suelos de seguridad; orientativo, no médico) y «Plan» que propone el resto del día según lo elegido; **Trabajo** (Hoy, Calendario, Registrar, Historial, Yo) con notas, resúmenes y prompts por fecha, búsqueda y calendario. Nueva identidad (Pionus senilis) en iconos PWA.
- **Migración nueva V015** (`NUTRITION_GOALS`, `WORK_ENTRIES`); también generada para PostgreSQL. **Hay que aplicarla a Neon** (`scripts/dev/db-migrate-neon.ps1`, ahora espera 75 tablas y versión 015) antes de desplegar el backend nuevo.
- **Criterio «sin culpa»:** el objetivo se muestra como referencia neutra, sin colores de semáforo ni compensación por deporte.
- **Limitaciones:** el plan propuesto no se guarda (solo se añade al diario al confirmar); la edad se guarda como número (no se actualiza sola); sin disparadores de sincronización en las tablas nuevas; búsqueda de Trabajo sensible a acentos; E2E de la PWA (`e2e/pwa.mjs`) adaptado pero **no reejecutado**; no probado en móviles reales.

## Evolución a «centro personal» · Fase 1: base visual y módulos (27-nov-2026)
- **Implementado y probado en Chromium** (unitarias 19/19; E2E de módulos 34/34; recorrido completo 26/26; PWA 31/31; sin scroll horizontal a 390 y 320 px): registro único de módulos (`frontend/src/app/core/modules.ts`: pantalla principal, color, menú inferior y rutas salen de ahí; añadir un módulo = una entrada); tokens de diseño con tema **automático/claro/oscuro** (se guarda en el dispositivo; `public/theme-init.js` lo aplica antes de pintar, compatible con la CSP); color propio por módulo (contraste ≥ 4,5:1 en claro y oscuro, calculado); pantalla principal con tarjetas, orden y ocultación personalizables y datos de hoy opcionales (solo si hay registros); acceso a «Yo» general (`/ajustes`) con selector de tema; menú de Comida ahora Hoy · Alimentos · Registrar · Plan · Recetas (el perfil nutricional sigue en Yo).
- **Decisiones:** los módulos aún no construidos (Salud, Economía, Deporte, Cuidado personal) aparecen como «Próximamente», sin botón, para no tener pantallas vacías ni datos simulados. Orden y visibilidad se guardan **solo en este dispositivo** (localStorage), no en la cuenta.
- **No hecho aún (fases 2–5):** módulos Salud, Economía, Deporte y Cuidado personal; Proyectos/daily/informes en Trabajo; registro inteligente, buscador y avisos globales; menú inferior general (Inicio · Buscar · Registrar · Avisos · Yo: se añadirá cuando Buscar, Registrar y Avisos funcionen, para no dejar botones muertos); Yo general completa.
- **Pruebas:** no hay prueba en iPhone físico; solo emulación en Chromium. El E2E contra `ng serve` tuvo fallos esporádicos al arrancar el servidor de desarrollo (recarga por optimización de dependencias de Vite); contra servidor estático y compilación de producción es estable.

## Revisión de la Fase 1: dirección visual «Fiona» y rendimiento (27-nov-2026)
- **Implementado y probado en Chromium** (backend 63/63 en Oracle y en PostgreSQL; unitarias 22/22; E2E módulos 36/36, recorrido 26/26 y PWA 31/31 contra la compilación de producción): diseño luminoso (vainilla, pistacho, celeste, lavanda, melocotón, rosa; contraste AA comprobado) **sin modo oscuro** (tampoco automático); botones con relieve que se hunden, tarjetas ilustradas, barras de progreso, calendario y formularios redondeados, transición al entrar en cada pantalla, esqueletos de carga; mascota **Fiona** en SVG + CSS con 11 gestos (`shared/fiona.ts`, galería «Mi Fiona» en `/mi-fiona`, base para su personalización); nuevo icono de la app, favicon, apple-touch-icon y pantallas de arranque de iOS con Fiona; pantalla principal con los seis módulos (Salud, Economía, Deporte y Cuidado personal marcados «Próximamente», sin simular nada); orden y módulos ocultos **guardados en la cuenta** (migración **V016** `USER_PREFERENCES`, compatible Oracle/PostgreSQL).
- **Rendimiento:** ver `docs/rendimiento.md` (mediciones, causas probables de la espera de minutos y cómo medir producción). Arranque en frío del backend 45,7 s → ~18 s (emulando 0,1 CPU); interfaz visible en ~0,15 s; una sola petición al abrir en vez de tres; avisos de conexión distintos y no bloqueantes; tiempos máximos y reintentos acotados.
- **Migración nueva V016** → hay que aplicarla a Neon con `scripts/dev/db-migrate-neon.ps1` **antes** de desplegar el backend nuevo (el script ahora espera 76 tablas y versión 016). Compatibilidad: el backend antiguo ignora la tabla nueva.
- **No hecho aún:** módulos Salud, Economía, Deporte y Cuidado personal (Fases 2-3); registro inteligente con Fiona, buscador, avisos y conexiones entre módulos (Fase 4); gamificación y personalización de Fiona (Fase 5); menú inferior general Inicio · Buscar · Registrar · Avisos · Yo (se añadirá con esas funciones para no dejar botones sin función).
- **No probado:** iPhone real (solo Chromium emulando 393×852); Render y Neon reales (ni el arranque con AppCDS ni los tiempos de producción); `docker build` de `Dockerfile.render` (falla aquí por el certificado del proxy). Fiona solo en SVG animado: no se ha medido el coste de seis ilustraciones animadas en un iPhone antiguo.
