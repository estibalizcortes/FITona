# Entregable E · Arquitectura técnica

> Estado: **diseñada**; el esquema de base de datos está **implementado y probado** (ver F). Backend y frontend **no existen todavía**. Versiones: ver §10 (verificadas el 18-nov-2026 contra npm/Maven Central).

## 1. Arquitectura recomendada (una sola)

**Monolito modular** (un despliegue) con arquitectura hexagonal por módulo, API REST contract-first, cliente único Angular+Ionic empaquetado como PWA, Android e iOS (Capacitor), Oracle como base de datos.

```
                      ┌──────────── Cliente único (Angular 22 + Ionic 9 + Capacitor 8) ────────────┐
                      │ PWA (navegador) · Android · iOS   ·  IndexedDB + cola de salida (offline)   │
                      └───────────────┬───────────────────────────────────────────────┬────────────┘
                                      │ HTTPS + JWT (OIDC/PKCE)                      │ Health Connect / HealthKit (plugin)
                          ┌───────────▼──────────┐                                    │ (datos del dispositivo)
                          │  Keycloak (OIDC)     │                                    │
                          └───────────┬──────────┘                                    │
                      ┌───────────────▼─────────────────────────────────────────────▼────┐
                      │                 Backend Quarkus (monolito modular)                │
                      │ identity · profile · catalog · nutrition · diary · planning ·     │
                      │ recipes · pantry · shopping · pricing · activity · assistant ·    │
                      │ sync · admin · shared                                             │
                      │  REST (OpenAPI) ─ casos de uso ─ dominio ─ puertos ─ adaptadores  │
                      └───────┬───────────────┬──────────────────┬───────────────────────┘
                              │               │                  │
                      ┌───────▼─────┐  ┌──────▼───────┐   ┌──────▼─────────────────┐
                      │   Oracle    │  │ Objetos (fotos│   │ Proveedores IA (puerto │
                      │ (Flyway)    │  │  cifradas)   │   │ AiGateway, intercambia-│
                      └─────────────┘  └──────────────┘   │ bles)                  │
                                                           └────────────────────────┘
```

**Por qué monolito modular y no microservicios:** una persona desarrolla y opera; la consistencia transaccional (plan↔lista↔despensa↔diario) es el corazón del producto; los límites de módulo se imponen con pruebas de arquitectura (ArchUnit) y paquetes, de modo que un módulo (p. ej. `assistant`) pueda extraerse si algún día hace falta.

## 2. Módulos y reglas de dependencia

| Módulo | Responsabilidad |
|---|---|
| `identity` | Vinculación token OIDC ↔ `APP_USERS`, borrado y exportación de cuenta |
| `profile` | Preferencias, modos, alergias, objetivos opcionales, consentimientos |
| `catalog` | Alimentos, variantes, sinónimos, porciones, versiones de catálogo, búsqueda |
| `nutrition` | **Motor de cálculo determinista** (sin dependencias de framework, IA ni BD) |
| `diary` | Registro real, comidas guardadas, frecuentes |
| `planning` | Planes, huecos, opciones, sustituciones, «mover a mañana» |
| `recipes` | Recetas versionadas, escalado, importación (texto), compartición |
| `pantry` | Despensa, lotes y sobras |
| `shopping` | Listas, generación desde plan, secciones, enlaces |
| `pricing` | Observaciones de precio con procedencia; presupuesto |
| `activity` | Actividad manual/importada, antiduplicados, integraciones |
| `assistant` | Orquestación de IA mediante herramientas (casos de uso) y propuestas |
| `sync` | Endpoints push/pull incrementales e idempotencia |
| `admin` | Panel (catálogo, importaciones, costes IA, auditoría) |

Reglas (verificadas con ArchUnit en CI): `domain` no importa JPA, REST ni IA; `nutrition` no depende de nada; `assistant` **solo** invoca casos de uso de otros módulos, nunca repositorios; los módulos no leen tablas ajenas, se hablan por interfaces públicas.

## 3. API REST y contrato

