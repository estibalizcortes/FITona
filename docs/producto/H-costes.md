# Entregable H · Costes

> Resumen consolidado de las investigaciones [stack y costes](../investigacion/stack-y-costes-infraestructura.md) e [integraciones, IA y normativa](../investigacion/integraciones-ia-normativa.md). **Lee antes sus limitaciones**: varios dominios estaban bloqueados y se agotó el cupo de búsquedas, por lo que hay muchas cifras marcadas **[NV]** (no verificado). Importes sin IVA. Cambio supuesto 1 US$ ≈ 0,87 € [NV].

## 1. Gastos únicos

| Concepto | Importe | Estado |
|---|---|---|
| Alta Google Play (cuenta de desarrollador) | 25 US$ | [V-b] |
| Dominio `.es`/`.app` | ≈ 8–25 €/año | [NV] |
| Mac o minutos de CI macOS para compilar/firmar iOS | variable | [NV] |
| Revisión legal (RGPD/EIPD/MDR, 1.ª vez) | no estimado | Recomendable antes de 1.0 |
| Ordenador de desarrollo (16 GB mínimo; 32 GB cómodo con Oracle + emulador) | si no se dispone | [NV] |

## 2. Costes fijos recurrentes

| Concepto | Importe | Estado |
|---|---|---|
| Apple Developer Program | 99 US$/año | [V] |
| Hosting frontend (Cloudflare Pages) | 0 € (plan gratuito) | [V] |
| Correo transaccional (SES) | 0,0001 US$/correo | [V] |
| Monitorización (Sentry) | gratis al inicio; plan de pago [NV] | |
| Docker Desktop | 0 € para uso personal o pyme (< 250 empleados y < 10 M US$) | [V] |

## 3. Costes variables con usuarios (sin IA)

Hipótesis: 30 % de registrados activos al mes; 2 MB de BD por usuario y año; ≈ 10 fotos/mes por activo. Detalle y fórmulas en la investigación §6.

| Ruta | Beta ~50 | 1.000 | 10.000 | 100.000 |
|---|---|---|---|---|
| **O · Oracle en OCI** (Always Free → Autonomous de pago) | ≈ 1 € | ≈ 1 € (sin SLA) | **≈ 432 €** | ≈ 470 € |
| O′ · Oracle Free en VM propia | ≈ 8 € | ≈ 12 € | **no viable** (>12 GB, sin licencia superior) | no viable |
| **P1 · PostgreSQL autogestionado (Hetzner)** | ≈ 8 € | ≈ 12 € | ≈ 24 € | ≈ 84 € (26 € [NV]) |
| **P2 · PostgreSQL gestionado (Neon + Fly.io)** | ≈ 1 € | ≈ 17 € | ≈ 58 € | ≈ 190 € |

Lectura honesta: **hasta unos 1.000–3.000 usuarios Oracle cuesta 0 €**; el salto posterior es el problema (≈ 430 €/mes frente a ≈ 24–58 € con PostgreSQL a 10.000). Por eso la decisión Oracle/PostgreSQL tiene una puerta explícita (F §8).

## 4. IA (parte que más escala con el uso)

Precios por millón de tokens (entrada/salida) verificados en fuentes oficiales [V]: **Claude Haiku 5.5: 0,10 / 0,50 US$** · **Sonnet 5.5: 2 / 10 US$** · **Opus 5.5: 4 / 20 US$** · Gemini 3.5 Flash-Lite 0,30 / 2,50 US$ (+10 % con región UE).

Estimación por operación (fórmula y supuestos en integraciones §3.5; son **estimaciones, no medidas**):

| Modelo | Texto con caché | Foto | Mes por usuario activo (120 textos + 30 fotos) |
|---|---|---|---|
| Haiku 5.5 | 0,00015 US$ | 0,00036 US$ | **≈ 0,029 US$** |
| Sonnet 5.5 | 0,00298 US$ | 0,00729 US$ | ≈ 0,576 US$ |
| Gemini 3.5 Flash-Lite (UE) | 0,00078 US$ | 0,00148 US$ | ≈ 0,138 US$ |

