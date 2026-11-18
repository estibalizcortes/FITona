# Fuentes de datos nutricionales, normativa y marco legal de reutilización

> **Proyecto:** FITona (app española de nutrición, freemium, backend Java/Oracle)
> **Fecha de la investigación:** 18-nov-2026
> **Naturaleza:** documento de investigación técnica. **No es asesoramiento jurídico**: antes de cargar datos de terceros en producción o de firmar acuerdos, conviene que un abogado de propiedad intelectual revise los textos primarios citados.

---

## 0. Metodología, leyenda y limitaciones

**Leyenda de verificación** (aplicada a cada dato):

| Marca | Significado |
|---|---|
| `[V: Fn]` | Dato confirmado en la fuente oficial o primaria `Fn` (ver §9, cada `Fn` enlaza a su URL). |
| `[V-sec: Fn]` | Dato confirmado solo en fuente secundaria (despacho, doctrina, prensa, agregador o copia no oficial). |
| `[NV]` | **No verificado** en esta investigación. Puede ser correcto (a menudo es conocimiento general del sector), pero hay que comprobarlo antes de usarlo. |
| `[Inferencia]` | Razonamiento propio a partir de datos verificados. No es un dato. |

**Limitaciones importantes de esta investigación:**

1. **Acceso directo bloqueado.** La lectura directa de páginas falló por la red del entorno en `www.bedca.net`, `www.aesan.gob.es` y `ciqual.anses.fr`. Para no insistir, no se probaron más dominios. **Todas las marcas `[V]` se basan en los extractos que devuelve el buscador web para la URL citada, no en una lectura completa de la página.** Son verificaciones razonables, pero no sustituyen a la lectura íntegra del texto legal o de la licencia.
2. **Se agotó el cupo de búsquedas web** (200 por turno, compartido) al final de la sección F. Por eso parte de la §7 (AESAN, Comité Científico y EFSA) y toda la §8 (tamaño del catálogo) tienen menos verificación. Están marcadas.
3. **Textos de la UE consultados en copias del Reino Unido.** Varios textos de la UE (Reglamento 1169/2011, Directiva 2019/790) se verificaron en `legislation.gov.uk`, que publica la versión "retenida" por el Reino Unido. Para el texto vigente en la UE hay que consultar EUR-Lex (CELEX 32011R1169 y 32019L0790).
4. Las condiciones de uso de los supermercados se verificaron por extractos. Las citas literales se indican como tales. Cuando el extracto parafrasea, se indica "paráfrasis".

---

## 1. Resumen y recomendación

### Conclusiones clave

1. **BEDCA no es una base de datos abierta.** Sus condiciones de uso (v1.0) permiten reproducir los datos citando la fuente y sin alterar su sentido. Pero **la reproducción electrónica, la traducción o "cualquier uso que no sea personal, educacional o no comercial" requiere autorización expresa de AESAN/BEDCA**, que envía las condiciones a quien las solicita [V: F1]. Una app freemium es un uso comercial, así que **hay que pedir autorización por escrito a AESAN antes de cargar datos de BEDCA** [Inferencia]. Además, BEDCA tiene pocos alimentos procesados [V: F4] y su actualización depende de las ~20 tablas de las que se alimenta [V: F5].
2. **Open Food Facts (OFF) sí permite el uso comercial**, pero con condiciones [V: F17]:
   - **ODbL** para la base de datos, **DbCL** para los contenidos y **CC BY-SA** para las imágenes.
   - Obligatorio **atribuir** la fuente y **compartir con la misma licencia (share-alike)** cualquier base de datos derivada que se use públicamente [V: F18].
   - Implicación: los datos de OFF y las correcciones que se les hagan **no pueden quedar como datos propietarios**. Hay que aislarlos en una capa separada del catálogo propio y devolver las mejoras a OFF [Inferencia, apoyada en F18].
   - Calidad variable (datos colaborativos) [V: F22] y límites de la API: 100 peticiones/min en lectura de producto y 10/min en búsqueda [V: F19].
3. **Fuentes libres para uso comercial que sirven de base del catálogo de genéricos:**
   - **USDA FoodData Central:** CC0, dominio público [V: F13].
   - **CIQUAL (ANSES):** "Licence Ouverte"/Etalab. Confirmado para la edición de 2016; para la versión vigente está pendiente de confirmar [V-sec: F11].
   - **INE** para estadística: CC BY 4.0 [V: F102].

   Las dos primeras deben adaptarse a las definiciones de la UE (factores del Anexo XIV, hidratos de carbono sin fibra).
4. **Supermercados: ninguno de los nueve analizados ofrece una API pública de productos o precios** (no se encontró ninguna) [NV en sentido estricto: ausencia de evidencia].
   - **Todos** reservan la propiedad intelectual y prohíben el uso comercial o la reproducción sin autorización (Mercadona, Lidl, Aldi, Carrefour, DIA, Eroski, Alcampo y Consum: §4).
   - Carrefour prohíbe expresamente robots, arañas e indexadores en las condiciones de su app y de la tarjeta Pass [V: F71, F72].
   - **Hacer scraping sistemático de sus catálogos o precios para mostrarlos en una app comercial tiene un riesgo legal alto.** Se acumulan tres riesgos: derecho *sui generis* sobre bases de datos (doctrina *Innoweb* y *CV-Online*), incumplimiento contractual (*Ryanair*) y posible competencia desleal. **Recomendación: descartarlo.**
   - La única vía comercial encontrada es la **afiliación de Carrefour Supermercado Online en Awin** [V: F73].
5. **Precios por vías legales:** tickets del propio usuario (OCR, con RGPD), precios aportados por la comunidad, **Open Prices** (ODbL; pruebas gráficas en CC BY-SA 4.0) [V: F24] y referencias oficiales (IPC del INE, CC BY 4.0 [V: F102]; precios de MAPA [V: F105, F107]).
6. **Seguridad alimentaria:** en España se usa **AESAN como fuente principal**:
   - Cocinar hasta ≥70 °C en el centro durante 2 min [V: F114].
   - Las sobras se mantienen por encima de 60 °C o como máximo a 5 °C [V-sec: F113].
   - No dejarlas fuera del frigorífico más de 2 h, ni más de 1 h si hace más de 30 °C [V-sec: F113].

   USDA/FoodSafety.gov sirve como fuente complementaria: aves a 165 °F/74 °C, sobras en 3–4 días [V: F108, F110]. Ver §7.3, con valores unificados conservadores.
7. **Catálogo inicial** (estimación [NV], no se encontraron estudios): unos **400–600 genéricos**, más sus variantes de preparación (crudo, cocido, frito…), más unos **150–250 platos españoles** calculados por receta. Después se amplía según las búsquedas sin resultado (§8).
8. **Arquitectura:** guardar la **procedencia y la licencia de cada valor nutricional** (fuente, código, versión, método y licencia). Así se cumplen el share-alike de ODbL y las atribuciones sin "contaminar" el catálogo propio [Inferencia].

### Recomendación de combinación de fuentes (orden de prioridad)

| Capa | Fuente | Uso en FITona | Licencia / condición |
|---|---|---|---|
| Genéricos (base) | USDA FDC (Foundation + SR Legacy) | Composición completa, variantes cocinadas | CC0, citar FDC (cortesía) [V: F13] |
| Genéricos (perfil europeo) | CIQUAL | Alimentos del mercado europeo, contraste | Licence Ouverte (confirmar versión vigente) [V-sec: F11] |
| Genéricos españoles | BEDCA | Solo tras **autorización escrita de AESAN** | Uso comercial sujeto a autorización [V: F1] |
| Complementarias | CoFID (Reino Unido) | Contraste, platos | OGL en gov.uk [V-sec: F38]; **la API de Quadram es CC BY-NC-SA (no comercial)** [V-sec: F38] |
| Platos españoles | Cálculo propio por receta | Tortilla, paella, lentejas… | Propio (factores de rendimiento y retención USDA/EuroFIR) [V: F39, F42] |
| Productos comerciales | Open Food Facts + datos de etiqueta introducidos por usuarios | Vinculados al genérico | ODbL/DbCL; capa separada; devolver mejoras [V: F17, F18] |
| Precios | Tickets (OCR), comunidad, Open Prices, INE, MAPA | Estimación de coste | RGPD; ODbL (Open Prices); CC BY 4.0 (INE) |

---

## 2. Tabla de fuentes nutricionales

