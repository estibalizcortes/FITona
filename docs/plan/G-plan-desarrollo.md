# Entregable G · Plan de desarrollo

> Estado: **diseñado**. Base de datos: hecha y probada (ver F). Todo lo demás: pendiente. Esfuerzos orientativos **[P]** para una persona con apoyo de Claude Code; no son compromisos.

## 1. Cambios respecto a la hoja de ruta de tu documento

| Cambio | Motivo |
|---|---|
| **0.1 incluye** exportar/eliminar cuenta, modos de visualización y «registrar sin cifras» | Son requisitos legales y de filosofía; añadirlos después obliga a rehacer |
| **La IA no entra hasta 0.4**, pero el núcleo (0.1–0.3) ya es útil sin ella | Valida el valor real sin coste ni riesgo regulatorio de IA; reduce dependencias externas |
| **El motor nutricional y el catálogo se prueban antes de cualquier pantalla** | Es la parte que no puede fallar; lo demás depende de ella |
| **Offline en 0.1 solo de lectura + cola de registro**; edición offline de planes/recetas en 0.3 | El offline completo es la parte más compleja (R-12); se escala por riesgo |
| **Integraciones deportivas**: Health Connect/HealthKit + FIT/GPX; Strava y Garmin fuera | Políticas y requisitos reales (investigación §2) |
| **Panel de administración mínimo desde 0.1** (revisión de catálogo) | Sin él no hay calidad de datos |

## 2. Versiones

| Versión | Objetivo | Contenido principal | Salida comprobable |
|---|---|---|---|
| **0.0** (hecho) | Fundamentos | Investigación, diseño, esquema Oracle, entorno local, pruebas del esquema | Este repositorio |
| **0.1** Base | Registrar con rapidez, sin IA | Backend Quarkus + Keycloak; contrato OpenAPI; motor `nutrition` con pruebas; catálogo inicial (~150) + buscador con sinónimos; registro (buscar, frecuentes, comida estimada, texto sin cifras); medidas caseras y «mis medidas»; modos sencillo/equilibrado/avanzado; onboarding; exportar/eliminar cuenta; PWA responsive claro/oscuro; panel mínimo de revisión | Casos 1, 3, 12, 13, 14, 15 |
| **0.2** Planificación | Plan que resiste la vida real | Planes 1–31 días con opciones; plan ≠ diario; recetas versionadas y familiares (fracción de olla); sustituciones y «no tengo»/«no me apetece»; «mover a mañana»; semana tipo | Casos 4, 8, 9 |
| **0.3** Cocina y compra | Cerrar el ciclo | Despensa (sencilla y avanzada); lotes y sobras; lista de compra con suma y descuento de despensa; hogares compartidos y enlace de lista; precios manuales/ticket; presupuesto básico; offline completo de lista/plan | Casos 6, 7, 11 |
| **0.4** Asistente | IA útil y controlada | `AiGateway` + herramientas; registro por texto/voz con IA; «Resuélveme la cena»; recetas desde despensa; menú asistido validado por el motor; consentimientos por categoría; cuotas y tope de gasto; salvaguarda de cuidado | Casos 2, 5, 7 (con IA) |
| **0.5** Avanzadas | Captura y actividad | Foto de plato (con rango); lectura de etiquetas/código; OCR de ticket; actividad manual + FIT/GPX + Health Connect/HealthKit | Caso 10 |
| **0.9** Beta cerrada | Realidad | Pruebas con 10–20 personas; ajustes de UX; seguridad y rendimiento | Informe de pruebas |
| **1.0** Publicación | Producto público | EIPD cerrada y revisión legal; política de privacidad; despliegue web; apps Android/iOS; monitorización y copias; documentación | Lista de salida |

## 3. Dependencias críticas

```
Esquema (hecho) ─► Motor nutrition ─► Catálogo cargado ─► Registro ─► Plan ─► Recetas ─► Despensa ─► Compra
                                  └─► Contrato OpenAPI ─► Cliente generado ─► UI
Keycloak ─► Backend (JWT) ─► Aislamiento + pruebas de acceso cruzado
Consentimientos ─► AiGateway ─► Asistente
Licencia de datos (AESAN/ODbL/CC0) ─► Publicación del catálogo
EIPD + revisión legal ─► Beta con datos reales
```

## 4. Criterios de aceptación (por versión, medibles)

**0.1**
- El motor pasa pruebas unitarias y de propiedades (conversión, redondeo, nulos, crudo/cocido, coherencia 4/9/4 con el ejemplo 1.846 vs 1.864 kcal) con cobertura ≥ 90 % en `nutrition`.
- API: 100 % de endpoints con contrato OpenAPI; pruebas de integración con Oracle (Testcontainers); **pruebas de acceso cruzado**: usuario A recibe 404 en todo recurso de B.
- Buscador: «batata/boniato», «judías verdes/habichuelas», «queso cottage/granulado» devuelven el alimento correcto (sinónimo ≠ idéntico nutricionalmente).
- Manzana registrada en ≤ 4 interacciones; habitual en ≤ 2 (medido en prueba de uso).
- Cambiar de modo no pierde datos (prueba automatizada).
- Eliminar cuenta borra datos personales (prueba automatizada sobre todas las tablas con `USER_ID`).
- Accesibilidad: auditoría automática sin errores críticos (axe) + revisión manual con lector de pantalla.

