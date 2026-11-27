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
- **Datos nutricionales: SOLO 54 de los 576 alimentos tienen valores, y son aproximados, escritos a mano y SIN VERIFICAR** (marcados «Estimación» y «aproximado, sin verificar»). **Los otros 522 no tienen datos nutricionales** y no se inventan: se ven en el catálogo, pero para calcular hay que ponerles valores propios («Poner mis valores») o apuntarlos sin cifras.
- **Valores propios:** en cualquier alimento del catálogo, «Poner mis valores» crea tu versión (por 100 g, con tus medidas) que **sustituye al del catálogo solo para ti**; si la borras, vuelve el del catálogo. Los alimentos propios siguen guardándose para siempre y se pueden crear desde cero («Crear alimento») si algo poco habitual no está.
- **Cómo completar el catálogo con datos fiables:** rellenar `database/seed/nutrientes-pendientes.csv` (los 522 pendientes) con una fuente fiable y licenciada (USDA FoodData Central, CIQUAL o BEDCA con autorización) y ejecutar `python3 database/seed/apply_nutrients.py datos.csv V012`; genera la migración con la procedencia de cada valor. Probado con datos sintéticos de prueba (se deshizo); **no hay aún ningún dato verificado cargado**.
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

- **Sin autenticación real.** Solo hay una identidad de *desarrollo* (UUID en el navegador enviado en `X-Dev-User`). Cualquiera que conozca ese UUID ve esos datos. Keycloak/OIDC **no está implementado** (ADR-004). No usar con datos reales ni exponer a Internet.
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
