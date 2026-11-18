# Integraciones, IA y normativa: investigación para FITona

> **Fecha de la investigación:** 18-11-2026.
> **Contexto:** app de nutrición, planificación de comidas y registro de actividad. Frontend Angular + Ionic + Capacitor (PWA, Android e iOS), backend Java/Quarkus, base de datos Oracle, usuarios en España/UE, modelo freemium. Trata datos de alimentación y actividad y, de forma opcional, peso y bienestar.

## Cómo leer este documento (metodología y limitaciones)

Cada dato lleva una de estas marcas:

| Marca | Significado |
|---|---|
| **[V: URL]** | Verificado leyendo directamente la fuente oficial en esta sesión (18-11-2026). |
| **[V-b: URL]** | Verificado con el extracto que devolvió el buscador de una página **oficial**. La página no se pudo abrir directamente porque la red del entorno lo bloqueaba. La fiabilidad es alta, pero conviene releer la página antes de decidir. |
| **[NV]** | **No verificado** en esta sesión. Procede de conocimiento previo, de fuentes no oficiales o de fuentes oficiales inaccesibles. Cuando existe, se indica la URL donde comprobarlo. |
| **[NV-sec]** | No verificado en fuente oficial. Procede de una fuente secundaria identificada: el paquete `@pydantic/genai-prices` 0.2.4, publicado el 17-11-2026. Sus precios de Anthropic y Google **coinciden** con las fuentes oficiales verificadas, lo que da cierta confianza, pero sigue sin ser fuente oficial. |

**Limitaciones de esta sesión:**

- El proxy de red **bloqueó** estos dominios: `strava.com`, `developers.strava.com`, `developer.garmin.com`, `openai.com`, `platform.openai.com`, `mistral.ai`, `docs.mistral.ai`, `ai.google.dev`, `support.google.com`, `eur-lex.europa.eu`, `aepd.es`, `edpb.europa.eu`, `curia.europa.eu`, `health.ec.europa.eu` y `boe.es`.
- Se agotó el presupuesto de búsquedas web de la sesión antes de cubrir OpenAI, Mistral y la normativa UE y española.
- Por eso **todo el bloque normativo (secciones 5 a 8) y los precios de OpenAI y Mistral están marcados como [NV]**. Hay que revisarlos con las fuentes oficiales enlazadas antes de tomar decisiones legales o de negocio. **Este documento no es asesoramiento jurídico.**

---

## 1. Resumen y recomendaciones

### Decisiones recomendadas para el MVP

