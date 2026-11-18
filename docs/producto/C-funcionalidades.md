# Entregable C · Inventario de funcionalidades

> Estado: **diseñado**. Leyenda: **I**=impacto en usuario (1–5), **D**=dificultad técnica (1–5), **C**=coste recurrente (€/IA/datos: B/M/A), **R**=riesgo (legal, salud, reputación: B/M/A), **P**=prioridad (P0 imprescindible, P1 recomendable, P2 diferencial/posterior, P3 futuro, ✗ descartar). Las puntuaciones son juicio de producto **[P]**, no mediciones.

## 1. Imprescindibles (MVP · P0)

| Función | Notas |
|---|---|
| Cuenta, verificación de correo, recuperación, sesiones, exportación y eliminación | Obligatorio por RGPD y por las tiendas (borrado dentro de la app) |
| Onboarding breve y opcional + tres modos (sencillo/equilibrado/avanzado) | Cambiar de modo no pierde datos |
| Catálogo genérico (3 niveles) + buscador con sinónimos | Núcleo diferencial |
| Registro rápido: búsqueda, frecuentes/recientes, comida guardada, comida estimada sin desglosar, texto sin cifras | «Registrar sin números» incluido |
| Cantidades: gramos y medidas caseras con indicación de precisión; porciones personales («mi vaso») | |
| Motor nutricional determinista + trazabilidad de fiabilidad | Sin IA |
| Plan flexible (1–31 días) con opciones intercambiables; plan ≠ diario | Mueve la semana a la vida real |
| Recetas propias/familiares con raciones | «Una ración del potaje de mi madre» |
| Sustituciones («cambiar arroz por patata», «no tengo X», «no me apetece») | Sin recalcular el resto del día |
| Lista de la compra (suma, secciones, compartir, offline) | |
| Despensa sencilla (tengo / no tengo) | Avanzada en v0.3 |
| Modo claro/oscuro, accesibilidad, responsive, PWA | |
| Offline parcial: consultar y registrar sin red, sincronizar después | Sin promesas para IA |

## 2. Recomendables (P1)

Despensa avanzada (cantidad, ubicación, fechas introducidas por la persona) · cocina por lotes y sobras · escáner de código de barras (OFF, opcional) · importación de recetas desde texto · compartir recetas con permiso · hogares compartidos (lista y plan) · presupuesto manual con precios por ticket · recordatorios discretos y desactivables · registro de actividad manual · importación FIT/GPX.

## 3. Diferenciales (P2)

Asistente con herramientas reales · registro por texto libre/voz con IA · «Resuélveme la cena» · plan asistido por IA validado por el motor · foto de plato con incertidumbre explícita · OCR de ticket para precios · lectura de etiquetas · Health Connect/HealthKit.

## 4. Futuras (P3)

Garmin Connect (programa orientado a empresas, ver investigación) · internacionalización a LatAm (el modelo ya la soporta) · Apple/Google como proveedores de identidad · pagos Plus · widgets/atajos de pantalla de bloqueo · integración con tiendas con acuerdo (p. ej. afiliación) · modo profesional (dietista con permiso del usuario).

## 5. Descartadas (✗) y por qué

| Función | Motivo |
|---|---|
| Rachas, medallas, rankings, retos de adelgazamiento | Contradicen «sin culpa»; riesgo para TCA (A §8) |
| Compensar ejercicio con comida / calorías negativas | Prohibido por filosofía |
| Reajuste automático de objetivos o del día siguiente | El usuario mantiene el control |
| Puntuaciones de salud propias («tu día: 72/100») | Sin validación científica |
| Scraping de catálogos de supermercados | Riesgo legal alto (sui generis, contrato); ver investigación §5 |
| Strava en la nube | La API Policy 2026 §5.3 prohíbe usar sus datos con IA [V-b]; solo archivos/Health del dispositivo |
| Publicidad personalizada / venta de datos | Datos de salud; excluido por principio |
| Planes para enfermedades (diabetes, renal…) | Podría convertirse en producto sanitario (MDR) |
| Tienda propia / contenido patrocinado en recomendaciones | Conflicto de interés (A §8.9) |
| Millones de productos en el buscador principal | Ruido; solo vía escaneo opcional |

## 4 bis. Propuestas adicionales por iniciativa propia (22)

Más allá de tu documento. Las marcadas ★ entran en el producto.