| Fuente | Mantenedor | Nº alimentos | Licencia | Uso comercial | Share-alike | API / formato | Idoneidad para FITona |
|---|---|---|---|---|---|---|---|
| **BEDCA** (España) | Red BEDCA, coordinada y financiada por AESAN; estándares EuroFIR [V: F2] | >500 en el lanzamiento [V-sec: F3]; cifra actual [NV] | Condiciones propias v1.0 (2010): citar la fuente y no alterar el sentido [V: F1] | **Solo con autorización expresa** de AESAN/BEDCA [V: F1] | No aplica (no es licencia abierta) | Consulta web; existe una interfaz XML usada por proyectos no oficiales [V-sec: F7]; no publicada como dato abierto (hay una "solicitud de datos" en datos.gob.es) [V: F6] | Alta en representatividad española, **bloqueada hasta tener autorización**. Pocos procesados [V: F4] |
| **CIQUAL** (Francia) | ANSES (Oqali para las actualizaciones) [V: F8] | 3.484 alimentos, 74 componentes (nueva versión) [V: F8]; edición 2020: 3.185 alimentos y 67 componentes según su documentación [V: F9] | "Licence Ouverte" (confirmado para 2016; versión vigente [NV]) [V-sec: F11] | Sí, si se confirma la Licence Ouverte [V-sec: F11] | No (solo atribución) [V-sec: F11] | Descarga (Excel en Zenodo [V: F9]; otros formatos [NV]); el dataset 2020 de data.gouv remite a recherche.data.gouv [V: F10] | **Alta**. Actualización anual [V: F8] |
| **USDA FoodData Central** (EE. UU.) | USDA ARS / National Agricultural Library [V: F12] | [NV] (varía según el tipo de dato) | **CC0 1.0 / dominio público**; se pide citar FDC [V: F13] | **Sí** [V: F13] | No | API REST con clave de data.gov, **1.000 peticiones/hora por IP** [V: F16]; descargas JSON/CSV (versiones de octubre de 2026) [V: F15] | **Muy alta como base de genéricos y cocinados**. Requiere adaptarla a la UE (§3) |
| — Foundation Foods | USDA | [NV] | CC0 | Sí | No | Igual | Alimentos básicos con metadatos analíticos amplios [V: F14] |
| — SR Legacy | USDA | [NV] | CC0 | Sí | No | Igual | Última versión en **abril de 2018, sin actualizar** [V: F14]; muchos cocinados |
| — Branded Foods | USDA (Global Branded Food Products Database) | [NV] | CC0 | Sí | No | Igual, actualización mensual [V: F12] | Baja (mercado de EE. UU.) |
| — FNDDS / Experimental | USDA | [NV] | CC0 | Sí | No | Igual | FNDDS: porciones y recetas de la encuesta de EE. UU. [V: F14] |
| **Open Food Facts** | Asociación Open Food Facts (comunidad) | Mundial; España [NV] (un estudio de 2021 usó 9.931 productos españoles con Nutri-Score y NOVA) [V: F23] | **ODbL** (base de datos) + **DbCL** (contenidos) + **CC BY-SA** (imágenes) [V: F17] | **Sí**, con atribución y share-alike [V: F17] | **Sí** [V: F18] | API de lectura sin autenticación; User-Agent propio obligatorio [V: F20]; 100 lecturas/min y 10 búsquedas/min [V: F19]; volcados [NV] | **Alta para productos comerciales**, en una capa aislada. Calidad variable [V: F22] |
| **EuroFIR FoodEXplorer** | EuroFIR AISBL [V: F28] | Agregador de tablas nacionales [V: F28] | Membresía o pago por consulta; acuerdos de licencia para uso comercial [V: F29, F31] | **Mediante contrato** [V: F31] | Según contrato | Navegador web; descargas "dentro de un uso razonable" [V: F28] | Media: útil para buscar datos; los derechos siguen siendo de cada compilador nacional [NV] |
| **Moreiras et al.** (*Tablas de composición de alimentos*) | Ediciones Pirámide (Grupo Anaya); 20.ª ed. 2022 [V-sec: F32] | [NV] | Libro con derechos de autor; **no se encontró licencia** [NV] | **No sin licencia del editor** [Inferencia] | — | Papel / libro | Solo para contraste manual; no copiar a la base de datos |
| **Mataix et al.** (*Tabla de composición de alimentos*) | Universidad de Granada; última edición conocida 2009 [V-sec: F33] | [NV] | **No se encontró licencia** [NV] | **No sin licencia** [Inferencia] | — | Libro | Igual que Moreiras |
| **Frida** (Dinamarca) | DTU National Food Institute [V: F34] | >1.400 alimentos; se actualiza dos veces al año [V: F34]; versión 5.5 según la FAO [V: F35] | [NV] (no se encontró en esta investigación) | [NV] | [NV] | Web y descargas; nueva interfaz en 2026 [V: F36] | Media: contraste; **confirmar la licencia antes de usarla** |
| **CoFID / McCance & Widdowson** (Reino Unido) | Publicado en GOV.UK [V: F37]; datos y API vinculados al Quadram Institute [V-sec: F38]; organismo responsable concreto [NV] | 2.887–2.898 alimentos, más ~300–390 "old foods", según la versión [V-sec: F38] | Ficheros de gov.uk: **Open Government Licence** [V-sec: F38]; **la API de Quadram: CC BY-NC-SA 4.0** [V-sec: F38] | Ficheros OGL: sí (atribución) [V-sec]; **API: no** | API: sí (BY-NC-SA) | Excel (gov.uk) [V: F37] | Media: contraste y platos; usar los ficheros de gov.uk, **no la API** |

### 2.1 Notas por fuente

**BEDCA.**
- El documento de condiciones remite a "BEDCA v1.0" (2010). Indica que la base "no es estática y se irá actualizando y ampliando periódicamente" [V-sec: F5].
- AESAN/BEDCA declina toda responsabilidad por los daños derivados del uso de los datos [V: F1].
- No se pudo comprobar el número actual de alimentos y componentes, la fecha de la última actualización, ni si existen condiciones más recientes que la v1.0 [NV]. bedca.net no era accesible desde el entorno.
- **Acción:** escribir a AESAN/BEDCA solicitando autorización de uso comercial. Indicar el modelo de negocio, cómo se atribuirá la fuente, si los valores se mostrarán transformados (por ración) y si se combinarán con otras fuentes.

**CIQUAL.**
- Fórmula de cita propuesta en Zenodo: "Anses. 2020. Ciqual French food composition table…" [V: F9].
- La ANSES publicó una versión nueva y más representativa, con 3.484 alimentos y 74 constituyentes [V: F8]. Fecha exacta [NV]: el extracto indica noviembre de 2025.
- Hay discrepancia entre fuentes sobre el recuento de 2020 (3.185 frente a 3.484) [V: F9, F10]. Se usará la cifra de la versión vigente.

**USDA FDC.**
- El catálogo de datos de USDA la etiqueta como "U.S. Public Domain" y la web de FDC como CC0 [V-sec/V: F13].
- Para un límite de API mayor, hay que contactar con FDC [V: F16].

**Open Food Facts.**
- Hay derechos de terceros que la licencia **no** cubre: el diseño del envase, las marcas y los derechos de imagen de las personas que aparecen en él. Comprobarlos es responsabilidad de quien reutiliza los datos [V: F17].
- Atribución modelo: *"Contains data from Open Food Facts, available under the Open Database License"* [V: F18].
- La propia documentación pide que las apps que permiten añadir o editar productos **envíen esas contribuciones a OFF** mediante la API o los SDK [V: F18].
- Hay comprobaciones automáticas de calidad (el wiki lista 218 tipos de error detectados) [V: F21].
- **Matiz sobre el alcance del share-alike** [NV, interpretación del texto de ODbL v1.0 que no se consultó directamente en esta investigación]:
  - La ODbL distingue entre "obra producida" (*Produced Work*), "base de datos derivada" y "base de datos colectiva".
  - Una pantalla de la app que muestra un valor es una obra producida: requiere aviso de atribución.
  - Si se modifican o corrigen los datos de OFF y se usan públicamente, esa base derivada (o sus cambios) debe ofrecerse bajo ODbL.
  - Si los datos de OFF se mantienen como un conjunto independiente junto al catálogo propio, este último puede considerarse parte de una base colectiva, no derivada, y no quedaría sujeto al share-alike.
  - **Hay que confirmarlo con un abogado** sobre el texto oficial: https://opendatacommons.org/licenses/odbl/1-0/

**EuroFIR.**
- Propuesta de cuotas de 2023: "organizaciones comerciales (grandes)", 2.000–5.000 €, más una subida del 10 % desde el 1-ene-2024 [V: F30]. Las cuotas vigentes son [NV].
- Hay un acceso de pago por consulta de 1 semana, 2 semanas o 3 meses, con descargas limitadas [V: F29].

### 2.2 Factores de retención y de rendimiento (crudo ↔ cocinado)

| Recurso | Contenido | Estado / licencia |
|---|---|---|
| **USDA Table of Nutrient Retention Factors, Release 6 (2007)** | Factores de retención de **26 vitaminas y minerales, más alcohol**, durante la preparación. Añade la colina; los demás factores no cambian respecto a la Release 4 [V: F39] | Publicación del Gobierno de EE. UU. Una copia CSV en Figshare tiene etiqueta CC0 [V-sec: F39]. Dominio público [NV formal] |
| **USDA Cooking Yields for Meat and Poultry** | Rendimientos de cocción de carne y aves [V: F40] | Documento del USDA NDL; fecha [NV] |
| **USDA Agriculture Handbook No. 102** (*Food Yields Summarized by Different Stages of Preparation*, revisión de 1975) | Rendimientos de **2.894** alimentos y preparaciones; el rendimiento del cocinado (Yc) entra en el cálculo del nutriente del alimento cocinado [V-sec: F41] | Antiguo, pero sigue siendo una referencia |
| **EuroFIR, Vasquez-Caicedo et al. (2007), D2.2.9** | Reglas de cálculo de recetas: factor de rendimiento de peso; factores de retención vinculados a la clasificación EuroFIR y a los métodos de cocción LanguaL; medias por grupo (calor seco, calor húmedo, fritura) [V-sec: F42] | Informe técnico. Licencia de reutilización de las tablas [NV] |
| **EuroFIR, armonización del cálculo de recetas** (Reinivuo y Laitinen, 2007) | Recomienda aplicar el **rendimiento a nivel de receta** y la **retención a nivel de ingrediente** ("procedimiento B") [V-sec: F43] | — |
| Bognár (tablas de rendimiento y retención) | Citadas como la fuente con más valores de retención [V-sec: F42, F43] | Edición o año (¿2002?) [NV] |

**Método recomendado para "arroz blanco crudo" frente a "arroz blanco cocido"** [Inferencia, alineada con F41 y F43]:

1. **Preferir siempre el dato analítico del alimento cocinado** si existe en una fuente con licencia válida. FDC, CIQUAL y BEDCA tienen arroz cocido [NV por alimento].
2. Si no existe, calcular:
   - Por cada 100 g de alimento cocinado: `N_cocido = N_crudo × (FR / 100) × (100 / Y)`.
   - `FR` es el factor de retención en %: se aplica a vitaminas y minerales; los macronutrientes no se pierden, salvo la grasa que gotea en carnes.
   - `Y` es el rendimiento en %: peso cocinado / peso crudo × 100.
3. Guardar el método ("analítico", "calculado: rendimiento X% + retención USDA R6/EuroFIR") como metadato de procedencia.

### 2.3 Diferencias de definición al importar datos de EE. UU. [NV, conocimiento del sector, verificar con la documentación de FDC]

- En FDC, "Carbohydrate, by difference" **incluye la fibra**. En la UE, "hidratos de carbono" son los metabolizables, sin fibra (Anexo I). **Al importar: hidratos de carbono UE = hidratos por diferencia − fibra.**
- En SR Legacy, la energía se calcula con factores Atwater específicos por alimento, no con 4/9/4. **Recalcular la energía con los factores del Anexo XIV** (§3.2) para que sea coherente con las etiquetas europeas.

---

## 3. Normativa de etiquetado y energía (Reglamento (UE) n.º 1169/2011)

### 3.1 Información nutricional obligatoria

- **Declaración obligatoria:** valor energético, grasas, de las cuales saturadas, hidratos de carbono, de los cuales azúcares, proteínas y sal [V-sec: F48; V: F47]. Es obligatoria en casi todos los alimentos envasados desde el **13-dic-2016** [V-sec: F48].
- **Complemento voluntario:** grasas monoinsaturadas y poliinsaturadas, polialcoholes, almidón, fibra alimentaria, vitaminas y minerales [V: F47].
- **Expresión** por 100 g o 100 ml, con la opción adicional de por porción [NV en esta investigación; art. 32–33].
- **Definiciones (Anexo I):** sal = sodio × 2,5; proteínas = nitrógeno total (Kjeldahl) × 6,25 [V-sec: F46, copia de legislation.gov.uk].
- **Origen del valor declarado** [NV en esta investigación, art. 31.4]: puede proceder de un análisis del fabricante, de un cálculo a partir de valores medios de los ingredientes o de datos generalmente aceptados.
- **Revisión pendiente:** se esperaba una revisión del Reglamento en el marco de la información alimentaria al consumidor y sigue en preparación [V-sec: F44, extracto]. Hay que vigilar posibles cambios.

