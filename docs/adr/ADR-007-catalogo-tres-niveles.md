# ADR-007 · Catálogo en tres niveles con procedencia y licencia

- **Estado:** Implementada en el esquema
- **Fecha:** 2026-11-18

## Contexto
Se quiere ver 'chocolate negro' sin decenas de marcas, sin mezclar alimentos distintos (arroz crudo vs cocido) y respetando licencias (BEDCA no abierta; ODbL con share-alike).

## Decisión
FOODS (genérico) -> FOOD_VARIANTS (solo si cambia lo nutricional) -> COMMERCIAL_PRODUCTS (opcional). Perfiles nutricionales inmutables con procedencia (SOURCE_RECORDS, PROFILE_CONTRIBUTIONS) y fuentes con licencia (DATA_SOURCES). Perfil representativo por mediana ponderada tras descartar atípicos.

## Consecuencias
Calidad y trazabilidad por encima de cantidad. Requiere trabajo editorial y panel de revisión.
