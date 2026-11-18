# Entregable I · Riesgos y mitigaciones

> P = probabilidad, I = impacto (B/M/A). Valoración propia **[P]**. Las referencias a hechos están en las investigaciones enlazadas; lo no verificado allí lo sigue estando aquí.

| ID | Riesgo | P | I | Mitigación práctica | Estado |
|---|---|---|---|---|---|
| R-01 | **Calidad de datos nutricionales** (errores, duplicados, valores incoherentes) | A | A | Catálogo curado y pequeño; fuentes con procedencia; CHECK de imposibles + cola de revisión de sospechosos; perfiles inmutables; fiabilidad visible; botón «avisar de un error» | CHECK/inmutabilidad **hechos y probados**; importador y panel pendientes |
| R-02 | **Licencias de bases** (BEDCA no abierta; OFF share-alike) | A | A | BEDCA solo con autorización escrita de AESAN; OFF en capa separada con atribución y ODbL; USDA CC0/CIQUAL (confirmar) como base; `DATA_SOURCES.COMMERCIAL_USE` impide publicar fuentes no autorizadas | Modelado; **acción tuya**: solicitar autorización AESAN |
| R-03 | **Scraping y datos de supermercados**: sin APIs públicas; ocho avisos legales prohíben reutilización comercial; Carrefour prohíbe bots | A | A | **No hacer scraping**. Precios por ticket del usuario, aportación voluntaria, Open Prices (ODbL), IPC del INE como referencia; afiliación de Carrefour (Awin) como única vía comercial hallada | Decidido (ADR-008) |
| R-04 | **Privacidad: datos de salud (RGPD art. 9)** | A | A | Consentimiento explícito y granular; EIPD antes de usuarios reales; minimización (sin correo en BD de la app); exportación/supresión; sin publicidad; registro de actividades; evaluar DPO | Diseño y esquema listos; **EIPD y revisión legal pendientes** |
| R-05 | **Errores de IA** (cifras inventadas, recetas inseguras, acciones erróneas) | A | A | La IA no calcula ni escribe: propone; motor determinista; confirmación; temperaturas/plazos solo de tablas con fuente; evaluación con casos de prueba antes de cada versión | Diseñado |
| R-06 | **Foto con IA imprecisa** (estudios: infraestima ~⅓ de las calorías, errores en platos mixtos) | A | M | Rango y «~», nunca cifra única; corrección obligatoria antes de guardar; entrada secundaria (v0.5) | Diseñado |
| R-07 | **Coste de IA** descontrolado | M | A | Modelo barato por defecto; cuotas por plan; tope global mensual con degradación; caché; salida JSON acotada; métricas en `AI_USAGE_EVENTS`; revisar cuotas con consumo real (H §6) | Diseñado; cuotas provisionales |
| R-08 | **Seguridad** (acceso cruzado, inyección, filtración de tokens) | M | A | Filtro por propietario en repositorio + 404; pruebas de acceso cruzado en CI; mínimos privilegios de BD (hecho); secretos fuera del repo; tokens de integración cifrados; dependabot/escaneo; prueba de intrusión antes de 1.0 | Mínimos privilegios **probados**; resto pendiente |
| R-09 | **Trastornos de la conducta alimentaria / daño por diseño** | M | A | Modo sin números, sin rachas/semáforos/compensaciones; objetivos como rangos con suelo de seguridad; salvaguarda de cuidado; recursos de ayuda; revisión por profesional clínico antes de 1.0; solo adultos | Diseño; **revisión clínica pendiente** |
| R-10 | **Convertirse en producto sanitario (MDR)** o sistema de IA de alto riesgo | M | A | Posicionar como bienestar; sin diagnóstico/tratamiento/dosis; sin planes para enfermedades; revisión de textos de marketing y de la IA; guía MDCG 2019-11 | Diseño; revisión legal pendiente |
| R-11 | **Menores** usando la app | M | A | Confirmación de mayoría de edad; sin fecha de nacimiento; edición 18+ en tiendas; si se amplía, salvaguardas específicas | Diseñado |
| R-12 | **Complejidad de sincronización offline** (duplicados, pérdidas, conflictos) | A | A | IDs de cliente + `Idempotency-Key` + `SYNC_SEQ`; estrategias por tipo; escalado por versiones; pruebas con corte de red y reintentos; no prometer offline para IA | Esquema listo; lógica pendiente |
| R-13 | **Requisitos de tiendas móviles** (eliminación de cuenta, permisos de IA, apps de salud, 12 probadores) | M | M | Cuenta Google Play de organización; borrado en la app (0.1); consentimiento de IA explícito; etiquetas de privacidad | Planificado |
| R-14 | **Integraciones deportivas** (Strava prohíbe uso con IA; Garmin orientado a empresas; Google Fit en retirada) | A | M | Health Connect/HealthKit + FIT/GPX; Strava/Garmin fuera; plugin Capacitor con mantenimiento verificado (`@capgo/capacitor-health` 8.13.0) | Decidido |
| R-15 | **Oracle: coste y licencia al crecer** (salto ≈ 430 €/mes; límite 12 GB; sin copias gestionadas; licencia de producción de Free sin confirmar) | M | A | Puerta de decisión a 3.000 usuarios/8 GB y **antes de 0.2** si el plan supera ~1.000; copias obligatorias; confirmar licencia por escrito; portabilidad limitada (F §8) | Abierto: decisión tuya |
| R-16 | **Dependencia de un proveedor de IA** (precios, retiradas, residencia) | M | M | Puerto `AiGateway` + adaptadores; configuración por proveedor/región; pruebas de contrato | Diseñado |
| R-17 | **Residencia de datos UE** (API directa de Anthropic: inferencia global/us) | M | M | Adaptador de nube con región UE (+10 %) si se exige; consentimiento y cláusulas contractuales; decisión por configuración | Abierto |
| R-18 | **Mantenimiento por una sola persona** (versiones, seguridad, soporte) | A | M | Monolito modular; CI; dependencias LTS; documentación y ADR; límites de alcance por versión | Gestionado por plan |
| R-19 | **Versiones del stack incompatibles** (p. ej. TypeScript 7 con Angular 22) | M | B | Fijar versiones en `package.json`/`pom.xml`; CI; ya verificado: Angular 22 exige TS 6.0.x | Detectado y documentado |
| R-20 | **Cierre o pérdida de datos por mi parte** (lección Mealime) | B | A | Exportación completa desde 0.1; copias; aviso previo a cambios; datos portables en JSON/CSV | Diseñado |
| R-21 | **Suscripciones y consumo** (patrones oscuros; Directiva 2023/2673) | B | M | Cancelación en un clic; aviso de renovación; básicos siempre gratis | Diseñado |
| R-22 | **Ruido en la investigación** (fuentes escritas por competidores; extractos de buscador en vez de páginas completas) | M | M | Validar con pruebas propias y entrevistas; revisar las marcas [NV]; leer las fuentes primarias antes de decisiones legales | Reconocido |

## Riesgos de calidad del propio trabajo (transparencia)

- Los informes de investigación se basan en extractos de buscador; hay **70 marcas [NV]** en el de infraestructura y todas las secciones legales del de IA son [NV].
- Las estimaciones de coste de IA, esfuerzo y metas de uso son hipótesis, no mediciones.
- Backend y frontend **no existen**: el stack se ha verificado por versiones publicadas y compatibilidad declarada, no compilando una aplicación.

Confianza: 75 %.