### 3.2 Factores de conversión de energía (Anexo XIV)

El art. 31.1 remite el cálculo del valor energético a los factores del Anexo XIV [V: F45].

| Componente | kcal/g | kJ/g | Verificación |
|---|---|---|---|
| Hidratos de carbono (excepto polialcoholes) | 4 | 17 | kcal [V: F44]; kJ [NV] |
| Polialcoholes | 2,4 | 10 | kcal [V: F44]; kJ [NV] |
| Proteínas | 4 | 17 | kcal [V: F44]; kJ [NV] |
| Grasas | 9 | 37 | kcal [V: F44]; kJ [NV] |
| Salatrims | 6 | 25 | kcal [V: F44]; kJ [NV] |
| Alcohol (etanol) | 7 | 29 | kcal [V: F44]; kJ [NV] |
| Ácidos orgánicos | 3 | 13 | kcal [V: F44]; kJ [NV] |
| Fibra alimentaria | 2 | 8 | kcal [V: F44]; kJ [NV] |
| Eritritol | 0 | 0 | [V: F44] |

> Nota: F44 es la copia de legislation.gov.uk. Hay que contrastarla con el texto consolidado de EUR-Lex. Los valores en kJ se dan por conocimiento del Anexo, sin verificación en esta investigación.

### 3.3 Por qué las kcal de la etiqueta no coinciden con un cálculo exacto 4/9/4

1. **La fibra aporta 2 kcal/g** y se suma aparte. En la UE no forma parte de los "hidratos de carbono" [V: F44; definición de la UE NV].
2. **Polialcoholes a 2,4 kcal/g y eritritol a 0.** En los productos "sin azúcar", los polioles se declaran dentro de los hidratos de carbono, pero cuentan 2,4 kcal/g, no 4 [V: F44].
3. **Alcohol a 7 kcal/g y ácidos orgánicos a 3 kcal/g** (vinagres, zumos, encurtidos, bebidas) [V: F44].
4. **Redondeos.** El fabricante calcula la energía con valores sin redondear y luego redondea cada nutriente según la guía (§3.4). Al recalcular desde los valores redondeados, el resultado cambia [Inferencia sobre F52].
5. **Valores medios y tolerancias.** El valor declarado es una media (análisis, cálculo o datos aceptados) y la guía admite desviaciones de ±20 % o más (§3.4) [V-sec: F51].
6. **Bases de datos de EE. UU.:** factores Atwater específicos e hidratos de carbono "por diferencia" con la fibra incluida (§2.3) [NV].

**Ejemplo ilustrativo** (valores **inventados** para la explicación; no corresponden a un producto real). "Chocolate negro" con grasas 42,6 g, hidratos de carbono (UE) 29 g, fibra 11 g y proteínas 7,8 g por 100 g:

- Con el Anexo XIV: 42,6×9 + 29×4 + 7,8×4 + 11×2 = **552,6 kcal**.
- Con 4/9/4 sin contar la fibra: 530,6 kcal (−4 %).
- Con los hidratos "por diferencia" al estilo de EE. UU. (29 + 11 = 40 g × 4) y sin fibra aparte: 574,6 kcal (+4 %).

**Regla para la app** [Inferencia]:
- Para productos con etiqueta, **mostrar la energía declarada**.
- Para genéricos, **calcularla con el Anexo XIV** a partir de los macronutrientes.
- Marcar internamente si una incoherencia entre la energía declarada y la calculada supera ±20 %. Puede indicar un error de introducción de datos.

### 3.4 Tolerancias y redondeo (guía de la Comisión, diciembre de 2012)

La guía de la Comisión sobre tolerancias para el control de los valores nutricionales declarados (DG SANCO, dic. 2012) **no tiene valor jurídico vinculante**; la interpretación final corresponde al TJUE [V-sec: F49, copia de FSAI]. Hay una tabla resumen oficial [V: F50].

**Tolerancias para alimentos que no son complementos alimenticios** (incluyen la incertidumbre de medida):

| Nutriente | Contenido por 100 g/ml | Tolerancia | Verificación |
|---|---|---|---|
| Hidratos de carbono, azúcares, proteínas, fibra | < 10 g | ± 2 g | [V-sec: F51] |
| | 10–40 g | ± 20 % | [V-sec: F51] |
| | > 40 g | ± 8 g | [V-sec: F51] |
| Grasas | < 10 g | ± 1,5 g | [V-sec: F51] |
| | 10–40 g | ± 20 % | [V-sec: F51] |
| | > 40 g | ± 8 g | [V-sec: F51] |
| Saturadas, monoinsaturadas, poliinsaturadas | < 4 g | ± 0,8 g | [V-sec: F51; V: F50] |
| | ≥ 4 g | ± 20 % | [V-sec: F51; V: F50] |
| Sodio | < 0,5 g | ± 0,15 g | [V-sec: F51] |
| | ≥ 0,5 g | ± 20 % | [V-sec: F51] |
| Sal | < 1,25 g | ± 0,375 g | [V-sec: F51] |
| | ≥ 1,25 g | ± 20 % | [V-sec: F51] |
| Vitaminas | — | +50 % / −35 % | [V: F53] |
| Minerales | — | +45 % / −35 % | [V: F53] |

**Redondeo de la declaración (misma guía):**

| Nutriente | Regla | Verificación |
|---|---|---|
| Energía | Al kJ/kcal entero más próximo | [V-sec: F52] |
| Grasas, hidratos de carbono, azúcares, proteínas, fibra | ≥ 10 g → 1 g; < 10 g y > 0,5 g → 0,1 g; ≤ 0,5 g → puede declararse "0 g" | [V-sec: F52] (la variante "<0,5 g" [NV]) |
| Saturadas | ≥ 10 g → 1 g; < 10 g y > 0,1 g → 0,1 g; ≤ 0,1 g → "0 g" | [V-sec: F52] |
| Sal | ≥ 1 g → 0,1 g; < 1 g y > 0,0125 g → 0,01 g; ≤ 0,0125 g → "0 g" | [V-sec: F52] (hay fuentes que dicen "<0,01 g": discrepancia) |

### 3.5 Los 14 alérgenos (Anexo II)

El Anexo II recoge **14 grupos** de sustancias o productos que causan alergias o intolerancias [V-sec: F55; V: F54]. La lista de cereales es **exhaustiva** [V-sec: F56]. La información sobre alérgenos también es obligatoria en alimentos no envasados [V: F57, extracto de AESAN].

1. **Cereales que contengan gluten:** trigo (espelta y khorasán incluidos), centeno, cebada, avena o sus variedades híbridas, y productos derivados, con excepciones (p. ej., jarabes de glucosa a base de trigo, dextrosa incluida) [V-sec: F55].
2. Crustáceos y productos a base de crustáceos.
3. Huevos y productos a base de huevo.
4. Pescado y productos a base de pescado.
5. Cacahuetes y productos a base de cacahuetes.
6. Soja y productos a base de soja.
7. Leche y sus derivados (incluida la lactosa).
8. Frutos de cáscara: almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, pistachos y macadamias.
9. Apio y productos derivados.
10. Mostaza y productos derivados.
11. Granos de sésamo y productos a base de granos de sésamo.
12. Dióxido de azufre y sulfitos en concentraciones superiores a 10 mg/kg o 10 mg/l (expresado como SO₂).
13. Altramuces y productos a base de altramuces.
14. Moluscos y productos a base de moluscos.

> Verificación: el número (14) y el grupo 1 están verificados [V: F54; V-sec: F55]. La redacción de los grupos 2 a 14 se transcribe por conocimiento del Anexo II [NV en esta investigación]. Las excepciones detalladas de cada grupo hay que tomarlas del texto consolidado de EUR-Lex.

**Implicación para la app** [Inferencia]:
- Guardar los alérgenos como **14 indicadores normalizados** más las "trazas" (precautorias, voluntarias).
- En los genéricos, los alérgenos son intrínsecos ("leche" → grupo 7). En los productos, se toman de la etiqueta.

### 3.6 Venta a distancia (art. 14)

En los alimentos envasados vendidos a distancia, **toda la información alimentaria obligatoria, salvo la fecha de duración mínima o de caducidad, debe estar disponible antes de la compra** y sin coste adicional [V: F57].

[Inferencia] Los supermercados online están obligados a mostrar la información nutricional antes de la compra. Que la información esté **publicada** no significa que se pueda **reutilizar** (§5).

---

## 4. Supermercados españoles

### 4.1 Tabla resumen

| Cadena | API pública | Afiliados / programa de datos | Información nutricional en la web | Condiciones de uso (resumen) | Verificación |
|---|---|---|---|---|---|
| **Mercadona** | **No oficial.** Hay librerías y scrapers no oficiales que la propia comunidad describe como "no oficiales" [V-sec: F61] | No se encontró [NV] | Tienda online: **fotos del envase en alta resolución** para leer la etiqueta; en la panadería sin envasar, un desplegable con ingredientes, alérgenos e información nutricional [V: F59] | Uso personal; **uso comercial prohibido**; reproducción comercial con autorización previa **y acuerdo** [V: F58] | Términos en inglés (copia de hace ~2 años según los metadatos) |
| **Lidl España** | No encontrada [NV] | No encontrado [NV] | [NV] (la venta online de alimentación en España no se confirmó) | Prohíbe la reproducción o distribución con fines comerciales sin autorización; enlazar exige consentimiento [V: F62, F63]; **recetas: uso comercial prohibido** [V: F64] | Paráfrasis del extracto |
| **Aldi España** | No encontrada [NV] | No encontrado [NV] | [NV] | Prohíbe descargar, copiar o reproducir sin consentimiento escrito; uso **solo con fines privados** [V: F65] | Página antigua según los metadatos |
| **Supermercados El Jamón** (Grupo Empresarial El Jamón, S.L., antes Cash Lepe) [V-sec: F68] | No encontrada [NV] | Alianza de reparto con **Glovo** [V-sec: F67]; supermercado online lanzado [V-sec: F66] | [NV] | **No se encontró el aviso legal** [NV] | — |
| **Carrefour España** | No encontrada [NV] | **Sí: Carrefour Supermercado Online en Awin** (perfil 25399): 5 % de la cesta en Alimentación, No Alimentación y Moda; 15 días desde el clic y 7 desde la visualización; prohibido modificar los enlaces [V: F73] | [NV] en la web oficial (solo se encontraron copias de terceros) | Contenidos, **estructura y selección** protegidos; prohibida la explotación comercial "ni directa ni indirectamente"; prohibida la ingeniería inversa [V: F70]; no usar la información para fines comerciales [V: F69]; **en la app y en la tarjeta Pass, prohibidos los programas automáticos: arañas, robots, indexadores, bots** [V: F71, F72] | Paráfrasis de los extractos |
| **DIA** | No encontrada [NV] | Programa en TradeDoubler listado como **cerrado** [V-sec: F75] | [NV] | Copiar, modificar o redistribuir con fines públicos o comerciales exige autorización previa, expresa y escrita [V: F74] | Paráfrasis |
| **Eroski** | No encontrada [NV] | Acuerdo con NIQ Activate [V-sec: F78, solo el título de la nota de prensa; naturaleza del acuerdo NV]; afiliación no encontrada [NV] | Supermercado online con >14.000 referencias de alimentación y frescos [V-sec: F78]; ficha nutricional [NV] | Solo visualización y descarga para uso **personal y no comercial**; prohibido copiar, modificar, distribuir, reproducir o crear productos o servicios derivados [V: F76]; enlazar a la app exige consentimiento [V: F77] | Paráfrasis (traducida del extracto) |
| **Alcampo** | No encontrada [NV] | No encontrado [NV] | [NV] | Contenido protegido; guardarlo solo para uso personal y no comercial; prohibido redistribuir o reutilizar con fines públicos o comerciales [V: F79, F80] | Paráfrasis |
| **Consum** | No encontrada [NV] | No encontrado [NV] | [NV] | "Queda prohibida su reproducción, distribución, comunicación pública y transformación, salvo para uso personal y privado" [V: F81]; cualquier explotación exige autorización previa y escrita [V: F82] | Cita literal (F81) |
| *(Referencia) El Corte Inglés* | — | En Awin, **la categoría de supermercado no genera comisión** [V: F83] | — | — | — |