**0.2** Plan y diario independientes (prueba: sustituir y registrar otra comida no modifica el plan); sustituir arroz por patata actualiza plan, receta del plan y lista; nada reajusta el resto del día.

**0.3** Lista suma 4+2 huevos = 6 y descuenta despensa cuando hay cantidad; funciona sin red; sincroniza sin duplicados tras 3 reintentos (pruebas con corte de red simulado).

**0.4** Ninguna escritura sin confirmación (prueba: la herramienta de escritura devuelve propuesta); las cifras proceden del motor (prueba: respuesta del modelo con cifras inventadas es sustituida); sin consentimiento `AI_SHARE_*` no se envía ese contexto; el tope de gasto degrada a modo sin IA.

**1.0** Quality gates: 0 vulnerabilidades altas conocidas, EIPD aprobada, tienda: eliminación de cuenta dentro de la app, etiquetas de privacidad, política publicada.

## 5. Calidad y proceso

- Incrementos pequeños, rama por funcionalidad, CI obligatoria; **sin despliegues ni publicaciones sin tu autorización expresa**.
- Cada fase termina con un informe: archivos creados, qué funciona, pruebas ejecutadas y resultado, cómo comprobarlo en PowerShell, y lo pendiente. **No se pasa a la siguiente sin tu conformidad.**
- Se distingue siempre: *diseñado / implementado / probado / validado con personas*.

## 6. Pruebas de usabilidad (15 casos) y métricas

Participantes: 5–8 por ronda (el 80 % de los problemas de uso suelen aparecer con ~5; hipótesis habitual de la disciplina, no medida aquí), incluida gente poco técnica y alguien con lector de pantalla. Prototipo navegable antes de 0.1 para el caso 1, 2, 4, 12, 13.

| Caso | Tarea | Éxito | Meta [P] |
|---|---|---|---|
| 1 | Registrar una manzana sin elegir entre cientos de referencias | Registro correcto sin errores | ≤ 4 interacciones, ≤ 15 s |
| 2 | Registrar por voz un desayuno completo | Alimentos y cantidades confirmados | ≤ 30 s hasta guardar |
| 3 | Registrar un plato casero de composición aproximada | Guardado con fiabilidad visible | Comprende «≈/~» (≥ 80 %) |
| 4 | Sustituir arroz por patata en el menú | Plan y lista actualizados | ≤ 6 interacciones |
| 5 | Generar una cena con huevos y otros ingredientes | 3 propuestas con ingredientes disponibles | Confirma sin ayuda |
| 6 | Preparar la lista para varios días | Cantidades sumadas y despensa descontada | ≤ 5 interacciones |
| 7 | Planificar con presupuesto limitado | Propuesta dentro del presupuesto con procedencia del precio | Entiende qué precios son estimados |
| 8 | Registrar un día distinto al menú | Plan intacto, diario correcto | 0 mensajes de «fallo» percibidos |
| 9 | Guardar una receta familiar y reutilizarla | «Una ración» registrada | ≤ 8 interacciones la 1.ª vez; ≤ 3 después |
| 10 | Registrar una carrera manualmente | Actividad sin calorías obligatorias | ≤ 6 interacciones |
| 11 | Registrar/consultar sin conexión y sincronizar | Sin pérdidas ni duplicados | 0 duplicados en 20 ciclos |
| 12 | Cambiar de modo sencillo a avanzado | Sin pérdida de datos | Encuentra el cambio sin ayuda |
| 13 | Registrar una comida sin ver cifras | Ninguna cifra visible | 0 cifras en pantalla |
| 14 | Recuperar la cuenta en un teléfono nuevo | Datos íntegros | ≤ 3 min |
| 15 | Intentar acceder a datos de otro usuario | El servidor responde 404; auditoría registrada | 100 % de intentos bloqueados (automatizado) |

**Indicadores**: tasa de tareas completadas sin ayuda, tiempo en tarea, número de interacciones, errores (toques en vacío, vuelta atrás), comprensión (preguntas de verificación sobre fiabilidad y mensajes), puntuación SUS (≥ 80 objetivo), y — a nivel de producto — **retención semanal de funciones** (no solo de registro: uso de plan/lista/recetas cuenta igual, coherente con «útil con dos funciones»). No se valorará el éxito por número de funciones terminadas.

Confianza: 70 % (estimaciones de esfuerzo sin base histórica; criterios de aceptación sí son comprobables).