- OpenAPI 3.1 como **fuente de verdad** (contract-first); cliente TypeScript generado.
- Recursos en plural, sin verbos; versión en ruta `/api/v1`; errores en `application/problem+json` (RFC 9457) sin datos sensibles.
- Idempotencia: cabecera `Idempotency-Key` en escrituras (tabla `IDEMPOTENCY_KEYS`).
- Concurrencia optimista con `ROW_VERSION` (`ETag`/`If-Match`).
- Autorización: JWT validado en cada petición; **toda consulta de datos personales se filtra por `USER_ID`/`HOUSEHOLD_ID` del token en la capa de repositorio** (nunca por un ID que llegue del cliente sin comprobar pertenencia). Un recurso ajeno devuelve **404** (no 403) para no revelar su existencia.

## 4. Motor nutricional (módulo `nutrition`)

Funciones puras, deterministas, con pruebas de propiedades:

- Conversión unidad → gramos (masa, volumen con densidad, medida casera por alimento, medida personal) y nivel de **precisión** (exacta / aproximada / grosera).
- Cantidad → nutrientes por 100 g; **instantánea** en `FOOD_LOG_ITEMS` (el histórico no cambia si cambia el catálogo).
- Recetas: suma de ingredientes, rendimiento de cocción (`VARIANT_CONVERSIONS`), peso en seco vs preparado, raciones, reparto entre comensales, `NUTRITION_COMPLETENESS` (COMPLETE/PARTIAL/NONE si hay ingredientes sin resolver).
- Sustitución: candidatos por rol culinario (`SUBSTITUTION_ROLE`), equivalencia por energía/hidratos/proteínas/perfil con tolerancias configurables; **siempre muestra diferencias**, nunca promete equivalencia.
- Coherencia energía↔macros: kcal = 4·P + 4·H + 9·G (+2·fibra, 7·alcohol según factores UE). Ejemplo de tu documento: 164 g P, 66 g G, 149 g H → 656 + 594 + 596 = **1.846 kcal**, distinto de 1.864 (Δ 18 kcal). El sistema **muestra la diferencia** y ofrece: mantener ambos, derivar energía de los macros, o ajustar uno de los macros (hidratos +4,5 g / grasa +2 g / proteína +4,5 g). Nunca cambia nada en silencio. Umbral de aviso configurable (`targets.energyCoherenceToleranceKcal`).
- Redondeo: se calcula con precisión completa y se redondea **solo al mostrar**.
- Fiabilidad: el peor nivel de los componentes gobierna el resultado (una comida con una estimación es una estimación).
- Datos incompletos: `NULL` ≠ 0; se muestra «sin dato», nunca 0.

## 5. Catálogo y motor de agrupación

Ver F §4. Resumen: ingesta por fuente con licencia (`DATA_SOURCES`), registros crudos (`SOURCE_RECORDS`), normalización (minúsculas, sin tildes, unidades), emparejamiento por reglas + similitud, **separación por estado de preparación** (crudo ≠ cocido), perfil representativo por **mediana ponderada** tras descartar atípicos (MAD) y filas con energía incoherente, trazabilidad (`PROFILE_CONTRIBUTIONS`), revisión administrativa (`CATALOG_REVIEW_ITEMS`) y publicación versionada (`CATALOG_RELEASES`). El catálogo funciona sin ninguna fuente externa en línea.

## 6. IA (módulo `assistant`)

```
Cliente ─► Assistant API ─► Orquestador ─► AiGateway (puerto)
                                │               ├─ Adaptador A: API directa del proveedor
                                │               ├─ Adaptador B: nube con región UE
                                │               └─ Adaptador C: otro proveedor
                                ▼
                       Herramientas tipadas (casos de uso del backend)
         getPlan · searchFoods · getPantry · proposeSubstitution · proposeLog ·
         proposePlanChange · proposeShoppingItems · computeRecipeNutrition · …
                                │
                                ▼  (acciones que escriben)
                       AI_ACTION_PROPOSALS (caduca) ──► Confirmar en cliente ──► caso de uso real
```