**No se comprobó el `robots.txt` de ningún supermercado** [NV]. No cambia la conclusión: las condiciones ya bastan para descartar la extracción automatizada.

### 4.2 Citas de condiciones (según los extractos del buscador)

- **Mercadona** (versión en inglés de los términos) [V: F58]:
  - *"…commercial use is forbidden unless otherwise stated."*
  - Para usos comerciales es necesario obtener *"prior authorisation from Mercadona and enter into an agreement"*.
  - *"Articles, information and other materials are protected by industrial and/or intellectual property law."*
  - *"…logos, brands and trade names featuring on the web site remain the property of Mercadona."*
- **Lidl** [V: F62] (paráfrasis): prohibida la reproducción o distribución de contenidos con fines comerciales sin autorización de LIDL; enlazar el portal requiere consentimiento expreso. **Recetas Lidl** [V: F64]: "queda prohibido el uso comercial de las Recetas".
- **Aldi** [V: F65]:
  - "Los contenidos de estos Web Sites no podrán ser descargados, copiados, reproducidos… sin el previo consentimiento por escrito de ALDI".
  - "El uso de esta página web será siempre con fines privados".
  - "Todos los derechos están reservados. Su reproducción precisa de autorización."
- **Carrefour:**
  - Las condiciones de Carrefour Pass y de la app Mi Carrefour prohíben ejecutar programas o comandos automáticos y citan expresamente "arañas web, robots web, indexadores y bots" (paráfrasis) [V: F71, F72].
  - Los términos de los Medios Digitales protegen textos, imágenes, software **y la estructura y selección de contenidos**, y exigen autorización previa y escrita para reproducirlos o transformarlos (paráfrasis) [V: F70].
- **DIA** [V: F74] (paráfrasis): la copia, modificación o redistribución con fines públicos o comerciales requiere autorización previa, expresa y escrita de DIA ESPAÑA o del titular.
- **Eroski** [V: F76] (paráfrasis traducida): solo se autoriza visualizar y descargar para uso personal y no comercial. El usuario no puede copiar, modificar, distribuir, transmitir, reproducir, publicar, ceder o vender estos elementos, ni crear productos o servicios derivados.
- **Alcampo** [V: F79, F80] (paráfrasis): el contenido de la app puede guardarse en el dispositivo solo para uso personal y no comercial; se prohíbe distribuirlo, modificarlo o reutilizarlo con fines públicos o comerciales.
- **Consum** [V: F81] (literal): "Queda prohibida su reproducción, distribución, comunicación pública y transformación, salvo para uso personal y privado."

---

## 5. Marco legal del scraping y de la reutilización

### 5.1 Derecho *sui generis* sobre bases de datos

- **Directiva 96/9/CE, art. 7:**
  - Protege al fabricante que ha hecho una **inversión sustancial**, cualitativa o cuantitativa, en la **obtención, verificación o presentación** del contenido [V-sec: F84; V: F86].
  - Le permite prohibir la **extracción** (transferir el contenido a otro soporte) y la **reutilización** (ponerlo a disposición del público) de la totalidad o de una **parte sustancial** [V: F87].
  - Según la jurisprudencia, la extracción o reutilización **repetida y sistemática de partes no sustanciales** puede valorarse en conjunto [V-sec: F100].
- **España:** se transpuso con la Ley 5/1998, que crea el Título VIII del Libro II de la LPI (**arts. 133 a 137**) [V: F85, F86].
  - Art. 133: objeto (inversión sustancial).
  - Art. 134: derechos y obligaciones del usuario legítimo.
  - Art. 135: excepciones.
  - Los pactos contrarios a los derechos del usuario legítimo son **nulos de pleno derecho** [V: F85].
  - **Duración:** 15 años desde el 1 de enero siguiente a la finalización de la base de datos [V: F85]. Se renueva con cada modificación sustancial [NV].
- **La inversión en *crear* los datos no cuenta** (*British Horseracing Board*, C-203/02, 9-nov-2004): solo cuenta la inversión en obtener, verificar o presentar datos que ya existen [V: F87].

[Inferencia]
- Los precios y el surtido de un supermercado son, en gran parte, datos "creados" por él. Su listado de precios por sí solo podría tener una protección *sui generis* discutible.
- En cambio, un catálogo online con fichas, fotos, descripciones y tablas nutricionales transcritas de los envases implica una inversión en obtención, verificación y presentación que **probablemente sí está protegida**.
- No conviene apostar el producto a esa discusión.

### 5.2 Jurisprudencia del TJUE relevante

| Asunto | Fecha | Doctrina | Relevancia para FITona |
|---|---|---|---|
| **C-203/02** *British Horseracing Board v William Hill* | 9-nov-2004 | La inversión en **crear** datos no activa el derecho *sui generis* [V: F87] | Argumento a favor de reutilizar datos "creados" (horarios, precios), aunque no protege ante el resto de riesgos |
| **C-202/12** *Innoweb v Wegener* | 19-dic-2013 | Un **metabuscador dedicado** que da al usuario final una forma de acceso a la base de datos **reutiliza** una parte sustancial; infringe el art. 7.1 [V-sec: F92] | **Un comparador o buscador de productos de supermercado que consulta sus webs en tiempo real encaja en este supuesto** |
| **C-30/14** *Ryanair v PR Aviation* | 15-ene-2015 | Si la base de datos **no** está protegida por derechos de autor ni por el derecho *sui generis*, la Directiva **no impide** al titular imponer **restricciones contractuales** (prohibir el scraping), sin perjuicio del derecho nacional; el contrato solo vincula a las partes [V-sec: F88, F89] | **Aunque la base de datos no estuviera protegida, las condiciones de uso pueden prohibir el scraping**, si se aceptaron válidamente según el derecho nacional |
| **C-762/19** *CV-Online Latvia v Melons* | 3-jun-2021 | Un metabuscador dedicado puede constituir extracción o reutilización. Solo se prohíben las que **perjudican la inversión** (riesgo para su amortización); el juez nacional valora la inversión sustancial [V-sec: F90, F91] | Introduce un equilibrio, pero una app que sustituye a la consulta de la web del supermercado **sí puede perjudicar** su inversión (tráfico, publicidad, retail media) [Inferencia] |

**España, contexto de los casos de Ryanair:**
- El Tribunal Supremo resolvió en 2014 varios recursos sobre *screen scraping* de agencias como Atrápalo, Rumbo y Lastminute.
- En la STS 236/2014 (7-may-2014, rec. 1421/2012) se recoge que el *screen scraping* **no supuso un aprovechamiento indebido del esfuerzo ajeno** a efectos de la Ley de Competencia Desleal en ese caso [V-sec: F99]. Otro resumen, de número de sentencia dudoso, apunta en sentido contrario cuando hay incumplimiento de las condiciones [V-sec: F100].
- Esos litigios son **anteriores a *Ryanair* (2015) y a *CV-Online* (2021)**. **No permiten concluir que hoy sea lícito** [Inferencia].

### 5.3 Excepciones de minería de textos y datos (TDM)

- **Directiva (UE) 2019/790:**
  - **Art. 3:** excepción obligatoria para **organismos de investigación** e instituciones del patrimonio cultural, con fines de investigación científica. **Quedan fuera** las entidades con orientación comercial [V-sec: F95].
  - **Art. 4:** excepción general, **comercial incluida**, para **reproducciones y extracciones** de obras y otras prestaciones accesibles lícitamente, **incluido el art. 7.1 de la Directiva 96/9** (derecho *sui generis*) [V: F93].
    - Las copias pueden conservarse "el tiempo necesario para los fines de la minería" (art. 4.2) [V: F93].
    - **Solo se aplica si el titular no ha reservado expresamente sus derechos**. En el contenido online, la reserva se hace "por medios de lectura mecánica" (art. 4.3) [V: F93].
    - La doctrina entiende que los metadatos **y las condiciones de uso** de la web pueden servir como reserva [V-sec: F95].
- **España: RDL 24/2021, art. 67.** Reúne en un solo precepto las excepciones de los arts. 3 y 4 [V-sec: F96, F98].
  - El límite cubre la **reproducción** con fines de minería, **no la comunicación pública** del material [V-sec: F97].
  - La reserva (*opt-out*) no se opone a la minería con fines de investigación científica [V-sec: F96].

[Inferencia] **La excepción TDM no ampara a FITona para mostrar en la app datos extraídos de los supermercados:**
1. Mostrar los datos a los usuarios es **reutilización o comunicación pública**, no minería.
2. Las condiciones de todas las cadenas reservan los derechos de forma expresa.
3. Como mucho, ampararía análisis internos (p. ej., estadísticas agregadas no publicadas) **y solo sobre contenido sin reserva de derechos**.

### 5.4 Otros riesgos

- **Competencia desleal** (Ley 3/1991): es la vía usada en los casos de Ryanair en España [V-sec: F99]. Los artículos aplicables y la doctrina actual son [NV].
- **Fotografías de producto y marcas:** las fotos tienen derechos de autor y los logotipos son marcas registradas. OFF también advierte de estos derechos de terceros [V: F17]. **No copiar imágenes de los supermercados** [Inferencia].
- **Eludir medidas técnicas o barreras anti-bot:** posible responsabilidad civil y, en casos graves, penal (acceso ilícito a sistemas). Los artículos concretos son [NV]. Requiere valoración jurídica.

