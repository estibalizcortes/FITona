# Entregable D · Experiencia de usuario

> Estado: **diseñado** (wireframes de baja fidelidad en texto; no hay UI implementada). **[P]** = propuesta.

## 1. Decisión de navegación (cambia respecto a tu propuesta)

Tu propuesta: HOY · MI PLAN · COCINA · COMPRA · ACTIVIDAD.

**Propuesta: 4 pestañas + botón central «+» + «Yo»** [P]

```
┌─────────────────────────────────────────────┐
│  HOY      PLAN      ( + )     COCINA  COMPRA │   ← barra inferior (alcance del pulgar)
└─────────────────────────────────────────────┘
        Avatar (arriba a la derecha) → «Yo»: Actividad, Ajustes, Privacidad, Datos
```

Por qué:
- **Actividad** es de uso ocasional y opcional; una pestaña fija la convierte en obligación visual. Va en «Hoy» (tarjeta opcional) y en «Yo → Actividad».
- **«+» central** = registro rápido accesible desde cualquier pantalla (requisito tuyo) y a una mano. Abre la hoja «¿Qué has comido?».
- 4 destinos + «+» = 5 objetivos táctiles: caben en móviles pequeños con zonas ≥ 48 dp.
- «Cocina» agrupa recetas, despensa y asistente: son un solo flujo mental («¿qué hago con lo que tengo?»).

## 2. Mapa de navegación

```
HOY ── tarjeta comidas del día (planificado vs real) ── registrar / marcar «hecho» / «comí otra cosa»
 │      accesos rápidos: frecuentes · Resuélveme la cena · No quiero contar hoy
 │      [opcional] actividad · agua · energía
PLAN ── semana/días (1–31) ── hueco → opciones (alternativas) → sustituir / no tengo / no me apetece
 │      plantillas · repetir semana · generar con IA · pausa viaje
( + ) ─ hoja de registro: Buscar · Frecuentes · Voz · Texto · Foto · Código · Plato casero · Estimar
COCINA ─ Recetas (mías, familiares, curadas) · Despensa · Asistente · Sobras y lotes · Modo cocina
COMPRA ─ Listas · por sección/tienda · presupuesto · compartir enlace
YO ──── Actividad · Peso y bienestar (ocultos por defecto) · Modo de uso · Alergias · Privacidad e IA ·
        Exportar/Borrar datos · Suscripción (futuro)
```

## 3. Primer acceso (onboarding progresivo y opcional)

Cinco pantallas, todas **saltables**; nada obliga a dar datos corporales.

1. **Bienvenida** (+ confirmación «soy mayor de edad», sin fecha de nacimiento).
2. **¿Qué buscas?** — multiselección: organizar comidas · saber lo que como · objetivos · deporte · familia · ahorrar · cocinar con lo que tengo · aprender a cocinar.
3. **¿Cómo quieres verlo?** — Sencillo / Equilibrado / Avanzado (preselección según 2; cambiable siempre).
4. **Tu cocina** (opcional): comensales, tiempo, electrodomésticos, alergias/intolerancias (con aviso: dato de salud, consentimiento explícito).
5. **Listo.** Entra en «Hoy». La IA se ofrece después, con consentimiento propio y separado.

No se pide peso, altura ni edad. Los objetivos numéricos solo existen si se activa el modo avanzado.

## 4. Wireframes clave

### 4.1 HOY (modo sencillo)

```
┌──────────────────────────────┐
│ Hoy, miércoles 18      (◯ Yo)│
│                              │
│ Desayuno                  ✓  │  ← hecho
│  Tostada con pavo y café     │
│                              │
│ Comida                       │
│  Plan: Pollo con arroz       │
│  [ Hecho ] [ Comí otra cosa ]│  ← sin juicio
│                              │
│ Cena          [Resuélveme]   │
│  (sin planificar)            │
│                              │
│ Frecuentes:  [Café] [Manzana]│
│ [ Hoy no quiero contar ]     │
└──────────────────────────────┘
```

### 4.2 HOY (modo avanzado, mismas tarjetas + cifras opcionales)

```
 Comida                  ≈ 640 kcal  ·  P 38  H 70  G 22     ← «≈» = promedio
  Plan: Pollo con arroz              rango 580–720 si hay estimaciones
 ──────────────
 Día: 1.420 de 1.864 kcal (rango objetivo 1.800–1.950)       ← sin colores de «bien/mal»
```

Sin semáforos rojo/verde. El progreso se muestra como barra neutra; superar el objetivo no cambia el color ni el texto.

### 4.3 Hoja «+» de registro rápido

```
┌──────────────────────────────┐
│ ¿Qué has comido?        [×]  │
│ [🔎 Buscar o escribir…]  🎤  │
│ Frecuentes: Café con leche · │
│   Tostada con pavo · Yogur   │
│ ─ Otras formas ─             │
│ [Texto libre] [Foto] [Código]│
│ [Plato de casa] [Estimar]    │
└──────────────────────────────┘
```

Meta: **alimento habitual en ≤ 2 toques** (frecuentes) y **manzana en ≤ 4 interacciones** (buscar → cantidad por defecto → guardar), sin elegir entre referencias.

