# ADR-004 · Identidad con Keycloak (OIDC)

- **Estado:** Propuesta (propuesta, pendiente de tu conformidad salvo que se indique)
- **Fecha:** 2026-11-18

## Contexto
Se necesita registro, verificación de correo, recuperación, sesiones y posterior Apple/Google. Implementar autenticación propia es arriesgado. La BD de la app no debe guardar correo ni contraseña (minimización).

## Decisión
Keycloak 26.x autogestionado con quarkus-oidc y PKCE. La aplicación guarda solo el identificador opaco (APP_USERS.AUTH_SUBJECT).

## Consecuencias
Control y datos en la UE; coste operativo extra (memoria, actualizaciones). Alternativa gestionada a evaluar si la operación resulta pesada.

## Actualización (18-nov-2026)
**Keycloak no está implementado.** El backend incluye solo una identidad de **desarrollo** (cabecera `X-Dev-User` con un UUID, activable con `FITONA_AUTH_DEV_ENABLED=true`; desactivada por defecto: sin ella toda petición a `/api` responde 401). No es seguridad real y no debe exponerse. La integración OIDC es requisito previo a cualquier uso con datos reales.

## Actualización (27-nov-2026)
Por decisión de la propietaria se implementa **autenticación propia con correo y contraseña** en el backend (PBKDF2-SHA256 600.000 iteraciones con sal, sesiones con token opaco guardado como SHA-256, contraseña de 4 caracteres o más por decisión de la propietaria (riesgo asumido), límite de 5 intentos fallidos/15 min por correo en memoria, consentimiento de datos de salud y confirmación de mayoría de edad al registrarse). Esto **sustituye a Keycloak en la v1** y modifica la decisión original «la BD no guarda correo ni contraseña»: ahora `USER_CREDENTIALS` guarda el correo y el hash (se borran en cascada con la cuenta). **Faltan** recuperación de contraseña y verificación de correo (requieren envío de correo). La cabecera `X-Dev-User` queda solo para pruebas con `FITONA_AUTH_DEV_ENABLED=true`.