### 5.5 RGPD

- **Los datos de salud son una categoría especial** (art. 9 RGPD). Su tratamiento está **prohibido** salvo excepción, como el **consentimiento explícito** para fines especificados [V: F101].
- [Inferencia] Una app de nutrición que registra peso, alergias, intolerancias o dietas por motivos de salud **probablemente trata datos de salud**. Necesita una base del art. 6, una excepción del art. 9.2.a (consentimiento explícito y separado), minimización, y valorar una EIPD (evaluación de impacto). Que sea obligatoria es [NV].
- **Tickets de compra** [Inferencia]: pueden contener datos personales (número de tarjeta de fidelización, últimos dígitos de la tarjeta de pago, tienda, fecha y hora). Hay que:
  - procesarlos con consentimiento o en ejecución del servicio pedido;
  - **descartar los campos innecesarios tras el OCR**;
  - no conservar la imagen más tiempo del necesario;
  - publicar los precios agregados **sin vincularlos al usuario**.
- **Precios aportados por la comunidad con geolocalización y hora:** son datos personales mientras puedan vincularse al usuario. Hay que publicarlos agregados o desvinculados [Inferencia].

### 5.6 Conclusión práctica (semáforo)

| Actividad | Riesgo | Motivo |
|---|---|---|
| Usar USDA FDC (CC0), INE (CC BY 4.0) y CIQUAL (Licence Ouverte, tras confirmarla) con atribución | 🟢 Bajo | Licencias abiertas que permiten el uso comercial [V: F13, F102; V-sec: F11] |
| Usar Open Food Facts con atribución, en una capa separada, devolviendo las mejoras | 🟢 Bajo | ODbL cumplida [V: F17, F18] |
| Datos introducidos por el usuario desde **su** envase o **su** ticket | 🟢 Bajo (+RGPD) | Hechos aislados de un solo producto; no hay extracción sustancial de una base de datos [Inferencia] |
| Enlaces de afiliado (Carrefour en Awin) | 🟢 Bajo | Contrato con el titular [V: F73] |
| Usar BEDCA **con** autorización escrita de AESAN | 🟢 Bajo | [V: F1] |
| Usar BEDCA **sin** autorización en la app comercial | 🔴 Alto | Contrario a las condiciones de uso [V: F1] |
| Consultar puntualmente la web de un supermercado para validar internamente un dato concreto | 🟡 Medio-bajo | Uso no sustancial; aun así, las condiciones limitan el uso comercial [Inferencia] |
| Minería interna para estadística no publicada | 🟡 Medio | Art. 4 DSM / art. 67 RDL 24/2021, **pero las condiciones reservan los derechos** [V: F93; Inferencia] |
| Scraping sistemático de catálogos o precios de supermercados para mostrarlos en la app | 🔴 Alto | *Sui generis* (*Innoweb*, *CV-Online*), contrato (*Ryanair*), competencia desleal y prohibición expresa de bots (Carrefour) |
| Copiar fotos de productos o logotipos de los supermercados | 🔴 Alto | Derechos de autor y marcas [V: F17; Inferencia] |
| Copiar en bloque las tablas de Moreiras o Mataix | 🔴 Alto | Obra protegida sin licencia [NV/Inferencia] |
| Usar la API de CoFID de Quadram (CC BY-NC-SA) en la app comercial | 🔴 Alto | Licencia no comercial [V-sec: F38] |

---

## 6. Alternativas legales para precios y productos

| Alternativa | Qué aporta | Licencia / base legal | Limitaciones | Prioridad |
|---|---|---|---|---|
| **OCR de tickets del usuario** | Precio real, tienda, fecha y productos comprados | Datos del propio usuario. RGPD: consentimiento o ejecución del servicio, con minimización [Inferencia; F101] | Las descripciones abreviadas del ticket hay que vincularlas a un producto o genérico (ML más revisión). La imagen del ticket es un dato personal | **Alta** |
| **Precios aportados por la comunidad** (foto de la etiqueta del lineal y del ticket como prueba) | Cobertura por tienda y zona | Términos propios que obtengan una licencia del usuario; RGPD | Fraude o errores: hacen falta validación y reputación | Alta |
| **Open Prices** (Open Food Facts) | Precios colaborativos con prueba (ticket o etiqueta) [V: F26] | **Datos ODbL 1.0; pruebas CC BY-SA 4.0** [V: F24]; ODbL en data.gouv [V: F25] | Volumen modesto: >125.000 precios en agosto de 2025, mundial [V-sec: F27]. España [NV]. Algunos endpoints requieren cuenta de OFF y token. Volcados JSONL diarios [V: F24] | Media: consumir y **contribuir** |
| **Afiliación** | Enlace a la compra con comisión | Contrato. Carrefour Supermercado Online en Awin [V: F73] | Si Awin ofrece un *feed* de productos y precios para este anunciante es [NV]. El Corte Inglés no paga comisión en supermercado [V: F83]. DIA en TradeDoubler: cerrado [V-sec: F75] | Media |
| **Acuerdos directos con cadenas o fabricantes** | Datos oficiales de producto | Contrato | Requiere negociación. Ejemplo: acuerdo de Eroski con NIQ Activate [V-sec: F78; alcance NV] | Media-baja (más adelante) |
| **INE – IPC por subclases (ECOICOP)** | **Índices**, no precios en €. Sirve para actualizar precios de referencia con la inflación | **CC BY 4.0**, incluido el uso comercial. Citar "Fuente: Sitio web del INE: www.ine.es" o "Elaboración propia con datos extraídos del sitio web del INE…"; mencionar la fecha de actualización; no desnaturalizar los datos; solo cubre contenidos cuya fuente original sea el INE [V: F102, F103] | API JSON de INEbase (Tempus3). Tablas útiles: subclases (p. ej., 50937), grupos ECOICOP (24080) y ECOICOP v2 (79181) [V: F104]. La periodicidad hay que comprobarla en cada ficha | Media |
| **MAPA – Panel de consumo alimentario** ("La alimentación mes a mes") | **Precio medio €/kg o €/l por categoría** y consumo per cápita. Panel de 12.500 hogares con lector óptico desde 2016; desde 2024 adaptado al censo de 2021 [V: F107] | Licencia de reutilización [NV] (por defecto, la Ley 37/2007 de reutilización de la información del sector público; confirmar el aviso legal del MAPA) | Agregado por categoría, no por producto. PDF mensual | Media (precio de referencia de genéricos) |
| **MAPA – Observatorio de la Cadena Alimentaria** | Precios **origen-mayorista** de 34 productos frescos (semanales) y precios en **destino**/consumo (€/kg, €/docena, €/unidad) [V: F105]. Desde nov-2024 los precios minoristas son mensuales [V: F106] | Licencia [NV] | Las series no son homogéneas entre eslabones [V: F105] | Media-baja |
| **Open Food Facts** (nutrición de productos) | Etiqueta nutricional, ingredientes, alérgenos, Nutri-Score, por código de barras | ODbL/DbCL/CC BY-SA [V: F17] | Calidad variable; aplicar filtros de completitud [V: F22]; límites de la API [V: F19] | **Alta** |
| **Etiqueta introducida por el usuario** (foto del envase con OCR) | Rellena huecos de OFF | Términos propios; se recomienda contribuir a OFF [V: F18] | Moderación | Alta |

---

## 7. Seguridad alimentaria: valores de referencia con fuente

### 7.1 España y la UE (fuente preferente para la app)

| Aspecto | Valor | Fuente | Verificación |
|---|---|---|---|
| Cocinado general | Al menos **70 °C en el centro durante al menos 2 min**, de forma homogénea | AESAN (fichas de listeriosis y triquinelosis; campaña de verano) | [V: F114]; [V-sec: F113] |
| Carne (criterio del Comité Científico de AESAN) | 70 °C durante al menos 1 s | Comité Científico de AESAN (informe de ~2021) | **[NV]**: aparece en un extracto sin URL identificada |
| **Aves** (criterio del Comité Científico de AESAN) | **74 °C durante al menos 1 s** | Comité Científico de AESAN | **[NV]**: igual que la anterior |
| Mantener las sobras o lo que no se consume enseguida | Calientes **> 60 °C** o frías **≤ 5 °C** | AESAN, campaña de verano | [V-sec: F113] (extracto atribuido a la página de AESAN) |
| Tiempo máximo fuera del frigorífico | **≤ 2 h**, o **≤ 1 h si hace > 30 °C** | AESAN | [V-sec: F113] |
| Frigorífico doméstico | "A ser posible por debajo de 4 °C" (publicación de AESAN); ≤ 5 °C para cocinados (campaña de verano) | AESAN | [V-sec]: la URL concreta de los 4 °C no se identificó; 5 °C [V-sec: F113] |
| *Listeria* | Se multiplica a temperaturas de refrigeración (2–4 °C); 70 °C durante 2 min la destruye | AESAN, ficha de listeriosis | [V: F114] |
| Recalentado | 70 °C durante 2 min | AESAN | [V-sec]: extracto sin URL identificada |
| Zona de peligro | 5–65 °C | Consumer.es (Fundación Eroski), divulgativa | [V-sec: F116] |
| 5 claves de la OMS | Limpieza, separar crudo y cocinado, cocinar bien, temperaturas seguras, agua y materias primas seguras | OMS vía Consumer.es | [V-sec: F116] |
| EFSA (consejos al consumidor) | — | — | **[NV]**: no se pudo buscar (cupo agotado) |

### 7.2 Estados Unidos (USDA FSIS / FoodSafety.gov)

| Aspecto | Valor | Verificación |
|---|---|---|
| **Aves** (enteras, pechuga, muslo, picada, menudillos, relleno) | **165 °F (73,9 °C)** | [V: F108; V-sec: F117] |
| Carne picada (vacuno, cerdo, cordero) | **160 °F (71,1 °C)** | [V-sec: F117] |
| Piezas enteras de vacuno, cerdo, ternera y cordero (filetes, chuletas, asados) | **145 °F (62,8 °C) y 3 min de reposo** (el cerdo bajó de 160 °F a 145 °F en 2011) | [V-sec: F108, F117] |
| Pescado | **145 °F (62,8 °C)**, o hasta que la carne quede opaca y se separe con el tenedor | [V-sec: F108] |
| Sobras y guisos al horno | **165 °F (73,9 °C)** al recalentar | [V: F109, F110] |
| Refrigerar tras cocinar | En menos de **2 h**, o **1 h si hace > 90 °F (32 °C)**; recipientes **poco profundos** para enfriar antes | [V: F109, F110] |
| Frigorífico | **≤ 40 °F (4 °C)** | [V: F112] |
| Congelador | **0 °F (−18 °C)**; lo congelado es seguro indefinidamente, aunque la calidad baja | [V: F112; V: F110] |
| Sobras en el frigorífico | **3–4 días** | [V: F110; V-sec: F111]. El *Cold Food Storage Chart* de FoodSafety.gov, que da 3–4 días para carne y aves cocinadas, sopas y guisos, solo se verificó en fuentes secundarias [V-sec] |

