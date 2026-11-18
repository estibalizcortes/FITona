# ADR-009 · Convenciones de base de datos propias de FITona

- **Estado:** Implementada
- **Fecha:** 2026-11-18

## Contexto
El proyecto es independiente de otros proyectos de la propietaria. Se necesita edición offline y borrado completo de cuenta.

## Decisión
Identificadores en inglés y mayúsculas; UUID RAW(16) generado en cliente para datos personales; identidad numérica para catálogo; ROW_VERSION y SYNC_SEQ; toda FK con índice (verificado); COMMENT en todas las tablas; NULL = desconocido; sin lógica de negocio en PL/SQL.

## Consecuencias
Convenciones verificables por prueba automática (database/tests/schema_smoke_test.sql).
