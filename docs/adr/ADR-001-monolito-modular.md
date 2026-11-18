# ADR-001 · Monolito modular con arquitectura hexagonal

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Una persona desarrolla y opera. La consistencia entre plan, lista, despensa y diario es central. Los microservicios añadirían coste operativo sin beneficio.

## Decisión
Un único despliegue Quarkus dividido en módulos (identity, profile, catalog, nutrition, diary, planning, recipes, pantry, shopping, pricing, activity, assistant, sync, admin). Dominio sin dependencias de framework. Límites verificados con ArchUnit.

## Consecuencias
Transacciones simples y despliegue sencillo. Riesgo de acoplamiento si no se vigilan los límites: se mitiga con pruebas de arquitectura. Un módulo puede extraerse más tarde.
