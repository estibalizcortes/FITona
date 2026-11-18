# ADR-006 · Funcionamiento sin conexión parcial

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Se quiere consultar y registrar sin red. La sincronización es la parte más compleja y no debe prometerse para funciones que dependen del servidor de IA.

## Decisión
IDs de cliente (UUID), cola de salida con Idempotency-Key, descarga incremental por SYNC_SEQ, borrado lógico y estrategias de conflicto por tipo de dato (ver docs/tecnico/E-arquitectura.md §7). Alcance por versiones: lectura + registro en 0.1; plan/recetas/despensa/lista en 0.3.

## Consecuencias
Sin pérdidas ni duplicados si se cumplen las reglas (modificar un hijo toca la raíz). Datos locales en web no cifrados a nivel de archivo: solo datos recientes.
