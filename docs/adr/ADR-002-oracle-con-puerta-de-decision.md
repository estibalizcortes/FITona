# ADR-002 · Oracle con puerta de decisión

- **Estado:** Propuesta (decisión final tuya) (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Tu preferencia es Oracle. Oracle Free en Docker funciona (probado). 0 € hasta ~1.000–3.000 usuarios; después ≈ 430 €/mes frente a ≈ 24–58 € con PostgreSQL a 10.000 usuarios. El esquema usa funciones de 23ai (BOOLEAN, JSON, identidad, PL/SQL) y no es trivialmente portable.

## Decisión
Mantener Oracle. Revisar al alcanzar 3.000 usuarios registrados u 8 GB, y decidir antes de v0.2 si se esperan más de ~1.000 usuarios. Mantener la lógica de negocio fuera de PL/SQL (solo disparadores de metadatos de sincronización) para limitar el coste de un cambio.

## Consecuencias
Entorno local fiel a producción. Riesgo económico al crecer y licencia de producción de Oracle Free sin confirmar. Copias de seguridad obligatorias (no incluidas en Free).
