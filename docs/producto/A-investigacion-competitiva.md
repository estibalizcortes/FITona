# Entregable A · Investigación competitiva

> **Fecha de consulta:** 18-nov-2026 (todas las fuentes salvo que se indique otra fecha del dato).
>
> **Método:** búsquedas web (motor de búsqueda con extracto de cada URL), priorizando fuentes oficiales (webs, centros de ayuda, notas de prensa, fichas de App Store/Google Play) y, después, reseñas de usuarios (Trustpilot, fichas de tiendas, foros, agregadores de Reddit) y prensa especializada. **Limitaciones importantes:**
> - La descarga directa de páginas (WebFetch) falló por restricciones de red de la sesión (`myfitnesspal.com`, `insider.fitt.co`, `markets.financialcontent.com` no resolvieron). Por tanto, "verificado" significa que el dato aparece en el extracto que el buscador ofrece de esa URL, no que se haya leído la página completa.
> - Reddit y The Verge no se pudieron consultar directamente (dominios no accesibles para el buscador); la opinión de Reddit procede de espejos o agregadores, y se indica.
> - Los precios de App Store proceden de fichas en caché con fecha incierta; varias fichas muestran precios contradictorios. Hay que tratarlos como orientativos.
> - El presupuesto de búsquedas de la sesión se agotó antes de terminar; los puntos que quedaron sin comprobar se marcan [NV].
>
> **Leyenda:**
> - **[V]** = verificado con fuente oficial o primaria (web/centro de ayuda/nota de prensa/ficha de tienda/artículo científico), enlazada.
> - **[V·sec]** = verificado solo con fuente secundaria (prensa, agregadores, blogs de terceros o **de competidores**, que tienen interés comercial) → fiabilidad menor.
> - **[NV]** = no verificado en esta investigación (conocimiento previo, inferencia o dato no encontrado).
> - **[P]** = propuesta o valoración nuestra.
> - En tablas: ✓ = sí, ✗ = no (confirmado), ✗* = no aparece en las fuentes consultadas (ausencia **no** confirmada), ? = desconocido o contradictorio, — = no aplica por el tipo de app.

---

## 1. Resumen ejecutivo (máx. 12 viñetas)

1. **El registro "multimodal" con IA (foto, voz, texto libre) ya es commodity y casi siempre de pago**: MyFitnessPal, Fitia, YAZIO, MacroFactor, Cronometer, Lifesum y Lose It! lo ofrecen, en general tras el muro de pago ([V] fichas en §3).
2. **Consolidación agresiva del líder**: MyFitnessPal compró Intent (planificación de comidas, feb-2025) y Cal AI (registro por foto, mar-2026), creó el nivel Premium+ (99,99 US$/año) con planificador y lista de la compra, y lanzó un AI Coach (jun-2026) ([V] §3.1).
3. **Paywall creciente en lo básico**: el escáner de códigos de barras es de pago en MyFitnessPal ([V]) y, según fuentes secundarias, en Lose It! para cuentas nuevas ([V·sec]). Fitia, Cronometer y Lifesum lo mantienen gratis ([V]). Es una de las quejas más repetidas.
4. **Planificación + lista de la compra + despensa conectadas solo existen en pocos productos**: Eat This Much (despensa que descuenta lo que comes, Premium), Samsung Food (despensa automatizada y visión IA en Food+) y Paprika (despensa básica, pago único) ([V]). Los registradores nutricionales grandes (YAZIO, Cronometer, MacroFactor, Lifesum, Lose It!) no muestran despensa en las fuentes consultadas.
5. **Las integraciones de compra y entrega a domicilio son casi exclusivamente de EE. UU./Canadá** (Instacart, Walmart, Kroger, Amazon Fresh) ([V]). No se ha encontrado ninguna integración con supermercados españoles.
6. **El presupuesto apenas existe como función**: solo Eat This Much tiene en cuenta un presupuesto al generar planes ([V]), y en EE. UU. Ningún competidor revisado estima el coste con precios de supermercados españoles ([NV]: ausencia en las fuentes).
7. **El enfoque "sin culpa" está poco cubierto**: Ate es diario fotográfico sin contar calorías ([V]) y MacroFactor declara un coaching "adherence-neutral", que no castiga desviarse ([V]). Nadie combina un modo sin números con planificación, despensa y compra ([P], según las fuentes revisadas).
8. **Competidores en español relevantes**: Fitia (de origen peruano, plan anual 39,99 € en App Store ES, plan familiar con raciones por persona) y MyRealFood (España, escáner con puntuación 0-10, menú semanal y lista por pasillos; plan 59,99 €/año) ([V]).
9. **Brecha de datos españoles**: BEDCA (base oficial) no muestra actualizaciones visibles desde 2012 ([V·sec]); la marca blanca supone ~45-46 % del gran consumo en valor (Kantar/Worldpanel) y hasta un 59 % en unidades (Circana) ([V·sec]). Por eso los códigos de barras de Hacendado, Lidl o DIA y las recetas caseras son críticos y están mal resueltos ([P]).
10. **Riesgos de la categoría bien documentados**: las apps de foto IA subestimaron ~⅓ de las calorías en un estudio del NIH de 2026 (preliminar, sin revisión por pares) ([V·sec]); las bases de datos colaborativas tienen errores ([V]); y el 73 % de los usuarios de MyFitnessPal con TCA en tratamiento percibía que la app contribuía a su trastorno (estudio de 2017) ([V]).
11. **Frustraciones transversales**: cobros y renovaciones inesperadas o cancelación difícil (MyFitnessPal, YAZIO, Lifesum, Lose It!), soporte con chatbots, anuncios intrusivos, bases de datos imprecisas o duplicadas y rediseños que quitan funciones ([V]/[V·sec] §6).
12. **Mealime anunció su cierre para el 21-oct-2026 y el borrado de los datos personales** de sus usuarios (recetas, planes, listas) ([V]); no se ha comprobado que el cierre se haya ejecutado [NV]. Es una advertencia sobre la portabilidad de datos, y deja huérfanos a usuarios de planificadores simples ([P]).

---

## 2. Tabla comparativa

> Precios: los de EE. UU. en US$ y los de España en € cuando hay ficha ES. Son fichas de tienda en caché con fecha incierta (ver notas en §3).

| App | Foto IA | Voz / texto libre | Código de barras gratis | Planificador | Recetas | Lista compra | Despensa | Modo sin números | Precio premium aprox. | Nota |
|---|---|---|---|---|---|---|---|---|---|---|
| **MyFitnessPal** | ✓ (Premium) | ✓ voz (Premium) | ✗ (Premium) | ✓ (Premium+) | ✓ (Premium+) | ✓ (Premium+) | ~ (marcar lo que ya tienes en la cocina) | ? | 79,99 $/año Premium; 99,99 $/año Premium+; ES: 49,99-87,99 €/año (ficha contradictoria) | Integraciones de compra solo EE. UU./CA |
| **Fitia** | ✓ (Premium) | ✓ voz (Premium); texto gratis | ✓ | ✓ automático (Premium) | ✓ 20.000+ (Premium) | ✓ (Premium) | ~ ("planes con lo que tienes", según su blog) | ? | ES: 9,99 €/mes; 39,99 €/año; familiar 59,99 €/año | Gratis limitado a 4 comidas |
| **YAZIO** | ✓ "registro con IA" (PRO) | ? | ? | ~ (registrar comidas futuras, PRO) | ✓ 3.000+ (PRO) | ✓ ilimitadas (PRO) | ✗* | ? | ES: 47,90 €/año (oferta 35,90 €); 23,99 €/3 meses | 100 M usuarios (2025) |
| **MacroFactor** | ✓ | ✓ "Describe" (texto + fotos) | ✗ (no hay plan gratis) | ✗* | ~ (creación de recetas propias) | ✗* | ✗* | ✗ (pero "adherence-neutral") | 71,99 $/año; 11,99 $/mes; pack con Workouts 89,99 $/año | Solo de pago, prueba de 7 días |
| **Cronometer** | ✓ (Gold) | ✓ voz (Gold, abr-2026) | ✓ | ✗* | ~ (importador de recetas) | ✗* | ✗* | ? | Gold ≈ 54,99-59,99 $/año (fuentes contradictorias) | Anuncios a pantalla completa en el plan gratis |
| **Lifesum** | ✓ (Premium) | ✓ voz y texto (Premium) | ✓ | ✓ planes y programas (Premium) | ✓ "1000+" (Premium) | ? | ✗* | ? | ES: 44,99-99,99 €/año (ficha contradictoria); EE. UU. ~49,99 $/año | Trustpilot 2,4-2,5/5 |
| **Lose It!** | ✓ Snap It (sec.) | ✓ Say It (sec.) | ✗ para cuentas nuevas (sec.) | ? (sugerencias, no planes, según fuentes) | ? | ? | ✗* | ? | 39,99 $/año (sec.) vs. 79,99 $ en App Store EE. UU. | Trustpilot ~2/5 |
| **Eat This Much** | ? | ? | ? | ✓ núcleo (diario gratis, semanal Premium) | ✓ | ✓ (Premium) + entrega a domicilio EE. UU. | ✓ (Premium, descuenta lo consumido) | ? | 59,99 $/año o 14,99 $/mes | Único con presupuesto como dato de entrada |
| **Samsung Food** | ~ (visión IA de ingredientes para la despensa, Food+) | ? | ? | ✓ básico gratis; con IA en Food+ | ✓ (160.000+, importador) | ✓ gratis | ✓ (automatizada en Food+) | ? | 59,99 $/año o 6,99 $/mes (precio en € no encontrado) | Antes Whisk; ofrece español de España |
| **MyRealFood** (ES) | ✓ escáner de platos por foto (Google Play) | ? | ? (fuentes contradictorias) | ✓ menú semanal (pago) | ✓ (también "con lo que hay en la nevera") | ✓ por pasillos (pago) | ~ (recetas con lo que hay en la nevera) | ? (puntuación 0-10 de productos) | ES: 11,99 €/mes; 29,99 €/semestre; 59,99 €/año; web: 8,99 €/mes | Vende productos propios en la app |
| **Ate** | ✓ análisis de foto, sin calorías | ? | — | ✗* | ✗* | ✗* | ✗* | ✓ ("No calorie counting!") | 29,99 $/año; 3,99 $/mes (ficha EE. UU.) | Referente de enfoque sin números |
| **Mealime** | — | — | — | ✓ | ✓ | ✓ gratis, por secciones del súper | ~ (Pro: "What's in my fridge") | — | Pro 2,99 $/mes (antes del cierre) | **Cierre anunciado para el 21-oct-2026** |
| **Paprika 3** | — | — | — | ✓ | ✓ importación web | ✓ agrupa y ordena por pasillo | ✓ básica | — | Pago único: 4,99 $ iOS; 29,99 $ Windows | Sin suscripción |
| **Bring!** | — | — | — | ✗* | ✓ recetas de socios + importación | ✓ núcleo, compartida | ✗* | — | Premium 8,99 $/año (EE. UU.); 9,99 €/año (Croacia) | Contenido patrocinado en la lista |

Fuentes de cada celda: ver fichas en §3. "~" = función parcial o equivalente.

---

## 3. Ficha por aplicación

