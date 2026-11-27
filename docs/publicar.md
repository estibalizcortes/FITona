# Publicar FITona: guía paso a paso (Android primero, iPhone como app web)

> Estado real (27-nov-2026): la app y el inicio de sesión con **correo y contraseña** funcionan y están probados en el entorno de desarrollo remoto. **Nada de lo que sigue se ha ejecutado**: no hay servidor, dominio ni cuenta de tienda conectados desde aquí. Las políticas de Google/Apple cambian: confirma cada requisito en su consola.

## 0. Qué se necesita (y no puedo hacer yo)
| Qué | Quién | Coste orientativo |
|---|---|---|
| Servidor con Docker (≥ 4 GB RAM, p. ej. un VPS en la UE) | tú eliges y pagas | unos 8-20 €/mes |
| Dominio propio | tú | unos 10 €/año |
| Cuenta de Google Play (ya la tienes, **pendiente de verificar**) | tú | 25 € (ya pagado) |
| Apple Developer Program (solo si quieres App Store) | tú | 99 $/año |
| Revisión legal de la política de privacidad (datos de salud) | tú / asesoría | — |

## 1. Servidor con HTTPS (imprescindible para móvil y tiendas)
1. Contrata un VPS (Ubuntu 24.04), apunta tu dominio a su IP (registro A).
2. En el servidor: `sudo apt install docker.io docker-compose-v2 git`, clona el repositorio, rama `claude-v1`.
3. Copia `.env.example` a `.env` y pon **contraseñas largas y distintas** y `FITONA_DOMAIN=app.tudominio.es`. Deja `FITONA_AUTH_DEV_ENABLED` sin definir (= false).
4. `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build`
5. Abre `https://app.tudominio.es`: debe salir «Entrar». Crea tu cuenta.
6. **Copias de seguridad** (aún no automatizadas): haz `docker exec fitona-oracle ...` / copia del volumen `oracle-data` antes de nada importante.

## 2. iPhone sin App Store (gratis, hoy)
Abre `https://app.tudominio.es` en Safari → Compartir → **Añadir a pantalla de inicio**. Funciona como app (sin barra del navegador). Limitación: sin modo sin conexión todavía.

## 3. Android en Google Play
1. **Termina tu cuenta de desarrollador** (lo que muestra tu captura): espera la verificación de identidad; «Declara tu estado de comerciante» (responde según tu situación real: si no cobras, indica que no eres comerciante… confirma el texto exacto de la consola); «Verifica que tienes acceso a un Android» con la app Play Console en un móvil Android.
2. **Genera el paquete (AAB)** sin instalar nada: entra en <https://www.pwabuilder.com>, escribe `https://app.tudominio.es`, elige **Android** y descarga el paquete (incluye la clave de firma: **guárdala y no la pierdas**). PWABuilder crea una Trusted Web Activity que muestra tu web como app.
3. En Play Console: **Crear aplicación** → nombre FITona, español, app, gratuita → sube el `.aab` a **Pruebas cerradas**.
4. Rellena: política de privacidad (URL pública `https://app.tudominio.es/privacidad` **tras revisarla**), **Seguridad de los datos** (recoge: correo y datos de salud/alimentación; cifrado en tránsito; se pueden borrar), clasificación de contenido, público objetivo (adultos), categoría Salud y bienestar / Alimentación.
5. **Requisito de cuentas personales nuevas** (según las políticas vigentes cuando se escribió esto: confírmalo en la consola): hay que hacer una prueba cerrada con **al menos 12 personas probadoras durante 14 días seguidos** antes de poder pedir publicación en producción. Reúne 12 correos de Gmail (amistades/familia) y añádelos a la lista de probadores.
6. Pasados los días, solicita acceso a producción y publica.
7. Enlace de verificación de dominio (Digital Asset Links): PWABuilder te da el archivo `assetlinks.json`; súbelo a `https://app.tudominio.es/.well-known/assetlinks.json` (basta copiarlo a `frontend/public/.well-known/` y reconstruir).

## 4. App Store (iPhone) — opcional y más costoso
Requiere Apple Developer (99 $/año), un Mac con Xcode y empaquetar con Capacitor. Mientras tanto, la opción 2 (añadir a pantalla de inicio) cubre tu iPhone.

## 5. Pendiente antes de abrirla a otras personas
- **Recuperar contraseña** (necesita enviar correos: proveedor de correo) — hoy olvidar la contraseña = perder la cuenta.
- Verificación de correo, límite de intentos compartido entre servidores, copias de seguridad automáticas, revisión legal (RGPD art. 9) y EIPD.
- Valores nutricionales: son aproximados y sin verificar (ver `docs/estado-implementacion.md`).
- Icono «maskable» con margen de seguridad (hoy reutiliza el icono normal).
