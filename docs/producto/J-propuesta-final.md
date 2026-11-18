# Entregable J · Propuesta final mejorada

> Documento de decisión. Detalle en A–I. Estado real hoy: **investigación, diseño, esquema Oracle y entorno local hechos y probados; backend y frontend sin empezar.**

## 1. La aplicación en una página

**FITona** organiza lo que se cocina, se compra y se come, y deja que la persona decida cuánto quiere medir. Ciclo cerrado: **despensa → plan → lista → diario → sobras**, con números opcionales y sin culpa.

Cinco ideas que la hacen distinta:
1. **El plan y el diario son cosas distintas.** Comer otra cosa no es un error: se registra y ya.
2. **Registro de comida casera de verdad**: «me serví 1/5 del potaje de mi madre», con incertidumbre visible, sin pesar.
3. **Modo sencillo real**: sin cifras, rachas ni semáforos en toda la aplicación.
4. **Catálogo propio, pequeño y con procedencia**, no millones de entradas colaborativas.
5. **IA con herramientas reales y control del usuario**: propone, el motor calcula, la persona confirma.

## 2. Qué cambia respecto a tu documento (y por qué)

| Tu planteamiento | Mi propuesta | Motivo |
|---|---|---|
| 5 pestañas (Hoy, Plan, Cocina, Compra, **Actividad**) | 4 pestañas + «+» central + «Yo» (Actividad dentro) | La actividad es opcional y ocasional; una pestaña fija la vuelve obligación |
| Catálogo «pequeño» | Catálogo **interno amplio y curado** (400–600 genéricos + variantes), buscador que muestra solo lo relevante | Mejor cobertura sin ruido; igual que apuntabas en §36 |
| Strava + Garmin | **Health Connect/HealthKit + archivos FIT/GPX**; Strava y Garmin fuera | Strava prohíbe usar sus datos con IA (§5.3 de su API Policy 2026) y Garmin está orientado a empresas |
| Scraping de supermercados | **No hacer scraping** | Riesgo legal alto; alternativas legales para precios |
| BEDCA como base | Base técnica con **USDA (CC0)** + curación; BEDCA solo con autorización de AESAN | Sus condiciones exigen autorización para uso comercial |
| IA genera recetas | **Híbrido**: recetas curadas + IA para adaptar/buscar; cifras y seguridad alimentaria del motor y tablas con fuente | Evita invenciones |
| Oracle | **Oracle con puerta de decisión** (3.000 usuarios/8 GB o antes de 0.2) | 0 € hasta ~1.000–3.000 usuarios; luego ≈ 430 €/mes frente a ≈ 24–58 € con PostgreSQL |
| Hoja de ruta con IA en 0.4 | Igual, pero **el núcleo (0.1–0.3) es útil sin IA** y exportar/eliminar cuenta entra en 0.1 | Reduce riesgo y coste; obligaciones legales desde el inicio |
| TypeScript «última versión» | **TypeScript 6.0.x** con Angular 22 | El CLI de Angular 22 declara `>=6.0 <6.1`; TS 7.0.2 (última en npm) no es compatible |

## 3. Navegación final

HOY · PLAN · **+** · COCINA · COMPRA · (Yo: Actividad, Ajustes, Privacidad, Datos). Ver [D](../ux/D-experiencia-usuario.md).

## 4. MVP (v0.1) — pequeño, útil y comprobable

Registrar comida en 2–4 toques (buscar, frecuentes, texto sin cifras, comida estimada), catálogo de ~150 alimentos con medidas caseras españolas, tres modos, onboarding opcional, cuenta con exportación y borrado, PWA claro/oscuro, panel mínimo de revisión. **Sin IA, sin plan, sin compra** (llegan en 0.2–0.4). Criterios medibles en [G §4](../plan/G-plan-desarrollo.md).

## 5. Arquitectura en una línea

Monolito modular Quarkus (hexagonal) + Keycloak + Oracle (Flyway) + cliente único Angular 22/Ionic 9/Capacitor 8 (PWA, Android, iOS) + puerto `AiGateway` intercambiable. Ver [E](../tecnico/E-arquitectura.md).

## 6. Lo ya hecho y comprobado (v0.0)

| Qué | Cómo se comprobó |
|---|---|
| Esquema Oracle de 70 tablas (9 migraciones + 1 repetible) | Aplicado desde cero con Flyway 13.12.2 en Oracle 26ai Free (23.26.4); reaplicación idempotente |
| 19 pruebas de humo del esquema | Ejecutadas: FK con índice, comentarios, 14 alérgenos, inmutabilidad de perfiles, `FREE_TEXT` sin kcal, rangos incoherentes, plazos de conservación solo con fuente, borrado en cascada de cuenta, sincronización |
| Aislamiento de privilegios | `FITONA_APP` lee datos pero `CREATE`/`DROP` → ORA-01031 |
| Entorno local reproducible | `docker compose` con Oracle + Flyway; scripts PowerShell (**no ejecutados aquí**: no hay PowerShell en este entorno) |
| Cuatro informes de investigación | Fuentes citadas con marcas [V]/[NV]; ver sus limitaciones |

## 7. Decisiones que necesito de ti (con mi recomendación)

| # | Decisión | Recomendación |
|---|---|---|
| 1 | ¿Oracle o PostgreSQL para producción? | Mantener Oracle hasta la puerta de decisión; decidir **antes de 0.2** si esperas > 1.000 usuarios |
| 2 | ¿Solicitar autorización a AESAN para BEDCA? | Sí, en paralelo (no bloquea 0.1: se empieza con USDA) |
| 3 | ¿Proveedor de IA y residencia de datos? | Empezar con modelo pequeño tras `AiGateway`; decidir UE vs global con asesoramiento sobre RGPD antes de 0.4 |
| 4 | ¿Cuenta de Google Play como organización? | Sí (evita los 12 probadores/14 días) |
| 5 | ¿Revisión legal y clínica? | Sí: EIPD/RGPD, MDR y revisión de la salvaguarda de cuidado antes de datos reales |

## 8. Acciones que dependen de ti (no puedo hacerlas yo)

1. **Commit y push** de estos cambios (mis instrucciones lo prohíben para mí): ver el resultado final para los comandos.
2. Instalar Docker Desktop (WSL2) y ejecutar `scripts\dev\db-up.ps1` para reproducir la validación en tu Windows.
3. Escribir a AESAN pidiendo autorización de uso de BEDCA (uso comercial en app freemium).
4. Decidir lo de la tabla anterior.
5. Instalar JDK 25 (o 21), Node 24 LTS y Maven en Windows antes de 0.1.

## 9. Siguiente paso propuesto

**v0.1, empezando por el motor `nutrition` + contrato OpenAPI + pruebas**, antes de cualquier pantalla. No empiezo hasta que confirmes el estado de esta fase y las decisiones 1–3.

Confianza: 78 %.