Con modelo pequeño la IA de interpretación cuesta céntimos al mes; el riesgo está en el **chat y la generación de menús con modelos grandes y razonamiento** (la salida domina el coste). Controles de diseño: cuotas por plan, tope global mensual con degradación a modo sin IA, caché de prompt, JSON acotado, modelo barato por defecto.

Voz: reconocimiento **en el dispositivo** (gratis) con respaldo en nube (Google STT V2 0,016 US$/min [V]).

## 5. Tiendas móviles

| | Apple | Google |
|---|---|---|
| Cuota | 99 US$/año [V] | 25 US$ única [V-b] |
| Comisión UE 2026 | 15 % (Small Business y suscripciones desde el 2.º año), 26 % estándar [V] | 10 % + 5 % de facturación en el primer millón [V-b] |
| Requisitos clave | Eliminación de cuenta en la app; permiso explícito para enviar datos a IA de terceros (5.1.2(i)) [V] | Declaración de apps de salud; si la cuenta es personal nueva: 12 probadores/14 días (las de organización están exentas) [V-b] |

## 6. Modelo de negocio propuesto [P] (sin implementar pagos)

| | Gratis | Plus (hipótesis) |
|---|---|---|
| Registro, búsqueda, código de barras, recetas y planes propios, lista, despensa, offline, exportación | ✓ | ✓ |
| IA | cuota mensual baja de texto/chat (valores iniciales en `APP_SETTINGS`: 60 textos, 30 chat, 2 menús; sin foto) | cuota ampliada (600 textos / 300 chat / 6 menús / 90 fotos; ver el cálculo de más abajo) |
| Menús avanzados, importación avanzada, hogares con muchos miembros | límites | ✓ |

Precio de referencia observado en el mercado [V, A]: Fitia 39,99 €/año, YAZIO 47,90 €/año, MyRealFood 59,99 €/año, Ate 29,99 US$/año. **Hipótesis de partida: 24–36 €/año**, a validar. Margen unitario aproximado a 29,99 €/año: ingreso neto tras 15 % de tienda ≈ 25,5 € (≈ 2,1 €/mes). Coste de IA **a plena cuota Plus** (estimación propia, sin medir, sin caché salvo donde se indica):
- 600 textos (Haiku, con caché) ≈ 0,09 US$ + 90 fotos (Haiku) ≈ 0,03 US$ + 300 mensajes de chat (Haiku, ≈ 3.000 tokens de entrada y 500 de salida) ≈ 0,17 US$ ⇒ **≈ 0,3 US$/mes**.
- 20 menús generados con Sonnet 5.5 (supuesto 20.000 tokens de entrada + 4.000 de salida ≈ 0,08 US$ cada uno) ⇒ **≈ 1,6 US$/mes**.
- Total a plena cuota ≈ **1,9 US$/mes ≈ 1,7 €/mes**, que consumiría ≈ 80 % del ingreso neto mensual. **Conclusión:** la cuota de 20 menús/mes con un modelo grande **no es sostenible** a ese precio; hay que bajarla (p. ej. ≤ 6/mes), usar un modelo más barato o caché para la planificación. El uso medio real será muy inferior a la cuota, pero el diseño debe resistir el peor caso razonable. Los valores de `APP_SETTINGS` son provisionales y deben ajustarse con consumo medido en la beta.

Sin publicidad ni monetización de datos. Cancelación en un clic dentro de la app (anticipa la Directiva 2023/2673, aplicable desde 19-jun-2026 [V]).

## 7. Qué crece con los usuarios

| Crece | No crece (o casi) |
|---|---|
| BD (≈ 2 MB/usuario/año), fotos, salida de datos, correos, IA, soporte | Catálogo, frontend, cuotas de tienda, dominio |

Confianza: 62 % (precios verificados: IA, tiendas, Hetzner/Neon/RDS/OCI en gran parte; **no** verificados: licencia de Oracle Free en producción, tarifa Base DB OCI, precio Sentry/Render/Brevo/etc., dominios).