Reglas:
1. **La IA nunca consulta la BD**: solo herramientas con esquema JSON y validación.
2. **Las cifras las calcula el motor**; la IA identifica alimentos/cantidades y el motor devuelve nutrientes.
3. **Toda escritura = propuesta con vista previa + confirmación** explícita; la propuesta caduca.
4. **Seguridad alimentaria**: temperaturas, tiempos y plazos de conservación salen de datos con fuente (`RECIPE_VERSIONS.STORAGE_SOURCE_ID`, guías AESAN/USDA); si no hay dato, la respuesta dice que no lo sabe.
5. **Consentimiento por categoría** (`USER_CONSENTS`: `AI_SHARE_DIARY`, `AI_SHARE_PANTRY`, `AI_SHARE_PREFERENCES`, `AI_SHARE_ACTIVITY`, `AI_SHARE_PHOTOS`): el contexto enviado se construye solo con lo autorizado y retirar el permiso es inmediato.
6. **Sin almacenar conversaciones**: se guardan métricas de uso (`AI_USAGE_EVENTS`, sin contenido), propuestas y la memoria que la persona ve y edita (`ASSISTANT_MEMORIES`).
7. **Costes**: cuotas por plan (`APP_SETTINGS`, `USER_ENTITLEMENTS`), tope global mensual con degradación a funciones sin IA, caché de prompt, salida JSON acotada, modelo barato por defecto y modelo mayor solo para planificación.
8. **Salvaguarda de cuidado**: clasificación previa de la entrada; ante señales de angustia o conductas alimentarias problemáticas, respuesta de apoyo, sin reforzar restricción ni diagnosticar, con recursos de ayuda.
9. **Transparencia** (Reglamento de IA, art. 50): se indica que se interactúa con una IA y el contenido generado se etiqueta.
10. **Residencia**: la API directa de Anthropic solo ofrece inferencia `global`/`us` [V, ver investigación §1.5]; si se exige UE, usar el adaptador de nube regional (+10 %). La decisión se toma por configuración, no por código.

## 7. Sincronización y modo offline parcial

**Qué funciona sin red:** catálogo esencial (IndexedDB), recetas/planes/listas descargados, registro de comidas, marcar la lista. **Qué no:** asistente, foto con IA, importaciones.

Diseño:
- **IDs generados en cliente** (UUID, `RAW(16)`) para toda entidad editable offline ⇒ sin duplicados al reenviar.
- **Cola de salida** (outbox) con `Idempotency-Key` por operación; reintento con retroceso exponencial; la misma clave devuelve la misma respuesta.
- **Descarga incremental** por `SYNC_SEQ` (secuencia global monótona asignada por disparador): `GET /sync?since=<seq>`; los borrados viajan como `DELETED_AT` (soft delete) hasta su purga.
- **Conflictos** según el tipo de dato:
  | Tipo | Estrategia |
  |---|---|
  | Diario (`FOOD_LOG_*`) | Solo añadir/anular; id de cliente; sin conflicto práctico |
  | Lista de la compra | Unión de partidas; «marcado» gana si cualquiera lo marcó |
  | Plan/recetas/despensa | `ROW_VERSION`: si difiere, el servidor conserva su versión y el cliente recibe 409 con ambas; se ofrece «conservar la mía / la otra» (nunca se pierde en silencio) |
  | Preferencias | Último cambio gana por campo |
- **Datos sensibles locales**: tokens en almacén seguro del sistema (Capacitor); en web, IndexedDB sin cifrado a nivel de archivo (limitación honesta de los navegadores): solo se conservan datos recientes y se borran al cerrar sesión; cifrado adicional con clave no extraíble (WebCrypto) en v1.0.
- Riesgo principal y pruebas específicas: [I-riesgos](../producto/I-riesgos.md) R-12.

## 8. Seguridad y privacidad

- **Identidad**: Keycloak 26 (OIDC, PKCE; verificación de correo, recuperación, bloqueo por intentos, contraseñas con Argon2/PBKDF2 gestionadas por el IdP). El backend solo guarda `AUTH_SUBJECT` opaco: **sin correo ni contraseña en la BD de la app** (minimización).
- **Aislamiento**: filtro obligatorio por propietario; pruebas automáticas de acceso cruzado (caso 15); defensa en profundidad opcional con *Virtual Private Database* de Oracle (a evaluar; funcionalidad de edición Enterprise, comprobar su disponibilidad en la edición elegida).
- **Esquema**: `FITONA_OWNER` (despliegue) ≠ `FITONA_APP` (aplicación, solo SELECT/INSERT/UPDATE/DELETE por rol, sin DDL; probado).
- **Cabeceras y transporte**: HTTPS, HSTS, CSP estricta, CORS acotado; secretos fuera del repositorio.
- **Privacidad**: datos de alimentación/actividad = datos de salud (RGPD art. 9) ⇒ consentimiento explícito y granular, EIPD, registro de actividades, exportación (portabilidad) y supresión completa (cascada probada). Sin publicidad ni venta de datos.
- **Auditoría**: `AUDIT_EVENTS` para acciones administrativas y accesos denegados; **el panel de administración no muestra diarios individuales** (solo catálogo, importaciones, costes y métricas agregadas).

