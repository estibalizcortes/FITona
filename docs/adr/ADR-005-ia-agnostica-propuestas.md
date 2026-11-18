# ADR-005 · IA agnóstica de proveedor con acciones propuestas y confirmadas

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
La IA debe estar conectada a funciones reales sin acceso a la BD, sin inventar cifras y con costes controlados. Los precios y condiciones de residencia varían entre proveedores.

## Decisión
Puerto AiGateway con adaptadores intercambiables. Herramientas tipadas = casos de uso del backend. Toda escritura es una propuesta (AI_ACTION_PROPOSALS) que caduca y requiere confirmación. Los nutrientes los calcula el motor. No se guardan conversaciones. Cuotas y tope global de gasto.

## Consecuencias
Cambiar de proveedor es configuración. Más código inicial. Residencia de datos resuelta por adaptador y región, no por diseño de producto.