1. **Integraciones de actividad en el MVP: integraciones del propio dispositivo e importación de archivos, sin APIs de terceros en la nube.**
   - **Android:** Health Connect. Google Fit solo se mantiene hasta finales de 2026 [V: https://developer.android.com/health-and-fitness/health-connect/migration/fit].
   - **iOS:** HealthKit.
   - **Plugin único para ambas plataformas:** `@capgo/capacitor-health`. Es la versión 8.13.0, del 14-11-2026, compatible con Capacitor ≥ 8, con 48 versiones en los últimos 6 meses y licencia MPL-2.0 [V: https://registry.npmjs.org/@capgo/capacitor-health].
   - **Alternativa más sencilla:** `capacitor-health` (mley). Es la versión 8.4.0, del 23-09-2026, con licencia MIT y la función `queryNutrition` [V: https://registry.npmjs.org/capacitor-health].
   - **PWA web:** no tiene acceso a HealthKit ni a Health Connect, así que solo admite registro manual e importación de archivos GPX, FIT y TCX.
2. **Strava queda fuera del MVP y, en principio, fuera del roadmap si su contenido llega a la IA.**
   - La *API Policy (2026)* de Strava, sección 5.3, prohíbe usar datos de Strava, incluidos los derivados o anonimizados, "in connection with the development, training, evaluation, or operation of any AI Application". Esto **incluye introducirlos en la ventana de contexto** de un modelo [V-b: https://www.strava.com/legal/api_policy].
   - Desde junio de 2026, el nivel *Standard* (hasta 10 atletas sin revisión) exige que **el desarrollador tenga una suscripción de Strava** [V-b: https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428].
3. **Garmin queda para el futuro.**
   - El programa de Garmin está orientado a empresas y tiene niveles *Starter* y *Enterprise* [V-b: https://developer.garmin.com/gc-developer-program/overview/].
   - Hay informes de la comunidad que dicen que las solicitudes nuevas estaban pausadas [V-b, fuente comunitaria: https://forums.garmin.com/developer/connect-iq/f/discussion/436226/connect-developer-program-access-form-unavailable-anyone-got-through-recently].
   - Mientras tanto, se puede cubrir a los usuarios de Garmin con la importación de archivos `.FIT` usando el SDK oficial en Java `com.garmin:fit` 21.222.0 desde Quarkus [V: https://repo1.maven.org/maven2/com/garmin/fit/maven-metadata.xml].
4. **IA: dos niveles de modelo y salida estructurada en JSON.**
   - **Para interpretar texto, voz y fotos:** un modelo barato.
     - **Claude Haiku 5.5:** 0,10 USD de entrada y 0,50 USD de salida por millón de tokens [V: https://platform.claude.com/docs/en/about-claude/pricing].
     - **Gemini 3.5 Flash-Lite:** 0,30 / 2,50 USD [V: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing].
     - **Mistral Small 4 [NV-sec].**
   - **Para el asistente conversacional y la planificación de menús:** un modelo intermedio, Claude Sonnet 5.5 (2 / 10 USD) o equivalente.
   - **Coste estimado:** una operación de texto con caché cuesta entre **0,00015 USD (Haiku 5.5) y 0,003 USD (Sonnet 5.5)** (ver §3.5).
5. **Residencia de datos en la UE.**
   - La API directa de Anthropic **solo ofrece** `inference_geo` con los valores `global` o `us`, y almacena los datos en reposo (`workspace geo`) **solo en `us`** [V: https://platform.claude.com/docs/en/manage-claude/data-residency].
   - Si se exige tratamiento en la UE, hay dos vías:
     - **Vertex AI** (ahora "Gemini Enterprise Agent Platform") con endpoint regional europeo. Cuesta un **10 % más** que el endpoint global [V: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing] y tiene compromiso contractual de ubicación de datos y de tratamiento de ML [V: https://cloud.google.com/terms/service-terms].
     - **Claude a través de Google Cloud o Amazon Bedrock** con endpoints regionales o multirregión. También cuesta un 10 % más [V: https://platform.claude.com/docs/en/about-claude/pricing]. Falta comprobar qué modelos concretos están disponibles en regiones de la UE [NV].
   - **Mistral**, como proveedor de la UE, es la tercera opción [NV].
6. **Voz:** se prioriza el reconocimiento en el dispositivo, que es gratuito y más privado.
   - **Android:** `SpeechRecognizer.createOnDeviceSpeechRecognizer`, desde API 31 [V: https://developer.android.com/reference/android/speech/SpeechRecognizer].
   - **iOS:** `SpeechAnalyzer` (iOS 26+) [V: https://developer.apple.com/documentation/speech/speechanalyzer] o `requiresOnDeviceRecognition` [V: https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition].
   - **Respaldo en la nube:** Google STT V2 a 0,016 USD/min [V: https://cloud.google.com/speech-to-text/pricing], o el audio enviado directamente a un modelo multimodal.
7. **RGPD: tratar todo el registro de alimentación, actividad, peso y bienestar como datos de salud del art. 9.**
   - **Base jurídica:** consentimiento explícito, separado y granular.
   - **EIPD (evaluación de impacto) obligatoria.**
   - Es probable que haga falta un **DPO** (delegado de protección de datos).
   - Contratos de encargado y SCC/DPF con los proveedores de IA de EE. UU.
   - **Apple 5.1.2(i)** exige revelar que se comparten datos personales con una IA de terceros y obtener permiso explícito [V: https://developer.apple.com/app-store/review/guidelines/].
8. **Menores:** en España la edad de consentimiento digital es de 14 años (LOPDGDD art. 7) [NV]. Aun así, se **recomienda limitar el MVP a mayores de 18 años**, o como mínimo a mayores de 16, por el riesgo de trastornos de la conducta alimentaria y por la reforma legal en curso [NV].
9. **Reglamento de IA:** un asistente nutricional de bienestar sería **de riesgo mínimo con obligaciones de transparencia (art. 50)**, aplicables desde el **2-8-2026** [NV]. Hay que avisar de que el usuario interactúa con una IA y etiquetar el contenido generado.
10. **MDR (productos sanitarios):** hay que posicionar la app como **bienestar para adultos sanos**, sin finalidad médica. Para ello:
    - No hacer afirmaciones sobre enfermedades como diabetes, obesidad como enfermedad, insuficiencia renal o TCA.
    - No calcular dosis de insulina.
    - No hacer diagnósticos.

    Si se cruza esa línea, el software pasa a ser producto sanitario, como mínimo de clase IIa por la Regla 11, y en consecuencia de **alto riesgo** según el Reglamento de IA [NV].
11. **Tiendas:**
    - **Apple:** 99 USD al año [V: https://developer.apple.com/programs/whats-included/].
    - **Google Play:** 25 USD en un único pago [V-b: https://support.google.com/googleplay/android-developer/answer/14659200].
    - **Comisiones en la UE en 2026:**
      - Apple, desde el 1-10-2026: **15 %** para el Small Business Program y para suscripciones a partir del segundo año, y **26 %** estándar [V: https://developer.apple.com/support/apps-in-the-eu/].
      - Google, en el EEE desde el 30-6-2026: **10 % de tarifa de servicio + 5 % de tarifa de facturación** en el primer millón de USD y en suscripciones [V-b: https://support.google.com/googleplay/android-developer/answer/16954621].
    - **Recomendación:** abrir la cuenta de Google Play como **organización** para evitar el requisito de 12 probadores durante 14 días, que se aplica a las cuentas personales creadas después del 13-11-2023 [V-b: https://support.google.com/googleplay/android-developer/answer/14151465].

### Riesgos principales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Usar datos de Strava con IA viola la API Policy 2026 §5.3 [V-b] | Revocación del acceso e incumplimiento contractual | No integrar Strava o aislar sus datos fuera de cualquier flujo de IA. Mejor importar archivos exportados por el propio usuario (ver §2.6). |
| Datos de HealthKit enviados a la IA | Rechazo en App Review o retirada de la app | Permiso explícito del usuario. Apple solo permite compartirlos con terceros que "also provide a health or fitness service to the user" [V: https://developer.apple.com/documentation/healthkit/protecting-user-privacy]. Minimizar y no usarlos nunca para publicidad. |
| Funcionalidades que deriven en finalidad médica | Producto sanitario (MDR) y alto riesgo según el Reglamento de IA | Revisión de claims y del alcance funcional antes de cada versión (§8). |
| Menores y TCA | Daño al usuario, sanción y reputación | Exigir 18+ o 16+, límites de objetivos calóricos y mensajes de seguridad (§6). |
| Transferencias a EE. UU. | Incumplimiento del Capítulo V del RGPD | DPF y SCC más TIA (evaluación de impacto de la transferencia), o proveedor o región en la UE (§3.3 y §5.6). |

---

## 2. Integraciones deportivas y de salud

### 2.1 Tabla comparativa

| Integración | Disponibilidad real (nov-2026) | Requisitos | Coste | Complejidad | Recomendación |
|---|---|---|---|---|---|
| **Apple HealthKit** | Disponible en iOS y en iPadOS 17 o posterior. No disponible en la web [V: https://developer.apple.com/documentation/healthkit/setting-up-healthkit] | App nativa (Capacitor sirve), entitlement `com.apple.developer.healthkit` [V: https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.healthkit], claves `NSHealthShareUsageDescription` y `NSHealthUpdateUsageDescription`, y política de privacidad [V: https://developer.apple.com/documentation/healthkit/protecting-user-privacy] | 0 € (incluido en el Apple Developer Program) | Media | **MVP** (iOS) |
| **Android Health Connect** | Integrado en el sistema desde Android 14. En Android 13 o anterior requiere instalar una APK. La app de Health Connect necesita Android 9 o superior [V: https://developer.android.com/health-and-fitness/health-connect/get-started] | Permisos en el manifiesto, actividad que muestre la política de privacidad y declaración de *Health apps* en Play Console [V: https://developer.android.com/health-and-fitness/health-connect/publish] | 0 € | Media | **MVP** (Android) |
| **Importar GPX/FIT/TCX** | Siempre disponible. Funciona también en la PWA | Parser en el backend (`com.garmin:fit` 21.222.0) [V: https://repo1.maven.org/maven2/com/garmin/fit/maven-metadata.xml] o en el frontend (`@garmin/fitsdk` 21.222.0, `fit-file-parser` 6.2.10 MIT, `@tmcw/togeojson` 7.1.4) [V: https://registry.npmjs.org/] | 0 € (revisar la licencia del FIT SDK) [NV] | Baja | **MVP** |
| **Strava API** | Disponible, con restricciones fuertes desde nov-2024 y jun-2026 [V-b] | Registrar una app. Nivel *Standard*: hasta 10 atletas y **suscripción de Strava del desarrollador**. *Extended*: aplicaciones con 10 000 usuarios o más, sujeto a revisión [V-b: https://www.strava.com/legal/api_policy] | Suscripción de Strava: 11,99 USD/mes o 79,99 USD/año en EE. UU. [NV-sec: https://appsforstrava.com/blog/strava-developer-program-changes-2026] | Media (OAuth + webhooks) | **No recomendado** mientras haya IA en el producto |
| **Garmin Connect Developer Program** (Health API y Activity API) | Programa para organizaciones con niveles *Starter* y *Enterprise* [V-b: https://developer.garmin.com/gc-developer-program/overview/]. Hay informes de solicitudes pausadas [V-b, foro] | Aprobación de Garmin y contrato. Uso "for internal business purposes" [V-b: https://developerportal.garmin.com/sites/default/files/Garmin%20Connect%20Developer%20Program%20Agreement.pdf] | Gratuito para entidades corporativas aprobadas, según la página en japonés [V-b: https://developer.garmin.com/gc-developer-program/activity-api-japanese/]. *Enterprise* con precio a medida [V-b] | Alta (webhooks push o ping/pull) | **Futuro** |
| **Google Fit APIs** | Soporte solo **hasta finales de 2026** [V: https://developer.android.com/health-and-fitness/health-connect/migration/fit] | — | — | — | **No usar** |
| **Google Health API** (en la nube, para datos de Fitbit y dispositivos Google) | Disponible. Es el destino recomendado para migrar desde la Fit REST API [V: https://developer.android.com/health-and-fitness/health-connect/migration/fit] | Proyecto de Google Cloud y OAuth [V] | [NV] | Media | Futuro (opcional) |

### 2.2 Strava API

| Aspecto | Dato | Marca |
|---|---|---|
| Registro de la app | Se crea en el panel de ajustes de la API. Hasta su revisión, las apps nuevas funcionan en *Single Player Mode*, es decir, solo con los datos del propio desarrollador | [V-b: https://communityhub.strava.com/developers-knowledge-base-14/our-developer-program-3203] |
| Niveles desde 1-6-2026 | **Standard:** todas las apps lo tienen por defecto. Permite autoupgrade hasta **10 atletas** y límites más altos sin revisión formal, pero exige **suscripción de Strava**: a los desarrolladores nuevos desde el 1-6-2026 y a los existentes desde el 30-6-2026. **Extended Access:** "generally inclusive of Developer Applications serving 10,000 users or more and approved by Strava", sin suscripción, con revisión obligatoria | [V-b: https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428] · [V-b: https://www.strava.com/legal/api_policy] · fechas: [NV-sec] |
| Límites de uso por defecto | Global: **200 peticiones cada 15 min y 2 000 al día**. Lectura ("non-upload"): **100 cada 15 min y 1 000 al día**. Tras el upgrade: lectura 200 / 2 000 y global 400 / 4 000. Los valores reales se ven en el panel y en las cabeceras `X-RateLimit-*` y `X-ReadRateLimit-*` | [V-b: https://developers.strava.com/docs/rate-limits/] |
| Atletas sin aprobación | 1 (Single Player). Desde jun-2026, hasta 10 en *Standard* sin revisión | [V-b] |
| Cambios del Acuerdo de API (11-11-2024) | Prohíbe usar los datos de la API en modelos de IA o ML. Los datos de un usuario solo se pueden mostrar **a ese mismo usuario** | [V-b: https://press.strava.com/articles/updates-to-stravas-api-agreement] |
| API Policy 2026, §5.3 | "No AI/ML Training, Fine-Tuning, Grounding, Evaluation, Embedding, or Retrieval-Augmented Generation". Incluye la ingesta "into a context window or working memory" y los datos derivados o anonimizados. La única excepción es el MCP propio de Strava para suscriptores que lo usan con sus propios datos (§3.5) | [V-b: https://www.strava.com/legal/api_policy] |
| Intermediarios | "Apps routing Strava data through third-party intermediary platforms are no longer supported". Esto descarta los agregadores | [V-b: https://communityhub.strava.com/developers-knowledge-base-14/strava-api-faq-12906] |
| Webhooks | Una suscripción por app. Eventos de `activity` y `athlete` con `aspect_type` `create`, `update` o `delete`. El cuerpo lleva `object_id`, **no la actividad completa**. Hay que responder **200 en menos de 2 s**, con un máximo de 3 intentos. Validación con `hub.challenge`. Requiere el scope `activity:read`. Desde el 10-11-2026 se incluye `upload_id` | [V-b: https://developers.strava.com/docs/webhooks/] · [V-b: https://developers.strava.com/docs/changelog/] |
| Retención, caché y borrado tras la desautorización | Históricamente, borrado al revocar el acceso y caché limitada. **No se pudo verificar la redacción vigente** | [NV] (comprobar en https://www.strava.com/legal/api) |
| Apps comerciales | Se permiten dentro del API Agreement. En el FAQ, las apps que "expose athlete data to third party AI tools" no se aprueban | [V-b: https://communityhub.strava.com/developers-knowledge-base-14/strava-api-faq-12906] |

**Conclusión:** para FITona, el valor de Strava (actividades para cuadrar el gasto calórico) entra en conflicto directo con el núcleo de IA del producto. Se descarta en el MVP.

### 2.3 Garmin Connect Developer Program

| Aspecto | Dato | Marca |
|---|---|---|
| Destinatarios | Organizaciones. Existe además un acceso *Personal* con clave propia, pero solo para los datos del propio usuario | [V-b: https://developer.garmin.com/gc-developer-program/overview/] · [V-b: https://developer.garmin.com/gc-developer-program/personal/personal-faq/] |
| Niveles | **Starter:** Activity, Courses, Health, Training y Women's Health API, solo en modo *push*, sin histórico y con capacidad de usuarios limitada (una búsqueda indicó 1 000, sin confirmar). **Enterprise:** *push* o *ping/pull*, histórico desde 1 mes, usuarios ilimitados, soporte y precio a medida | [V-b] · cifra de 1 000: [NV] |
| Coste | Gratuito para "approved corporate entities", según la página en japonés. *Enterprise* tiene condiciones comerciales a medida | [V-b: https://developer.garmin.com/gc-developer-program/activity-api-japanese/] |
| Aprobación | Obligatoria. Varios hilos de foro dicen que el formulario de alta no estaba disponible y que no había fecha de reapertura | [V-b, comunitario: https://forums.garmin.com/developer/connect-iq/f/discussion/434798/cannot-access-developer-program-application-form-under-construction] |
| Formato de datos | Activity API: resúmenes JSON y archivos FIT, GPX y TCX. Health API: métricas diarias (frecuencia cardiaca, sueño, pasos, composición corporal, estrés…) en JSON | [V-b: https://developer.garmin.com/gc-developer-program/enterprise/activity-api] |
| Push y ping | *Push*: Garmin envía los datos a tu endpoint. *Ping/pull*: Garmin notifica y tú descargas los datos | [V-b] |
| Restricciones contractuales | Licencia limitada y revocable "for internal business purposes". Prohíbe usar los datos para decidir sobre crédito, seguros o empleo. No se verificó si hay cláusulas sobre IA | [V-b: PDF del acuerdo] · IA: [NV] |

### 2.4 Apple HealthKit

| Aspecto | Dato | Marca |
|---|---|---|
| Plataforma | iOS 8+ y iPadOS (en iPadOS 16 o anterior no está disponible). **No existe en la web ni en la PWA** | [V: https://developer.apple.com/documentation/healthkit/setting-up-healthkit] |
| Entitlement | Capacidad HealthKit en Xcode (`com.apple.developer.healthkit`). Xcode añade `healthkit` a *Required device capabilities*: hay que quitarlo si HealthKit no es imprescindible | [V] |
| Privacidad | El permiso se concede por tipo de dato. **La app no sabe si el usuario denegó la lectura**: simplemente no ve datos. El almacén está cifrado con el dispositivo bloqueado, así que las lecturas en segundo plano pueden fallar. Política de privacidad obligatoria. Prohibido usar estos datos para publicidad o venderlos. No se pueden revelar a terceros sin permiso expreso, y aun con permiso, solo a terceros que presten un servicio de salud o fitness al usuario | [V: https://developer.apple.com/documentation/healthkit/protecting-user-privacy] |
| App Store 5.1.3 | (i) No se pueden usar los datos para publicidad, marketing ni minería de datos, salvo para mejorar la gestión de la salud o para investigación, y siempre con permiso. Hay que indicar qué datos de salud se recogen. (ii) No escribir datos falsos en HealthKit. **No guardar información personal de salud en iCloud** | [V: https://developer.apple.com/app-store/review/guidelines/] |
| App Store 1.4.1 | Las apps médicas reciben más escrutinio. Hay que justificar la precisión de las medidas y recordar que se consulte a un médico | [V] |
| App Store 5.1.2(i) | "You must clearly disclose where personal data will be shared with third parties, **including with third-party AI**, and obtain explicit permission before doing so" | [V] |

**Plugins de Capacitor (estado a 18-11-2026):**

| Paquete | Última versión y fecha | Capacitor | Plataformas | Mantenimiento | Notas |
|---|---|---|---|---|---|
| `@capgo/capacitor-health` | 8.13.0, 14-11-2026 | `>=8.0.0` | iOS (HealthKit) y Android (Health Connect). Sin web | Muy activo: 48 versiones en 6 meses. Licencia MPL-2.0 | Pasos, calorías, peso, sueño, entrenamientos y `dietaryEnergyConsumed`. `dietaryProtein` solo en Android. Soporta `READ_HEALTH_DATA_HISTORY` [V: https://registry.npmjs.org/@capgo/capacitor-health] |
| `capacitor-health` (mley) | 8.4.0, 23-09-2026 | `>=8.0.0` | iOS y Android | Moderado: 3 versiones en 6 meses. Licencia MIT | `queryNutrition` con `READ_NUTRITION`, peso y entrenamientos. No pide historial: solo lee los últimos 30 días en Android [V: https://registry.npmjs.org/capacitor-health] |
| `@perfood/capacitor-healthkit` | 1.3.2, 13-02-2025 | `^4.0.0` | Solo iOS | Parado: 0 versiones en 6 meses. El README anuncia una v2 en alfa | **No recomendado** [V: https://registry.npmjs.org/@perfood/capacitor-healthkit] |
| `@kiwi-health/capacitor-health-connect` | 0.0.43, 29-09-2026 | `^7.0.0` | Solo Android | Activo con poca frecuencia. Sin licencia declarada en npm | Muchos tipos de registro, entre ellos `Nutrition` [V: https://registry.npmjs.org/@kiwi-health/capacitor-health-connect] |
| `capacitor-health-connect` (ubie-oss) | 0.7.0, 29-08-2024 | `^5.0.0` | Solo Android | Obsoleto | No recomendado [V: npm] |
| `cordova-plugin-health` y `@awesome-cordova-plugins/health` | 3.3.2 (27-10-2026) y 9.7.0 | Cordova | iOS y Android | Activo | Vía Cordova. No se verificó su compatibilidad con Capacitor 8 [NV] |

Referencia de plataforma: `@capacitor/core` 8.6.2 (12-11-2026) e `@ionic/angular` 9.0.12 (17-11-2026) [V: https://registry.npmjs.org/].

### 2.5 Android Health Connect

| Aspecto | Dato | Marca |
|---|---|---|
| Google Fit | "The Google Fit API (including the REST API) will only be supported until the end of 2026". Se recomienda Health Connect para apps móviles y Google Health API para integraciones en la nube | [V: https://developer.android.com/health-and-fitness/health-connect/migration/fit] |
| Cierre de altas nuevas en Google Fit | 1-5-2024 | [NV] |
| SDK | `androidx.health.connect:connect-client`. Desde la versión 1.1.0 requiere `compileSdk = 36` y AGP ≥ 8.9.1 | [V: https://developer.android.com/health-and-fitness/health-connect/get-started] |
| Permisos | `android.permission.health.READ_*` y `WRITE_*` en el manifiesto, que deben coincidir con los declarados en Play Console. Actividad o alias para `ACTION_SHOW_PERMISSIONS_RATIONALE` y `VIEW_PERMISSION_USAGE` que muestre **la misma política de privacidad que Play** | [V] |
| Histórico | Solo se leen datos de hasta **30 días antes de conceder el permiso**, salvo que se tenga `PERMISSION_READ_HEALTH_DATA_HISTORY`. Hay lectura en segundo plano (`FEATURE_READ_HEALTH_DATA_IN_BACKGROUND`) | [V] |
| Declaración en Play | Formulario *Health apps* en *App content*. La característica aplicable es "Nutrition and weight management". Las categorías de datos incluyen *Nutrition*, *Energy*, *Body composition* y *Activity and fitness*. Hay que justificar cada tipo de dato y volver a presentar el formulario si cambian | [V: https://developer.android.com/health-and-fitness/health-connect/publish] |
| Política de permisos de Health Connect | Acceso limitado a casos de uso aprobados (fitness y bienestar, coaching, etc.). Incluye apps que permiten "journal, report, monitor, and/or analyze… nutrition". Hay que pedir el mínimo de tipos de datos | [V-b: https://support.google.com/googleplay/android-developer/answer/14738291] |
| Declaración de *Health apps* | **Obligatoria para todas las apps publicadas**, también en pistas de prueba, aunque no tengan funciones de salud | [V-b: https://support.google.com/googleplay/android-developer/answer/14738291] |

### 2.6 Alternativas sencillas para empezar

1. **Registro manual** de actividad con una tabla de MET (equivalentes metabólicos) en el backend.
2. **Importar archivos** GPX, FIT y TCX desde la PWA y desde las apps móviles, con *file picker* y *share target*:
   - **FIT:** SDK oficial de Garmin en Java, `com.garmin:fit` 21.222.0 [V: Maven Central], o en JS, `@garmin/fitsdk` 21.222.0 (17-11-2026) [V: npm]. Hay que revisar la licencia del FIT SDK [NV].
   - **GPX:** `@tmcw/togeojson` 7.1.4, licencia BSD-2 [V: npm], o un parser XML en Quarkus.
   - **TCX:** XML. La librería `tcx-js` está parada desde 2019 [V: npm], así que conviene escribir un parser propio con JAXB o StAX.
3. **Exportaciones manuales que hace el propio usuario:**
   - Exportación masiva de su cuenta de Strava.
   - Exportación de actividades en Garmin Connect.
   - Exportación de datos de la app Salud de iOS.

   Los formatos y procedimientos concretos están [NV]. *Interpretación (no es asesoramiento jurídico)*: un archivo que el usuario obtiene mediante su derecho de acceso o portabilidad y sube por su cuenta **no pasa por la API de Strava**. Por tanto, en principio no queda sujeto al API Agreement. Este punto debe validarlo un abogado [NV].

---

## 3. Proveedores de IA

### 3.1 Precios por millón de tokens (USD, sin IVA, consultados el 18-11-2026)

**Anthropic Claude** (API directa). Todos los modelos actuales aceptan texto e imagen y tienen visión [V: https://platform.claude.com/docs/en/about-claude/models/overview].

| Modelo (ID) | Entrada | Escritura en caché (5 min / 1 h) | Lectura de caché | Salida | Batch (entrada / salida) | Contexto | Marca |
|---|---|---|---|---|---|---|---|
| Claude Haiku 5.5 (`claude-haiku-5-5`), prompt ≤ 100k | 0,10 | 0,125 / 0,20 | 0,01 | 0,50 | 0,05 / 0,25 | 1M | [V: https://platform.claude.com/docs/en/about-claude/pricing] |
| Claude Haiku 5.5, prompt > 100k | 0,50 | 0,625 / 1 | 0,05 | 2,50 | 0,25 / 1,25 | 1M | [V] |
| Claude Sonnet 5.5 (`claude-sonnet-5-5`) | 2 | 2,50 / 4 | 0,10 | 10 | 1 / 5 | 1M | [V] |
| Claude Opus 5.5 (`claude-opus-5-5`) | 4 | 5 / 8 | 0,20 | 20 | 2 / 10 | 1M | [V] |
| Claude Fable 5.2 (gama alta de razonamiento) | 8 | 10 / 16 | 0,20 | 40 | — | 1M | [V] |

Notas sobre Claude:

- **Recargos:**
  - `inference_geo: "us"` aplica un multiplicador de **×1,1**.
  - Los endpoints regionales o multirregión en Bedrock y Google Cloud tienen un **recargo del 10 %**.
  - El Batch API tiene un 50 % de descuento [V].
- **Tokens de herramientas:** usar *tool use* añade un prompt de sistema de 286 tokens en Haiku, Sonnet y Opus 5.5 (406 tokens en Haiku 5.5 con `tool_choice` `any` o `tool`) [V].

**Google Gemini** (Vertex AI / "Gemini Enterprise Agent Platform"). Columnas *Global* y *No global* (regional, p. ej. UE) [V: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing]:

| Modelo | Entrada (texto, imagen, vídeo, audio) global / regional | Lectura de caché global | Salida global / regional | Notas | Marca |
|---|---|---|---|---|---|
| **Gemini 3.5 Flash-Lite** | 0,30 / 0,33 | 0,03 | 2,50 / 2,75 | — | [V] |
| Gemini 3.1 Flash-Lite | 0,25 (audio 0,50) / 0,275 | 0,025 | 1,50 / 1,65 | — | [V] |
| **Gemini 3.8 Flash** | 0,75 / 0,825 | 0,075 | 3,75 / 4,125 | Precio de lanzamiento **hasta el 31-12-2026**. Desde el 1-1-2027 pasa a **1,50 / 7,50** (regional: 1,65 / 8,25) | [V] |
| Gemini 3.5 Flash | 1,50 / 1,65 | 0,15 | 9,00 / 9,90 | — | [V] |
| **Gemini 3.1 Pro Preview** | 2,00 (> 200k: 4,00) | 0,20 | 12,00 (> 200k: 18,00) | Preview | [V] |
| Gemini 4 Hydrogen | 1,50 / 1,65 | 0,075 | 7,50 / 8,25 | La página no lo sitúa en la gama Flash ni Pro | [V] (posicionamiento: [NV]) |
| Gemini 4 Carbon y Gemini 4 Argon | 2,00 hasta el 30-11-2026 y **4,00 desde el 1-12-2026** | 0,10 → 0,20 | 10 → **20** | Promoción mediante crédito del 50 % | [V] |

Notas sobre Gemini en Vertex:

- **Batch o Flex:** cuesta aproximadamente la mitad. Por ejemplo, Gemini 4 Hydrogen baja de 1,50 a 0,75 en entrada [V].
- **Tarifa regional:** los endpoints *no globales* pagan el precio regional desde el 1-7-2026 [V].

**OpenAI** (precios **no verificados en fuente oficial**: openai.com estaba bloqueado) [NV-sec: https://www.npmjs.com/package/@pydantic/genai-prices; para verificar: https://openai.com/api/pricing/]:

| Modelo | Entrada | Lectura de caché | Salida | Nota |
|---|---|---|---|---|
| GPT-6 Luna (pequeño) | 0,10 | 0,01 | 0,50 | Por encima de 272k tokens, el precio se duplica |
| GPT-5.4 nano / GPT-5.4 mini | 0,20 / 0,75 | 0,02 / 0,075 | 1,25 / 4,50 | — |
| GPT-6.2 Sol (intermedio) | 2 | 0,10 | 10 | — |
| GPT-6.2 Astra (grande) | 8 | 0,40 | 40 | — |

La visión de OpenAI, su Batch con un 50 % de descuento y los modelos "actuales" oficiales están [NV].

**Mistral** (proveedor UE). Precios **no verificados en fuente oficial** [NV-sec: genai-prices 0.2.4; para verificar: https://mistral.ai/pricing]:

| Modelo | Entrada | Lectura de caché | Salida | Nota |
|---|---|---|---|---|
| Mistral Small 4 (`mistral-small-latest` desde el 16-3-2026) | 0,15 | 0,015 | 0,60 | — |
| Mistral Medium 3.5 (`mistral-medium-latest` desde el 16-6-2026) | 1,50 | 0,15 | 7,50 | — |
| Mistral Large 4 (desde el 29-10-2026) | 0,70 | 0,07 | 2,10 | Sin verificar |
| Ministral 3 8B | 0,15 | 0,015 | 0,15 | — |

La visión de Mistral (multimodalidad de Small 4 y Medium 3.5) está [NV].

### 3.2 Comparativa de capacidades y condiciones de datos

| Proveedor | Texto + visión | Residencia en la UE | Retención por defecto (API) | ¿Entrena con datos de la API? | Batch y caché |
|---|---|---|---|---|---|
| **Anthropic (API directa)** | Sí, en todos los modelos actuales [V] | **No.** `inference_geo` solo admite `global` y `us`, y el almacenamiento en reposo es solo `us` [V: https://platform.claude.com/docs/en/manage-claude/data-residency]. Para la UE: Bedrock o Google Cloud regional, con un 10 % de recargo [V]. Falta comprobar qué modelos están en regiones de la UE [NV] | "Conversation content (your prompts and Claude's outputs) is not retained by default". Excepciones: los *Covered Models* (Fable y Mythos) exigen 30 días, y el contenido marcado por *trust & safety* puede guardarse **hasta 2 años**. ZDR (retención cero) se contrata con ventas [V: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention] | "Retained data is never used for model training without your express permission" [V] | Batch −50 %. Lectura de caché al 10 % del precio de entrada (5 % en Opus y Sonnet 5.5; 2,5 % en Fable) [V: https://platform.claude.com/docs/en/about-claude/models/overview] |
| **Google Vertex AI** | Sí [V] | **Sí**, para los servicios listados (datos en reposo y procesamiento de ML en una multirregión) [V: https://cloud.google.com/terms/service-terms §16; https://cloud.google.com/terms/data-residency] | No almacena los prompts fuera de la cuenta del cliente más tiempo del necesario salvo instrucción. Los sistemas antiabuso pueden registrar prompts [V: https://cloud.google.com/terms/service-terms] | "Google will not use Customer Data to train or fine-tune any AI/ML models without Customer's prior permission" [V: §18] | Batch o Flex al 50 %. Caché disponible [V] |
| **Google Gemini API** (AI Studio) | Sí | [NV] | [NV] | Según conocimiento previo: el nivel gratuito sí puede usar los datos para mejorar productos y el nivel de pago no [NV]. Comprobar en https://ai.google.dev/gemini-api/terms | [NV] |
| **OpenAI** | Sí [NV] | Según conocimiento previo, existe residencia en Europa para proyectos de API que la cumplen [NV] | Según conocimiento previo, hasta 30 días para control de abuso. ZDR bajo solicitud [NV] | Según conocimiento previo, no por defecto [NV] | Batch y caché [NV] |
| **Mistral** | Sí, según el modelo [NV] | Empresa de la UE con alojamiento en la UE [NV] | [NV] | [NV] | [NV] |

### 3.3 Recomendación de proveedor

- **Si la residencia en la UE es un requisito duro** (recomendable con datos de salud): usar **Vertex AI en una región de la UE con Gemini 3.5 Flash-Lite** para interpretar entradas y **Gemini 3.8 Flash** para el asistente. Hay que tener en cuenta la subida de precio del 1-1-2027 [V]. Mistral queda como alternativa a validar [NV].
- **Si se acepta tratamiento en EE. UU.** con DPF o SCC: **Claude Haiku 5.5** para interpretar, por ser el más barato de los verificados, y **Claude Sonnet 5.5** para el asistente.
- **Arquitectura:** el backend en Quarkus hace de *gateway* de IA, sin llamadas directas desde el cliente. Conviene una abstracción por proveedor (p. ej. LangChain4j o el SDK de cada proveedor) para poder cambiar de modelo sin tocar la app.

### 3.4 Buenas prácticas de coste

- **Caché de prompts:** cachear el *system prompt*, el esquema JSON y las tablas de referencia. Las lecturas de caché cuestan entre el 2,5 % y el 10 % del precio de entrada en Claude, y entre el 5 % y el 10 % en Gemini [V].
- **Batch:** usarlo para tareas no interactivas, como los planes semanales generados de noche (−50 %) [V].
- **Imágenes:** reducirlas a ≤ 784×784 px en el cliente antes de enviarlas (ver §3.5).
- **Salida:** salida estructurada con `max_tokens` bajo y razonamiento desactivado o con esfuerzo bajo en la tarea de interpretación.

### 3.5 Estimación de coste por operación

**Fórmula general:**

```
Coste (USD) = ( T_in·P_in + T_cache_read·P_cache_read + T_cache_write·P_cache_write + T_out·P_out ) / 1 000 000
```

**Supuestos (son estimaciones, no medidas):**

- **Frase de ejemplo:** "he desayunado dos huevos y una tostada" tiene 38 caracteres. Con el tokenizador actual de Claude, 1M de tokens equivale a unos 2,5M de caracteres [V: https://platform.claude.com/docs/en/about-claude/models/overview], así que la frase son unos **15 tokens**.
- **System prompt:** instrucciones, esquema JSON y prompt de herramientas, unos **800 tokens**. Son cacheables.
- **Salida:** JSON con 2 alimentos, cantidades y kcal/macros estimados, unos **250 tokens**.
- **Texto sin caché:** T_in = 1 000 y T_out = 250.
- **Texto con caché:** T_in = 200 y T_cache_read = 800. La escritura en caché se amortiza entre muchas peticiones y se ignora.
- **Foto de un plato:**
  - **Claude:** cuesta `⌈ancho/28⌉ × ⌈alto/28⌉` tokens [V: https://platform.claude.com/docs/en/build-with-claude/vision]. Una imagen de 1000×1000 son **1 296 tokens** [V]. A 784×784 serían 28×28 = **784 tokens**.
  - **Gemini:** la página de precios cita 1 120 tokens por imagen de entrada en 3.1 Flash Image y 258 tokens por imagen en la Live API [V]. Se usa **1 120** como cota conservadora.
  - En los dos casos se suman 850 tokens de texto y 300 de salida.
- **Perfil mensual de un usuario activo:** 4 registros de texto al día y 1 foto al día, es decir, 120 textos con caché y 30 fotos al mes.

| Modelo | Texto sin caché | Texto con caché | Foto | **Mes por usuario activo** |
|---|---|---|---|---|
| Claude Haiku 5.5 [V] | 0,00022 | 0,00015 | 0,00036 | **0,029** |
| Claude Sonnet 5.5 [V] | 0,00450 | 0,00298 | 0,00729 | 0,576 |
| Claude Opus 5.5 [V] | 0,00900 | 0,00596 | 0,01458 | 1,153 |
| Gemini 3.5 Flash-Lite global [V] | 0,00093 | 0,00071 | 0,00134 | 0,125 |
| Gemini 3.5 Flash-Lite regional UE (+10 %) [V] | 0,00102 | 0,00078 | 0,00148 | 0,138 |
| Gemini 3.8 Flash (hasta 31-12-2026) [V] | 0,00169 | 0,00115 | 0,00260 | 0,216 |
| Gemini 3.8 Flash regional UE (desde 1-1-2027) [V] | 0,00371 | 0,00252 | 0,00573 | 0,475 |
| Gemini 3.1 Pro Preview [V] | 0,00500 | 0,00356 | 0,00754 | 0,653 |
| OpenAI GPT-6 Luna [NV-sec] | 0,00022 | 0,00015 | n/d (tokens de imagen [NV]) | 0,018 (solo texto) |
| OpenAI GPT-6.2 Sol [NV-sec] | 0,00450 | 0,00298 | n/d | 0,358 (solo texto) |
| Mistral Small 4 [NV-sec] | 0,00030 | 0,00019 | n/d | 0,023 (solo texto) |
| Mistral Medium 3.5 [NV-sec] | 0,00337 | 0,00230 | n/d | 0,275 (solo texto) |

**Ejemplo de cálculo** (Claude Haiku 5.5, texto con caché):

```
(200 × 0,10 + 800 × 0,01 + 250 × 0,50) / 1e6 = (20 + 8 + 125) / 1e6 = 0,000153 USD
```

**Lectura:** la salida domina el coste. Conviene limitar la longitud del JSON. Con Haiku 5.5, 1 000 usuarios activos con este perfil cuestan unos **29 USD al mes** en IA de interpretación. **Advertencias:**

- El número real de tokens varía según el tokenizador de cada proveedor y el idioma.
- El razonamiento ("thinking") puede multiplicar los tokens de salida.

---

## 4. Voz e imagen

### 4.1 Voz a texto

| Opción | Plataforma | Coste | Privacidad y limitaciones | Marca |
|---|---|---|---|---|
| **Android `SpeechRecognizer`** | Android | 0 € | Necesita `RECORD_AUDIO`. "The implementation of this API is likely to stream audio to remote servers". **`createOnDeviceSpeechRecognizer` desde API 31** (con `isOnDeviceRecognitionAvailable`). No pensado para reconocimiento continuo | [V: https://developer.android.com/reference/android/speech/SpeechRecognizer] |
| **iOS Speech** (`SFSpeechRecognizer`, iOS 10+; `SpeechAnalyzer` y `SpeechTranscriber`, iOS 26+) | iOS | 0 € | `requiresOnDeviceRecognition` evita enviar el audio por la red ("won't be as accurate") y solo funciona si `supportsOnDeviceRecognition` es verdadero. Los límites del reconocimiento en servidor y las claves `NSSpeechRecognitionUsageDescription` y `NSMicrophoneUsageDescription` están [NV] | [V: https://developer.apple.com/documentation/speech] · [V: https://developer.apple.com/documentation/speech/speechanalyzer] |
| **Web Speech API** (PWA) | Navegador | 0 € | Depende del navegador. En Chrome suele procesarse en servidores de Google y Firefox no implementa `SpeechRecognition` [NV]. **No usar como única vía con datos de salud** | [NV] (https://developer.mozilla.org/docs/Web/API/Web_Speech_API) |
| Plugins de Capacitor | iOS y Android | 0 € | `@capgo/capacitor-speech-recognition` 8.6.0 (17-11-2026, Capacitor ≥ 8, MPL-2.0, 26 versiones en 6 meses). `@capacitor-community/speech-recognition` 7.0.1 (9-6-2025, MIT, sin versiones en 6 meses) | [V: https://registry.npmjs.org/] |
| **Google Cloud STT V2** | Nube | **0,016 USD/min** de 0 a 500k min al mes; 0,01 de 500k a 1M; 0,008 de 1M a 2M; 0,004 por encima. *Dynamic batch* (no en tiempo real): **0,003 USD/min** | Regiones de la UE: [NV] | [V: https://cloud.google.com/speech-to-text/pricing] |
| OpenAI `gpt-transcribe`, `gpt-4o-mini-transcribe` y `whisper-1` | Nube | 0,27 USD/h (0,0045 USD/min); 3 USD por millón de tokens de audio; 0,36 USD/h | — | [NV-sec] |
| Mistral Voxtral Mini Transcribe 3 | Nube (UE) [NV] | 0,21 USD/h (0,0035 USD/min) | — | [NV-sec] |
| **Audio directo a un modelo multimodal** | Nube | Gemini 3.5 Flash-Lite cobra el audio al mismo precio que el texto, 0,30 USD por millón [V]. En la Live API se calculan 25 tokens por segundo de audio [V]. Una nota de 10 s son unos 250 tokens, unos 0,000075 USD. Que la tasa de 25 tokens/s se aplique a la API estándar está [NV] | Un solo paso: transcribir e interpretar. Claude no figura con entrada de audio, solo texto e imagen [V] | [V: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing] |

**Coste de una nota de voz de 10 s:**

- Google STT V2: 0,00267 USD.
- OpenAI `gpt-transcribe`: 0,00075 USD [NV-sec].
- Reconocimiento en el dispositivo: 0 USD.

**Coste mensual** con 20 minutos de voz por usuario: Google STT V2, 0,32 USD; *dynamic batch*, 0,06 USD [V].

**Recomendación:**

1. **Primera opción:** reconocimiento en el dispositivo, mostrando la transcripción al usuario para que la confirme.
2. **Respaldo:** audio a Gemini (regional UE) o a Google STT.
3. **PWA:** campo de texto con dictado del teclado del sistema, que no requiere integración.

### 4.2 Reconocimiento de imágenes de comida

| Opción | Coste | Utilidad | Marca |
|---|---|---|---|
| **LLM multimodal** (Claude, Gemini) | Ver §3.5. Entre 0,00036 USD (Haiku 5.5) y 0,0073 USD (Sonnet 5.5) por foto | Identifica platos, estima raciones y devuelve JSON | [V] |
| Google Cloud Vision, *Label Detection* | Gratis las primeras 1 000 unidades al mes, luego **1,50 USD por cada 1 000** y 1,00 por encima de 5M | Etiquetas genéricas. **No estima raciones ni nutrientes** | [V: https://cloud.google.com/vision/pricing] |
| Lectura de **código de barras** | 0 € en el dispositivo. `@capacitor-mlkit/barcode-scanning` 8.2.2 (31-10-2026, Apache-2.0) o `@capacitor/barcode-scanner` 3.1.3 | El más preciso para productos envasados. Se complementa con una base de datos de alimentos. La licencia ODbL de Open Food Facts está [NV] | [V: https://registry.npmjs.org/] |
| ML en el dispositivo (ML Kit Image Labeling, Core ML) | 0 € | Clasificación genérica | [NV] |

Las estimaciones calóricas a partir de una foto son **aproximadas**. Hay que presentarlas como editables y sin precisión clínica. Es coherente con App Store 1.4.1 [V] y con el posicionamiento de bienestar (§8).

---

## 5. RGPD y datos de salud

> **Nota:** las fuentes oficiales (EUR-Lex, EDPB, AEPD, CURIA y BOE) **no fueron accesibles** desde el entorno. Esta sección se basa en conocimiento previo y debe validarse [NV]. Se indican las URL de referencia.

### 5.1 ¿Son "datos relativos a la salud"?

- **Definición (RGPD art. 4.15 y considerando 35):** son datos de salud los datos personales sobre la salud física o mental, incluida la prestación de servicios sanitarios, **que revelen información sobre su estado de salud** [NV] https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **Criterios del GT29 (anexo de la carta de 5-2-2015 sobre apps y dispositivos de salud),** que el EDPB sigue tomando como referencia [NV]. Son datos de salud:
  1. Los datos inherentemente médicos.
  2. Los **datos brutos de sensores** que, solos o combinados, permiten **sacar conclusiones** sobre el estado o el riesgo de salud.
  3. Las **conclusiones** sobre el estado o el riesgo de salud, **sean o no exactas**.
- **Jurisprudencia del TJUE** [NV]:
  - **C-184/20, OT (1-8-2022):** son categoría especial los datos que **revelan de forma indirecta** información sensible tras una operación intelectual de deducción o cotejo.
  - **C-252/21, Meta Platforms c. Bundeskartellamt (4-7-2023):** tratar datos de navegación o de apps que permiten **inferir** categorías especiales es tratamiento de datos sensibles. La excepción de "datos hechos manifiestamente públicos" exige un acto deliberado del interesado.
  - **C-21/23, Lindenapotheke (4-10-2024):** los datos introducidos al pedir online medicamentos sin receta son datos de salud aunque solo permitan inferir el estado de salud **con cierta probabilidad**.
  - **C-667/21, Krankenversicherung Nordrhein (21-12-2023):** el tratamiento de datos del art. 9 necesita **además** una base jurídica del art. 6.

**Aplicación a FITona (criterio de prudencia):**

| Dato | ¿Dato de salud? |
|---|---|
| Peso, IMC, % de grasa, perímetro | **Sí** |
| Registro de comidas | **Sí, en la práctica.** Revela o permite inferir dietas ligadas a patologías (sin gluten → celiaquía; bajo en hidratos → diabetes), intolerancias y patrones de TCA. Además, la IA hace inferencias sobre él |
| Actividad (pasos, sesiones), frecuencia cardiaca y sueño | **Sí,** sobre todo combinados con lo anterior, o la frecuencia cardiaca por sí sola |
| Estado de ánimo o bienestar | **Sí** (salud mental) |
| Preferencias culinarias (p. ej. vegetariano o halal) | Pueden revelar **creencias religiosas o filosóficas**, también protegidas por el art. 9 |

**Conclusión:** diseñar todo el dominio de datos como **categoría especial**.

### 5.2 Bases jurídicas

| Tratamiento | Base del art. 6 | Excepción del art. 9 |
|---|---|---|
| Cuenta y prestación del servicio básico | 6.1.b (contrato) | — |
| Registro de comidas, actividad, peso y bienestar | 6.1.a (consentimiento) o 6.1.b | **9.2.a: consentimiento explícito** |
| Envío a un proveedor de IA (encargado) | Igual que el tratamiento principal. El proveedor actúa como encargado del art. 28 | El mismo consentimiento explícito, informando específicamente del uso de IA |
| Sincronización con HealthKit o Health Connect | 6.1.a | 9.2.a, con un permiso independiente |
| Marketing | 6.1.a | **No usar datos de salud** (HealthKit y Apple 5.1.3 también lo prohíben) [V] |

**Requisitos del consentimiento:**

- Explícito, libre, específico, informado e inequívoco.
- **Separado** de las condiciones.
- **Granular**, por finalidad: registro, IA, integración con Salud y fotos.
- **Revocable** con la misma facilidad con que se dio (art. 7.3).
- **Registrado** (art. 7.1).

Referencia: EDPB, Directrices 05/2020 sobre el consentimiento [NV] https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_es

**LOPDGDD art. 9.1:** el consentimiento por sí solo no levanta la prohibición cuando la finalidad principal es identificar ideología, afiliación sindical, religión, orientación sexual, creencias u origen racial o étnico. La salud no está en esa lista [NV] https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673

**Freemium:** que el plan gratuito sea "a cambio de datos" es delicado. El consentimiento para usos no necesarios no puede condicionar el servicio (art. 7.4) [NV].

### 5.3 EIPD (evaluación de impacto): **obligatoria**

- **Base legal:** art. 35 RGPD y la **lista de la AEPD** de tratamientos que requieren EIPD (art. 35.4) [NV] https://www.aepd.es/documento/listas-dpia-es-35-4.pdf
- **Criterios de esa lista que FITona cumple** (según recuerdo de la lista, a verificar):
  - Categorías especiales del art. 9.1.
  - **Perfilado o evaluación** de aspectos de salud y hábitos.
  - **Uso de nuevas tecnologías** o uso innovador de las consolidadas, **incluida la IA**.
  - Posible tratamiento **a gran escala**.
  - Combinación de bases de datos (HealthKit, Health Connect, archivos importados).
  - En su caso, **sujetos vulnerables** (menores).
- La AEPD indica que, en general, cumplir **dos o más criterios** obliga a hacer la EIPD [NV].
- **Recomendación:** hacer la EIPD **antes** del lanzamiento, con la herramienta **Gestiona EIPD** de la AEPD [NV]. Si el riesgo residual es alto, hay que hacer la **consulta previa** del art. 36.

### 5.4 DPO, registro y seguridad

- **DPO:** el art. 37.1.c lo exige si la **actividad principal** consiste en tratar **a gran escala** categorías especiales. En una app de nutrición con IA, el tratamiento de datos de salud **es** la actividad principal. Se recomienda **nombrar DPO** desde el lanzamiento y comunicarlo a la AEPD (LOPDGDD art. 34) [NV].
- **Registro de actividades (art. 30):** es obligatorio aunque haya menos de 250 empleados, porque se tratan datos del art. 9 [NV].
- **Seguridad (art. 32) y protección desde el diseño (art. 25):**
  - Cifrado en tránsito y en reposo (Oracle TDE o cifrado de columnas para los datos de salud).
  - Seudonimización de los prompts: enviar a la IA solo lo necesario, sin nombre ni email.
  - Control de accesos y auditoría.
  - Retención limitada de fotos y audios: borrarlos tras procesarlos.
  - Notificación de brechas en **72 h** (art. 33).

### 5.5 Encargados (art. 28)

- Firmar un **DPA** (contrato de encargado) con cada proveedor: IA, nube, analítica, correo y crash reporting.
- Configurar la retención mínima: Anthropic no retiene el contenido por defecto [V], ZDR (retención cero) se contrata, y Vertex no entrena ni almacena prompts más allá de lo necesario [V].
- Inventariar los **subencargados**.

### 5.6 Transferencias internacionales (proveedores de IA de EE. UU.)

- **Data Privacy Framework (DPF):** Decisión de adecuación (UE) 2023/1795, de 10-7-2023. Comprobar que la entidad concreta está **certificada** en https://www.dataprivacyframework.gov/list [NV]. El Tribunal General desestimó el recurso *Latombe* (T-553/23) en septiembre de 2025, pero cabe recurso de casación [NV].
- **Si no hay DPF:** **SCC** (Decisión (UE) 2021/914), más una **TIA** (evaluación de impacto de la transferencia) conforme a las Recomendaciones 01/2020 del EDPB, más medidas complementarias como la seudonimización [NV].
- **Mejor opción:** evitar la transferencia con **procesamiento en la UE**: Vertex AI regional [V], Mistral [NV], o Claude en Bedrock o Google Cloud con endpoint en la UE [V para el recargo; NV para la disponibilidad por modelo].
- Con Claude en la API directa no hay residencia en la UE [V], así que habría transferencia.

### 5.7 Derechos de los interesados

| Derecho | Implementación en FITona |
|---|---|
| Acceso (art. 15) | Pantalla "Mis datos" y exportación completa |
| Rectificación (art. 16) | Edición de registros e inferencias de la IA |
| **Supresión (art. 17)** | Borrado de la cuenta dentro de la app, que también exigen Apple y Google. Propagar el borrado a copias de seguridad (con plazos), a los encargados y a los archivos subidos |
| **Portabilidad (art. 20)** | Exportación en **formato estructurado y de lectura mecánica** (JSON o CSV, y GPX o FIT para las actividades) de los datos facilitados por el usuario |
| Oposición y retirada del consentimiento (art. 7.3 y 21) | Interruptores por finalidad. La retirada detiene el uso de IA sobre los datos |
| Decisiones automatizadas (art. 22) | Los menús sugeridos no producen efectos jurídicos ni significativos, pero conviene dar información y permitir intervención humana o edición |
| Plazo | 1 mes, ampliable 2 meses (art. 12.3) |

**Otros puntos:**

- **Cookies y SDK de analítica:** se rigen por la LSSI, art. 22.2, que exige consentimiento previo para lo que no sea necesario [NV].
- **Espacio Europeo de Datos de Salud (Reglamento (UE) 2025/327):** si en el futuro se declarara interoperabilidad con sistemas de historia clínica electrónica, habría obligaciones de etiquetado para las apps de bienestar [NV].

---

## 5 bis. Publicidad y protección del consumidor

> **Nota:** esta sección es [NV].

| Tema | Obligación | Marca |
|---|---|---|
| **Botón de desistimiento** | La Directiva (UE) 2023/2673 añade el art. 11 bis a la Directiva 2011/83/UE: una **función de desistimiento** visible en los contratos a distancia celebrados por interfaz en línea. Aplicable desde el **19-6-2026**. No se pudo verificar su transposición en España | [NV] https://eur-lex.europa.eu/eli/dir/2023/2673/oj |
| **Cancelar suscripciones** | TRLGDCU (RDL 1/2007), art. 62: no se puede obstaculizar la baja, que debe poder hacerse **por el mismo medio** por el que se contrató. Las suscripciones vía IAP se gestionan en Apple y Google. Si se venden por la web (p. ej. Stripe), hace falta una baja en línea sencilla | [NV] https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555 |
| Información precontractual | Precio final con IVA, renovación automática, duración y condiciones de la prueba gratuita y su conversión (TRLGDCU art. 97 y Directiva 2011/83/UE art. 6) | [NV] |
| Directiva Ómnibus (UE) 2019/2161 | Reseñas auténticas e indicación de precios en las rebajas | [NV] |
| **DSA (Reglamento (UE) 2022/2065)** | Se aplica a los **servicios intermediarios**. Si FITona solo almacena datos privados del usuario, su encaje como "alojamiento de datos" es discutible y las obligaciones serían mínimas: punto de contacto (arts. 11–12), condiciones (art. 14) y mecanismo de notificación (art. 16). Si se añaden **funciones sociales públicas** (recetas compartidas, comunidad), pasa a ser **plataforma en línea**, aunque las micro y pequeñas empresas están exentas de parte de las obligaciones (art. 19) | [NV] https://eur-lex.europa.eu/eli/reg/2022/2065/oj |
| Publicidad con finalidad sanitaria | RD 1907/1996 (incluye las afirmaciones de adelgazamiento). Reglamento (CE) 1924/2006 (declaraciones nutricionales). Ley 34/1988 General de Publicidad | [NV] |
| Accesibilidad | La Directiva (UE) 2019/882 y la Ley 11/2023 se aplican desde el 28-6-2025 a los servicios de comercio electrónico. Las microempresas de servicios están exentas | [NV] |
| *Digital Fairness Act* | Propuesta de la Comisión prevista para 2026 sobre *dark patterns* y suscripciones. Estado: [NV] | [NV] |

---

## 6. Menores

> **Nota:** todo esta sección está marcada como [NV] por el bloqueo de BOE, AEPD y EUR-Lex.

| Aspecto | Dato | Marca |
|---|---|---|
| Edad de consentimiento en España | **LOPDGDD art. 7.1:** el consentimiento del menor solo es válido a partir de los **14 años**. Por debajo hace falta el de quien ejerza la patria potestad o tutela. Como referencia, el RGPD, art. 8, fija 16 años con la posibilidad de rebajarlo a 13 | [NV] https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 |
| Reforma en curso | El proyecto de **Ley Orgánica de protección de las personas menores de edad en los entornos digitales** (2024–2025) proponía **elevar la edad a 16 años**. No se pudo verificar en qué estado está en nov-2026 | [NV] |
| Señales de edad en las tiendas | **Apple Declared Age Range API**, en iOS e iPadOS 26+, con el entitlement `com.apple.developer.declared-age-range`. "You are solely responsible for ensuring compliance" | [V: https://developer.apple.com/documentation/declaredagerange] |
| | **Play Age Signals API** (beta). Prohíbe usar las señales para publicidad o perfilado | [V: https://developer.android.com/google/play/age-signals/overview] |
| Reglas de Apple | 5.1.4: las apps que recogen datos de menores deben tener política de privacidad y cumplir la normativa. En la categoría Kids no se permiten analíticas ni publicidad de terceros | [V: https://developer.apple.com/app-store/review/guidelines/] |

**Salvaguardas recomendadas:**

- **MVP para mayores de 18 años**, con *age gate* en el alta y la declaración de edad de la tienda. Si más adelante se abre a 16 o 17 años, hay que:
  - Prohibir los objetivos de déficit calórico agresivo, los rankings de peso y las comparativas sociales.
  - Desactivar las funciones de pérdida de peso o limitarlas a un plan neutro.
  - Incluir mensajes y recursos de ayuda sobre **TCA** (trastornos de la conducta alimentaria) y detectar señales de riesgo en el asistente.
  - No hacer perfilado comercial ni enviar notificaciones de marketing.
  - Aplicar valores por defecto de máxima privacidad (art. 25 del RGPD).
  - Revisar la EIPD, porque los menores son un **colectivo vulnerable**, criterio de la lista de la AEPD [NV].
- No publicar en la categoría *Kids* ni usar los términos "para niños" (Apple 2.3.8) [V].

---

## 7. Reglamento de IA de la UE (Reglamento (UE) 2024/1689)

> **Nota:** esta sección es [NV] salvo que se indique otra cosa. Fuente para verificar: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

### 7.1 Clasificación probable de FITona

| Escenario | Clasificación | Motivo |
|---|---|---|
| Asistente nutricional y de actividad para **adultos sanos**, con fines de bienestar | **Riesgo mínimo o limitado:** solo obligaciones de **transparencia (art. 50)** y alfabetización en IA (art. 4) | No aparece en las prácticas prohibidas (art. 5) ni en el Anexo III, y no es componente de seguridad de un producto del Anexo I [NV] |
| Funciones con **finalidad médica** que conviertan la app en producto sanitario de clase IIa o superior (§8) | **Alto riesgo** (art. 6.1 + Anexo I, MDR) | Necesitaría evaluación por un organismo notificado según el MDR. Se aplica desde el **2-8-2027** [NV] |
| Funciones que exploten vulnerabilidades como la edad o los TCA para influir en el comportamiento de forma perjudicial | **Prohibido** (art. 5.1.b) | Hay que evitar *dark patterns* en los objetivos de peso [NV] |

### 7.2 Obligaciones y fechas

| Obligación | Contenido | Desde | Marca |
|---|---|---|---|
| Art. 4: alfabetización en IA | Formación adecuada del personal que opera o desarrolla el sistema | **2-2-2025** | [NV] |
| Art. 5: prácticas prohibidas | — | 2-2-2025 | [NV] |
| Obligaciones de modelos GPAI (Capítulo V) | Recaen en los **proveedores del modelo** (Anthropic, Google…), no en FITona salvo que modifique el modelo de forma sustancial | 2-8-2025 | [NV] |
| **Art. 50.1** | Los proveedores deben diseñar el sistema para que las personas **sepan que interactúan con una IA**, salvo que resulte obvio | **2-8-2026** (ya aplicable) | [NV] |
| **Art. 50.2** | Marcar en formato legible por máquina los contenidos sintéticos (texto, audio, imagen) generados, con excepciones para la edición asistida. FITona, como integrador, probablemente sea "proveedor" del sistema de IA si lo comercializa con su nombre | 2-8-2026 | [NV] |
| Alto riesgo (Anexo I) | — | 2-8-2027 | [NV] |
| *Digital Omnibus* (propuesta de la Comisión, nov-2025) | Proponía aplazar obligaciones de alto riesgo y establecer un periodo transitorio para el art. 50.2. **No se pudo verificar si se ha aprobado** | — | [NV] |

### 7.3 Cómo cumplir el art. 50 en la app

- Un aviso visible en el chat ("Estás hablando con un asistente de IA").
- Una etiqueta "Sugerido por IA" en menús, estimaciones de foto y planes.
- Metadatos `ai_generated=true` en la base de datos y en los exportables.
- Documentar en la política de privacidad y en las condiciones qué hace la IA, sus límites y que no es consejo médico.
- Guardar registros (*logs*) de versión de modelo y prompt para trazabilidad, aunque no sea legalmente obligatorio en riesgo mínimo.

---

## 8. Reglamento de productos sanitarios (MDR 2017/745) y guía MDCG 2019-11

> **Nota:** esta sección es [NV]. Fuentes para verificar: https://eur-lex.europa.eu/eli/reg/2017/745/oj y https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en

### 8.1 Criterio general

- **Definición de producto sanitario (MDR art. 2.1):** el software lo es si el fabricante le da una **finalidad médica**. Esto incluye diagnosticar, prevenir, monitorizar, predecir, pronosticar, tratar o aliviar una **enfermedad**, o compensar una lesión o discapacidad [NV].
- **Considerando 19:** el software para fines generales o de **estilo de vida y bienestar** no es producto sanitario [NV].
- **MDCG 2019-11:** guía de cualificación y clasificación de software. Se cree que tiene una revisión de 2025 [NV]. Usa un árbol de decisión:
  1. ¿Es software?
  2. ¿Hace algo más que almacenar, archivar, comunicar o buscar datos de forma simple?
  3. ¿Es en beneficio de pacientes individuales?
  4. ¿Tiene finalidad médica según el art. 2.1? [NV]
- **Regla 11 (Anexo VIII):** el software que proporciona información para decisiones diagnósticas o terapéuticas es, **como mínimo, de clase IIa**. El que monitoriza procesos fisiológicos es de clase IIa, o IIb si son parámetros vitales críticos. Todo lo demás es de clase I [NV].

### 8.2 Ejemplos para FITona

| Función | ¿Producto sanitario? (orientativo) |
|---|---|
| Registrar comidas, calcular kcal y macros, objetivos de peso para adultos sanos, planificador de menús, recetas | **No:** bienestar o estilo de vida [NV] |
| Recomendaciones generales de alimentación saludable (p. ej., basadas en guías de salud pública) | **No**, si no se dirigen a una enfermedad [NV] |
| Planes para **tratar** diabetes, obesidad como enfermedad, hipertensión, enfermedad renal o celiaquía como pauta terapéutica | **Probablemente sí** [NV] |
| Cálculo de **dosis de insulina** o de bolos según los carbohidratos | **Sí**, probablemente de clase IIb [NV] |
| Detectar o "diagnosticar" un TCA, déficits nutricionales o riesgo de enfermedad | **Probablemente sí** [NV] |
| Filtrar recetas por alérgenos declarados por el usuario | Zona gris. Si se presenta como preferencia y no como gestión médica de una alergia, es más defendible. Requiere análisis [NV] |

### 8.3 Cómo mantenerse en bienestar

- Redactar la **finalidad prevista** en las condiciones, la ficha de las tiendas y la web: "bienestar y hábitos saludables para adultos sanos; no diagnostica, trata ni previene enfermedades".
- Coherencia en el marketing:
  - Revisar todos los *claims* en las tiendas, las redes y el *system prompt* del asistente.
  - Las palabras "tratar", "curar", "diabetes", "obesidad", "paciente" o "dieta terapéutica" son señales de alarma.
- Hacer que el asistente **derive al profesional sanitario** cuando el usuario mencione enfermedades, embarazo, medicación o TCA. Es coherente con Apple 1.4.1: "remind users to check with a doctor" [V].
- En Play Console, declarar las funciones de "Nutrition and weight management", **no** "Medical device apps". Las apps reguladas como producto sanitario deben aportar prueba de autorización si se les pide [V-b: https://support.google.com/googleplay/android-developer/answer/14738291].
- **Publicidad sanitaria en España:** revisar el **RD 1907/1996**, sobre publicidad con pretendida finalidad sanitaria, que incluye las afirmaciones de adelgazamiento, y el **Reglamento (CE) 1924/2006**, sobre declaraciones nutricionales y de propiedades saludables, si se promocionan alimentos [NV].
- Anotar en un registro interno cada decisión de producto que toque la frontera entre bienestar y uso médico.

---

## 9. Tiendas móviles

### 9.1 Costes

| Concepto | Apple App Store | Google Play | Marca |
|---|---|---|---|
| Cuenta de desarrollador | **99 USD al año** o el equivalente en moneda local. Exención de la cuota para ONG, centros educativos y administraciones | **25 USD en un único pago** | Apple [V: https://developer.apple.com/programs/whats-included/] · Google [V-b: https://support.google.com/googleplay/android-developer/answer/14659200] |
| Comisión estándar en la UE (compras dentro de la app) | **26 %** con Apple IAP (términos unificados de la UE desde el **1-10-2026**) | Bienes no recurrentes, por encima del primer millón de USD: **20 %** en instalaciones nuevas y **25 %** en existentes, más el **5 %** de tarifa de facturación si se usa Play Billing (EEE, desde el 30-6-2026) | Apple [V: https://developer.apple.com/support/apps-in-the-eu/] · Google [V-b: https://support.google.com/googleplay/android-developer/answer/16954621] |
| Comisión reducida | **15 %** para el Small Business Program (ingresos ≤ 1M USD) y para **suscripciones a partir del primer año**. Con pago alternativo: 20 % / 10 %. Enlace externo (*link-out*): 15 % / 10 % | **10 % en el primer millón de USD**, más el 5 % de facturación | Apple [V] · Google [V-b] |
| Suscripciones | IAP: 26 % el primer año y 15 % después, o **15 % desde el primer día con SBP** [V]. Que el SBP se aplique a las suscripciones del primer año en los términos de la UE se deduce de la página, pero conviene confirmarlo en el Anexo 14 del DPLA [NV] | **10 % de tarifa de servicio** en todas las suscripciones con renovación automática, más el 5 % de facturación | Apple [V] · Google [V-b: https://android-developers.googleblog.com/2026/06/play-expanded-billing.html] |
| Small Business Program de Apple | Desarrolladores nuevos o con ingresos ≤ 1M USD el año anterior, contando las cuentas asociadas | — | [V: https://developer.apple.com/app-store/small-business-program/] |

### 9.2 Requisitos

| Requisito | Apple | Google Play |
|---|---|---|
| **Eliminación de cuenta dentro de la app** | **5.1.1(v)**: si la app permite crear cuenta, debe permitir **eliminarla desde la app**. Desactivarla no basta. Con Sign in with Apple, hay que revocar los tokens con la REST API. Hay que avisar de que las suscripciones de Apple siguen activas hasta cancelarlas [V: https://developer.apple.com/support/offering-account-deletion-in-your-app/] | Ruta **dentro de la app** y además un **enlace web** para pedir la eliminación de la cuenta y de los datos. "Congelar" la cuenta no cuenta como eliminación. Se declara en *Data safety* [V-b: https://support.google.com/googleplay/android-developer/answer/13327111] |
| **Privacidad declarada** | *App Privacy Details*: declarar todos los datos que recogen la app y los SDK de terceros. Incluye la categoría **Health & Fitness**. Lo que solo se procesa en el dispositivo no se considera "recogido". URL de la política de privacidad obligatoria [V: https://developer.apple.com/app-store/app-privacy-details/] | Sección **Data safety** obligatoria, con preguntas sobre eliminación de datos [V-b: https://support.google.com/googleplay/android-developer/answer/10787469] |
| **Apps de salud y nutrición** | 1.4.1 (apps médicas), 5.1.3 (salud), uso de HealthKit y 5.1.2(i) (IA de terceros con permiso explícito) [V] | Formulario **Health apps declaration**, obligatorio para todas las apps. Política de privacidad. Declaración de los tipos de datos de Health Connect. Política de *Health Content and Services* [V-b: https://support.google.com/googleplay/android-developer/answer/14738291] · [V: https://developer.android.com/health-and-fitness/health-connect/publish] |
| **Login social** | **4.8 Login Services**: si se usa un login de terceros (p. ej. Google) para la cuenta principal, hay que ofrecer **otro servicio equivalente** que se limite a nombre y email, permita ocultar el email y no rastree para publicidad sin consentimiento. *Sign in with Apple* cumple, pero **ya no se exige expresamente**. No hace falta si solo hay cuenta propia [V: https://developer.apple.com/app-store/review/guidelines/] | — |
| **Suscripciones** | 3.1.2: periodo mínimo de 7 días, valor continuado, disponible en todos los dispositivos del usuario y descripción clara de lo que se obtiene antes de suscribirse [V] | [NV] (políticas de suscripción de Play) |
| **Pruebas antes de producción** | — | Cuentas **personales** creadas después del **13-11-2023**: prueba cerrada con **al menos 12 probadores** que permanezcan **14 días seguidos**. Hasta dic-2024 eran 20. Las cuentas de organización están exentas. La revisión suele tardar ≤ 7 días [V-b: https://support.google.com/googleplay/android-developer/answer/14151465] |
| **Nivel de API objetivo** | La versión mínima del SDK y de Xcode exigida en nov-2026 está [NV] | Apps nuevas y actualizaciones: **Android 16 (API 36) desde el 31-8-2026**, con prórroga posible hasta el 1-11-2026. Las apps existentes deben apuntar a **API ≥ 35** para seguir visibles a usuarios nuevos en versiones recientes de Android [V-b: https://support.google.com/googleplay/android-developer/answer/11926878]. Health Connect `connect-client` ≥ 1.1.0 ya exige `compileSdk 36` [V] |
| **Edad** | Declared Age Range API (iOS 26+) [V] | Play Age Signals API (beta) [V] |

### 9.3 Recomendaciones para las tiendas

1. **Google Play:** registrar una cuenta de **organización**. Requiere D-U-N-S [NV] y evita el requisito de 12 probadores durante 14 días.
2. **Apple Small Business Program:** apuntarse antes de la primera venta.
3. **Login:** si se ofrece Google Sign-In, añadir **Sign in with Apple**, que es la forma más simple de cumplir la regla 4.8.
4. **Permiso de IA de terceros:** pantalla de consentimiento explícito antes del primer uso de funciones que envían datos a un proveedor de IA. Sirve a la vez para Apple 5.1.2(i) y para el art. 9.2.a del RGPD.
5. **Datos de salud:** no sincronizarlos con iCloud (Apple 5.1.3(ii)) [V]. El almacenamiento local cifrado (p. ej. `@capacitor-community/sqlite` 8.1.1 [V: npm] con cifrado) sí es válido. No incluir datos de salud en las copias de iCloud.

---

## 10. Fuentes

Las fuentes están **numeradas**. Todas se consultaron el **18-11-2026**. El tipo de verificación se indica con [V], [V-b], [NV] o [NV-sec].

**Apple**

1. App Store Review Guidelines (1.4.1, 3.1.2, 4.8, 5.1.1(v), 5.1.2(i), 5.1.3, 5.1.4). https://developer.apple.com/app-store/review/guidelines/ [V]
2. Apple Developer Program, qué incluye y precio. https://developer.apple.com/programs/whats-included/ [V]
3. App Store Small Business Program. https://developer.apple.com/app-store/small-business-program/ [V]
4. Changes for apps in the European Union (términos desde el 1-10-2026). https://developer.apple.com/support/apps-in-the-eu/ [V]
5. Offering account deletion in your app. https://developer.apple.com/support/offering-account-deletion-in-your-app/ [V]
6. App privacy details on the App Store. https://developer.apple.com/app-store/app-privacy-details/ [V]
7. HealthKit, Setting up HealthKit. https://developer.apple.com/documentation/healthkit/setting-up-healthkit [V]
8. HealthKit, Protecting user privacy. https://developer.apple.com/documentation/healthkit/protecting-user-privacy [V]
9. Entitlement `com.apple.developer.healthkit`. https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.healthkit [V]
10. Speech framework. https://developer.apple.com/documentation/speech [V]
11. `requiresOnDeviceRecognition`. https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition [V]
12. `SpeechAnalyzer` (iOS 26+). https://developer.apple.com/documentation/speech/speechanalyzer [V]
13. Declared Age Range API. https://developer.apple.com/documentation/declaredagerange [V]
14. Apple Newsroom, cambios en la UE (agosto de 2026). https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union/ [V-b]

**Android y Google Play**

15. Migración desde Google Fit. https://developer.android.com/health-and-fitness/health-connect/migration/fit [V]
16. Publicar una app de salud con Health Connect. https://developer.android.com/health-and-fitness/health-connect/publish [V]
17. Primeros pasos con Health Connect. https://developer.android.com/health-and-fitness/health-connect/get-started [V]
18. `SpeechRecognizer`. https://developer.android.com/reference/android/speech/SpeechRecognizer [V]
19. Play Age Signals API. https://developer.android.com/google/play/age-signals/overview [V]
20. Requisitos de prueba para cuentas personales nuevas. https://support.google.com/googleplay/android-developer/answer/14151465 [V-b]
21. Requisitos de nivel de API objetivo. https://support.google.com/googleplay/android-developer/answer/11926878 [V-b]
22. Anuncio de políticas del 15-7-2026. https://support.google.com/googleplay/android-developer/answer/17134731 [V-b]
23. Tarifas reducidas de Google Play. https://support.google.com/googleplay/android-developer/answer/16954621 [V-b]
24. Condiciones generales de acceso a Google Play en el EEE. https://support.google.com/googleplay/android-developer/answer/14659200 [V-b]
25. Android Developers Blog, "Expanded billing choice and lower fees on Google Play" (junio de 2026). https://android-developers.googleblog.com/2026/06/play-expanded-billing.html [V-b]
26. Android Developers Blog, "A new era for choice and openness" (marzo de 2026). https://android-developers.googleblog.com/2026/03/a-new-era-for-choice-and-openness.html [V-b]
27. Requisitos de eliminación de cuenta. https://support.google.com/googleplay/android-developer/answer/13327111 [V-b]
28. Sección Data safety. https://support.google.com/googleplay/android-developer/answer/10787469 [V-b]
29. Health apps declaration. https://support.google.com/googleplay/android-developer/answer/14738291 [V-b]
30. Health Content and Services. https://support.google.com/googleplay/android-developer/answer/16679511 [V-b]

**Strava**

31. Strava API Policy (2026). https://www.strava.com/legal/api_policy [V-b]
32. Strava API Agreement (2026). https://www.strava.com/legal/api [V-b]
33. Updates to Strava's API Agreement (nov-2024). https://press.strava.com/articles/updates-to-stravas-api-agreement [V-b]
34. An Update To Our Developer Program (1-6-2026). https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428 [V-b]
35. Strava API FAQ. https://communityhub.strava.com/developers-knowledge-base-14/strava-api-faq-12906 [V-b]
36. Our Developer Program. https://communityhub.strava.com/developers-knowledge-base-14/our-developer-program-3203 [V-b]
37. Rate limits. https://developers.strava.com/docs/rate-limits/ [V-b]
38. Webhook Events API. https://developers.strava.com/docs/webhooks/ [V-b]
39. Changelog. https://developers.strava.com/docs/changelog/ [V-b]
40. Precio de la suscripción de Strava para desarrolladores (fuente secundaria). https://appsforstrava.com/blog/strava-developer-program-changes-2026 [NV-sec]

**Garmin**

41. Garmin Connect Developer Program, Overview. https://developer.garmin.com/gc-developer-program/overview/ [V-b]
42. Activity API (Enterprise). https://developer.garmin.com/gc-developer-program/enterprise/activity-api [V-b]
43. Activity API (en japonés, gratuidad para entidades aprobadas). https://developer.garmin.com/gc-developer-program/activity-api-japanese/ [V-b]
44. Program FAQ (acceso personal). https://developer.garmin.com/gc-developer-program/personal/personal-faq/ [V-b]
45. Garmin Connect Developer Program Agreement (PDF). https://developerportal.garmin.com/sites/default/files/Garmin%20Connect%20Developer%20Program%20Agreement.pdf [V-b]
46. Foros de Garmin (formulario de acceso no disponible, fuente comunitaria). https://forums.garmin.com/developer/connect-iq/f/discussion/436226/connect-developer-program-access-form-unavailable-anyone-got-through-recently [V-b]
47. Maven Central, `com.garmin:fit`. https://repo1.maven.org/maven2/com/garmin/fit/maven-metadata.xml [V]

**IA: Anthropic**

48. Pricing. https://platform.claude.com/docs/en/about-claude/pricing [V]
49. Models overview. https://platform.claude.com/docs/en/about-claude/models/overview [V]
50. Data residency. https://platform.claude.com/docs/en/manage-claude/data-residency [V]
51. API and data retention. https://platform.claude.com/docs/en/manage-claude/api-and-data-retention [V]
52. Vision (coste de las imágenes). https://platform.claude.com/docs/en/build-with-claude/vision [V]

**IA: Google Cloud**

53. Precios de Gemini Enterprise Agent Platform (Vertex AI). https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing [V]
54. Google Cloud Service Specific Terms (última modificación: 11-11-2026; §16 AI/ML Data Location, §18 Training Restriction). https://cloud.google.com/terms/service-terms [V]
55. Servicios con residencia de datos. https://cloud.google.com/terms/data-residency [V]
56. Precios de Speech-to-Text. https://cloud.google.com/speech-to-text/pricing [V]
57. Precios de Cloud Vision. https://cloud.google.com/vision/pricing [V]

**IA: OpenAI y Mistral (fuente secundaria)**

58. `@pydantic/genai-prices` 0.2.4 (17-11-2026), precios de OpenAI y Mistral. https://www.npmjs.com/package/@pydantic/genai-prices [NV-sec]
59. Para verificar OpenAI: https://openai.com/api/pricing/ y https://platform.openai.com/docs/guides/your-data [NV, bloqueado]
60. Para verificar Mistral: https://mistral.ai/pricing y https://docs.mistral.ai/ [NV, bloqueado]

**Plugins y librerías (registro de npm)**

61. https://registry.npmjs.org/@capgo/capacitor-health [V]
62. https://registry.npmjs.org/capacitor-health [V]
63. https://registry.npmjs.org/@perfood/capacitor-healthkit [V]
64. https://registry.npmjs.org/@kiwi-health/capacitor-health-connect [V]
65. https://registry.npmjs.org/capacitor-health-connect [V]
66. https://registry.npmjs.org/cordova-plugin-health [V]
67. https://registry.npmjs.org/@capgo/capacitor-speech-recognition [V]
68. https://registry.npmjs.org/@capacitor-community/speech-recognition [V]
69. https://registry.npmjs.org/@capacitor-mlkit/barcode-scanning [V]
70. https://registry.npmjs.org/@garmin/fitsdk [V]
71. https://registry.npmjs.org/fit-file-parser [V]
72. https://registry.npmjs.org/@tmcw/togeojson [V]
73. https://registry.npmjs.org/@capacitor/core [V]

**Normativa (no accesible desde el entorno: verificar)**

74. RGPD, Reglamento (UE) 2016/679. https://eur-lex.europa.eu/eli/reg/2016/679/oj [NV]
75. LOPDGDD, Ley Orgánica 3/2018. https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 [NV]
76. AEPD, listas de tratamientos que requieren EIPD (art. 35.4). https://www.aepd.es/documento/listas-dpia-es-35-4.pdf [NV]
77. EDPB, Directrices 05/2020 sobre el consentimiento. https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_es [NV]
78. TJUE, C-184/20 (OT), C-252/21 (Meta Platforms), C-21/23 (Lindenapotheke) y C-667/21 (Krankenversicherung Nordrhein). https://curia.europa.eu/ [NV]
79. GT29, anexo sobre datos de salud en apps y dispositivos (5-2-2015). https://ec.europa.eu/justice/article-29/documentation/other-document/files/2015/20150205_letter_art29wp_ec_health_data_after_plenary_annex_en.pdf [NV]
80. Decisión de adecuación del DPF (UE) 2023/1795 y lista de entidades certificadas. https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj y https://www.dataprivacyframework.gov/list [NV]
81. Cláusulas contractuales tipo, Decisión (UE) 2021/914. https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj [NV]
82. Reglamento de IA (UE) 2024/1689. https://eur-lex.europa.eu/eli/reg/2024/1689/oj [NV]
83. MDR (UE) 2017/745. https://eur-lex.europa.eu/eli/reg/2017/745/oj [NV]
84. MDCG 2019-11 y documentos MDCG. https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en [NV]
85. Directiva (UE) 2023/2673 (función de desistimiento). https://eur-lex.europa.eu/eli/dir/2023/2673/oj [NV]
86. TRLGDCU, RDL 1/2007. https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555 [NV]
87. DSA, Reglamento (UE) 2022/2065. https://eur-lex.europa.eu/eli/reg/2022/2065/oj [NV]
88. RD 1907/1996, publicidad con pretendida finalidad sanitaria. https://www.boe.es/buscar/act.php?id=BOE-A-1996-17946 [NV]

---

### Pendientes de verificación prioritaria

1. **Precios oficiales de OpenAI y Mistral**, junto con sus políticas de retención, entrenamiento y residencia en la UE.
2. **Disponibilidad de Claude Haiku y Sonnet 5.5** en regiones de la UE de Bedrock y Google Cloud.
3. **Texto vigente de LOPDGDD art. 7** y estado de la ley de menores en entornos digitales.
4. **Estado del *Digital Omnibus*** y fechas del art. 50 del Reglamento de IA.
5. **Revisión vigente de MDCG 2019-11.**
6. **Lista de EIPD de la AEPD.**
7. **Transposición en España** de la Directiva 2023/2673.
8. **Cláusulas de retención y borrado** del Strava API Agreement 2026.
9. **Estado real del alta** en el Garmin Connect Developer Program.
