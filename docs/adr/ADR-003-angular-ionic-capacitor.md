# ADR-003 · Angular + Ionic + Capacitor (una base de código)

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Se pide web, Android e iOS sin mantener tres bases de código. Angular 22 exige TypeScript 6.0.x y Node 22.22+/24.15+/26+. Ionic 9.0.12 admite Angular >= 18. Capacitor 8.6.2 exige Node >= 22.

## Decisión
Cliente único Angular standalone con Ionic (navegación, gestos, áreas seguras) y Capacitor para Android/iOS; PWA para navegador. Tema propio mediante variables CSS para una identidad cálida (no el aspecto por defecto).

## Consecuencias
Reutilización total del código. iOS exige macOS/Xcode para compilar y firmar. Plugins de salud de terceros (@capgo/capacitor-health) a vigilar. Fijar TypeScript en 6.0.x.