### 3.1 MyFitnessPal (MFP)

**1. Funciones principales**
- Gratis: registro de comidas, contador de calorías y base de datos de alimentos [V](https://support.myfitnesspal.com/hc/en-us/articles/34889191368077-The-difference-between-Free-Premium-and-Premium).
- Premium: escáner de códigos de barras (requiere Premium y cámara trasera) [V](https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods); Meal Scan (foto), Voice Log, sin anuncios y objetivos de macros personalizados [V](https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium), [V](https://support.myfitnesspal.com/hc/en-us/articles/34347930588557-Premium).
- Premium+: todo lo de Premium más el planificador (Meal Planner), listas de la compra y herramientas de recetas; solo en iOS y Android [V](https://support.myfitnesspal.com/hc/en-us/articles/34347930588557-Premium).
- El Meal Planner convierte el plan en lista de la compra, permite marcar lo que ya tienes en la cocina para quitarlo de la lista y sincroniza con apps de compra (iOS: Instacart, Walmart, Kroger, Amazon Fresh, Whole Foods; Android: Instacart, Walmart). Solo para EE. UU. y Canadá según el centro de ayuda [V](https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner).
- "Photo Upload" de Meal Scan ("haz la foto ahora, registra después"), de momento solo en iOS en EE. UU. (feb-2026) [V](https://www.globenewswire.com/news-release/2026/02/24/3243668/0/en/myfitnesspal-debuts-its-2026-winter-release.html).
- Que las calorías del ejercicio se sumen al objetivo diario por defecto: **[NV]** (no se pudo comprobar en esta sesión).

**2. Modelo de negocio y precios**
- Freemium con anuncios. Premium 79,99 US$/año; Premium+ 99,99 US$/año o 24,99 US$/mes [V](https://www.myfitnesspal.com/premium-plus), [V](https://blog.myfitnesspal.com/myfitnesspal-membership-pricing-tiers/).
- España: la ficha de App Store ES muestra compras integradas contradictorias ("Annual Premium 49,99 €", "Yearly Premium 87,99 €" y también 9,99 €), en caché y con fecha incierta [V·sec](https://apps.apple.com/es/app/myfitnesspal-contador-de-calor%C3%ADas-y-pasos/id341232718). Una web de ofertas cita 79,99 € como precio en España [V·sec](https://www.chollometro.com/ofertas/myfitnesspal-premium-por-2eurano-tr-1963736).
- Prueba gratuita de 7 días (página ES) [V·sec](https://www.myfitnesspal.com/es/premium).

**3. Lo que hace especialmente bien**
- La base de datos más grande y la familiaridad de marca: los usuarios de Trustpilot destacan sobre todo la base de datos y la facilidad de registro, aunque advierten de errores [V·sec](https://www.trustpilot.com/review/www.myfitnesspal.com).
- Ecosistema completo de seguimiento → planificación → compra (en EE. UU.) tras integrar Intent [V](https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner).
- En un estudio belga, sus valores "limpios" se correlacionaban bien con la base de referencia en energía (r=0,96) y macronutrientes, aunque no en sodio ni colesterol [V](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7641788/).

**4. Quejas frecuentes**
- Cobros durante años tras intentar cancelar, renovaciones anuales no deseadas y suscripciones difíciles de localizar para cancelarlas [V·sec](https://www.trustpilot.com/review/www.myfitnesspal.com).
- Funciones que antes eran gratis (código de barras) ahora son de pago; soporte basado en un bot de IA [V·sec](https://www.trustpilot.com/review/www.myfitnesspal.com).
- Entradas erróneas o duplicadas en la base de datos, y no se retiran aunque se reporten [V·sec](https://www.trustpilot.com/review/www.myfitnesspal.com).
- Errores sistemáticos de la base de datos (no por desajuste con la referencia) en un estudio de JMIR mHealth de 2024 [V](https://mhealth.jmir.org/2024/1/e54509/PDF).

**5. Cambios recientes 2024-2026**
- 12-feb-2025: compra Intent (planificación personalizada); el Meal Planner pasa a Premium+ por 99,99 US$/año [V·sec](https://www.nutritioninsight.com/news/nutrition-tracker-meal-planner-diet-health-fitness-app-myfitnesspal-intent.html), [V·sec](https://connectthewatts.com/2025/02/14/myfitnesspal-acquires-intent-to-enhance-meal-planning-for-members/).
- ene-2026: app dentro de la experiencia ChatGPT Health (nota de prensa sindicada) [V·sec](https://business.mammothtimes.com/mammothtimes/article/gnwcq-2026-1-7-myfitnesspal-launches-app-in-new-chatgpt-health-experience).
- 24-feb-2026, "Winter Release": Photo Upload de Meal Scan, pestaña de Recetas en el Meal Planner, colección de recetas revisadas por dietistas ("Blue Check", Premium+) y cupón de Instacart en EE. UU. hasta el 16-ago-2026 [V](https://www.globenewswire.com/news-release/2026/02/24/3243668/0/en/myfitnesspal-debuts-its-2026-winter-release.html), [V](https://blog.myfitnesspal.com/winter-release-2026-nutrition-tracking-updates/).
- 2-mar-2026: compra **Cal AI** (app viral de calorías por foto). El equipo se queda y Cal AI sigue como app separada; no se publicaron los términos [V·sec](https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens), [V·sec](https://thenextweb.com/news/myfitnesspal-acquires-cal-ai-the-viral-calorie-tracking-app-built-by-teens), [V](https://www.beneschlaw.com/news/benesch-advises-myfitnesspal-on-acquisition-of-cal-ai-the-viral-calorie-app/). Cal AI había tenido unos 15 M de descargas en 2 años [V·sec](https://www.eweek.com/fr/news/myfitnesspal-acquires-cal-ai-teen-founders/).
- 28-abr-2026: soporte para usuarios de GLP-1 (gratuito) [V](https://www.globenewswire.com/news-release/2026/04/28/3282728/0/en/MyFitnessPal-Launches-Comprehensive-GLP-1-Support-Helping-Users-Stay-Consistent-and-Build-Habits-Alongside-Medication-to-Maximize-Their-Experience.html).
- 10-jun-2026: AI Coach para Premium y Premium+ [V](https://www.globenewswire.com/news-release/2026/06/10/3309733/0/en/myfitnesspal-introduces-ai-coach-to-deliver-personalized-nutrition-guidance-rooted-in-20-years-of-nutrition-expertise.html).
- Fecha de lanzamiento de Voice Log: las fuentes se contradicen (2024-2026) [NV].

---

### 3.2 Fitia

**1. Funciones principales**
- Gratis: calorías y macros personalizados, gran parte de la base de datos verificada, escáner de códigos de barras y registro por texto; limitado a 4 comidas; el progreso solo registra el peso [V](https://fitia.app/help/articles/diferencias-fitia-gratis-vs-premium/).
- Premium: planificación automática de comidas, constructor de planes semanales, recetas, lista de la compra, tipos de dieta, registro por foto y voz, "ajustes inteligentes", Fitia Coach, sincronización con Apple Health/Health Connect, comparador de alimentos, fotos de progreso y medidas, sin anuncios [V](https://fitia.app/help/articles/diferencias-fitia-gratis-vs-premium/).
- Planes diarios automáticos según calorías y macros; constructor manual; más de 20.000 recetas; **plan compartido con familia o amigos con raciones ajustadas a cada persona**; **exportación a PDF "para quien cocina por ti"** [V](https://fitia.app/es/funcionalidades/).
- El plan semanal se convierte en lista de la compra; se puede cambiar una comida o un ingrediente manteniendo calorías y macros [V](https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011). Listas que se actualizan al ajustar recetas [V](https://fitia.app/about/).
- La base de datos no admite entradas de usuarios (según una reseña independiente) [V·sec](https://www.garagegymreviews.com/fitia-app-review).

**2. Modelo de negocio y precios**
- Freemium. App Store ES: 9,99 €/mes, 23,99 €/3 meses, 35,99 €/6 meses, 39,99 €/12 meses y Familiar 59,99 €/año; otras variantes del plan anual a 38,99 € o 35,99 € (fichas en caché) [V·sec](https://apps.apple.com/es/app/fitia-contar-calor%C3%ADas-dietas/id1448277011).
- Prueba gratis de 3 días, solo con el plan anual [V·sec](https://fitia.app/es/aprende/articulo/vale-la-pena-fitia-premium-razones/).
- Cancelación vía App Store/Google Play o en app.fitia.app; tiene un artículo de ayuda específico sobre "cobro sin autorización" (la prueba se convierte en suscripción si no se cancela) [V](https://fitia.app/es/ayuda/articulos/cobro-suscripcion-sin-autorizacion-fitia/).

**3. Lo que hace especialmente bien**
- Es el competidor más directo en español: planificación + lista + plan familiar con raciones individuales [V](https://fitia.app/es/funcionalidades/).
- Mantiene gratis el código de barras y el registro por texto [V](https://fitia.app/help/articles/diferencias-fitia-gratis-vs-premium/).
- Reconoce públicamente las limitaciones de la foto IA en platos complejos (artículo propio) [V](https://fitia.app/learn/article/photo-calorie-apps-accuracy/).

**4. Quejas frecuentes**
- Reseñas mixtas en App Store: hay quien dice que la IA estima "bastante bien" y quien la califica de "horrible"; sincronizar con la pareja **borra el plan existente** [V·sec](https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011).
- Reservas sobre la precisión de foto y voz porque no se pueden cuantificar las raciones de cada ingrediente [V·sec](https://barbend.com/fitia-app-review/); funciones importantes tras el muro de pago (3/5) [V·sec](https://www.garagegymreviews.com/fitia-app-review).
- No se encontró ficha de Trustpilot ni hilos de Reddit verificables [NV].

**5. Cambios recientes 2024-2026**
- Se posiciona como "AI Calorie Counter & Diet Plans" con registro por foto y voz y Fitia Coach [V](https://fitia.app/).
- Empresa fundada en 2019 (origen en Perú), sede en San Francisco, graduada de Y Combinator S21 [V·sec](https://www.descubre.vc/e/Fitia). En 2022 se decía entre las apps de nutrición más usadas en México, Chile, Colombia, España y Perú [V·sec](https://www.descubre.vc/noticia/fitia-clasific-a-startup-per-8g-2022-07-27) (dato de 2022).
- No se encontraron rondas de financiación ni cifras de usuarios de 2025-2026 [NV].

---

### 3.3 YAZIO

**1. Funciones principales**
- Las funciones de cálculo de calorías son gratis "siempre"; PRO desbloquea valores adicionales, funciones y recetas [V](https://help.yazio.com/hc/en-us/articles/360000592809-Why-do-I-have-to-pay-for-YAZIO-PRO).
- PRO: más de 3.000 recetas creadas por sus nutricionistas, con filtros por comida, dificultad y dieta; planificación de comidas por adelantado (registrar con antelación); listas de la compra ilimitadas a las que se añaden recetas [V](https://help.yazio.com/hc/en-us/articles/208847005-How-does-Yazio-Pro-support-my-goals).
- Ayuno: el 16:8 es gratis y el resto de programas, PRO; informes semanales y mensuales, PRO [V](https://help.yazio.com/hc/en-us/articles/360000592809-Why-do-I-have-to-pay-for-YAZIO-PRO), [V](https://help.yazio.com/hc/en-us/articles/11804776635281-Tutorial-of-the-Yazio-app).
- Registro de alimentos con IA, de pago (descripción de la ficha ES) [V·sec](https://apps.apple.com/es/app/yazio-ia-para-contar-calor%C3%ADas/id946099227?see-all=reviews).
- Recetas propias: se guardan localmente, pueden no sincronizarse entre dispositivos, y el centro de ayuda reconocía una incidencia abierta [V](https://help.yazio.com/hc/en-us/articles/4406610369297-How-can-I-create-my-own-recipes-in-Yazio-and-access-edit-them).
- Registro por voz: competidores afirman que no existe [V·sec, fuente competidora]. Código de barras gratis: [NV].

**2. Modelo de negocio y precios**
- Freemium; PRO por suscripción de 3 o 12 meses [V](https://filecontent.yazio.com/press/factsheet-yazio-en.pdf).
- App Store ES: 12 meses 47,90 € (con oferta "Empieza hoy" de 35,90 €) y 3 meses 23,99 € (fichas en caché) [V·sec](https://apps.apple.com/es/app/contador-de-calor%C3%ADas-y-dieta/id946099227). Un usuario de Trustpilot menciona una renovación automática de 35,90 € [V·sec](https://www.trustpilot.com/review/yazio.com).
- Prueba de 7 días ocasional y solo en la web [V](https://help.yazio.com/hc/en-us/articles/4436727821073-What-is-our-7-Day-Free-Trial-Subscription).

**3. Lo que hace especialmente bien**
- Escala europea: más de 100 M de usuarios (hito en mayo de 2025), 20 idiomas, más de 150 países; empresa de Erfurt (Alemania) fundada en 2014 [V](https://filecontent.yazio.com/press/factsheet-yazio-en.pdf) (factsheet de dic-2025).
- Plan gratuito generoso en el conteo básico [V](https://help.yazio.com/hc/en-us/articles/360000592809-Why-do-I-have-to-pay-for-YAZIO-PRO).
- TrustScore de 4,6 con ~6.458 reseñas (instantánea de Trustpilot) [V·sec](https://www.trustpilot.com/review/yazio.com).

**4. Quejas frecuentes**
- Renovaciones no esperadas, reembolsos que no llegan, cobros pese a correos de "cancelado"; reembolsos casi imposibles en Android pasadas 48 h [V·sec](https://www.trustpilot.com/review/yazio.com).
- Fallos en las recetas propias y en su sincronización [V](https://help.yazio.com/hc/en-us/articles/4406610369297-How-can-I-create-my-own-recipes-in-Yazio-and-access-edit-them).

**5. Cambios recientes 2024-2026**
- La app se renombró "AI Calorie Tracker by Yazio" / "Yazio: IA para contar calorías" e incorporó el registro con IA [V](https://apps.apple.com/us/app/ai-calorie-tracker-by-yazio/id946099227). La fecha exacta se contradice entre fuentes (finales de 2024 frente a 2026) [NV].
- 100 M de usuarios en mayo de 2025 [V](https://filecontent.yazio.com/press/factsheet-yazio-en.pdf).

---

### 3.4 MacroFactor

**1. Funciones principales**
- Algoritmo de gasto energético adaptativo: estima el gasto a partir de la ingesta registrada y la tendencia de peso, y ajusta los objetivos cada semana [V](https://help.macrofactorapp.com/en/articles/20-expenditure), [V](https://macrofactor.com/macrofactor/). Compara el cambio de peso previsto con el observado y se autocorrige [V](https://help.macrofactorapp.com/en/articles/224-interpreting-the-energy-balance-widget).
- Coaching "adherence-neutral": el cálculo no depende de cumplir los objetivos, y la propuesta es sostenible y sin juicio [V](https://macrofactor.com/adherence-neutral/), [V](https://macrofactor.com/dashboard-revamp/).
- Registro con IA: foto que rellena el plato con alimentos editables [V](https://help.macrofactorapp.com/en/articles/258-ai-food-logging); modo "Describe" (una o varias fotos y/o texto) además de "Snap" (2026) [V](https://help.macrofactorapp.com/en/articles/258-ai-food-logging); escáner de etiquetas nutricionales en varios formatos e idiomas (jul-2026) [V](https://macrofactor.com/mm-july-2026/).
- Creación de recetas mejorada (abr-2026) [V](https://macrofactor.com/mm-april-2026/). No se encontró planificador de menús ni lista de la compra [NV: ausencia].

**2. Modelo de negocio y precios**
- Solo de pago, sin plan gratis; prueba de 7 días. 11,99 US$/mes, 47,99 US$/6 meses, 71,99 US$/año [V](https://macrofactor.com/press-kit/).
- Pack Nutrition + Workouts por 89,99 US$/año para usuarios nuevos desde el 1-ene-2026 [V](https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work).
- Precio en €: [NV].

**3. Lo que hace especialmente bien**
- Su algoritmo adaptativo es la función más elogiada por los usuarios ("vale el precio por sí solo") [V·sec, agregador de Reddit](https://macaron.im/playbook/macrofactor-reddit-reviews).
- Filosofía explícita contra la culpa (adherencia neutral), el referente más cercano a nuestro enfoque dentro de las apps con números [V](https://macrofactor.com/adherence-neutral/).
- Rigor y transparencia: publica la precisión de su algoritmo [V](https://macrofactor.com/algorithm-accuracy/) e incluye un artículo propio sobre "los problemas de contar calorías" [V](https://macrofactor.com/problems-with-calorie-counting/).

**4. Quejas frecuentes**
- Precio y ausencia de plan gratis, comparado con alternativas gratuitas [V·sec](https://macaron.im/playbook/macrofactor-reddit-reviews).
- Base de datos menos completa fuera de EE. UU. (marcas y alimentos regionales) [V·sec](https://macaron.im/playbook/macrofactor-reddit-reviews); hay quien prefiere la base de datos de Lose It! [V·sec, espejo de Reddit](https://axebps-redlib.hf.space/r/MacroFactor/comments/1iz8nx2/macrofactor_or_loseit).
- Estimación adaptativa "lenta y a veces poco fiable" para algún usuario [V·sec, foro](https://forums.cronometer.com/discussion/comment/21763/).
- Curva de aprendizaje [V·sec](https://macaron.im/playbook/macrofactor-reddit-reviews).

**5. Cambios recientes 2024-2026**
- abr-2025: registro de comidas con IA [V](https://macrofactor.com/mm-april-2025/), [V](https://macrofactor.com/ai-food-logging/).
- sep-2025: app de watchOS [V](https://macrofactor.com/mm-sept-2025/); oct-2025: "Expenditure Modifiers" [V](https://macrofactor.com/mm-oct-2025/).
- ene-2026: app separada MacroFactor Workouts (fuerza e hipertrofia) [V](https://macrofactor.com/mm-jan-2026/); cambio a precios por paquete [V](https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work).
- jul-2026: escáner de etiquetas multilingüe y mejoras de IA en registro y recetas; "Plate-Stack AI" en Workouts [V](https://macrofactor.com/mm-july-2026/).

---

### 3.5 Cronometer

**1. Funciones principales**
- Escáner de códigos de barras **gratis** (solo en móvil); si el producto no existe, se fotografía la etiqueta para crear un alimento propio [V](https://cronometer.com/features/track-food.html), [V](https://cronometer.com/blog/my-fitness-pal-to-cronometer/).
- Photo Logging (Gold): la IA solo identifica ingredientes y cantidades; los valores nutricionales salen de su base de datos analizada, no los genera la IA [V](https://cronometer.com/blog/photo-logging/), [V](https://cronometer.com/blog/technology-changes-responsibility-doesnt-why-cronometers-approach-to-ai-starts-with-people-not-technology/).
- Voice Logging (Gold, abr-2026): se dice o escribe la comida y se revisan las coincidencias; integración con Siri [V](https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging), [V](https://cronometer.com/blog/voice-logging-siri/).
- Gold: Nutrition Scores, Macro Scheduler, temporizador de ayuno, biometría y gráficos personalizados, informes imprimibles, sin anuncios [V](https://cronometer.com/gold/index.html), [V](https://cronometer.com/gold/signup/).
- Importador de recetas (mencionado en su ayuda) [V](https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging). Planificador, lista de la compra y despensa: no encontrados [NV].

**2. Modelo de negocio y precios**
- Freemium con anuncios. Gold: precios contradictorios entre sus propias páginas (54,99 US$/año; 59,99 US$/año; 9,99-10,99 US$/mes) [V](https://cronometer.com/gold/index.html), [V](https://cronometer.com/gold/signup/), [V](https://cronometer.com/gift-gold/).

**3. Lo que hace especialmente bien**
- Precisión de los datos y micronutrientes; política de IA prudente (la IA no inventa valores nutricionales) [V](https://cronometer.com/blog/technology-changes-responsibility-doesnt-why-cronometers-approach-to-ai-starts-with-people-not-technology/).
- Plan gratis útil con código de barras incluido [V](https://cronometer.com/features/track-food.html).

**4. Quejas frecuentes**
- Anuncios a pantalla completa invasivos en el plan gratis; piden un nivel intermedio más barato [V·sec, foro](https://forums.cronometer.com/discussion/comment/19563).
- Precio de Gold, curva de aprendizaje e interfaz anticuada [V·sec](https://www.garagegymreviews.com/cronometer-review).

**5. Cambios recientes 2024-2026**
- Photo Logging: beta en 2025 [V·sec](https://www.finanzen.net/nachricht/aktien/cronometer-launches-premium-photo-logging-fast-verified-nutrition-tracking-for-real-life-14808068); disponible para Gold según notas del 25-feb-2026 [V](https://cronometer.com/blog/cronometer-updates-whats-new-improved/).
- Voice Logging (abr-2026) [V](https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging); Nutrition Scores para simplificar datos densos (2026) [V](https://cronometer.com/gold/index.html).

---

### 3.6 Lifesum

**1. Funciones principales**
- "AI Tracking" (Premium): registro por voz, texto y foto, compatible con el registro clásico [V](https://help.lifesum.com/en/article/what-do-i-get-when-i-buy-premium-1vzq8pz/), [V](https://help.lifesum.com/en/article/ai-tracking-explained-15sw7rk/).
- Escáner de códigos de barras anunciado como gratis [V](https://lifesum.com/); escáner comparador de productos (Android) [V](https://help.lifesum.com/en/article/traditional-food-tracking-4nzcd7/).
- Premium: objetivos de calorías y macros ajustables, planes de comidas y programas, más detalle nutricional [V](https://help.lifesum.com/en/article/what-do-i-get-when-i-buy-premium-1vzq8pz/). La ficha de EE. UU. anuncia "Meal Plans, Diets & 1000+ recipes" [V](https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691).
- Lista de la compra y despensa: [NV].

**2. Modelo de negocio y precios**
- Freemium. EE. UU.: ~49,99 US$/año (precio de prueba), 3 meses ~14,99 US$ [V·sec](https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691).
- España: la ficha muestra importes sin asociar a cada plan (1 año: 99,99 € o 44,99 €; 1 mes 14,99 €; 3 meses 39,99 €) [V·sec](https://apps.apple.com/es/app/lifesum-contador-de-calor%C3%ADas/id286906691).

**3. Lo que hace especialmente bien**
- Posicionamiento de "comer sano, simplificado" (lema de su web) [V](https://lifesum.com/) y registro multimodal unificado [V](https://lifesum.com/page/lifesum-transforms-meal-tracking-with-world-first-ai-powered-multimodal-tracker).
- Mantiene gratis el código de barras [V](https://lifesum.com/).

**4. Quejas frecuentes**
- TrustScore de 2,4-2,5 sobre 5 (~278 reseñas): imposibilidad de cancelar, Premium activado sin confirmación y cobros inesperados (alguno de 2020), y la sensación de que Premium da "pocas recetas y ningún plan" [V·sec](https://uk.trustpilot.com/review/lifesum.com?page=3).
- Opiniones polarizadas, con quejas crecientes sobre funcionalidad y atención al cliente; tarda más de un mes en responder [V·sec](https://kimola.com/reports/lifesum-review-analysis-unveil-user-insights-trustpilot-en-ca-154113).

**5. Cambios recientes 2024-2026**
- feb-2025: "AI-powered Multimodal Tracker" [V](https://lifesum.com/page/lifesum-transforms-meal-tracking-with-world-first-ai-powered-multimodal-tracker).
- abr-2025: alianza con Consupedia para su base de datos de alimentos [V·sec](https://www.foodanddrinktechnology.com/news/58547/lifesum-in-partnership-with-consupedia-to-build-the-worlds-most-informed-and-inclusive-ai-powered-food-database/).
- oct-2025: encuesta sobre GLP-1 y orientación a usuarios de GLP-1 [V](https://lifesum.com/page/glp-1s-reduce-cravings-for-ultra-processed-foods-but-nutrition-remains-key).

---

### 3.7 Lose It!

> No se pudo consultar `loseit.com` (dominio no accesible para el buscador); los datos proceden de App Store, Trustpilot y fuentes secundarias.

**1. Funciones principales**
- Registro por foto (Snap It) y por voz (Say It); según una fuente secundaria, los usuarios gratuitos pueden probarlos antes de pagar [V·sec](https://www.fitbudd.com/post/lose-it-premium-review).
- La ficha de App Store anuncia "Meal Planning & Targets" (objetivos nutricionales sugeridos) [V](https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629), aunque otras reseñas dicen que solo hay sugerencias de comidas según el presupuesto calórico, no planes completos [V·sec](https://amyfoodjournal.com/blog/lose-it-app-review).
- Código de barras: varias fuentes secundarias dicen que pasó a Premium para la mayoría de cuentas nuevas, con fechas contradictorias (2022, mediados de 2023 o 2026) [V·sec](https://www.fitbudd.com/post/lose-it-premium-review).

**2. Modelo de negocio y precios**
- Freemium. 39,99 US$/año según reseñas de 2026 [V·sec](https://amyfoodjournal.com/blog/lose-it-app-review); la ficha de App Store EE. UU. lista una compra "Premium" de 79,99 US$ sin indicar periodo [V·sec](https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629). Precio real: [NV].

**3. Lo que hace especialmente bien**
- Sencillez para empezar a contar calorías y buena base de datos según algunos usuarios [V·sec](https://www.trustpilot.com/review/loseit.com).

**4. Quejas frecuentes**
- TrustScore ~2/5 (55 % de reseñas de 1 estrella en una instantánea): imposible cancelar durante la prueba, cobros no avisados, suscripciones duplicadas sin reembolso, soporte con un chatbot que no resuelve, rediseño que quitó funciones (solo 3 macros visibles), anuncios intrusivos, escáner de pago y base de datos colaborativa sin control [V·sec](https://www.trustpilot.com/review/loseit.com).
- Infraestima las grasas saturadas (entre −13,8 % y −40,3 % junto con MFP) en un estudio de 2024 [V](https://mhealth.jmir.org/2024/1/e54509/PDF).

**5. Cambios recientes 2024-2026**
- Difundió datos propios sobre los beneficios del registro con IA (nota de prensa; solo se vio el titular) [V·sec](https://www.barchart.com/story/news/31984516/lose-it-finds-ai-powered-logging-boosts-weight-loss-success-and-greater-nutritional-mindfulness).
- Cambio de paywall del escáner: [V·sec] con fechas contradictorias.

---

### 3.8 Eat This Much

**1. Funciones principales**
- Planificador automático: planes diarios gratis; semanales automáticos en Premium [V](https://help.eatthismuch.com/help/what-do-i-get-for-subscribing), [V](https://www.eatthismuch.com/meal-planner/).
- Lista de la compra generada desde el plan, que se actualiza al cambiarlo, ordenada por pasillos y combinando duplicados; envío a Instacart, Amazon Fresh y Walmart [V](https://www.eatthismuch.com/pricing), [V](https://www.eatthismuch.com/food-diary-app).
- **Despensa** (suscriptores): lo que compras pasa a la despensa con un clic y **se descuenta al comerlo**; sugiere recetas con lo que tienes [V](https://help.eatthismuch.com/help/what-do-i-get-for-subscribing).
- Planificación de sobras, escalado familiar de ingredientes, hasta 20 planes guardados (1 en gratis) y exportación a PDF [V](https://help.eatthismuch.com/help/what-do-i-get-for-subscribing).
- **Presupuesto** como dato de entrada del planificador (junto a objetivos, gustos y horario) [V](https://www.eatthismuch.com/choose-plan/).

**2. Modelo de negocio y precios**
- Freemium. Premium 59,99 US$/año (≈5 US$/mes) o 14,99 US$/mes; 14 días de prueba; reembolso en 30 días "sin preguntas" [V](https://www.eatthismuch.com/pricing).

**3. Lo que hace especialmente bien**
- Es el ciclo más completo: plan → lista → despensa → consumo → sobras [V](https://help.eatthismuch.com/help/what-do-i-get-for-subscribing). Es el referente funcional más cercano a nuestra propuesta [P].

**4. Quejas frecuentes**
- Menús repetitivos cuando hay muchas exclusiones [V·sec, blog de competidor](https://www.plantoeat.com/blog/2023/10/eat-this-much-app-review-pros-and-cons/); "repetitivos y poco apetecibles" [V·sec, competidor](https://foodcraft.app/en/compare/eat-this-much-alternative).
- Sesgo hacia la cocina occidental [V·sec](https://foodcraft.app/en/compare/eat-this-much-alternative).
- Sentimiento automatizado: 65 % positivo y 35 % negativo [V·sec](https://justuseapp.com/en/app/981637806/eat-this-much-meal-planner/reviews).

**5. Cambios recientes 2024-2026**
- No se encontró changelog oficial [NV]. Captación activa de usuarios de Mealime tras su cierre [V](https://www.eatthismuch.com/switch-from-mealime).

---

### 3.9 Samsung Food (antes Whisk)

**1. Funciones principales**
- Gratis: planificador semanal básico y listas de la compra; hasta 3 planes guardados [V](https://samsungfood.com/food-plus/), [V](https://samsungfood.com/meal-planner/). Recetas, lista de la compra y planificador son las funciones "más populares" [V](https://news.samsung.com/es/samsung-food-mejora-las-experiencias-gastronomicas-en-ifa-2024).
- Food+: planes semanales generados por IA según gustos, dieta y objetivos; sincronización con Samsung Health; **despensa ("Food List") automatizada**; **Vision AI** (foto de ingredientes para añadirlos a la despensa y obtener ideas de recetas); priorización por fecha de consumo preferente; personalización de recetas con IA; modo cocina guiado con control de electrodomésticos [V](https://support.samsungfood.com/hc/en-us/articles/32709269852052-What-s-Included-in-Your-Samsung-Food-Subscription), [V](https://news.samsung.com/global/upgraded-samsung-food-raises-the-bar-for-food-experiences-at-ifa-2024).
- Catálogo de más de 160.000 recetas con IA [V·sec](https://www.xatakamovil.com/samsung/samsung-food-app-160-000-recetas-e-inteligencia-artificial-que-puedes-tener-cualquier-movil/amp); extensión de Chrome para guardar recetas [V](https://chromewebstore.google.com/detail/samsung-food/gfoijmnbedaipllfimaogeepohalbgka/reviews).
- Idiomas: incluye español (España) y español (México) [V](https://news.samsung.com/es/samsung-presenta-samsung-food-una-plataforma-gastronomica-con-recetas-personalizadas-y-potenciado-por-la-ia) (dato de lanzamiento).

**2. Modelo de negocio y precios**
- Freemium. Food+ 6,99 US$/mes o 59,99 US$/año, prueba de 7 días, compra solo desde el móvil y precio variable por país [V](https://samsungfood.com/food-plus/). Precio en €: [NV].

**3. Lo que hace especialmente bien**
- Integra recetas, planificador, lista y despensa con visión IA, y desde 2025-2026 libera funciones de salud en el plan gratis [V](https://www.sammobile.com/news/samsung-food-update-massive-gift-free-users/).

**4. Quejas frecuentes**
- Errores de edición y sincronización de recetas entre versiones; la lista no admite precios, totales ni categorías propias [V·sec, competidor](https://listonic.com/compare-apps/listonic-vs-samsung-food).
- Al cambiar las raciones y añadir la receta a la lista, **las cantidades no se ajustan** [V·sec](https://justuseapp.com/en/app/1133637674/samsung-food-meal-planner/reviews).
- La extensión de importación no copia las instrucciones (3,5/5 con 532 valoraciones) [V](https://chromewebstore.google.com/detail/samsung-food/gfoijmnbedaipllfimaogeepohalbgka/reviews).

**5. Cambios recientes 2024-2026**
- sep-2024 (IFA): lanzamiento de Food+ [V](https://news.samsung.com/global/upgraded-samsung-food-raises-the-bar-for-food-experiences-at-ifa-2024).
- oct-2025 (v2.50): Health Goals gratis y mejoras del Recipe Builder [V·sec](https://www.sammobile.com/news/samsung-food-update-editing-recipes-easier/); dic-2025 (v2.51): seguimiento de calorías y objetivos de macros/fibra **gratis para todos** [V·sec](https://www.sammobile.com/news/samsung-food-update-massive-gift-free-users/).
- 2026: Samsung presenta Health y Food como complementarios [V](https://news.samsung.com/us/galaxy-unpacked-2026-samsung-partners-envision-connected-care-future-first-signal-lasting-change/); oct-2026: Samsung Health añade escaneo de comidas (calorías y macros) [V·sec](https://9to5google.com/2026/10/14/samsung-rolling-out-major-health-update-with-sleep-running-coach-meal-scanning/).

---

### 3.10 MyRealFood (España) — competidor local elegido

**1. Funciones principales**
- Escáner que puntúa productos de 0 a 10, plan nutricional con menú semanal, recetas (también "con lo que hay en la nevera") y **lista de la compra ordenada por pasillos** [V](https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749).
- Escáner de platos por foto que envía el plato a un diario de comidas (ficha de Google Play en inglés) [V](https://play.google.com/store/apps/details?id=es.myrealfood.myrealfood&hl=en_US).
- v8.0: pestaña "Tienda" para comprar productos de la marca Realfooding dentro de la app [V](https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749).

**2. Modelo de negocio y precios**
- Freemium. App Store ES: plan de comidas 11,99 €/mes, 29,99 €/semestre, 59,99 €/año [V·sec](https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749); web oficial "MyRealFood PLUS" 8,99 €/mes con menús semanales y lista automática [V](https://realfooding.com/products/suscripcion-plan-plus-myreal-food-app).
- Qué es gratis: el escáner parece gratuito, pero un comparador sitúa el código de barras y las funciones de IA (foto y voz) en Premium [NV, contradictorio].

**3. Lo que hace especialmente bien**
- Contexto español (productos y lenguaje "realfooding") y más que un escáner [V·sec](https://www.xatakandroid.com/aplicaciones-android/probamos-myrealfood-aplicacion-carlos-rios-para-mejorar-nuestros-habitos-alimentarios/amp); valoración de ~4,7 en App Store (agregador) [V·sec](https://apppricinglab.com/app/apple/1458031749).

**4. Quejas frecuentes**
- No se encontraron quejas concretas verificables [NV]. Riesgo percibido [P]: posible conflicto de interés al vender productos propios dentro de la app y polarización en torno al movimiento "realfooding".

**5. Cambios recientes 2024-2026**
- Tienda integrada (v8.0) [V](https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749). Fecha exacta: [NV].

---

### 3.11 Ate Food Journal (AteMate) — referente "sin números"

**1. Funciones principales**
- Diario fotográfico basado en alimentación consciente e intuitiva: **"No calorie counting!"** [V](https://apps.apple.com/us/app/id1164976477).
- Análisis de fotos con IA (AteMate AI); ejercicio, agua y sueño en una misma línea de tiempo; uso privado o con amigos [V](https://apps.apple.com/us/app/atemate-food-journal-tracker/id1164976477?ls=1).

**2. Modelo de negocio y precios**
- Suscripción con 7 días de prueba; ficha de EE. UU.: 29,99 US$/año y 3,99 US$/mes (otras fichas difieren) [V·sec](https://apps.apple.com/us/app/id1164976477).

**3. Lo que hace especialmente bien**
- Valida que existe demanda de registro sin cifras: ~4,8★ con 10.200 reseñas según un agregador [V·sec](https://apps.apple.com/us/app/id1164976477). Declara no compartir datos personales [V](https://apps.apple.com/us/app/atemate-food-journal-tracker/id1164976477?ls=1).

**4. Quejas frecuentes**
- Pocas visibles (p. ej., "añadir agua debería ser más fácil") [V·sec](https://apps.apple.com/us/app/id1164976477). Sin datos de Reddit ni Trustpilot [NV].

**5. Cambios recientes 2024-2026**
- Renombrada a "AteMate", con función de IA [V](https://apps.apple.com/us/app/atemate-food-journal-tracker/id1164976477?ls=1). Fecha: [NV].

---

### 3.12 Mealime — planificador simple (cierre anunciado)

**1. Funciones principales**
- Planes de comidas y recetas; lista de la compra automática que combina ingredientes, los ordena por sección del supermercado y muestra a qué receta pertenece cada uno; integración con Kroger, Walmart, Amazon Fresh e Instacart [V](https://play.google.com/store/apps/details?id=com.mealime&hl=en_US&gl=US).
- Pro: información nutricional, filtros de calorías, notas, historial de planes y "What's in my fridge" (elegir lo que ya tienes) [V](https://support.mealime.com/article/79-mealime-pro).

**2. Modelo de negocio y precios**
- Gratis + Pro (2,99 US$/mes en EE. UU.) [V](https://apps.apple.com/us/app/mealime-meal-plans-recipes/id1079999103?uo=4). Antes del cierre, Pro pasó a ser gratis para todos [V](https://www.mealime.com/closing).

**3. Lo que hace especialmente bien**
- Simplicidad: plan → lista ordenada en minutos [V](https://play.google.com/store/apps/details?id=com.mealime&hl=en_US&gl=US).

**4. Quejas frecuentes**
- Hilo en su comunidad preguntando si se había abandonado el desarrollo [V·sec](https://community.mealime.com/t/has-support-development-of-this-app-been-discontinued/735).

**5. Cambios recientes 2024-2026**
- **Cierre anunciado para el 21-oct-2026** (que se haya ejecutado: [NV]); su propietario, Albertsons, traslada las recetas a "Meals Hub" en sus apps de supermercado y **borra todos los datos personales** (recetas, planes, listas) [V](https://www.mealime.com/closing).

---

### 3.13 Paprika Recipe Manager 3 — recetario con despensa

**1. Funciones principales**
- Importa recetas de webs, planificador, listas inteligentes que combinan ingredientes y los ordenan por pasillo, despensa para controlar lo que tienes y sincronización en la nube [V](https://apps.apple.com/us/app/-/id1303222868).

**2. Modelo de negocio y precios**
- **Pago único**, sin suscripción: 4,99 US$ en iOS (sin compras integradas) [V](https://apps.apple.com/us/app/-/id1303222868); Windows 29,99 US$ [V](https://paprikaapp.com/windows/). Que cada plataforma se pague por separado: [V·sec](https://paprikaapp.com/windows/). Precio en €: [NV].

**3. Lo que hace especialmente bien**
- Modelo sin suscripción y una valoración muy alta (4,9★ con 51.800 reseñas en una ficha) [V·sec](https://apps.apple.com/us/app/-/id1303222868).

**4. Quejas frecuentes**
- Planificador limitado (el calendario no se conecta con la lista) e interfaz poco intuitiva [V·sec, blog de competidor](https://plantoeat.com/?p=38013); problemas de importación y sincronización en recetarios personales [V·sec].

**5. Cambios recientes 2024-2026**
- No se encontraron [NV].

---

### 3.14 Bring! — lista de la compra compartida

**1. Funciones principales**
- Lista de la compra compartida y sincronizada, widgets, Apple Watch, web y asistentes de voz [V](https://getbring.com/en/features).
- Recetas de socios (principalmente Alemania, Austria y Suiza) e importación de recetas web con botón o extensión para compartir [V](https://getbring.com/en/recipe-partners).
- Plataforma publicitaria: micro-listas con artículos genéricos y **patrocinados** en la vista principal [V](https://www.getbring.com/magazin/ad-platform).

**2. Modelo de negocio y precios**
- Gratis con publicidad y patrocinio + Premium: 8,99 US$/año o 1,99 US$/mes (EE. UU.); 9,99 €/año (Croacia) [V·sec](https://apps.apple.com/us/app/-/id580669177). Contenido exacto de Premium: [NV].

**3. Lo que hace especialmente bien**
- La colaboración en el hogar; se define como "la mayor plataforma digital de listas de la compra de Europa"; fundada en 2015 en Zúrich y comprada por Correos de Suiza en 2021 [V](https://www.getbring.com/en/about-us).

**4. Quejas frecuentes**
- Los usuarios piden cantidades por artículo y categorías más personalizables [V·sec](https://kimola.com/reports/unlock-insights-with-our-bring-app-feedback-analysis-report-google-play-tr-146743).

**5. Cambios recientes 2024-2026**
- No se encontraron anuncios de IA de Bring! [NV]. Cifras de usuarios contradictorias (1,3 M mensuales frente a 20 M) [V·sec](https://getbring.com/en/recipe-partners).

---

## 4. Patrones comunes (commodity)

Funciones que ya no diferencian porque casi todos las tienen:

1. **Búsqueda en base de datos + código de barras** como base del registro (MFP, Fitia, Cronometer, Lifesum, Lose It!, MacroFactor) [V §3]. Lo que diferencia es si es gratis o no.
2. **Registro multimodal con IA (foto + voz + texto libre)**: MFP, Fitia, YAZIO, MacroFactor, Cronometer, Lifesum y Lose It! [V §3]. Casi siempre tras el muro de pago.
3. **Objetivos personalizados de calorías y macros** con ajustes "inteligentes" o adaptativos (MacroFactor, Fitia) [V].
4. **Catálogo de recetas propio** (Fitia 20.000+, YAZIO 3.000+, Lifesum 1.000+, Samsung Food 160.000+) [V].
5. **Lista de la compra generada desde el plan**, ordenada por pasillos y combinando duplicados (MFP Premium+, Fitia, YAZIO, Eat This Much, Samsung Food, MyRealFood, Mealime, Paprika) [V].
6. **Sincronización con Apple Health / Health Connect / Samsung Health** (Fitia Premium, Samsung Food+) [V].
7. **Ayuno intermitente** (YAZIO, Cronometer Gold) [V].
8. **"Coach" de IA conversacional** (MFP AI Coach, Fitia Coach) [V].
9. **Módulos para usuarios de GLP-1** (MFP, Lifesum) [V]: tendencia de 2025-2026.
10. **Modelo freemium con prueba que se renueva sola** y precio anual de ~40-100 €/año [V §3].

---

## 5. Funciones complicadas o innecesarias

> Valoración nuestra [P] con evidencia donde existe.

- **Varios niveles de pago superpuestos** (MFP Free/Premium/Premium+; MacroFactor con packs y precios antiguos) → confusión y sensación de que "todo útil está un nivel más arriba" [P]; base: [V](https://support.myfitnesspal.com/hc/en-us/articles/34889191368077-The-difference-between-Free-Premium-and-Premium), [V](https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work).
- **Paneles densos de micronutrientes**: el propio Cronometer creó "Nutrition Scores" para simplificarlos [V](https://cronometer.com/gold/index.html). Para el usuario medio sobran [P].
- **Integraciones de entrega a domicilio solo en EE. UU.** (Instacart, Walmart, Kroger) → inútiles en España [V](https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner).
- **Foto IA como método "principal"** pese a su error en platos mixtos y grasas (§8) [V·sec](https://www.healthday.com/health-news/nutrition/how-accurate-are-photo-based-calorie-apps-4-are-put-to-the-test). Útil como atajo, no como fuente de verdad [P].
- **Temporizadores de ayuno y retos** de valor dudoso y potencialmente contrarios a un enfoque sin culpa [P].
- **Catálogos gigantes de recetas** (160.000+) sin filtro por lo que hay en casa ni por presupuesto: abruman más que ayudan [P].
- **Coaches de IA conversacionales** genéricos: valor no demostrado y riesgo de consejos inadecuados en salud [P].
- **Funciones de otro dominio** (p. ej., Plate-Stack AI para máquinas de gimnasio en MacroFactor Workouts [V](https://macrofactor.com/mm-july-2026/)): dispersan el foco [P].

---

## 6. Frustraciones de usuarios recurrentes (con fuentes)

| # | Frustración | Apps con evidencia | Fuente |
|---|---|---|---|
| 1 | **Cobros/renovaciones inesperadas, cancelación difícil, reembolsos que no llegan** | MFP, YAZIO, Lifesum, Lose It!, Fitia (artículo de ayuda específico) | [MFP](https://www.trustpilot.com/review/www.myfitnesspal.com) · [YAZIO](https://www.trustpilot.com/review/yazio.com) · [Lifesum](https://uk.trustpilot.com/review/lifesum.com?page=3) · [Lose It!](https://www.trustpilot.com/review/loseit.com) · [Fitia](https://fitia.app/es/ayuda/articulos/cobro-suscripcion-sin-autorizacion-fitia/) |
| 2 | **Funciones básicas que pasan a ser de pago** (código de barras) | MFP, Lose It! | [MFP soporte](https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods) · [Lose It! (sec.)](https://www.fitbudd.com/post/lose-it-premium-review) |
| 3 | **Base de datos imprecisa o duplicada** (entradas de usuarios sin control) | MFP, Lose It! | [MFP Trustpilot](https://www.trustpilot.com/review/www.myfitnesspal.com) · [Lose It! Trustpilot](https://www.trustpilot.com/review/loseit.com) · [JMIR 2024](https://mhealth.jmir.org/2024/1/e54509/PDF) |
| 4 | **Huecos de alimentos regionales o de marcas locales** | MacroFactor (fuera de EE. UU.) | [agregador Reddit](https://macaron.im/playbook/macrofactor-reddit-reviews) |
| 5 | **Soporte con chatbots que no resuelve** | MFP, Lose It! | [MFP](https://www.trustpilot.com/review/www.myfitnesspal.com) · [Lose It!](https://www.trustpilot.com/review/loseit.com) |
| 6 | **Anuncios intrusivos en el plan gratis** | Cronometer, Lose It! | [foro Cronometer](https://forums.cronometer.com/discussion/comment/19563) · [Lose It!](https://www.trustpilot.com/review/loseit.com) |
| 7 | **Imprecisión de la foto/voz con IA** (raciones no cuantificables) | Fitia y la categoría | [App Store Fitia](https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011) · [BarBend](https://barbend.com/fitia-app-review/) · [NIH 2026](https://www.healio.com/news/primary-care/20260804/ai-photobased-calorietracking-tools-underestimate-them-by-33) |
| 8 | **Bugs de sincronización/recetas** (plan borrado al compartir, recetas propias que no sincronizan, cantidades que no escalan en la lista) | Fitia, YAZIO, Samsung Food | [Fitia](https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011) · [YAZIO](https://help.yazio.com/hc/en-us/articles/4406610369297-How-can-I-create-my-own-recipes-in-Yazio-and-access-edit-them) · [Samsung Food](https://justuseapp.com/en/app/1133637674/samsung-food-meal-planner/reviews) |
| 9 | **Rediseños que quitan funciones** | Lose It! | [Trustpilot](https://www.trustpilot.com/review/loseit.com) |
| 10 | **Planes repetitivos o sesgados a la cocina occidental** | Eat This Much | [Plan to Eat (competidor)](https://www.plantoeat.com/blog/2023/10/eat-this-much-app-review-pros-and-cons/) · [FoodCraft (competidor)](https://foodcraft.app/en/compare/eat-this-much-alternative) |
| 11 | **Premium que "no da lo prometido"** (pocas recetas, sin plan) | Lifesum | [Trustpilot](https://uk.trustpilot.com/review/lifesum.com?page=3) |
| 12 | **Precio alto / sin plan gratis** | MacroFactor, Cronometer Gold | [agregador Reddit](https://macaron.im/playbook/macrofactor-reddit-reviews) · [GGR](https://www.garagegymreviews.com/cronometer-review) |
| 13 | **Cierre de app y pérdida de datos** | Mealime | [mealime.com/closing](https://www.mealime.com/closing) |

---

## 7. Necesidades mal resueltas y oportunidades de diferenciación

### 7.1 Necesidades mal resueltas (con foco en España)

1. **Alimentos genéricos españoles fiables.** BEDCA, la base oficial coordinada por AESAN, se presentó en 2010, figura como "v1.0", y la última actualización documentada en prensa es de septiembre de 2012 [V](https://www.bedca.net/bdpub/UsoBD.pdf), [V·sec](https://www.consumer.es/?p=74508). Existen otras fuentes (AESAN: base de alimentos y bebidas comercializados en 2022 [V](https://www.aesan.gob.es/en/actualidad/publicaciones-nutricion/informe-sobre-la-base-de-datos-de-alimentos-y-bebidas-comercializados-en-espa-a-en-2022); TABULA 3.0 de la CEU con más de 10.000 productos de marca [V·sec](https://www.eurofir.org/17804-2/)). Las grandes apps se basan en bases colaborativas con errores (§8). **Hueco:** genéricos españoles curados, con medidas caseras (cucharada, cazo, plato hondo, ración de tapa) [P].
2. **Marca blanca y supermercados españoles.** La marca de distribuidor supone ~45,6 % del gran consumo en valor (Kantar, cierre de 2025) [V·sec](https://www.merca2.es/2026/06/03/subida-marca-blanca-45-cuota-2388543/), [V·sec](https://theobjective.com/economia/2026-01-18/mercadona-carrefour-lidl-liderazgo-boom-marca-blanca/), y el 59 % de las unidades según Circana [V·sec](https://www.vinetur.com/2026040998656/la-marca-blanca-conquista-la-mitad-del-mercado-en-europa-ante-la-presion-de-los-precios.html). Mercadona roza el 30 % de cuota [V·sec](https://forbes.es/economia/864120/mercadona-consolida-en-2025-su-liderazgo-al-frente-de-la-distribucion-con-una-cuota-de-casi-el-30/). En Open Food Facts España, ~96.755 productos tuvieron su última edición en 2025 (instantánea sin fecha) [V·sec](https://es.openfoodfacts.org/fechas-ultima-edicion). Ningún competidor revisado se integra con supermercados españoles [NV: ausencia]. **Hueco:** cobertura de Hacendado, Carrefour, Lidl, DIA, Aldi y Eroski, con detección de reformulaciones [P].
3. **Comida casera y familiar.** La foto IA falla en platos mixtos (estudio de Sídney: pho sobreestimado un 49 %; también espaguetis boloñesa) [V](https://sydney.edu.au/news-opinion/news/2024/08/29/ai-food-tracking-apps-need-improvement-to-address-cultural-diversity.html). Los platos de cuchara españoles (lentejas, cocido, guisos) son justo de ese tipo [P]. Solo Fitia comparte plan con raciones por persona [V](https://fitia.app/es/funcionalidades/), y en Samsung Food la lista no escala al cambiar raciones [V·sec](https://justuseapp.com/en/app/1133637674/samsung-food-meal-planner/reviews). **Hueco:** "cociné una olla para 4, me serví un plato hondo": registro por receta familiar + fracción de la olla, sin pesar [P].
4. **Menú del día y comer fuera a la española.** No se encontró ninguna app con plantillas de menú del día (primero + segundo + postre/café + pan) [NV: ausencia]. **Hueco:** registro rápido por estructura de menú y raciones típicas de bar o restaurante [P].
5. **Presupuesto real.** Solo Eat This Much usa el presupuesto como dato del plan (y en EE. UU.) [V](https://www.eatthismuch.com/choose-plan/); las listas de Samsung Food no admiten precios ni totales [V·sec](https://listonic.com/compare-apps/listonic-vs-samsung-food). **Hueco:** coste estimado por semana y por ración, con precios aproximados por cadena o metidos por el usuario (ticket), priorizando marca blanca [P].
6. **Despensa conectada con el registro.** Los trackers grandes no tienen despensa; los que la tienen (Eat This Much, Samsung Food+, Paprika) son planificadores o recetarios [V §3]. **Hueco:** despensa → plan → lista → registro → sobras en un solo ciclo, en español y con precios en € [P].
7. **Planificación que se adapta a la vida real.** Saltarse una comida planificada, sobras o una cena improvisada: solo Eat This Much planifica sobras [V](https://help.eatthismuch.com/help/what-do-i-get-for-subscribing). **Hueco:** replanificación automática que no "castiga" ni obliga a compensar [P].
8. **Enfoque sin culpa con utilidad práctica.** Ate elimina los números, pero no planifica ni compra [V](https://apps.apple.com/us/app/id1164976477); MacroFactor quita el juicio pero exige números [V](https://macrofactor.com/adherence-neutral/). **Hueco:** modo sin números (raciones, platos, colores o grupos de alimentos) que siga dando valor en planificación, despensa y presupuesto [P].
9. **Confianza en la suscripción.** Las quejas de cobros son transversales (§6). Desde el 19-jun-2026 la UE exige una función de desistimiento online fácil (Directiva 2023/2673); la OCU denuncia el retraso de España en transponerla [V](https://www.ocu.org/organizacion/prensa/notas-de-prensa/2026/normabotondesistimiento190626), [V·sec](https://www.que.es/2026/06/20/boton-desistimiento-espana-ocu-retraso/).
10. **Portabilidad y continuidad de los datos.** Mealime anunció que borraría los datos de sus usuarios al cerrar [V](https://www.mealime.com/closing).

### 7.2 Oportunidades de diferenciación [P]

1. **"Lo básico, gratis y bien"**: código de barras, búsqueda y registro por texto libre en el plan gratuito (como Fitia, Cronometer y Lifesum), en contraste con MFP y Lose It!.
2. **Base de datos española curada**: genéricos (partiendo de BEDCA y fuentes públicas, con su licencia revisada), marca blanca vía Open Food Facts + verificación, y medidas caseras españolas. Marcar en la interfaz la procedencia y fiabilidad de cada dato.
3. **Registro "plato de casa"**: recetas familiares con fracción de olla o bandeja; la IA solo propone y el usuario confirma (patrón de Cronometer: la IA identifica y los valores salen de una base verificada [V](https://cronometer.com/blog/technology-changes-responsibility-doesnt-why-cronometers-approach-to-ai-starts-with-people-not-technology/)).
4. **Menú del día en dos toques** y plantillas de bar (tapa, ración, bocadillo).
5. **Ciclo cerrado despensa → plan semanal → lista → registro → sobras**, con replanificación tolerante a imprevistos.
6. **Presupuesto en €** por semana y ración, con comparación genérico frente a marca blanca y sugerencias para aprovechar lo que hay en la despensa.
7. **Modo sin números de verdad**: ocultar calorías y macros en toda la app (no solo en el diario), sin rachas punitivas, sin "te has pasado", **sin sumar calorías del ejercicio para "ganarse" comida**, con lenguaje neutro (inspiración: Ate y el "adherence-neutral" de MacroFactor).
8. **Familia y hogar**: plan compartido con raciones por persona (validado por Fitia), lista colaborativa (validada por Bring!) y "quién cocina" (Fitia exporta PDF para quien cocina).
9. **Precio honesto**: pocas opciones, aviso antes de renovar, cancelación en un clic dentro de la app (cumple y se adelanta a la Directiva 2023/2673), y ninguna función básica retirada del plan gratis.
10. **Exportación completa de datos** desde el primer día (lección de Mealime).

---

## 8. Riesgos de la categoría

1. **Fomento o empeoramiento de TCA.** En una muestra de 105 personas con TCA, el ~73 % de quienes usaban MyFitnessPal percibía que contribuía a sus síntomas (Levinson et al., *Eating Behaviors*, 2017) [V](https://pubmed.ncbi.nlm.nih.gov/28843591/), [V](https://psychiatry.duke.edu/blog/trouble-tracking). El estudio es transversal y pequeño, y un estudio experimental (Jospe et al., 2017) no halló un efecto causal, según revisiones posteriores [V·sec](https://pmc.ncbi.nlm.nih.gov/articles/PMC8485346), [V·sec](https://pmc.ncbi.nlm.nih.gov/articles/PMC8643308); hay una revisión sistemática de 2025 sobre tecnologías de seguimiento y alimentación [V](https://uhra.herts.ac.uk/id/eprint/27021/2/wallace-et-al-2025-a-systematic-search-and-review-focusing-on-the-influence-of-health-tracking-technologies-on-eating.pdf). En España, un estudio de la Universidad de León sitúa en riesgo de TCA a ~1 de cada 5 universitarios de primer curso (24,8 % mujeres, 12,3 % hombres) [V·sec](https://www.vozpopuli.com/sociedad/los-trastornos-alimentarios-se-cuelan-en-la-universidad-uno-de-cada-cinco-alumnos-de-primer-ano-esta-en-riesgo.html). A escala mundial, los casos de anorexia y bulimia aumentaron un 71 % entre 1990 y 2023 (JAMA Psychiatry) [V·sec](https://sciencemediacentre.es/los-casos-de-anorexia-y-bulimia-aumentan-un-71-desde-1990-y-afectan-principalmente-jovenes-y). **Mitigación [P]:** modo sin números, sin objetivos extremos, detección de señales de riesgo (p. ej., objetivos muy bajos), lenguaje no punitivo, recursos de ayuda y revisión por profesionales clínicos.
2. **Precisión de la foto IA.** Estudio del NIH presentado en jul-2026 (sin revisión por pares): 4 apps (MyFitnessPal, Lose It!, Cal AI, Appediet) **subestimaron ~⅓ de las calorías** (250-345 kcal por comida) y ~30 g de grasa, y fueron peores en comidas cetogénicas [V·sec](https://www.healthday.com/health-news/nutrition/how-accurate-are-photo-based-calorie-apps-4-are-put-to-the-test), [V·sec](https://www.healio.com/news/primary-care/20260804/ai-photobased-calorietracking-tools-underestimate-them-by-33), [V·sec](https://www.epocrates.com/online/article/ai-calorie-counting-apps-miss-a-third-of-meal-calories). Universidad de Sídney (2024): errores grandes en platos mixtos (pho +49 %, té con perlas −76 %) [V](https://sydney.edu.au/news-opinion/news/2024/08/29/ai-food-tracking-apps-need-improvement-to-address-cultural-diversity.html). **Riesgo reputacional y para la salud** si se presenta como exacta [P].
3. **Bases de datos colaborativas con errores y duplicados.** Errores en la base de MFP independientemente de la referencia, e infraestimación de grasas saturadas (−13,8 % a −40,3 %) y colesterol [V](https://mhealth.jmir.org/2024/1/e54509/PDF); buena correlación en energía, pero débil en sodio y colesterol, que obligó a eliminar valores implausibles [V](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7641788/).
4. **Patrones oscuros de suscripción** y riesgo regulatorio: Directiva (UE) 2023/2673, aplicable desde el 19-jun-2026 [V](https://www.ocu.org/consumo-familia/compras-online/noticias/boton-desistimiento-directiva). Las quejas de §6 muestran el daño reputacional.
5. **Datos de salud (categoría especial del RGPD)**: obligaciones reforzadas de base legal, minimización y seguridad [NV: no verificado en esta sesión; requiere revisión legal]. La integración con asistentes externos (p. ej., MFP en ChatGPT Health [V·sec](https://business.mammothtimes.com/mammothtimes/article/gnwcq-2026-1-7-myfitnesspal-launches-app-in-new-chatgpt-health-experience)) amplía la superficie de riesgo [P].
6. **Consolidación y comoditización.** MFP compra capacidades (Intent, Cal AI) y Samsung integra Food con Health; las funciones de IA se abaratan y se copian rápido [V §3.1, §3.9]. Diferenciarse solo con IA no es sostenible [P].
7. **Cierre o abandono de producto y pérdida de datos** (Mealime) [V](https://www.mealime.com/closing).
8. **Deriva hacia GLP-1 y medicalización** (MFP, Lifesum) [V]: puede alejar a la categoría del público general y elevar las exigencias regulatorias [P].
9. **Conflictos de interés comerciales** (tienda propia en MyRealFood [V](https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749); artículos patrocinados en Bring! [V](https://www.getbring.com/magazin/ad-platform)): erosionan la confianza si se mezclan con recomendaciones de salud [P].
10. **Ruido en las fuentes**: gran parte del contenido "comparativo" de 2026 en la web lo escriben apps competidoras (nutrola.app, fitia.app/learn, calorie-trackers.com…) con interés comercial. Conviene validar con pruebas propias y entrevistas [P].

---

## 9. Fuentes consultadas

> Todas consultadas el **18-nov-2026** mediante extractos de buscador (ver Método). Cuando se conoce, se indica entre paréntesis la fecha del dato o de la publicación. (sec.) = fuente secundaria; (comp.) = escrita por un competidor.

**MyFitnessPal**
1. https://support.myfitnesspal.com/hc/en-us/articles/34889191368077-The-difference-between-Free-Premium-and-Premium
2. https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium
3. https://support.myfitnesspal.com/hc/en-us/articles/34347930588557-Premium
4. https://support.myfitnesspal.com/hc/en-us/articles/34603055097869-How-to-use-the-Meal-Planner
5. https://support.myfitnesspal.com/hc/en-us/articles/360032624771-How-do-I-use-the-barcode-scanner-to-log-foods
6. https://www.myfitnesspal.com/premium-plus
7. https://blog.myfitnesspal.com/myfitnesspal-membership-pricing-tiers/
8. https://www.myfitnesspal.com/es/premium
9. https://www.globenewswire.com/news-release/2026/02/24/3243668/0/en/myfitnesspal-debuts-its-2026-winter-release.html (24-feb-2026)
10. https://blog.myfitnesspal.com/winter-release-2026-nutrition-tracking-updates/ (feb-2026)
11. https://www.globenewswire.com/news-release/2026/04/28/3282728/0/en/MyFitnessPal-Launches-Comprehensive-GLP-1-Support-Helping-Users-Stay-Consistent-and-Build-Habits-Alongside-Medication-to-Maximize-Their-Experience.html (28-abr-2026)
12. https://www.globenewswire.com/news-release/2026/06/10/3309733/0/en/myfitnesspal-introduces-ai-coach-to-deliver-personalized-nutrition-guidance-rooted-in-20-years-of-nutrition-expertise.html (10-jun-2026)
13. https://www.nutritioninsight.com/news/nutrition-tracker-meal-planner-diet-health-fitness-app-myfitnesspal-intent.html (feb-2025) (sec.)
14. https://connectthewatts.com/2025/02/14/myfitnesspal-acquires-intent-to-enhance-meal-planning-for-members/ (14-feb-2025) (sec.)
15. https://techcrunch.com/2026/03/02/myfitnesspal-has-acquired-cal-ai-the-viral-calorie-app-built-by-teens (2-mar-2026) (sec.)
16. https://thenextweb.com/news/myfitnesspal-acquires-cal-ai-the-viral-calorie-tracking-app-built-by-teens (mar-2026) (sec.)
17. https://www.beneschlaw.com/news/benesch-advises-myfitnesspal-on-acquisition-of-cal-ai-the-viral-calorie-app/ (2026)
18. https://www.eweek.com/fr/news/myfitnesspal-acquires-cal-ai-teen-founders/ (2026) (sec.)
19. https://business.mammothtimes.com/mammothtimes/article/gnwcq-2026-1-7-myfitnesspal-launches-app-in-new-chatgpt-health-experience (7-ene-2026) (sec.)
20. https://www.trustpilot.com/review/www.myfitnesspal.com (reseñas 2024-2026)
21. https://apps.apple.com/es/app/myfitnesspal-contador-de-calor%C3%ADas-y-pasos/id341232718 (caché, fecha incierta)
22. https://www.chollometro.com/ofertas/myfitnesspal-premium-por-2eurano-tr-1963736 (sec.)

**Fitia**
23. https://fitia.app/help/articles/diferencias-fitia-gratis-vs-premium/
24. https://fitia.app/es/funcionalidades/
25. https://fitia.app/
26. https://fitia.app/about/
27. https://fitia.app/es/ayuda/articulos/cobro-suscripcion-sin-autorizacion-fitia/
28. https://fitia.app/es/aprende/articulo/vale-la-pena-fitia-premium-razones/
29. https://fitia.app/learn/article/photo-calorie-apps-accuracy/ (2026)
30. https://apps.apple.com/es/app/fitia-contar-calor%C3%ADas-dietas/id1448277011 (caché)
31. https://apps.apple.com/us/app/fitia-calorie-counter-diet/id1448277011
32. https://www.garagegymreviews.com/fitia-app-review (sec.)
33. https://barbend.com/fitia-app-review/ (sec.)
34. https://www.descubre.vc/e/Fitia (sec.)
35. https://www.descubre.vc/noticia/fitia-clasific-a-startup-per-8g-2022-07-27 (jul-2022) (sec.)

**YAZIO**
36. https://help.yazio.com/hc/en-us/articles/360000592809-Why-do-I-have-to-pay-for-YAZIO-PRO
37. https://help.yazio.com/hc/en-us/articles/208847005-How-does-Yazio-Pro-support-my-goals
38. https://help.yazio.com/hc/en-us/articles/11804776635281-Tutorial-of-the-Yazio-app
39. https://help.yazio.com/hc/en-us/articles/4406610369297-How-can-I-create-my-own-recipes-in-Yazio-and-access-edit-them
40. https://help.yazio.com/hc/en-us/articles/4436727821073-What-is-our-7-Day-Free-Trial-Subscription
41. https://filecontent.yazio.com/press/factsheet-yazio-en.pdf (dic-2025)
42. https://apps.apple.com/es/app/contador-de-calor%C3%ADas-y-dieta/id946099227 (caché)
43. https://apps.apple.com/es/app/yazio-ia-para-contar-calor%C3%ADas/id946099227?see-all=reviews
44. https://apps.apple.com/us/app/ai-calorie-tracker-by-yazio/id946099227
45. https://www.trustpilot.com/review/yazio.com (reseñas 2024-2026)

**MacroFactor**
46. https://macrofactor.com/press-kit/
47. https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work (2026)
48. https://macrofactor.com/macrofactor/
49. https://help.macrofactorapp.com/en/articles/258-ai-food-logging
50. https://macrofactor.com/ai-food-logging/
51. https://help.macrofactorapp.com/en/articles/20-expenditure
52. https://help.macrofactorapp.com/en/articles/224-interpreting-the-energy-balance-widget
53. https://macrofactor.com/adherence-neutral/
54. https://macrofactor.com/dashboard-revamp/
55. https://macrofactor.com/algorithm-accuracy/
56. https://macrofactor.com/problems-with-calorie-counting/
57. https://macrofactor.com/mm-april-2025/ (abr-2025)
58. https://macrofactor.com/mm-sept-2025/ (sep-2025)
59. https://macrofactor.com/mm-oct-2025/ (oct-2025)
60. https://macrofactor.com/mm-jan-2026/ (ene-2026)
61. https://macrofactor.com/mm-april-2026/ (abr-2026)
62. https://macrofactor.com/mm-july-2026/ (27-jul-2026)
63. https://macaron.im/playbook/macrofactor-reddit-reviews (agregador de Reddit) (sec.)
64. https://axebps-redlib.hf.space/r/MacroFactor/comments/1iz8nx2/macrofactor_or_loseit (espejo de Reddit, feb-2025) (sec.)
65. https://forums.cronometer.com/discussion/comment/21763/ (sec.)

**Cronometer**
66. https://cronometer.com/gold/index.html
67. https://cronometer.com/gold/signup/
68. https://cronometer.com/gift-gold/
69. https://cronometer.com/features/track-food.html
70. https://cronometer.com/blog/my-fitness-pal-to-cronometer/
71. https://cronometer.com/blog/photo-logging/ (2025)
72. https://cronometer.com/blog/cronometer-updates-whats-new-improved/ (notas hasta 2026)
73. https://cronometer.com/blog/technology-changes-responsibility-doesnt-why-cronometers-approach-to-ai-starts-with-people-not-technology/
74. https://support.cronometer.com/hc/en-us/articles/47549391461780-Mobile-Voice-Logging (2026)
75. https://cronometer.com/blog/voice-logging-siri/
76. https://www.finanzen.net/nachricht/aktien/cronometer-launches-premium-photo-logging-fast-verified-nutrition-tracking-for-real-life-14808068 (2025) (sec.)
77. https://forums.cronometer.com/discussion/comment/19563 (sec.)
78. https://www.garagegymreviews.com/cronometer-review (sec.)

**Lifesum**
79. https://help.lifesum.com/en/article/what-do-i-get-when-i-buy-premium-1vzq8pz/
80. https://help.lifesum.com/en/article/ai-tracking-explained-15sw7rk/
81. https://help.lifesum.com/en/article/traditional-food-tracking-4nzcd7/
82. https://lifesum.com/
83. https://apps.apple.com/us/app/lifesum-ai-calorie-counter/id286906691
84. https://apps.apple.com/es/app/lifesum-contador-de-calor%C3%ADas/id286906691 (caché)
85. https://lifesum.com/page/lifesum-transforms-meal-tracking-with-world-first-ai-powered-multimodal-tracker (feb-2025)
86. https://www.foodanddrinktechnology.com/news/58547/lifesum-in-partnership-with-consupedia-to-build-the-worlds-most-informed-and-inclusive-ai-powered-food-database/ (abr-2025) (sec.)
87. https://lifesum.com/page/glp-1s-reduce-cravings-for-ultra-processed-foods-but-nutrition-remains-key (oct-2025)
88. https://uk.trustpilot.com/review/lifesum.com?page=3
89. https://kimola.com/reports/lifesum-review-analysis-unveil-user-insights-trustpilot-en-ca-154113 (sec.)

**Lose It!**
90. https://apps.apple.com/us/app/lose-it-calorie-counter/id297368629 (caché)
91. https://www.trustpilot.com/review/loseit.com
92. https://www.fitbudd.com/post/lose-it-premium-review (sec.)
93. https://amyfoodjournal.com/blog/lose-it-app-review (2026) (sec.)
94. https://www.barchart.com/story/news/31984516/lose-it-finds-ai-powered-logging-boosts-weight-loss-success-and-greater-nutritional-mindfulness (sec., solo titular)

**Eat This Much**
95. https://www.eatthismuch.com/pricing
96. https://www.eatthismuch.com/choose-plan/
97. https://help.eatthismuch.com/help/what-do-i-get-for-subscribing
98. https://www.eatthismuch.com/food-diary-app
99. https://www.eatthismuch.com/meal-planner/
100. https://www.eatthismuch.com/switch-from-mealime (2026)
101. https://www.plantoeat.com/blog/2023/10/eat-this-much-app-review-pros-and-cons/ (oct-2023) (comp.)
102. https://foodcraft.app/en/compare/eat-this-much-alternative (comp.)
103. https://justuseapp.com/en/app/981637806/eat-this-much-meal-planner/reviews (sec.)

**Samsung Food**
104. https://samsungfood.com/food-plus/
105. https://samsungfood.com/meal-planner/
106. https://support.samsungfood.com/hc/en-us/articles/32709269852052-What-s-Included-in-Your-Samsung-Food-Subscription
107. https://news.samsung.com/global/upgraded-samsung-food-raises-the-bar-for-food-experiences-at-ifa-2024 (sep-2024)
108. https://news.samsung.com/es/samsung-food-mejora-las-experiencias-gastronomicas-en-ifa-2024 (sep-2024)
109. https://news.samsung.com/es/samsung-presenta-samsung-food-una-plataforma-gastronomica-con-recetas-personalizadas-y-potenciado-por-la-ia (2023)
110. https://www.sammobile.com/news/samsung-food-update-editing-recipes-easier/ (oct-2025) (sec.)
111. https://www.sammobile.com/news/samsung-food-update-massive-gift-free-users/ (dic-2025) (sec.)
112. https://news.samsung.com/us/galaxy-unpacked-2026-samsung-partners-envision-connected-care-future-first-signal-lasting-change/ (2026)
113. https://9to5google.com/2026/10/14/samsung-rolling-out-major-health-update-with-sleep-running-coach-meal-scanning/ (14-oct-2026) (sec.)
114. https://www.xatakamovil.com/samsung/samsung-food-app-160-000-recetas-e-inteligencia-artificial-que-puedes-tener-cualquier-movil/amp (sec.)
115. https://chromewebstore.google.com/detail/samsung-food/gfoijmnbedaipllfimaogeepohalbgka/reviews
116. https://justuseapp.com/en/app/1133637674/samsung-food-meal-planner/reviews (sec.)
117. https://listonic.com/compare-apps/listonic-vs-samsung-food (comp.)

**MyRealFood**
118. https://apps.apple.com/es/app/myrealfood-esc%C3%A1ner-y-recetas/id1458031749 (caché)
119. https://realfooding.com/products/suscripcion-plan-plus-myreal-food-app
120. https://play.google.com/store/apps/details?id=es.myrealfood.myrealfood&hl=en_US
121. https://www.xatakandroid.com/aplicaciones-android/probamos-myrealfood-aplicacion-carlos-rios-para-mejorar-nuestros-habitos-alimentarios/amp (sec.)
122. https://apppricinglab.com/app/apple/1458031749 (sec.)

**Ate**
123. https://apps.apple.com/us/app/id1164976477
124. https://apps.apple.com/us/app/atemate-food-journal-tracker/id1164976477?ls=1

**Mealime**
125. https://www.mealime.com/closing (2026)
126. https://support.mealime.com/article/79-mealime-pro
127. https://play.google.com/store/apps/details?id=com.mealime&hl=en_US&gl=US
128. https://apps.apple.com/us/app/mealime-meal-plans-recipes/id1079999103?uo=4
129. https://community.mealime.com/t/has-support-development-of-this-app-been-discontinued/735 (sec.)

**Paprika**
130. https://apps.apple.com/us/app/-/id1303222868
131. https://paprikaapp.com/windows/
132. https://plantoeat.com/?p=38013 (comp.)

**Bring!**
133. https://apps.apple.com/us/app/-/id580669177 (caché)
134. https://getbring.com/en/features
135. https://getbring.com/en/recipe-partners
136. https://www.getbring.com/magazin/ad-platform
137. https://www.getbring.com/en/about-us
138. https://kimola.com/reports/unlock-insights-with-our-bring-app-feedback-analysis-report-google-play-tr-146743 (sec.)

**Mercado español y regulación**
139. https://www.bedca.net/bdpub/UsoBD.pdf
140. https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/subseccion/composicion_alimentos_BD.htm
141. https://www.consumer.es/?p=74508 (sec.)
142. https://www.aesan.gob.es/en/actualidad/publicaciones-nutricion/informe-sobre-la-base-de-datos-de-alimentos-y-bebidas-comercializados-en-espa-a-en-2022 (datos de 2022)
143. https://www.eurofir.org/17804-2/ (TABULA 3.0) (sec.)
144. https://es.openfoodfacts.org/fechas-ultima-edicion (instantánea sin fecha)
145. https://forbes.es/economia/864120/mercadona-consolida-en-2025-su-liderazgo-al-frente-de-la-distribucion-con-una-cuota-de-casi-el-30/ (datos de 2025) (sec.)
146. https://www.merca2.es/2026/06/03/subida-marca-blanca-45-cuota-2388543/ (jun-2026) (sec.)
147. https://theobjective.com/economia/2026-01-18/mercadona-carrefour-lidl-liderazgo-boom-marca-blanca/ (ene-2026) (sec.)
148. https://www.vinetur.com/2026040998656/la-marca-blanca-conquista-la-mitad-del-mercado-en-europa-ante-la-presion-de-los-precios.html (abr-2026) (sec.)
149. https://www.ocu.org/consumo-familia/compras-online/noticias/boton-desistimiento-directiva
150. https://www.ocu.org/organizacion/prensa/notas-de-prensa/2026/normabotondesistimiento190626 (19-jun-2026)
151. https://www.que.es/2026/06/20/boton-desistimiento-espana-ocu-retraso/ (20-jun-2026) (sec.)

**Riesgos (salud, precisión, bases de datos)**
152. https://pubmed.ncbi.nlm.nih.gov/28843591/ (Levinson et al., 2017)
153. https://psychiatry.duke.edu/blog/trouble-tracking (sec.)
154. https://pmc.ncbi.nlm.nih.gov/articles/PMC8485346 (revisión) (sec.)
155. https://pmc.ncbi.nlm.nih.gov/articles/PMC8643308 (revisión) (sec.)
156. https://uhra.herts.ac.uk/id/eprint/27021/2/wallace-et-al-2025-a-systematic-search-and-review-focusing-on-the-influence-of-health-tracking-technologies-on-eating.pdf (2025)
157. https://www.vozpopuli.com/sociedad/los-trastornos-alimentarios-se-cuelan-en-la-universidad-uno-de-cada-cinco-alumnos-de-primer-ano-esta-en-riesgo.html (sec.)
158. https://sciencemediacentre.es/los-casos-de-anorexia-y-bulimia-aumentan-un-71-desde-1990-y-afectan-principalmente-jovenes-y (sec.)
159. https://www.healthday.com/health-news/nutrition/how-accurate-are-photo-based-calorie-apps-4-are-put-to-the-test (jul-2026) (sec.)
160. https://www.healio.com/news/primary-care/20260804/ai-photobased-calorietracking-tools-underestimate-them-by-33 (4-ago-2026) (sec.)
161. https://www.epocrates.com/online/article/ai-calorie-counting-apps-miss-a-third-of-meal-calories (2026) (sec.)
162. https://sydney.edu.au/news-opinion/news/2024/08/29/ai-food-tracking-apps-need-improvement-to-address-cultural-diversity.html (29-ago-2024)
163. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7641788/ (Evenepoel et al., JMIR 2020)
164. https://mhealth.jmir.org/2024/1/e54509/PDF (JMIR mHealth 2024)

**Fuentes que no cargaron o no fueron accesibles:** www.myfitnesspal.com/premium, insider.fitt.co y markets.financialcontent.com (WebFetch: el host no resolvió por restricción de red); loseit.com, reddit.com y theverge.com (no accesibles para el buscador).