### 7.3 Valores recomendados para las recetas de FITona (conservadores y unificados)

[Inferencia] Cuando las fuentes difieren, se toma el **valor más seguro** y se muestra la fuente española primero.

| Situación | Valor en la app | Justificación |
|---|---|---|
| Aves y carne picada de aves | **≥ 74 °C en el centro** | USDA 165 °F [V: F108]; cumple AESAN ≥70 °C/2 min [V: F114] |
| Carne picada (vacuno, cerdo, cordero) | **≥ 71 °C** (o 70 °C durante 2 min) | USDA 160 °F [V-sec]; AESAN 70 °C/2 min [V] |
| Piezas enteras de carne y pescado | Por defecto **70 °C/2 min** (AESAN). Opción "poco hecho" con aviso: USDA admite 63 °C más 3 min de reposo; no recomendado para grupos vulnerables | AESAN [V: F114]; USDA [V-sec: F117] |
| Recalentar sobras | **≥ 74 °C** en todo el alimento | USDA 165 °F [V: F110]; supera los 70 °C/2 min de AESAN |
| Enfriar y guardar | Al frigorífico en **< 2 h** (**< 1 h si hace > 30 °C**), en recipientes poco profundos | AESAN [V-sec: F113]; USDA [V: F109] |
| Frigorífico | **≤ 4 °C** | USDA/FDA [V: F112]; AESAN "por debajo de 4 °C" [V-sec] |
| Congelador | **≤ −18 °C** | [V: F112] |
| Consumo de sobras refrigeradas | **3–4 días** (fuente: USDA) | [V: F110]. **Falta el equivalente oficial español [NV]** |
| Mantener caliente | **> 60 °C** | AESAN [V-sec: F113] |

**Pendiente de verificar antes de publicar recetas** [NV]:
- El informe del Comité Científico de AESAN sobre las temperaturas de cocinado (70 °C/1 s para carne; 74 °C/1 s para aves).
- Los consejos de la EFSA al consumidor.
- El **RD 3484/2000** (comidas preparadas: enfriamiento rápido y temperaturas de conservación). Es normativa para establecimientos, no para hogares, pero sirve de referencia.
- Las medidas frente a ***Anisakis*** en pescado crudo o poco hecho (congelación previa). **Es relevante en España** (boquerones en vinagre, sushi, ceviche): hay que confirmar con AESAN la temperatura y la duración.

---

## 8. Tamaño y composición del catálogo inicial

### 8.1 Evidencia disponible

- **No se encontraron estudios** que digan cuántos alimentos cubren la mayoría de los registros cotidianos de dieta en España. **No se pudieron buscar de forma específica** porque se agotó el cupo de búsquedas [NV].
- Tamaños de referencia de bases de datos nacionales (verificados):

| Base de datos | Nº de alimentos |
|---|---|
| BEDCA (lanzamiento, seleccionado para la dieta española) | > 500 [V-sec: F3] |
| Frida (Dinamarca) | > 1.400 [V: F34] |
| CoFID (Reino Unido) | ~2.900 [V-sec: F38] |
| CIQUAL (Francia) | 3.484 [V: F8] |

- El panel de consumo del MAPA da una estructura de categorías de compra de los hogares [V: F107]. Se puede usar para priorizar grupos, pero no da una cifra de cobertura.
- **Pistas para verificar** [NV]: la encuesta nacional de alimentación de AESAN (ENALIA) y la base de datos de consumo de la EFSA (*Comprehensive European Food Consumption Database*), con datos españoles por categoría FoodEx2. Permitirían ordenar los alimentos por frecuencia de consumo.

### 8.2 Estimación propuesta (**[NV], estimación razonada, no dato**)

- **400–600 genéricos base** cubrirían la gran mayoría de los registros diarios, previsiblemente más del 80–90 %. Se apoya en la distribución tipo Pareto habitual del consumo (pocos alimentos acumulan la mayoría de las ingestas) y en que BEDCA arrancó con más de 500 alimentos pensados para la dieta española.
- **Más variantes nutricionalmente relevantes:** crudo, cocido, frito o a la plancha; con o sin piel; escurrido o en aceite; desnatado o entero. Suponen un **+30–50 %** de registros, **sin crear genéricos nuevos**: son variantes vinculadas al genérico.
- **Más 150–250 platos españoles** calculados por receta (tortilla de patatas, paella, lentejas estofadas, cocido, gazpacho, salmorejo, croquetas, pisto…), con rendimientos y retenciones (§2.2).
- **Total inicial orientativo:** ~800–1.200 registros (genéricos más variantes) y ~200 platos.

| Grupo | Nº orientativo de genéricos | Variantes típicas |
|---|---|---|
| Cereales y derivados (arroz, pasta, pan, harinas, copos) | 50–70 | Crudo/cocido; integral/refinado |
| Legumbres | 15–20 | Seco/cocido/en conserva escurrido |
| Verduras y hortalizas | 70–90 | Crudo/hervido/plancha/congelado |
| Frutas (frescas, secas, desecadas) | 60–80 | Con o sin piel; en almíbar o al natural |
| Lácteos y derivados | 40–60 | Entero/semidesnatado/desnatado |
| Huevos | 5–10 | Crudo/cocido/frito/tortilla |
| Carnes y derivados (incluidos los embutidos españoles) | 60–90 | Crudo/plancha/asado/frito; con o sin grasa visible |
| Pescados y mariscos | 50–70 | Crudo/plancha/hervido/conserva |
| Aceites y grasas | 10–15 | — |
| Frutos secos y semillas | 15–25 | Crudo/tostado/salado |
| Azúcares, dulces y bollería genérica (incluido chocolate negro, con leche y blanco) | 30–40 | Por % de cacao |
| Bebidas (incluidas las alcohólicas) | 30–40 | — |
| Salsas, condimentos y otros | 20–30 | — |

### 8.3 Cómo validar y hacer crecer el catálogo [Inferencia]

- Registrar las **búsquedas sin resultado** y los **alimentos creados por los usuarios**.
- Objetivo de ejemplo: que más del 95 % de los registros se resuelvan con el catálogo de genéricos a los 3 meses. Añadir mensualmente los 50 genéricos más pedidos.
- Priorizar con los datos de consumo de ENALIA y la EFSA cuando se verifiquen [NV].

### 8.4 Asignación de fuentes por capa respetando las licencias

| Necesidad | Fuente primaria | Fuente secundaria | Nota de licencia |
|---|---|---|---|
| Genérico crudo | USDA FDC Foundation/SR Legacy | CIQUAL | Adaptar a la UE: hidratos sin fibra y energía según el Anexo XIV |
| Genérico cocinado | Dato analítico de FDC o CIQUAL | Cálculo con USDA R6 y rendimientos de AH-102 o EuroFIR | Guardar el método |
| Particularidades españolas (embutidos, quesos, platos) | BEDCA (**tras autorización**) | Cálculo por receta | Sin autorización, solo cálculo propio |
| Productos comerciales | OFF | Etiqueta introducida por el usuario | Capa ODbL separada; devolver los cambios a OFF |
| Alérgenos | Etiqueta (producto) e intrínsecos (genérico) | — | 14 indicadores del Anexo II |
| Precios | Tickets y comunidad | Open Prices, INE, MAPA | RGPD; ODbL (Open Prices); CC BY 4.0 (INE) |

### 8.5 Modelo de procedencia (Oracle) [Inferencia]

Por cada valor nutricional, guardar:
- `fuente_id` (BEDCA/CIQUAL/FDC/OFF/USUARIO/CALCULADO)
- `codigo_en_fuente`
- `version_fuente`
- `fecha_importacion`
- `licencia` (CC0/ETALAB/ODBL/AUTORIZACION_AESAN/PROPIA)
- `metodo` (ANALITICO/ETIQUETA/CALCULADO_RECETA/CALCULADO_RENDIMIENTO)
- `unidad_base` (100 g/100 ml)

Mantener los datos con licencia ODbL en **tablas o esquema separados** (p. ej., `OFF_*`), para poder exportarlos y devolverlos a OFF. Así no se mezclan con el catálogo propio y se facilita el cumplimiento del share-alike.

---

## 9. Fuentes

Todas consultadas el **18-nov-2026** mediante extractos del buscador web. La lectura directa de bedca.net, aesan.gob.es y ciqual.anses.fr estaba bloqueada desde el entorno.