### 4.4 Registrar «plato de casa» (fracción de olla)

```
 Potaje de garbanzos de mi madre      (receta guardada)
 ¿Cuánto has comido?
  ( ) Una ración      ( ) 1 plato hondo    (•) Una fracción de la olla: [ 1/5 ▾ ]
 Fiabilidad: ≈ Estimación (rango 380–520 kcal)   [¿Por qué?]
 [ Guardar ]
```

Si la receta no existe: «Registrar sin detalle» guarda texto sin cifras (`FREE_TEXT`) y no inventa calorías.

### 4.5 Sustitución («cambiar arroz por patata»)

> Las cantidades y diferencias de los wireframes son **ilustrativas**; las reales las calculará el motor con el catálogo.

```
 Arroz blanco cocido · 150 g
 [ Cambiar ]  [ No lo tengo ]  [ No me apetece ]
 ───────────────────────────────
 Alternativas (despensa primero):
  • Patata cocida · 270 g   misma energía ≈   Δ hidratos −4 g · Δ proteína +1 g
  • Pasta cocida · 130 g    (no está en tu despensa)
 «No hay equivalencias perfectas.»           [ Solo esta vez ] [ Siempre ]
```

No se reajusta el resto del día. «Solo esta vez» crea un ajuste en `PLANNED_OPTION_ITEMS`; la receta original no cambia.

### 4.6 Fiabilidad de una cifra (no intrusiva)

Tres niveles, siempre con **texto + icono** (nunca solo color):

| Nivel | Marca | Ejemplo |
|---|---|---|
| Dato contrastado | `●` | «320 kcal» |
| Promedio representativo | `≈` | «≈ 320 kcal» |
| Estimación | `~` + rango | «~ 450–650 kcal» |
| Dato personalizado | `✎` | «320 kcal (tu dato)» |

Un toque abre «¿Por qué?»: fuente, fecha, método. Las fotos y el texto libre **nunca** muestran una cifra única exacta.

### 4.7 Asistente (acciones confirmadas)

```
 Tú: Mañana llego tarde, quiero algo rápido
 Asistente: Con lo que tienes puedo proponerte 3 cenas de ≤ 15 min:
   1) Tortilla de espinacas  ·  10 min  ·  2 raciones
   2) …
   [ Poner la 1 mañana en la cena ]     ← propuesta; no cambia nada hasta pulsar
 ─ Esta acción modificará tu plan de mañana (cena).  [ Confirmar ] [ Cancelar ]
```

## 5. Flujos principales

| Flujo | Pasos (objetivo) |
|---|---|
| Registrar manzana | + → «manzana» → (cantidad por defecto: 1 unidad ≈ 180 g, precisión «aproximada») → Guardar (4) |
| Desayuno por voz | + → 🎤 → dictado → lista editable → Guardar |
| Plan distinto al real | HOY → «Comí otra cosa» → registro; el plan queda como «reemplazado» |
| Sustituir arroz por patata | PLAN → hueco → alimento → Cambiar → patata → «solo esta vez» |
| Lista de varios días | PLAN → «Generar lista» → revisa → COMPRA (suma 4+2 huevos=6, descuenta despensa) |
| Presupuesto | Asistente: «5 días, 35 €» → propuesta con procedencia del precio → confirmar |
| Recuperar cuenta en móvil nuevo | Login (Keycloak) → descarga del estado desde el servidor; nada depende del dispositivo |
| Sin cifras | Modo sencillo; o «Hoy no quiero contar» (no cuenta como abandono) |

## 6. Principios de usabilidad y accesibilidad

- **Una mano**: acciones principales en el tercio inferior; zonas táctiles ≥ 48 dp.
- **Texto**: base 16 px, escalable al 200 %; contraste WCAG AA (objetivo AAA en texto principal).
- **Lectores de pantalla**: etiquetas en iconos, orden lógico, anuncios de estado («guardado»), sin información solo por color.
- **Claro/oscuro** y preferencia persistente; respeta `prefers-reduced-motion`.
- **Rendimiento en móviles modestos**: carga diferida por ruta, listas virtualizadas, catálogo esencial en IndexedDB, imágenes comprimidas.
- **Idioma**: es-ES inicial; todo texto en recursos i18n desde el día 1 (es-MX/en después).
- **Tono**: lenguaje neutro y descriptivo («has registrado 1.420 kcal»), nunca valorativo («te has pasado», «bien hecho»).

## 7. Dirección visual [P]

Cálida y doméstica, no médica: fondo crema/arcilla suave, acento terracota y verde oliva, tipografía redondeada legible, ilustraciones de alimentos simples, mucho espacio en blanco, **sin** gráficos de «cuadro de mandos» por defecto. Los colores se definen como tokens (tema Ionic por variables CSS) con variante oscura. Las paletas se validarán con prueba de contraste antes de cerrar.

## 8. Pruebas de uso

Ver [G · Plan de desarrollo §6](../plan/G-plan-desarrollo.md): 15 casos con indicadores (tiempo, interacciones, errores, comprensión, tareas completadas).

Confianza: 72 % (sin prototipo ni pruebas con personas: las metas de interacciones son hipótesis a validar).