## 9. Despliegue y operación

| Fase | Frontend | Backend | BD | Coste (ver H) |
|---|---|---|---|---|
| Local | `ng serve` / `ionic serve` | `quarkus:dev` | Oracle Free en Docker | 0 € |
| Beta web | Hosting estático con CDN | Contenedor en VM pequeña | Oracle (Always Free) **o** PostgreSQL | ≈ 0–8 € /mes |
| Pública | ídem + PWA instalable | 2 instancias + balanceador | Gestionada con copias | desde ≈ 25 € /mes (según ruta) |
| Móvil | Capacitor (Android/iOS) | ídem | ídem | + cuotas de tiendas |

CI (GitHub Actions): compilación, pruebas unitarias + integración (Testcontainers Oracle Free), ArchUnit, lint, análisis de dependencias y de secretos, migraciones sobre BD vacía. CD solo **a petición expresa** (no hay despliegues automáticos sin tu autorización).
Observabilidad: OpenTelemetry (trazas/métricas), logs estructurados **sin contenido del diario**, alertas de coste de IA.
Copias de seguridad: dependen de la ruta de BD; Oracle Free **no** incluye copias gestionadas ⇒ obligatorias en el plan antes de usuarios reales.

## 10. Versiones (verificadas el 18-nov-2026)

| Componente | Versión | Cómo se verificó |
|---|---|---|
| Java | **25 LTS** recomendada (21 LTS válida) | Criterio LTS; en este entorno solo hay JDK 21, **no probado con 25** |
| Quarkus | 3.40.1.2 (línea LTS indicada por la investigación; EOL por confirmar) | Maven Central lista 3.40.1.2 |
| Flyway (OSS) | 13.12.2 | **Ejecutado**: aplica las 9 migraciones + repetible en Oracle 23.26 Free |
| Oracle JDBC | 23.26.x (`ojdbc17`/`ojdbc11`) | Maven Central; Quarkus fija la suya |
| Oracle local | Oracle AI Database 26ai Free (release 23.26.4) | **Ejecutado** (`gvenzl/oracle-free:23-slim-faststart`) |
| Angular | 22.2.6 (CLI 22.2.7) | npm; CLI exige Node `^22.22.3 \|\| ^24.15.0 \|\| >=26` |
| TypeScript | **6.0.x** (no 7.0.x) | El CLI de Angular 22 declara `typescript >=6.0 <6.1`; la última de npm es 7.0.2 y **no es compatible** |
| Ionic | `@ionic/angular` 9.0.12 | npm; peer Angular ≥ 18 |
| Capacitor | 8.6.2 | npm; Node ≥ 22 |
| Node | 24 LTS (24.22.3) o 26 LTS (26.13.1) | nodejs.org/dist/index.json; recomendado 24 por madurez |
| Keycloak | 26.8.2 | Maven Central |
| Plugin salud | `@capgo/capacitor-health` 8.13.0 | npm |

Matiz: «verificado» = existe esa versión publicada y las dependencias declaradas son compatibles; **no** se ha compilado todavía una app con ellas.

## 11. Decisiones relacionadas

ADR en [docs/adr](../adr/README.md): monolito modular (001), Oracle con puerta de decisión (002), Angular+Ionic+Capacitor (003), identidad Keycloak (004), IA agnóstica con propuestas confirmadas (005), offline parcial (006), catálogo en tres niveles y licencias (007), sin scraping ni Strava (008), convenciones de BD (009).

Confianza: 80 % en la arquitectura; 65 % en las versiones LTS de Quarkus/Java 25 (no compiladas aquí).