**Composición de alimentos**
1. **F1** – BEDCA, "Condiciones de uso" (v1.0): https://www.bedca.net/bdpub/UsoBD.pdf
2. **F2** – AESAN, Composición de alimentos (BEDCA): https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/subseccion/composicion_alimentos_BD.htm
3. **F3** – Consumer.es, "Sanidad pone en marcha una base de datos…" (lanzamiento de BEDCA): https://www.consumer.es/alimentacion/sanidad-pone-en-marcha-una-base-de-datos-para-que-los-ciudadanos-accedan-al-contenido-nutricional-de-los-alimentos.html
4. **F4** – Endocrinología, Diabetes y Nutrición (2018), "Spanish food composition tables and databases": https://www.elsevier.es/es-revista-endocrinologia-diabetes-nutricion-english-ed--413-articulo-spanish-food-composition-tables-databases-S2530018018300982
5. **F5** – Nutrición Hospitalaria 41 (n.º esp. 3), 2024: https://scielo.isciii.es/pdf/nh/v41nspe3/0212-1611-nh-41-nspe3-37.pdf
6. **F6** – datos.gob.es, solicitud de datos "Base de datos BEDCA": https://datos.gob.es/en/solicitud-de-datos/base-de-datos-bedca
7. **F7** – Proyecto no oficial bedca-api (ecosyste.ms): https://awesome.ecosyste.ms/projects/github.com%2Fstatickidz%2Fbedca-api
8. **F8** – ANSES, "Table Ciqual : une nouvelle version enrichie et plus représentative": https://www.anses.fr/fr/actualite/table-ciqual-nouvelle-version-enrichie-plus-representative
9. **F9** – Zenodo, Ciqual 2020 (documentación y forma de cita): https://zenodo.org/records/4770202
10. **F10** – data.gouv.fr, Ciqual 2020: https://www.data.gouv.fr/datasets/table-de-composition-nutritionnelle-des-aliments-ciqual-2020/informations
11. **F11** – Wiki de Open Food Facts, fuentes de datos públicas (Ciqual, "Open Licence"): https://wiki.openfoodfacts.org/Project:Public_Data
12. **F12** – USDA FoodData Central (inicio): https://fdc.nal.usda.gov/
13. **F13** – FDC, FAQ (CC0 y cita): https://fdc.nal.usda.gov/faq
14. **F14** – FDC, Data Documentation: https://fdc.nal.usda.gov/data-documentation/
15. **F15** – FDC, Downloadable Data: https://fdc.nal.usda.gov/download-datasets/
16. **F16** – FDC, API Guide: https://fdc.nal.usda.gov/api-guide
17. **F17** – Open Food Facts, "Terms of use, contribution and re-use": https://world.openfoodfacts.org/terms-of-use
18. **F18** – Open Food Facts, "License – be on the legal side": https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/
19. **F19** – Open Food Facts, introducción a la API: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/
20. **F20** – Soporte de Open Food Facts, "Are there conditions to use the API?": https://support.openfoodfacts.org/help/en-gb/12-api-data-reuse/94-are-there-conditions-to-use-the-api
21. **F21** – Wiki de Open Food Facts, lista de errores de calidad: https://wiki.openfoodfacts.org/List_of_data_quality_errors_(generated)
22. **F22** – Soporte de Open Food Facts, "Is the information and data on products verified?": https://support.openfoodfacts.org/help/en-gb/9-open-food-facts/29-is-the-information-and-data-on-products-verified
23. **F23** – Estudio con datos de OFF de productos españoles (PMC8399905): https://pmc.ncbi.nlm.nih.gov/articles/PMC8399905
24. **F24** – Wiki de Open Food Facts, Project:Open Prices: https://wiki.openfoodfacts.org/Project:Open-Prices
25. **F25** – data.gouv.fr, Open Prices: https://www.data.gouv.fr/datasets/open-prices
26. **F26** – Open Prices, guía de la API: https://openfoodfacts.github.io/open-prices/guides/API/
27. **F27** – Wikipedia, "Open Food Facts" (cifra de Open Prices): https://en.wikipedia.org/wiki/Open_Food_Facts
28. **F28** – EuroFIR, FoodEXplorer: https://www.eurofir.org/our-tools/foodexplorer/
29. **F29** – EuroFIR, pago por consulta: https://www.eurofir.org/why-join-eurofir-aisbl/pay-per-view
30. **F30** – EuroFIR, propuesta de cuotas de membresía 2023: https://www.eurofir.org/wp-admin/wp-content/uploads/2023/03/Membership-Package_EuroFIR_2023_Proposed-new-fees-Lecture-seule.pdf
31. **F31** – EuroFIR, informe anual 2022 (Zenodo): https://zenodo.org/records/13905846/files/FINAL%2017042022%20Annual%20Report%20HQ.pdf
32. **F32** – UCM Innovadieta, bibliografía de tablas de composición (Moreiras, 20.ª ed.): https://www.ucm.es/innovadieta/bibliografia-composicion-alimentos
33. **F33** – Universitat de Barcelona, bibliografía de tesis (Mataix, UGR 2009): https://diposit.ub.edu/dspace/bitstream/2445/42489/7/7.BIBLIOGRAFIA.pdf
34. **F34** – DTU Food, noticia de feb-2026 (Frida, >1.400 alimentos): https://www.food.dtu.dk/english/newsarchive/2026/02/new-nutrient-data-for-energy-drinks-dressings-mayonnaise-and-remoulade
35. **F35** – FAO, ficha de Frida 5.5: https://www.fao.org/food-composition/tables-and-databases/detail/(denmark--2024)-danish-food-composition-table/en
36. **F36** – DTU Food, noticia de jun-2026 (nueva interfaz): https://www.food.dtu.dk/english/newsarchive/2026/06/nyt-interface-giver-nemmere-adgang-til-den-danske-foedevaredatabase
37. **F37** – GOV.UK, CoFID: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
38. **F38** – Quadram Institute, FAQ de CoFID: https://fnnbri.quadram.ac.uk/?p=34

**Factores de retención y rendimiento**
39. **F39** – USDA ARS, Table of Nutrient Retention Factors, Release 6: https://www.ars.usda.gov/Services/docs.htm?docid=9448
40. **F40** – USDA, Cooking Yields for Meat and Poultry: https://ars.usda.gov/ARSUserFiles/80400535/Data/retn/USDA_CookingYields_MeatPoultry02.pdf
41. **F41** – USDA ARS, artículo de JFCA sobre rendimientos de cocción (AH-102): https://ars.usda.gov/ARSUserFiles/80400525/Articles/jfca10_102-114.pdf
42. **F42** – Vasquez-Caicedo et al. (2007), EuroFIR D2.2.9, reglas de cálculo de recetas: https://fao.org/uploads/media/vasquez-caicedo_et_al__2007_recipe_rulesD2.2.9_02.pdf
43. **F43** – EuroFIR, informe sobre procedimientos de cálculo de recetas: https://www.eurofir.org/report-on-collection-of-rules-on-use-of-recipe-calculation-procedures-including-the-use-of-yield-and-retention-factors-for-imputing-nutrient-values-for-composite-foods/

**Etiquetado**
44. **F44** – Reglamento (UE) 1169/2011, Anexo XIV (copia de legislation.gov.uk): https://legislation.gov.uk/eur/2011/1169/annex/XIV/data.pdf
45. **F45** – MAPA, estudio sobre la información nutricional en el vino (art. 31): https://servicio.mapa.gob.es/fr/alimentacion/temas/laboratorios-agroalimentarios/estudiosobrelainformacionnutricionalenvino_revision02_tcm36-700631.pdf
46. **F46** – Reglamento (UE) 1169/2011, Anexo I (copia de legislation.gov.uk): https://legislation.gov.uk/eur/2011/1169/annex/I/data.htm
47. **F47** – AESAN, Información nutricional: https://www.aesan.gob.es/en/seguridad-alimentaria/informacion-alimentaria/informacion-nutricional
48. **F48** – Consumer.es, "Etiquetado nutricional obligatorio": https://www.consumer.es/?p=92096
49. **F49** – Comisión Europea, guía de tolerancias (dic. 2012), copia de FSAI: https://www.FSAI.ie/getmedia/71c87819-77a7-4bf2-b741-2f11cf019c2d/EU-guidance-tolerances.pdf
50. **F50** – Tabla resumen de tolerancias (FSAI): https://www.FSAI.ie/getmedia/d6f4396d-3c42-4bfc-adb8-b21e3c1751c9/guidance-tolerances-summary-table.pdf
51. **F51** – BDA, Appendix 11 (tolerancias): https://www.bda.uk.com/practice-and-education/resources-for-practice/the-nutrition-and-hydration-digest/appendices/appendix-11-tolerances.html
52. **F52** – BDA, Appendix 12 (redondeo): https://www.bda.uk.com/practice-and-education/resources-for-practice/the-nutrition-and-hydration-digest/appendices/appendix-12-rounding-guidelines.html
53. **F53** – Ruokavirasto (Autoridad Alimentaria de Finlandia), tolerancias: https://www.ruokavirasto.fi/en/foodstuffs/food-sector/food-information/labelling/nutrition-labelling/tolerances-for-nutrients/
54. **F54** – Reglamento (UE) 1169/2011, Anexo II (copia de legislation.gov.uk): https://www.legislation.gov.uk/eur/2011/1169/annex/II
55. **F55** – Comunidad de Madrid, alérgenos: https://www.comunidad.madrid/node/73550
56. **F56** – Comunicación de la Comisión sobre el Anexo II (2017): https://WWW.CELIACOSMADRID.ORG/documents/534/Comunicacion_alergias_comision_2017.pdf
57. **F57** – AESAN, Etiquetado general (venta a distancia, art. 14): https://aesan.gob.es/seguridad-alimentaria/informacion-alimentaria/etiquetado-general

**Supermercados**
58. **F58** – Mercadona, Terms and Conditions: https://info.mercadona.es/en/terms-and-conditions
59. **F59** – Ayuda de la tienda online de Mercadona, "Ingredientes y alérgenos, ¿dónde los encuentro?": https://ayuda.tienda.mercadona.es/hc/en-us/articles/360000840892-Ingredients-and-allergens-where-do-I-find-them
60. **F60** – Mercadona, FAQ de alérgenos: https://info.mercadona.es/en/customer-service/frequently-asked-questions/how-can-i-check-the-allergens-of-a-product-do-you-have-a-list-of-the-products-that-are-gluten-free-lactose-free-or-free-of-other-allergens/faq
61. **F61** – mercaapi (API no oficial, ecosyste.ms): https://awesome.ecosyste.ms/projects/github.com%2Fm0wer%2Fmercaapi
62. **F62** – Lidl España, Aviso legal (empresa): https://empresa.lidl.es/aviso-legal
63. **F63** – Lidl España, Aviso legal (lidl.es): https://www.lidl.es/c/aviso-legal/s10075786
64. **F64** – Recetas Lidl, condiciones de uso: https://recetas.lidl.es/legal/condiciones-de-uso
65. **F65** – ALDI España, Aviso legal y condiciones de uso: https://www.aldi.es/servicios/condiciones-de-uso.html
66. **F66** – Alimarket, "'El Jamón' se estrena en el canal online": https://www.alimarket.es/alimentacion/noticia/302585/-el-jamon--se-estrena-en-el-canal-online
67. **F67** – Alimarket, "La cadena de supermercados 'El Jamón' se alía con Glovo…": https://www.alimarket.es/alimentacion/noticia_amp/393543/la-cadena-de-supermercados--el-jamon--se-alia-con-glovo-para-entregas-rapidas
68. **F68** – Alimarket, cambio de denominación de Cash Lepe a Grupo Empresarial El Jamón: https://www.alimarket.es/alimentacion/noticia/400922/cash-lepe-canvia-a-grup-empresarial-el-jamon-despuix
69. **F69** – Carrefour, Aviso legal y DSA: https://www.carrefour.es/aviso-legal/mas-info/
70. **F70** – Carrefour, Términos y condiciones de uso de los Medios Digitales: https://www.carrefour.es/terminos-y-condiciones-uso-medios-digitales/mas-info/
71. **F71** – Condiciones de Carrefour Pass (PDF): https://www.pass.carrefour.es/binaries/content/assets/public/documentos-legales/condiciones-leonardo-032023-v3.pdf
72. **F72** – Condiciones de la unificación Pass–Mi Carrefour (PDF): https://static.carrefour.es/crs/cdn_static/c4corp-front/documentos/app-pass/Condiciones-APP-Mi%20Carrefour-SFC-092023-v2.pdf
73. **F73** – Awin, perfil y términos de Carrefour Supermercado Online (25399): https://ui.awin.com/merchant-profile/25399 y https://ui.awin.com/merchant-profile-terms/25399
74. **F74** – DIA, Aviso legal: https://www.dia.es/compra-online/aviso-legal
75. **F75** – affi.io, DIA en TradeDoubler (cerrado): https://affi.io/m/dia-
76. **F76** – Eroski, Términos y condiciones de uso: https://www.eroski.es/terminos-y-condiciones-de-uso/
77. **F77** – Eroski, Condiciones generales de uso de la app: https://www.eroski.es/condiciones-APP/
78. **F78** – Eroski, nota de prensa de 2024 (supermercado online): https://corporativo.eroski.es/wp-content/uploads/2024/10/20241008_NP_EROSKI_PREMIOS_COMERCIO_DEL_ANO_2025.pdf (acuerdo con NIQ Activate: https://corporativo.eroski.es/wp-content/uploads/2023/11/20231122_NP_acuerdo_NIQ-Activate-EROSKI.pdf)
79. **F79** – Alcampo, aviso legal (supermercado online): https://www.compraonline.alcampo.es/content/aviso-legal
80. **F80** – Alcampo, aviso legal (empresa): https://www.alcampo.es/empresa/aviso-legal
81. **F81** – Consum, nota legal de la tienda online: https://tienda.consum.es/site/es/nota-legal
82. **F82** – Consum, Web Terms and Conditions: https://www.consum.es/en/legal-terms-and-conditions/web-terms-and-conditions/
83. **F83** – Awin, perfil de El Corte Inglés (13075): https://ui.awin.com/merchant-profile/13075

