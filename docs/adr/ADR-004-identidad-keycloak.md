# ADR-004 · Identidad con Keycloak (OIDC)

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Se necesita registro, verificación de correo, recuperación, sesiones y posterior Apple/Google. Implementar autenticación propia es arriesgado. La BD de la app no debe guardar correo ni contraseña (minimización).

## Decisión
Keycloak 26.x autogestionado con quarkus-oidc y PKCE. La aplicación guarda solo el identificador opaco (APP_USERS.AUTH_SUBJECT).

## Consecuencias
Control y datos en la UE; coste operativo extra (memoria, actualizaciones). Alternativa gestionada a evaluar si la operación resulta pesada.