| # | Propuesta | Descripción | I | D | C | R | P |
|---|---|---|---|---|---|---|---|
| 1 | ★ **Fracción de olla** | «Cociné una olla para 4, me serví 1/5»: reparte la receta sin pesar | 5 | 2 | B | B | P0 |
| 2 | ★ **Mis medidas** | Calibrar «mi vaso/cuenco/cazo» en gramos o ml una vez | 5 | 1 | B | B | P0 |
| 3 | ★ **Menú del día / raciones de bar** | Plantillas (primero+segundo+postre+pan+café) e incertidumbre visible | 4 | 2 | B | B | P1 |
| 4 | ★ **Mover a mañana** | Si no se come lo planificado: mover, convertir en táper, congelar o dejar; sin culpa | 5 | 2 | B | B | P0 |
| 5 | ★ **Lista por enlace sin cuenta** | Compartir la lista por WhatsApp; marcar sin registrarse (caduca, revocable) | 4 | 2 | B | M | P1 |
| 6 | ★ **Modo cocina** | Pasos grandes, temporizadores, pantalla activa, manos libres después | 4 | 2 | B | B | P1 |
| 7 | ★ **Semana tipo** | Guardar y repetir semanas; plantillas | 4 | 1 | B | B | P0 |
| 8 | ★ **Procedencia visible** | «¿De dónde sale este dato?»: fuente, licencia, fecha | 4 | 1 | B | B | P0 |
| 9 | ★ **Exportación/portabilidad completa** | JSON/CSV desde el día 1 (lección de Mealime cerrando) | 4 | 2 | B | B | P0 |
| 10 | ★ **Salvaguarda de cuidado** | Detecta objetivos muy bajos o lenguaje de angustia; no refuerza restricción; recursos de ayuda; sin diagnosticar | 5 | 3 | B | A | P0 |
| 11 | ★ **Alérgenos con «desconocido» explícito** | La ausencia de dato nunca se muestra como «sin alérgenos» | 5 | 2 | B | A | P0 |
| 12 | ★ **Genérico vs marca blanca por precio** | Mismo uso, distinto coste, con procedencia del precio | 3 | 3 | B | M | P2 |
| 13 | ★ **Aprovechar antes** | Prioriza ingredientes/sobras con fecha dada por la persona | 4 | 3 | B | B | P1 |
| 14 | ★ **Variedad sin puntuación** | Panel opcional de grupos de alimentos de la semana, sin nota ni juicio | 3 | 2 | B | M | P2 |
| 15 | ★ **Lectura fácil / texto grande** | Perfil accesible para mayores o baja alfabetización digital | 3 | 2 | B | B | P1 |
| 16 | **Dictado manos libres en cocina** | Siguiente paso por voz | 3 | 4 | M | B | P3 |
| 17 | **Widgets/atajos de registro** | Un toque desde la pantalla de bloqueo | 3 | 3 | B | B | P3 |
| 18 | **Modo dietista** | Compartir plan con profesional con permiso explícito | 3 | 4 | B | A | P3 |
| 19 | **Comparador de supermercados** | Requiere datos que no se pueden obtener legalmente hoy | 3 | 5 | M | A | ✗ |
| 20 | **Puntuación nutricional propia** | Sin validación; riesgo reputacional | 2 | 2 | B | A | ✗ |
| 21 | **Pedido automático al súper** | Sin APIs públicas en España | 3 | 5 | M | M | P3 |
| 22 | **Recetas generadas 100 % por IA sin catálogo** | Riesgo de seguridad alimentaria; se combina con recetas curadas | 3 | 2 | A | A | ✗ (híbrido sí) |

## 5 bis. Tus 15 ideas (A–O) y decisión

| Idea | Decisión | Comentario crítico |
|---|---|---|
| A «Resuélveme la cena» | Entra (P1, asistente) | Con despensa + 3 propuestas; el motor calcula |
| B «Hoy no quiero cocinar» | Entra como filtro de A | No justifica pantalla propia |
| C «Tengo invitados» | Entra (P1) | Escalado de raciones + lista |
| D «Mi familia ha cocinado esto» | Entra (P0) | Es la fracción de olla (#1 arriba) |
| E «Voy al supermercado» | Entra (P1) | Orden por tienda; datos de tienda solo los que da la persona |
| F «Me voy de viaje» | Entra (P1) | `PLANNING_PAUSED_UNTIL`; sin borrar nada |
| G «Aprovecha mi frigorífico» | Entra (P1) | Depende de que la despensa se mantenga |
| H «Repite lo que me gusta» | Entra (P1) | `FOOD_FEEDBACK` caduca para «hoy no» |
| I «Cocina una vez, come varios días» | Entra (P1) | `PREPARED_BATCHES` |
| J «No quiero contar nada hoy» | Entra (P0) | Es un estado del producto, no un modo oculto |
| K «Plan alternativo» | Entra (P0) | Opciones intercambiables por hueco; reemplaza el menú rígido |
| L «Comida fuera de casa» | Entra (P0/P1) | Plato estimado con rango |
| M Sin conexión | Entra, **parcial** (P0) | Solo catálogo esencial, recetas/menús descargados y registro; IA excluida |
| N Asistente contextual | Entra (P2) | Memoria visible y borrable |
| O Objetivos sin números | Entra (P0) | Modo sencillo + intenciones de onboarding |

Confianza: 75 % (puntuaciones de producto = juicio propio, no medidas).