**Marco legal**
84. **F84** – EUR-Lex, resumen de la protección jurídica de las bases de datos: https://eur-lex.europa.eu/ES/legal-content/summary/legal-protection-databases.html
85. **F85** – BOE, Ley 5/1998 (transposición de la Directiva 96/9/CE): https://www.boe.es/eli/es/l/1998/03/06/5
86. **F86** – LPI, Libro II, Título VIII (derecho *sui generis*), Papelea: https://papelea.com/es/leyes/ley-de-propiedad-intelectual/libro-segundo_titulo-viii
87. **F87** – TJUE, comunicado de prensa sobre C-203/02 y otros (2004): https://curia.europa.eu/en/actu/communiques/cp04/aff/cp040089en.pdf
88. **F88** – IPPT, C-30/14 *Ryanair v PR Aviation*: https://ippt.eu/items/ippt20150115-cjeu-ryanair-v-pr-aviation
89. **F89** – Kluwer Copyright Blog, *Ryanair v PR Aviation*: https://legalblogs.wolterskluwer.com/copyright-blog/ryanair-ltd-v-pr-aviation-bv-contracts-rights-and-users-in-a-low-cost-database-law/
90. **F90** – IPPT, C-762/19 *CV-Online Latvia v Melons* (PDF): https://www.ippt.eu/sites/ippt/files/2021/IPPT20210603_CJEU_CV-Online_Latvia_v_Melons.pdf
91. **F91** – Bird & Bird, comentario sobre *CV-Online Latvia*: https://www.twobirds.com/en/insights/2021/uk/cv-online-latvia-cjeu-complicates-the-enforcement-of-database-rights
92. **F92** – IPPT, C-202/12 *Innoweb v Wegener*: https://ippt.eu/items/ippt20131219-cjeu-innoweb-v-wegener
93. **F93** – Directiva (UE) 2019/790, art. 4 (copia de legislation.gov.uk): https://www.legislation.gov.uk/eudr/2019/790/article/4
94. **F94** – Directiva (UE) 2019/790 en EUR-Lex (ES): https://eur-lex.europa.eu/eli/dir/2019/790/oj?locale=es
95. **F95** – Arthur Cox, "Mining for exceptions in the new Copyright Directive": https://www.arthurcox.com/knowledge/mining-for-exceptions-in-the-new-copyright-directive/
96. **F96** – Cuatrecasas, transposición de la Directiva 2019/790 (I): https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/ue-transposicion-de-la-directiva-ue-2019-790-i
97. **F97** – Gómez-Acebo & Pombo, minería de textos y datos (2024): https://ga-p.com/wp-content/uploads/2024/10/Mineria_textos_datos.pdf
98. **F98** – RDL 24/2021, Libro IV, Título II, Papelea: https://papelea.com/es/leyes/real-decreto-ley-24-2021/libro-cuarto_titulo-ii
99. **F99** – STS 236/2014, de 7 de mayo (Lastminute v Ryanair), civil-mercantil.com: https://civil-mercantil.com/sites/civil-mercantil.com/files/2599.pdf
100. **F100** – CERLALC, ficha de jurisprudencia (*screen scraping*, TS): https://cerlalc.org/wp-content/uploads/dar/jurisprudencia/2659.pdf
101. **F101** – AEPD, "Tus derechos en relación con tus datos de salud": https://www.aepd.es/es/areas-de-actuacion/salud/tus-derechos-en-relacion-con-tus-datos-de-salud

**Precios y estadística**
102. **F102** – INE, Aviso legal (CC BY 4.0): https://ine.es/dyngs/AYU/index.htm?cid=125
103. **F103** – INE, Datos abiertos: https://www.ine.es/dyngs/DAB/es/index.htm?cid=1722
104. **F104** – datos.gob.es, índices nacionales de subclases del IPC (API): https://datos.gob.es/en/catalogo/ea0010587-indices-nacionales-de-subclases-ipc-identificador-api-509371.xml
105. **F105** – MAPA, Observatorio de la Cadena Alimentaria, sistema de precios: https://www.mapa.gob.es/es/alimentacion/temas/observatorio-cadena/cadenas-valor/sistema-de-precios-om
106. **F106** – MAPA, nota de prensa de nov-2024 (Observatorio): https://mapa.gob.es/eu/prensa/241114observatoriodelacadena_tcm35-696653.pdf
107. **F107** – MAPA, "La alimentación mes a mes", junio de 2026: https://servicio.mapama.gob.es/es/dam/jcr:c212f9c9-925c-4631-aa67-14c73bdac6a1/mes-a-mes-alimentacion-junio-2026.pdf

**Seguridad alimentaria**
108. **F108** – FoodSafety.gov, Safe Minimum Internal Temperatures (versión imprimible): https://www.foodsafety.gov/print/pdf/node/10
109. **F109** – USDA FSIS, "Keep Food Safe! Food Safety Basics": https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/steps-keep-food-safe
110. **F110** – USDA FSIS, Leftovers and Food Safety (ES): https://www.fsis.usda.gov/es/node/3288
111. **F111** – USDA, sobras (~4 días): https://www.usda.gov/node/21012
112. **F112** – FDA (en español), temperatura del frigorífico y del congelador: https://www.fda.gov/ForConsumers/ConsumerUpdates/ConsumerUpdatesEnEspanol/ucm161263.htm
113. **F113** – AESAN, campaña "Prevenir intoxicaciones alimentarias en verano": https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/campanyas/campania_verano.htm
114. **F114** – AESAN, ficha de listeriosis (2025): https://www.aesan.gob.es/dam/jcr:88348d48-2e3b-4756-b6b4-837a6da02d6c/250917_Listeriosis.pdf
115. **F115** – AESAN, "Cocinar de forma segura": https://www.aesan.gob.es/AECOSAN/web/para_el_consumidor/ampliacion/cocinar_segura.htm
116. **F116** – Consumer.es, cinco claves para la inocuidad de los alimentos (OMS): https://www.consumer.es/seguridad-alimentaria/dia-mundial-de-la-salud-2015-cinco-claves-para-la-inocuidad-de-los-alimentos.html
117. **F117** – USDA FSIS, Safe Minimum Internal Temperature Chart (archivo UNT): https://webarchive.library.unt.edu/web/20121010032255/http:/www.fsis.usda.gov/Fact_Sheets/Safe_Minimum_Internal_Temperature_Chart/index.asp

---

## Anexo A. Lo que **no** se pudo verificar (pendientes)

**Composición de alimentos**
1. **BEDCA:**
   - Número actual de alimentos y componentes.
   - Fecha de la última actualización.
   - Si existen condiciones de uso posteriores a la v1.0.
   - Procedimiento y plazos para obtener la autorización comercial. **Acción: escribir a AESAN.**
2. **CIQUAL:** licencia exacta de la versión vigente y fecha exacta de su publicación.
3. **Frida:** licencia de reutilización.
4. **Moreiras y Mataix:** condiciones de licencia de los editores.
5. **EuroFIR:** cuotas y condiciones vigentes de la licencia comercial.
6. **Open Food Facts:**
   - Número de productos con España como país de venta.
   - Condiciones de los volcados completos.
   - Lectura directa del texto de ODbL 1.0 (alcance de "base colectiva" frente a "derivada").
7. **USDA FDC:** número de alimentos por tipo de dato; detalle de los factores Atwater y de los "hidratos de carbono por diferencia".

**Normativa de etiquetado**
8. Reglamento 1169/2011:
   - Texto de EUR-Lex (no la copia del Reino Unido).
   - Valores en kJ del Anexo XIV.
   - Arts. 31.4, 32 y 33.
   - Redacción literal de los grupos 2 a 14 del Anexo II.
9. Guía de tolerancias: lectura del documento íntegro de la Comisión (los valores se tomaron de resúmenes de BDA y FSAI y de Ruokavirasto).

**Supermercados**
10. Lidl, Aldi, DIA, Eroski, Alcampo, Consum y El Jamón:
    - Existencia de una API, de programas de afiliados o de *feeds*.
    - Si sus fichas online muestran tablas nutricionales en texto.
    - Contenido de `robots.txt`.
    - Aviso legal de El Jamón.

**Marco legal**
11. Jurisprudencia española posterior a 2015 sobre scraping y base de datos (CENDOJ).
12. Artículos concretos de la Ley de Competencia Desleal y del Código Penal aplicables.

**Precios**
13. Licencia de reutilización de los datos del MAPA (panel de consumo y Observatorio).
14. Si Awin ofrece un *feed* de productos y precios de Carrefour.

**Seguridad alimentaria**
15. Informe del Comité Científico de AESAN (70 °C/1 s para carne; 74 °C/1 s para aves).
16. Consejos de la EFSA al consumidor.
17. Plazo oficial español de consumo de sobras.
18. RD 3484/2000.
19. Medidas frente a *Anisakis*.
20. *Cold Food Storage Chart* de FoodSafety.gov leído directamente.

**Catálogo**
21. Estudios de cobertura (cuántos alimentos explican la mayoría de los registros en España): ENALIA y la base de datos de consumo de la EFSA.

> Para completar estos puntos hace falta: (a) permitir en la red del entorno los dominios `bedca.net`, `aesan.gob.es`, `ciqual.anses.fr`, `eur-lex.europa.eu` y `boe.es`; y (b) una nueva sesión de búsqueda, porque el cupo se agotó en esta.
