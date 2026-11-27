# Informe de fallos probables y mejoras (27-nov-2026)

> Método: sondeo real del backend con entradas extremas y mal formadas (curl contra Oracle), revisión del código del frontend y repaso de lo ya sabido por la investigación. «Ejecutado» = se probó; «Revisión» = deducido leyendo código, **no** ejecutado.

## 1. Fallos encontrados

| # | Fallo | Evidencia | Gravedad | Decisión |
|---|---|---|---|---|
| F1 | Cantidades absurdas (1e30 g) se aceptan en el cálculo (devuelve 1E+30) y **al guardar dan 500** (desbordamiento de columna). Igual con ingredientes de recetas | Ejecutado: `calc` 200; `diary/entries` 500; `recipes` 500 | Alta (error interno sin mensaje útil) | **Implementar ya**: límites de cantidad, raciones y tamaños de listas → 400 con mensaje |
| F2 | **Reintentos simultáneos con el mismo id de registro**: 1 devuelve 201 y 7 devuelven 400. Un cliente que reintenta (red móvil, doble toque) ve un error aunque se guardó | Ejecutado: 8 POST paralelos → `201 400 400 …` (se guardó 1, correcto) | Alta (rompe la idempotencia prometida; base del modo offline) | **Implementar ya**: ante clave duplicada de la misma persona, devolver el registro existente |
| F3 | **Identidad de desarrollo insegura fuera de HTTPS/localhost**: `crypto.randomUUID` no existe en contextos no seguros (p. ej. `http://192.168.x.x:4200` desde el iPhone). El código cae a un UUID **fijo** (`0000…`) ⇒ todas las personas comparten los mismos datos, y «Registrar» puede fallar | Revisión del código (`identity.ts`, `add-page.ts`) | Alta para probar desde el móvil | **Implementar ya**: UUID con `getRandomValues`; nunca un id fijo compartido |
| F4 | Fecha inválida en el diario (`?date=abc`) responde **404** en vez de 400 | Ejecutado | Baja | **Implementar ya** |
| F5 | **Swagger UI y OpenAPI abiertos sin identidad** en el contenedor del backend | Ejecutado: `/q/swagger-ui/` y `/q/openapi` → 200 | Media | **Implementar ya**: quitar Swagger UI del contenedor |
| F6 | Mensaje de error con código interno («Sin medida casera «GLASS»…») | Ejecutado (pruebas de integración) | Baja-media (UX) | **Implementar ya**: mensaje en español con el nombre de la unidad |
| F7 | Se aceptan 300 pasos de receta y listas sin tope | Ejecutado | Baja | **Implementar ya** con F1 |
| F8 | Alimentos con el mismo nombre repetidos sin aviso | Ejecutado | Baja | Siguiente versión |

## 2. Riesgos que no son un fallo de código

| # | Riesgo | Gravedad | Decisión |
|---|---|---|---|
| R1 | **Valores nutricionales del catálogo de arranque sin verificar** (escritos a mano, aproximados) | **Muy alta** (es el dato en el que se confía) | Sin fuentes no se resuelve: importación verificada (BEDCA con autorización de AESAN, USDA CC0, CIQUAL). **Imprescindible** antes de uso real; requiere un archivo de datos verificado |
| R2 | **Sin autenticación real**: quien conozca un UUID ve esos datos; borrar los datos del navegador pierde la cuenta | Muy alta para uso público | **Imprescindible** antes de publicar (Keycloak/OIDC); siguiente hito grande |
| R3 | Sin copias de seguridad de la BD local | Media | Siguiente: script de copia/restauración |
| R4 | Sin limitación de frecuencia de peticiones | Media (solo con acceso público) | Con la autenticación real |
| R5 | La app no es instalable en el móvil (sin manifiesto ni iconos) | Media para usarla en iPhone | **Implementar ya** manifiesto e iconos; el service worker (sin conexión) se pospone (cachés obsoletas mientras se prueba) |
| R6 | Sin HTTPS ni despliegue: el iPhone solo podrá usarla como PWA sobre una URL HTTPS pública | Alta para tu objetivo | Siguiente: despliegue privado (decisión de hosting tuya) |
| R7 | Datos de salud (RGPD art. 9): EIPD y política de privacidad sin hacer | Muy alta para publicar | Previo a cualquier tienda |

## 3. Carencias funcionales (priorizadas)

| Prioridad | Mejora | Por qué |
|---|---|---|
| Alta | Editar un registro del diario (cambiar cantidad) y «repetir comida de ayer» | Hoy solo se puede borrar y recrear |
| Alta | Editar recetas desde la pantalla (la API ya crea versiones) | Hoy solo se crean |
| Alta | Importador de datos verificados (CSV con fuente y licencia) | Resuelve R1 cuando haya datos |
| Media | «Mis medidas» (mi vaso = 250 ml) | Precisión |
| Media | Buscador tolerante a erratas | Ya en los criterios de aceptación |
| Media | Plan semanal, lista de la compra, despensa | Núcleo del producto (v0.2–0.3) |
| Baja | Modo oscuro verificado, internacionalización, administración | Más adelante |

## 4. Se implementa ahora

F1, F2, F3, F4, F5, F6, F7 y R5 (manifiesto e iconos), cada uno con prueba. Lo demás queda priorizado y no se simula como hecho.

## 5. Lo que no se puede resolver desde aquí

- R1: un archivo de datos verificado o autorización de AESAN para BEDCA.
- R2/R6/R7: autenticación real, hosting con HTTPS y revisión legal.
- Google Play / App Store: cuentas y verificaciones a tu nombre.
