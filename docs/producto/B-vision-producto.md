# Entregable B · Visión del producto

> Estado: **diseñado** (no implementado). Las afirmaciones sobre la competencia proceden de [A · Investigación competitiva](A-investigacion-competitiva.md); lo marcado **[P]** es propuesta nuestra.

## 1. Qué es FITona

**FITona es el organizador de comidas que se adapta a tu vida, en lugar de pedirte que adaptes tu vida a un menú.**

Conecta, en un solo ciclo, lo que hay en casa (despensa), lo que se va a comer (plan), lo que hay que comprar (lista y presupuesto), lo que realmente se ha comido (diario) y lo que sobra (lotes y táperes). Las cifras nutricionales están disponibles, pero son **opcionales**: la aplicación es útil con calorías ocultas.

Frase de producto [P]: *«Tu menú se adapta a tu vida.»*

## 2. Problemas reales que resuelve

| # | Problema cotidiano | Cómo lo resuelve FITona |
|---|---|---|
| 1 | «Registrar lo que como es un trabajo» | Registro en 1–3 toques: frecuentes, texto libre, voz, plato casero por fracción de olla |
| 2 | «El menú semanal se rompe el martes» | Plan y diario son registros separados; sustituir o saltarse algo no genera deuda ni «replanificación punitiva» |
| 3 | «¿Qué cocino con lo que tengo?» | Despensa + asistente + «Resuélveme la cena» |
| 4 | «Mi madre cocina; yo no sé qué he comido» | Recetas familiares reutilizables y registro de «un plato de…» con incertidumbre visible |
| 5 | «La compra se me va de presupuesto» | Lista generada desde el plan, precios con procedencia explícita, planificación por presupuesto |
| 6 | «Las apps de calorías me agobian» | Modo sencillo real: sin cifras, sin rachas, sin «te has pasado» |
| 7 | «Hay 40 entradas de “chocolate negro”» | Catálogo propio de genéricos con variantes solo cuando importan; marcas opcionales |
| 8 | «Cocino una vez y como cuatro días» | Cocina por lotes, raciones repartidas por días, congelador |

## 3. Para quién (primera versión pública: adultos)

- **Persona A — Organizadora doméstica** (25–50): cocina para 2–4, quiere ahorrar tiempo y dinero; no cuenta calorías.
- **Persona B — Deportista aficionado**: quiere referencias de proteína/energía sin obsesión; cocina por lotes.
- **Persona C — Estudiante / trabajador con poco tiempo**: come lo que prepara otra persona o improvisa; necesita rapidez y bajo coste.
- **Persona D — Quien quiere seguimiento detallado**: modo avanzado con objetivos y estadísticas, por decisión propia.

Fuera de alcance en v1: menores (requeriría salvaguardas y base legal específicas), patologías (producto sanitario, ver [riesgos](I-riesgos.md)), pérdida de peso como objetivo de producto.

## 4. Por qué la usarían frente a otras

Según la investigación [A §7], estos huecos están poco cubiertos (ausencia **no** probada, solo no encontrada en las fuentes consultadas):

1. **Ciclo cerrado** despensa → plan → lista → diario → sobras. Solo Eat This Much, Samsung Food+ y Paprika cubren partes, sin foco en España.
2. **Modo sin números de verdad** combinado con planificación y compra (Ate no planifica; MacroFactor exige números).
3. **Comida casera y familiar**: la foto con IA falla en platos mixtos (estudios de Sídney y NIH citados en A §8); el plato de cuchara español es justo ese caso.
4. **Contexto español**: genéricos curados con medidas caseras españolas, menú del día, marca blanca, precios en €.
5. **Confianza**: precio honesto, cancelación sencilla, exportación completa desde el día uno, básicos gratis.

## 5. Principios de diseño (no negociables)

1. **El usuario manda.** Nada cambia el menú, los objetivos o el diario sin confirmación explícita.
2. **Sin culpa.** Sin castigos, rachas, semáforos morales, «compensaciones» ni calorías negativas por ejercicio.
3. **Un día sin registrar no es un fracaso.** Ni ausencia ni exceso generan mensajes de fallo ni restricciones.
4. **Honestidad sobre la incertidumbre.** Cada cifra muestra su fiabilidad; una foto nunca da «537 kcal» exactas.
5. **Progresivo.** Se muestra lo importante; el detalle avanzado aparece cuando se pide.
6. **Útil con dos funciones.** Cada área funciona sola (solo recetas, solo lista de la compra…).
7. **Privacidad por defecto.** Datos de alimentación/actividad = datos de salud (RGPD art. 9); la IA solo ve lo que la persona autoriza.
8. **La IA propone, el motor calcula, la persona decide.** La IA no inventa cifras, temperaturas ni plazos de conservación.

## 6. Diferenciación en una tabla [P]

| Dimensión | Típico del mercado (A) | FITona |
|---|---|---|
| Foco | Contar y alcanzar objetivos | Organizar y cocinar; números opcionales |
| Fallos del plan | Se «falla» el plan | Plan y diario independientes; sustituir es normal |
| Catálogo | Millones de entradas colaborativas | ~500 genéricos curados + variantes + marcas opcionales, con procedencia y licencia |
| Comida casera | Foto/estimación | Receta familiar + fracción de olla, incertidumbre visible |
| IA | Chat o foto de pago | Asistente con herramientas reales, acciones confirmadas, cálculo determinista |
| Dinero | Casi ninguna | Presupuesto y precios con origen explícito (verificado/importado/ticket/manual/estimado) |
| Modelo de negocio | Paywall creciente en lo básico | Básicos gratis, Plus por IA y funciones avanzadas |

## 7. Qué NO es

- No es un dietista ni un producto sanitario: no diagnostica, no trata, no pauta dietas para enfermedades.
- No es una red social ni un juego (sin rankings, rachas ni retos de adelgazamiento).
- No es un supermercado ni un comparador de precios exhaustivo: no hay scraping de cadenas (ver [investigación de fuentes](../investigacion/fuentes-datos-nutricionales.md) §4–5).

Confianza: 78 % (el análisis de mercado se apoya en extractos de buscador, no en lectura completa de las páginas; ver limitaciones en A).
