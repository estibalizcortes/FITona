# ADR-008 · Sin scraping de supermercados ni integración con Strava

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Los avisos legales de ocho cadenas prohíben la reutilización comercial; Carrefour prohíbe bots. La API Policy 2026 de Strava (5.3) prohíbe usar sus datos en aplicaciones de IA. Garmin está orientado a empresas.

## Decisión
Precios por ticket del usuario, aportación voluntaria, Open Prices e IPC como referencia. Actividad por Health Connect/HealthKit y archivos FIT/GPX. Strava y Garmin fuera de v1.

## Consecuencias
Menos automatización de precios. Se evita riesgo legal y contractual. Reconsiderar si surgen acuerdos o APIs oficiales.
