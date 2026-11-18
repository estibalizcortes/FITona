# Stack, infraestructura y costes — FITona

> **Fecha de la investigación:** 18-nov-2026 · **Ámbito:** app de nutrición freemium (Angular + Ionic + Capacitor; Quarkus monolito modular; Oracle preferida) · **Fases:** local → web pública → apps móviles.
>
> **Leyenda de verificación**
>
> - **[V: fuente]** verificado en fuente oficial: web oficial, repositorio oficial de documentación del fabricante en GitHub (es el código fuente de la web de documentación), API oficial de precios, registro npm o Maven Central, o comando ejecutado.
> - **[V\*: fuente]** fuente oficial leída solo a través del extracto de un buscador (no pude abrir la página directamente porque el dominio estaba bloqueado en este entorno). Confianza media-alta.
> - **[V-sec: fuente]** confirmado solo en fuentes secundarias (prensa técnica, comparadores). Confianza media.
> - **[NV]** no verificado: conocimiento previo o estimación. **No debe usarse para decidir sin comprobarlo.**
>
> Los importes no incluyen IVA (21 %). Donde la fuente da USD, convierto a EUR con el supuesto **1 US$ ≈ 0,87 €** [NV, supuesto de cálculo; revísalo con el tipo del día].
>
> **Limitaciones de esta investigación:** varios dominios estaban bloqueados para lectura directa (angular.dev, quarkus.io, docs.oracle.com, oracle.com, documentation.red-gate.com, fly.io, adoptium.net, la API de precios de OCI y la de Azure). Cuando existía, leí el repositorio oficial de documentación en GitHub. Durante la investigación se agotó el cupo de búsquedas web, así que algunos precios (Render, Railway, Cloud Run, Azure PostgreSQL, Cloud SQL, Brevo, Postmark, Resend, Auth0, Clerk, Firebase Auth, Grafana Cloud, Better Stack, dominios, cuotas de Apple y Google) se quedan en **[NV]**. La lista de pendientes está al final de la sección 1.

---

## 1. Resumen y recomendaciones

### 1.1 Conclusiones clave

1. **El stack elegido está vigente y es compatible entre sí a fecha de hoy.** Angular 22.2 es la versión *Active* (LTS hasta jun-2028). Ionic 9 soporta Angular 18–22.x y Capacitor 7 o superior. Capacitor 8.6 es la última estable (la 9 está en RC). Quarkus 3.40 es la LTS más reciente (soporte hasta 30-sep-2027) y tiene soporte completo de Java 25 desde la 3.31. Node 26 es la LTS activa. Detalle en la sección 2.
2. **Oracle sale gratis hasta aproximadamente 5.000–10.000 usuarios registrados.** Oracle AI Database 26ai Free admite 12 GB de datos de usuario y Autonomous Database Always Free 20 GB por instancia. A partir de ahí, **el siguiente escalón en Oracle cuesta entre 4 y 18 veces más que en PostgreSQL**:
   - **Oracle de pago:** unos 100 €/mes con AWS RDS for Oracle SE2 *License Included* `db.t3.medium`, o unos 430 €/mes con OCI Autonomous Database Serverless (mínimo 2 ECPU funcionando 24×7).
   - **PostgreSQL:** entre 24 y 58 €/mes (Hetzner autogestionado, AWS RDS o Neon) para 10.000 usuarios.
   Ver secciones 3, 4 y 6.
3. **Recomendación sobre la base de datos (la decisión es de la propietaria):**
   - Se puede **empezar con Oracle** (local con contenedor Free; beta con OCI Always Free), con una **disciplina de portabilidad**:
     - JPA/Hibernate sin SQL propietario fuera de módulos acotados.
     - Migraciones con Flyway OSS.
     - Tests con Testcontainers.
     - En CI, una *pipeline* opcional también sobre PostgreSQL.
   - Hay que fijar un **punto de decisión** antes de llegar a unos **3.000 usuarios registrados o 8 GB de datos**, lo que ocurra primero.
   - **Seguir con Oracle** si en ese momento se da una de estas condiciones:
     - el presupuesto de BD de 100–450 €/mes es asumible;
     - se usan funciones exclusivas de Oracle;
     - la productividad de la propietaria con Oracle compensa.
   - **Migrar a PostgreSQL** si prima el coste o la variedad de proveedores. Condiciones detalladas en la sección 4.3.
4. **Alojamiento recomendado:**
   - **Frontend web (PWA):** Cloudflare Workers *static assets* o Pages. Las peticiones a estáticos son gratis e ilimitadas [V]. **Vercel Hobby no sirve**: prohíbe el uso comercial [V*].
   - **Backend:** OCI Ampere A1 Always Free para la beta si se sigue la ruta Oracle. Tras el recorte de 2026 quedan 2 OCPU y 12 GB en total [V-sec]. Para producción, una VM en la UE: Hetzner CX33 a 8,49 €/mes más IPv4 [V-sec], o Fly.io con 1 GB en Frankfurt a 7,73 US$/mes [V].
   - **AWS App Runner queda descartado:** está cerrado a clientes nuevos desde el 30-abr-2026 [V*].
   - **Fotos:** Cloudflare R2. Cuesta 0,015 US$/GB-mes, la salida (*egress*) es gratis y los primeros 10 GB también [V].
   - **Correo:** Amazon SES, a 0,10 US$ por cada 1.000 correos en la región de España [V].
   - **Errores:** Sentry Developer, gratuito [V], hasta la fase de 10.000 usuarios.
5. **Identidad para el MVP:** **Keycloak 26.8.x autogestionado + `quarkus-oidc`**.
   - Sin coste de licencia.
   - Basado en estándares (OIDC), con MFA, inicio de sesión social y políticas de contraseña ya hechas.
   - Necesita unos 1,25 GB de RAM de base [V].
   - Una autenticación propia (`quarkus-security-jpa` + `quarkus-smallrye-jwt`) solo es aceptable para una beta cerrada. No la recomiendo para salir a público con datos que pueden ser de salud.
6. **Coste mensual orientativo** (sin IA, sin IVA, sin monitorización de pago; detalle en la sección 6):

| Escenario | Ruta Oracle (OCI) | PostgreSQL en Hetzner | PostgreSQL gestionado (Neon + Fly.io) |
|---|---|---|---|
| MVP local | 0 € | 0 € | 0 € |
| Beta (~50) | ≈ 1 € | ≈ 8 € | ≈ 1 € |
| 1.000 | ≈ 1 € (Always Free, sin SLA) | ≈ 12 € | ≈ 17 € |
| 10.000 | ≈ 432 € (ADB de pago) · alt. ≈ 101 € solo BD en AWS RDS Oracle | ≈ 24 € | ≈ 58 € |
| 100.000 | ≈ 470 € (ADB) · alt. ≈ 223 € solo BD en AWS RDS Oracle | ≈ 84 € (incluye partidas [NV]) | ≈ 190 € |
| IA | ver `integraciones-ia-normativa.md` | ídem | ídem |

### 1.2 Versiones recomendadas (fijar en `pom.xml`, `package.json` y el entorno)

| Componente | Versión recomendada | Motivo |
|---|---|---|
| JDK | **Java 25 LTS** (build OpenJDK, p. ej. Eclipse Temurin 25; parche exacto [NV]) | LTS con soporte *Premier* de Oracle hasta sep-2030 [V*]. Quarkus le da soporte completo [V]. |
| Quarkus | **3.40.1.2 (LTS)** | LTS con EOL el 30-sep-2027 [V]. Pasar a 4.x cuando salga la **4.3 LTS** (prevista para el 31-mar-2027 [V]). |
| Maven | **3.9.16** | Quarkus exige 3.9.6 o superior [V]. 3.9.16 es la última 3.9.x en Maven Central [V]. |
| Node.js | **26.13.1 LTS** (alternativa: 24.22.3 LTS) | La 26 es la LTS activa (EOL 30-abr-2029) [V]. Angular 22 admite `>=26` [V]. |
| Angular | **22.2.6** (CLI 22.2.7) + **TypeScript 6.0.3** | Angular 22 exige TypeScript `>=6.0 <6.1` [V]. |
| Ionic Framework | **@ionic/angular 9.0.12** (CLI 7.2.1) | v9 es la activa; soporta Angular 18–22.x [V]. |
| Capacitor | **8.6.2** (pasar a 9.x cuando sea GA) | La 9 está en RC y exige Xcode 27, iOS 16 y Node 24 [V]. |
| Oracle JDBC | **ojdbc17 23.26.2.0.0**, gestionado por el BOM de Quarkus (no sobrescribir) | Hay 23.26.4.0.0 publicada [V], pero conviene respetar el BOM. |
| Flyway | **12.0.0** (gestionado por el BOM de Quarkus 3.40) + `flyway-database-oracle` | Licencia Apache 2.0; Oracle soportado en la edición OSS [V]. |
| Testcontainers | **2.0.5** (`org.testcontainers:testcontainers-oracle-free`) | Es la misma versión que fija el BOM de Quarkus [V]. |
| Imagen Oracle (dev/CI) | **`gvenzl/oracle-free:23-slim-faststart`** (en CI, fijar `23.26.4-slim-faststart`) | Es la que usan por defecto los Dev Services de Quarkus [V]. |
| Keycloak | **26.8.2** | Última en Maven Central (05-nov-2026) [V]. |
| Docker Desktop | **4.99.0** | Publicada el 09-nov-2026 [V]. |
| PostgreSQL (si se migra) | **18.x** (18.7) | 19.0 está recién etiquetada (16-nov-2026) [V]. Los servicios gestionados tardan en ofrecer cada versión mayor [NV]. |

### 1.3 Lo que queda sin verificar (hay que comprobarlo antes de decidir)

- **Si la licencia de Oracle AI Database Free permite uso en producción.** La FAQ oficial plantea la pregunta, pero no pude leer la respuesta y las fuentes secundarias discrepan [NV]. Acción: leer la FAQ y las *Free Use Terms*.
- **Precio actual de Autonomous Database y de Base Database Service.** El dato de ADB procede de la FAQ de ECPU de Oracle de 2024 [V]. La tarifa de Base DB SE no está verificada [NV]. Acción: calculadora de costes de OCI en la región de Madrid.
- **Cifras oficiales actuales de A1 Always Free.** La documentación oficial y la prensa no coinciden [V-sec].
- **Precios no verificados:** Render, Railway, Google Cloud Run, Azure Database for PostgreSQL, Cloud SQL, Brevo, Postmark, Resend, Auth0, Clerk, Firebase Auth, Grafana Cloud, Better Stack, el precio base de Sentry Team, dominios `.es`/`.app`, Apple Developer Program y alta en Google Play [NV].
- **Hetzner:** copias (+20 %), volúmenes, balanceador y tráfico incluido [NV]. Las tarifas de servidores solo están confirmadas en fuentes secundarias [V-sec].

---

## 2. Versiones del stack verificadas

| Componente | Versión | Fecha | Soporte / compatibilidad | Fuente / comando |
|---|---|---|---|---|
| **Java 25** (LTS) | 25 | GA sep-2025 | Oracle Premier hasta sep-2030; Extended hasta sep-2033 | [V\*: Oracle Java SE Support Roadmap, fuente 29] |
| **Java 21** (LTS) | 21 | GA sep-2023 | Oracle Premier hasta sep-2028; Extended hasta sep-2031. Oracle indica que la licencia permisiva (NFTC) de Oracle JDK 21 terminó en sep-2026. Con builds OpenJDK (Temurin, etc.) no hay coste. | [V\*: 29]; Temurin [NV] |
| Próxima LTS de Java | 29 | prevista sep-2027 | Cadencia de LTS cada 2 años | [V\*: 29] |
| **Quarkus 3.40 LTS** | **3.40.1.2** | 3.40.0: 30-sep-2026 · 3.40.1.2: 09-nov-2026 | LTS de 12 meses: EOL 30-sep-2027. Red Hat e IBM la soportan desde el 10-nov-2026. JDK 17 o superior. | [V: `curl …/io/quarkus/quarkus-bom/maven-metadata.xml`; fuentes 9, 10, 11, 12] |
| Quarkus 3.33 LTS | 3.33.4.2 | 3.33.0: 25-mar-2026 | EOL comunitario 25-mar-2027 | [V: 10, 13] |
| Quarkus 4.0 | 4.0.0.CR1 | CR1: 11-nov-2026; GA prevista 25-nov-2026 | **No es LTS**. Base Java 21, Hibernate ORM 8, Jackson 3, Vert.x 5. Primera LTS 4.x prevista: **4.3, el 31-mar-2027**. | [V: 9, 10, 15] |
| Política LTS de Quarkus | — | — | Una LTS cada 6 meses; cada LTS tiene 12 meses de correcciones críticas y de seguridad; menores cada 4 semanas | [V: 10] |
| Quarkus + Java 25 | desde 3.31 | 28-ene-2026 | "Full Java 25 support", incluidas imágenes nativas con Mandrel | [V: 14] |
| **Angular** | **22.2.6** (CLI 22.2.7) | 12-nov-2026 | v22 *Active* hasta 2027-06 y LTS hasta 2028-06. v21 en LTS hasta 2027-06. v20 en LTS hasta 28-nov-2026. Node `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`. TypeScript `>=6.0 <6.1`. | [V: `npm view @angular/core version time dist-tags engines`; fuentes 1, 2] |
| TypeScript | 6.0.3 (la última es 7.0.2, pero Angular 22 no la admite) | — | Angular 22 exige 6.0.x | [V: `npm view @angular/compiler-cli@22.2.6 peerDependencies`] |
| **Ionic Framework** | **9.0.12** | 17-nov-2026 | v9 *Active* desde el 19-ago-2026. v8 en mantenimiento hasta 19-feb-2027 (soporte extendido hasta 19-ago-2027). Angular **v18 a v22.x**. Capacitor 7 o superior. | [V: `npm view @ionic/angular`; fuente 3] |
| Ionic CLI | 7.2.1 | — | Node 16 o superior | [V: `npm view @ionic/cli`] |
| **Capacitor** | **8.6.2** | 12-nov-2026 | **Cap 8:** Node 22 o superior, **Xcode 26** o superior, iOS 15 o superior, Android Studio Otter 2025.2.1 o superior, `minSdk 24`, `compile/targetSdk 36`, SPM por defecto en iOS | [V: `npm view @capacitor/core`; fuentes 4, 5] |
| Capacitor 9 | 9.0.0-rc.0 | 12-nov-2026 | **Cap 9:** Node 24 o superior, **Xcode 27** o superior, iOS 16 o superior, Android Studio 2026.1.4 o superior | [V: fuentes 4, 6] |
| **Node.js** | **26.13.1** "Lithium" | LTS desde 28-oct-2026 | Mantenimiento desde 20-oct-2027; EOL 30-abr-2029 | [V: fuentes 7, 8] |
| Node.js 24 | 24.22.3 "Krypton" | — | Mantenimiento desde 20-oct-2026; EOL 30-abr-2028 | [V: 7, 8] |
| Node.js 22 | 22.23.5 "Jod" (instalado en este entorno) | — | EOL 30-abr-2027 | [V: `node -v`; 7, 8] |
| **Flyway (OSS/Community)** | 13.12.2 (último); **12.0.0 en el BOM de Quarkus 3.40** | 12-nov-2026 | Licencia Apache 2.0. El módulo `flyway-database-oracle` existe desde la 9.19 y es Apache 2.0. El código admite Oracle 10 o superior; para versiones **anteriores a la 18** recomienda o exige la edición de pago (*Tier.PREMIUM*). Para **23.x** no hay restricción. | [V: Maven Central; fuentes 18, 20, 21] |
| Flyway + Oracle en Quarkus | `quarkus-flyway` + `quarkus-jdbc-oracle` (+ `org.flywaydb:flyway-database-oracle`) | — | Quarkus añade automáticamente `quarkus-flyway-oracle` cuando están `quarkus-flyway` y `quarkus-jdbc-oracle` | [V: fuentes 16, 17] |
| Liquibase (alternativa) | 5.0.4 (último) · **4.33.0 en el BOM de Quarkus** | 20-ago-2026 | **Liquibase 5.x usa la licencia FSL-1.1-ALv2** (*source-available*). La 4.33.0 es Apache 2.0. | [V: POM de Maven Central, fuente 23] |
| Oracle JDBC | ojdbc17/ojdbc11 23.26.4.0.0 (último) · **23.26.2.0.0 en el BOM** | 29-oct-2026 | `quarkus-jdbc-oracle` 3.40.1.2 en el BOM | [V: fuentes 18, 24] |
| Testcontainers | 2.0.5 · módulo `testcontainers-oracle-free` | 20-abr-2026 | Usa la imagen `gvenzl/oracle-free`. El artefacto antiguo `org.testcontainers:oracle-free` se quedó en 1.21.4. | [V: Maven Central; fuente 25] |
| Hibernate ORM | 7.4.9.Final (en el BOM 3.40) | — | — | [V: fuente 18] |
| Oracle AI Database Free | 23.26.x (comercialmente "26ai", antes "23ai") | imagen 23.26.4 publicada el 17-nov-2026 | Ver la sección 3 | [V: Docker Hub API; fuentes 26, 27] |
| PostgreSQL | 18.7 · 19.0 etiquetada | tag REL_19_0: 16-nov-2026 | Fecha del anuncio oficial de la 19 [NV] | [V: `git ls-remote --tags …/postgres`] |
| PgJDBC | 42.7.14 | 07-oct-2026 | — | [V: Maven Central] |
| Keycloak | 26.8.2 (los Dev Services de Quarkus 3.40 usan 26.7.4) | 05-nov-2026 | — | [V: fuentes 19, 51] |
| Docker Desktop | 4.99.0 | 09-nov-2026 | — | [V: fuente 52] |

---

## 3. Oracle: Free, OCI Always Free y opciones de pago

### 3.1 Tabla resumen

| Oferta | Recursos y límites | Licencia y uso | Coste | Copias de seguridad | SLA | Fuente |
|---|---|---|---|---|---|---|
| **Oracle AI Database 26ai Free** (antes 23ai Free), autogestionada | **2 hilos de CPU**, **2 GB de RAM** (SGA + PGA), **12 GB de datos de usuario** (al superarlos, error ORA-12954). 1 PDB [V-sec]. | Gratuita. Uso en **producción: [NV]**: la FAQ oficial plantea la pregunta pero no pude leer la respuesta y las fuentes secundarias discrepan. Sin soporte de Oracle Support [NV]. | 0 € de licencia, más el coste de la VM donde corra | A cargo propio (RMAN o Data Pump hacia almacenamiento de objetos) | No | [V\*: 27, 28] |
| Imagen oficial `container-registry.oracle.com/database/free` | Las mismas limitaciones | — | 0 € | — | — | [NV]: el registro no era accesible desde este entorno |
| Imagen comunitaria `gvenzl/oracle-free` | Variantes `slim`, normal, `full` y `-faststart`; amd64 y arm64. Tamaño comprimido entre 0,85 GB (`slim`) y 2,77 GB (`full-faststart`). Etiqueta soportada: 23.26.3* (la 23.26.4 se publicó el 17-nov-2026). | Es la imagen por defecto de los Dev Services de Quarkus (`23-slim-faststart`) y de Testcontainers | 0 € | — | — | [V: 19, 25, 26] |
| **OCI Always Free – Autonomous AI Database** | **2 instancias** por *tenancy*, cada una con **1 OCPU** y **unos 20 GB**. Máximo de sesiones simultáneas: 20 (otra página indica 30). **Se para tras 7 días seguidos sin actividad**; puede reclamarse y borrarse tras **90 días parada**. Sin *restore* ni Autonomous Data Guard. | Gratis indefinidamente. Cualquier tipo de carga (ATP, ADW o JSON). | 0 € | La documentación indica que no admite restauración → hacer exportaciones propias | **Sin SLA** [NV] | [V\*: 30, 32] |
| **OCI Always Free – Compute Ampere A1** | **2 OCPU y 12 GB de RAM en total** (1.500 OCPU-h y 9.000 GB-h al mes) desde el 15-jun-2026, **antes 4 OCPU y 24 GB**. Algunas páginas oficiales aún muestran las cifras antiguas. | Gratis. Riesgo de recorte unilateral (ya ocurrió en 2026). Recuperación de instancias ociosas [NV]. | 0 € | — | Sin SLA [NV] | [V-sec: 31; V\*: 30] |
| OCI Always Free – Object Storage | 10 GB Standard, 10 GB Infrequent Access y 10 GB Archive | — | 0 € | — | — | [V\*: 30 (developer.oracle.com)] |
| OCI – transferencia saliente | **10 TB al mes gratis**; después, unos 0,0085 US$/GB | — | — | — | — | [V-sec: 35] |
| **Autonomous AI Database Serverless (ATP) de pago** | Mínimo **2 ECPU**, incrementos de 1 ECPU; almacenamiento mínimo de 20 GB | Licencia incluida o BYOL | **0,336 US$/ECPU-h** (BYOL: 0,0807). Con 2 ECPU 24×7: 0,672 US$/h × 730 h = **490,56 US$/mes (≈ 427 €)**. Almacenamiento: **0,1156 US$/GB-mes**. | Copias automáticas, pero su almacenamiento se factura aparte: **0,0244 US$/GB-mes** | Sí [NV] | [V: FAQ de ECPU de Oracle, **documento de 2024: las tarifas pueden haber cambiado**, fuente 33] |
| Base Database Service (VM DB System), Standard Edition | Tarifa por ECPU-hora en *shapes* x86 | Licencia incluida o BYOL | **[NV]**. Terceros citan unos 0,05 US$/ECPU-h para SE, más almacenamiento en bloque. Hay que consultarlo en la calculadora de OCI. | Copias a Object Storage (coste del almacenamiento) [NV] | Sí [NV] | [NV: 34] |
| **Alternativa: AWS RDS for Oracle SE2, *License Included*** (región España, eu-south-2) | `db.t3.small` (2 GiB): **0,077 US$/h**. `db.t3.medium` (4 GiB): **0,154 US$/h**. `db.t3.large` (8 GiB): **0,308 US$/h**. Multi-AZ: el doble. | Licencia SE2 incluida | `db.t3.medium` + 30 GB gp3: 112,42 + 3,81 = **116,23 US$/mes (≈ 101 €)** | Copias incluidas hasta un volumen [NV]; el exceso cuesta 0,095 US$/GB-mes | Multi-AZ | [V: AWS Price List API, publicada el 17-nov-2026, fuente 36] |

### 3.2 Lectura para FITona

- **Desarrollo local:** contenedor Oracle Free. Funciona igual con Quarkus Dev Services (cero configuración) y con Testcontainers.
- **Beta y hasta 1.000 usuarios:** OCI Always Free (ADB + A1) cuesta 0 €, pero **no tiene SLA**, la ADB tiene un límite de 20–30 sesiones y Oracle puede cambiar las condiciones (lo hizo en 2026 con A1). Es aceptable para una beta; para producción es arriesgado.
- **Cuello de botella:** con los supuestos de la sección 6 (0,5 GB de catálogo más 2 MB por usuario registrado), se agotan los **12 GB de Oracle Free hacia los 5.750 usuarios** y los **20 GB de ADB Always Free hacia los 9.750**. El salto siguiente cuesta unos 100 €/mes (RDS Oracle SE2 `db.t3.medium`, sin alta disponibilidad) o unos 430 €/mes (ADB 2 ECPU).
- **Copias:** en la ruta gratuita no hay copias gestionadas con restauración. Hay que programar `expdp` (Data Pump) o exportaciones a Object Storage o R2 desde el primer día.

---

## 4. Oracle vs PostgreSQL

### 4.1 Comparativa de precios de entrada y de producción pequeña (solo la base de datos)

Supuestos de tamaño de la sección 6. Precios mensuales, bajo demanda.

| Opción | Entrada / gratis | 1.000 usuarios (2,5 GB) | 10.000 (20,5 GB) | 100.000 (200,5 GB) | Fuente |
|---|---|---|---|---|---|
| Oracle Free autogestionada (en una VM) | 0 € | 0 € (más la VM) | **No cabe** (más de 12 GB) | No cabe | [V\*: 27] |
| OCI ADB Always Free | 0 € | 0 € | **No cabe** (más de 20 GB) | No cabe | [V\*: 30] |
| OCI ADB ATP de pago (2 ECPU) | — | 492,87 US$ | 492,93 US$ (≈ 429 €) | 513,74 US$ (≈ 447 €) | [V: 33 (2024)] |
| AWS RDS Oracle SE2 LI | — | `t3.small`: 58,75 US$ | `t3.medium`: 116,23 US$ (≈ 101 €) | `t3.large`: 256,59 US$ (≈ 223 €); Multi-AZ: 449,68 US$ más almacenamiento | [V: 36] |
| **Neon** (PostgreSQL *serverless*) | Free: 100 CU-h y 1 GB por proyecto; *scale-to-zero* a los 5 min | Launch: 0,25 CU el 50 % del tiempo: 10,55 US$ (≈ 9 €) | 0,5 CU 24×7: 45,87 US$ (≈ 40 €) | 1 CU 24×7: 147,56 US$ (≈ 128 €) | [V: 39] — Launch: 0,106 US$/CU-h y 0,35 US$/GB-mes |
| **Supabase** | Free: 500 MB de BD, se pausa tras 1 semana sin actividad, 2 proyectos | Pro: 25 US$ (incluye 8 GB y cómputo Micro) | 26,56 US$ (≈ 23 €) | 49,06 US$ más cómputo mayor [NV] | [V: 40] — exceso de disco a 0,125 US$/GB |
| **AWS RDS PostgreSQL** (eu-south-2) | Capa gratuita [NV] | `t4g.micro` (1 GiB) + 20 GB: 15,68 US$ (≈ 14 €) | `t4g.small` + 30 GB: 29,36 US$ (≈ 26 €); Multi-AZ: 51,10 US$ más almacenamiento | `m7g.large` + 250 GB: 167,82 US$ (≈ 146 €) | [V: 36] — gp3 a 0,127 US$/GB-mes |
| AWS Aurora PostgreSQL Serverless v2 | — | 0,14 US$/ACU-h (IO-Optimized: 0,19) | — | — | [V: 36] |
| Fly.io Managed Postgres | — | Basic: 38 US$ más 0,28 US$/GB-mes | — | — | [V: 41] |
| Azure Database for PostgreSQL Flexible (Burstable B1ms) | [NV] | [NV] | [NV] | [NV] | No verificado (API de precios bloqueada) |
| Google Cloud SQL para PostgreSQL | [NV] | [NV] | [NV] | [NV] | No verificado |
| **Hetzner, PostgreSQL autogestionado** | — | Dentro de la CX33 de la app (8,49 € + 0,50 € de IPv4) | CX33 dedicada: 8,99 € más copias [NV] | CX43 a 16,49 € más volumen y copias [NV] | [V-sec: 42] |

### 4.2 Ventajas y limitaciones para este caso

Las valoraciones cualitativas de esta tabla son criterio profesional. Las afirmaciones técnicas no comprobadas en esta sesión llevan [NV].

| Criterio | Oracle | PostgreSQL |
|---|---|---|
| **Coste a 0–5.000 usuarios** | 0 € con Free u OCI Always Free (sin SLA) | 0–15 €/mes con SLA razonable (Neon, RDS micro o Hetzner) |
| **Coste a 10.000–100.000 usuarios** | De 100 a más de 450 €/mes solo en BD (RDS SE2 o ADB) | 24–170 €/mes según opción |
| **Portabilidad / *lock-in*** | Alto si se usa PL/SQL, Oracle Text, secuencias y tipos propios. Medio si todo pasa por JPA y Flyway con SQL estándar. | Bajo: decenas de proveedores gestionados y autogestión sencilla |
| **Ecosistema Quarkus** | De primera: `quarkus-jdbc-oracle`, Dev Services (gvenzl), `quarkus-flyway-oracle` automático [V] | De primera: `quarkus-jdbc-postgresql`, Dev Services, clientes reactivos [V] |
| **Migraciones** | Flyway OSS (Apache 2.0) soporta Oracle 18 o superior sin coste [V]. Algunas funciones avanzadas (p. ej. comandos SQL*Plus) son de pago [NV]. | Flyway OSS sin restricciones relevantes [V] |
| **JSON** | Tipo JSON nativo y JSON-Relational Duality en 23ai/26ai [NV] | `jsonb` con índices GIN, muy maduro [NV] |
| **Búsqueda de alimentos (texto)** | Oracle Text (índice `CONTEXT`, `CONTAINS`, *fuzzy*), incluido en las ediciones [NV]. Necesita sincronizar el índice [NV]. | `pg_trgm` (similitud por trigramas, ideal para autocompletar con erratas) + `unaccent` + FTS `spanish` [NV]. Más sencillo para este caso. |
| **Vectores (futuro con IA)** | AI Vector Search incluido [NV] | `pgvector`, disponible en Neon, Supabase y RDS [NV] |
| **Comunidad y talento** | Más pequeño en *startups*; fuerte en empresa y en la propietaria | Muy amplio en *startups* y *open source* |
| **Hosting** | OCI (Free y ADB), AWS RDS, Azure/Google mediante Oracle@… (caro); autogestión sujeta a licencia | Prácticamente cualquier proveedor |
| **Licencia** | Propietaria; Free con límites duros (2 CPU, 2 GB RAM, 12 GB) | Licencia PostgreSQL (permisiva) |
| **Rendimiento a esta escala** | Sobrado | Sobrado |

### 4.3 Recomendación (la decisión es de la propietaria)

**Mantener Oracle tiene sentido si:**

1. La propietaria es significativamente más productiva en Oracle (SQL, PL/SQL, herramientas) y eso acorta el MVP.
2. Se espera seguir **por debajo de unos 5.000 usuarios registrados durante los próximos 12–18 meses**, de modo que Free o Always Free bastan.
3. Se acepta **no tener SLA** en la beta y hay un plan de copias propio.
4. Al crecer, hay presupuesto para unos **100–450 €/mes solo de BD** (RDS Oracle SE2 o ADB), o se acepta migrar en ese momento.
5. Se van a usar funciones distintivas de Oracle que aporten valor de producto (JSON Duality, AI Vector Search, Oracle Text).

**Conviene cambiar a PostgreSQL si:**

1. El objetivo es pasar de **5.000–10.000 usuarios** en el primer año, porque el coste de BD sería entre 4 y 18 veces menor.
2. Se quiere SLA y copias gestionadas por menos de 30 €/mes desde el inicio.
3. Se busca libertad de proveedor (Neon, Supabase, RDS, Hetzner…) y facilidad para contratar.
4. La búsqueda tolerante a erratas sobre el catálogo de alimentos es central (`pg_trgm`).

**Camino intermedio recomendado:**

- Empezar con Oracle por preferencia y conocimiento, pero **escribir código portable**:
  - JPA/Hibernate, sin `NUMBER(…)`, `ROWNUM` ni PL/SQL en la lógica.
  - Migraciones Flyway en SQL estándar; si hay scripts de un solo motor, separarlos por perfil con `quarkus.flyway.locations`.
  - Tests de integración con Testcontainers.
- Revisar la decisión en el **punto de control: 3.000 usuarios registrados u 8 GB de datos**.
- Migrar con datos pequeños es barato; con 100 GB ya no lo es.

---

## 5. Hosting y servicios

### 5.1 Frontend estático (PWA Angular/Ionic)

| Servicio | Plan gratuito y límites | Uso comercial | Plan de pago de entrada | Fuente |
|---|---|---|---|---|
| **Cloudflare Workers static assets / Pages** | Workers: peticiones a estáticos **gratis e ilimitadas**, sin coste por almacenarlos. Pages Free: 500 *builds* al mes, 1 *build* simultáneo, 20.000 ficheros por sitio, 25 MiB por fichero, 100 dominios propios por proyecto. Cloudflare recomienda Workers para proyectos nuevos. | No encontré restricciones de uso comercial [NV] | Pro (precio [NV]) | [V: 44] |
| Netlify | Free: 300 créditos al mes como límite duro | [NV] | Personal: 9 US$/mes (1.000 créditos); Pro: 20 US$/mes | [V-sec: 46] |
| **Vercel** | Hobby | **Prohibido**: "Hobby teams are restricted to non-commercial personal use only" | Pro: 20 US$ por usuario y mes | [V\*: 45] |
| Firebase Hosting | Spark: 10 GB de almacenamiento y 360 MB/día de transferencia | Sí [NV] | Blaze: transferencia a 0,15 US$/GB; precio del almacenamiento por encima de 10 GB no concluyente [NV] | [V\*: 47] |
| OCI Object Storage + CDN | Se puede servir el estático desde un *bucket* (10 GB Always Free) | Sí | OCI no tiene CDN propio equivalente [NV] | [V\*: 30] |

**Recomendación:** Cloudflare (Workers static assets o Pages), con el dominio en Cloudflare DNS.

### 5.2 Backend Quarkus (contenedor de 512 MB a 1 GB)

| Servicio | 512 MB | 1 GB | Notas | Fuente |
|---|---|---|---|---|
| **OCI Ampere A1 Always Free** | 0 € | 0 € | **2 OCPU y 12 GB en total** desde jun-2026. Sin SLA. El *build* de la imagen debe ser arm64 (Quarkus JVM funciona en arm64). | [V-sec: 31] |
| **Hetzner Cloud** (UE, DE/FI) | — | CX23 (2 vCPU, 4 GB): **5,49 €/mes** · CAX11 (Arm, 4 GB): **5,99 €** · CX33 (8 GB): **8,49 €**. IPv4: +0,50 €/mes. | Dos subidas en 2026: 1-abr y 15-jun. Copias: +20 % [NV]. Tráfico incluido [NV]. | [V-sec: 42] |
| **Fly.io** | `shared-cpu-1x` de 512 MB: **3,69 US$/mes** (Ashburn) | 1 GB: **6,70 US$** (Ashburn) o **7,73 US$ en Frankfurt** | Sin capa gratuita, pero las facturas personales por debajo de 5 US$ se condonan. Salida: 0,02 US$/GB en UE y Norteamérica. | [V: 41] |
| Render | Starter [NV] | [NV] | — | [NV] |
| Railway | [NV] | [NV] | — | [NV] |
| Google Cloud Run | Pago por uso con capa gratuita [NV] | [NV] | Con `min-instances=1` se paga 24×7 [NV] | [NV] |
| **AWS App Runner** | — | — | **Cerrado a clientes nuevos desde el 30-abr-2026**; AWS recomienda ECS Express Mode | [V\*: 38] |
| **Azure Container Apps** (Consumption) | Gratis cada mes, por suscripción: **180.000 vCPU-s, 360.000 GiB-s y 2 millones de peticiones** | Una réplica de 0,5 vCPU y 1 GiB 24×7 (≈ 1,31 M vCPU-s y 2,63 M GiB-s) supera la parte gratuita; tarifas [NV] | Tarifa reducida en reposo (*idle*) | [V: 49] |

**Recomendación:**

- **Beta en la ruta Oracle:** A1 Always Free.
- **Producción:** Hetzner CX33 en la UE (relación precio/RAM imbatible; sin servicios gestionados), o Fly.io en Frankfurt si se prefiere PaaS y despliegue con un comando.

Quarkus en modo JVM con 1 GB va sobrado hasta unos 70 peticiones/s en pico (supuesto S6) [NV, a validar con pruebas de carga].

### 5.3 Almacenamiento de objetos (fotos)

| Servicio | Almacenamiento | Salida (*egress*) | Gratis | Fuente |
|---|---|---|---|---|
| **Cloudflare R2** | **0,015 US$/GB-mes** (Infrequent Access: 0,01) | **Gratis** | 10 GB-mes, 1 M operaciones de clase A y 10 M de clase B al mes | [V: 43] |
| OCI Object Storage | Unos 0,0255 US$/GB-mes | 10 TB/mes gratis | 10 GB Standard en Always Free | [V-sec: 35; V\*: 30] |
| Amazon S3 (España, eu-south-2) | **0,023 US$/GB-mes** (primeros 50 TB) | **0,09 US$/GB** tras los 100 GB/mes gratuitos (agregados en todo AWS) | — | [V: 36/37] |
| Backblaze B2 | **6,95 US$/TB-mes** (subió desde 6 US$ el 1-may-2026) | Gratis hasta 3 veces lo almacenado; después, 0,01 US$/GB | 10 GB | [V-sec: 48] |

**Recomendación:** R2, por la salida gratuita y la API compatible con S3, que permite cambiar de proveedor.

### 5.4 Correo transaccional

| Servicio | Gratis | Precio | Fuente |
|---|---|---|---|
| **Amazon SES** (España) | Capa gratuita inicial [NV] | **0,10 US$ por cada 1.000 correos** (0,0001 US$/correo; la lista también muestra un tramo de 0,08 US$/1.000 hasta 10 M). Adjuntos: 0,12 US$/GB. IP dedicada: 24,95 US$/mes. | [V: 37] |
| Brevo | [NV] (históricamente unos 300 correos/día) | [NV] | [NV] |
| Postmark | [NV] | [NV] | [NV] |
| Resend | [NV] | [NV] | [NV] |

**Recomendación:** SES (lo más barato a escala), con la extensión `quarkus-mailer` sobre SMTP de SES [V: `quarkus-mailer` está en el BOM]. Para empezar sin cuenta de AWS sirve el plan gratuito de Brevo o Resend [NV].

### 5.5 Monitorización

| Servicio | Gratis | De pago | Fuente |
|---|---|---|---|
| **Sentry** | Plan **Developer** gratuito (cuotas exactas [NV]) | Los planes de pago incluyen **50.000 errores, 5 GB de logs, 5 M de *spans* y 50 *replays***. Precio base de Team [NV]. Excesos: errores desde 0,00029 US$ (Team, reservado) y logs a 0,50 US$/GB. | [V: 50] |
| Grafana Cloud | Plan Free [NV] | [NV] | [NV] |
| Better Stack | Plan Free (*uptime* + logs) [NV] | [NV] | [NV] |
| Autogestionado | Micrometer + Prometheus y OpenTelemetry (extensiones en el BOM) | — | [V: 18] |

### 5.6 Dominio

| Dominio | Precio aproximado | Fuente |
|---|---|---|
| `.es` | 8–15 €/año [NV] | [NV] |
| `.app` | 15–25 €/año [NV]; exige HTTPS (HSTS precargado) [NV] | [NV] |

### 5.7 Identidad (autenticación)

| Opción | Coste | Pros | Contras | Fuente |
|---|---|---|---|---|
| **Keycloak autogestionado** + `quarkus-oidc` | 0 € de licencia; **unos 1,25 GB de RAM de base** por instancia (con 10.000 sesiones en caché); 1 vCPU por cada 15 inicios de sesión con contraseña por segundo | Estándar OIDC, MFA, inicio de sesión social (Google, Apple), verificación de correo, políticas de contraseña, protección frente a fuerza bruta; Dev Services en Quarkus; sin dependencia de proveedor | Mantenimiento y actualizaciones; más RAM (CX33 en lugar de CX23) | [V: 51, 19] |
| Autenticación propia (`quarkus-security-jpa` + `quarkus-smallrye-jwt`) | 0 € | Mínima, sin servicios extra | Código de seguridad propio (*reset*, verificación, *refresh tokens*, bloqueo, MFA); riesgo alto con datos de salud | [V: extensiones en el BOM, 18] |
| Supabase Auth | Free: **50.000 MAU**. Pro: 100.000 MAU incluidos y después **0,00325 US$/MAU**. | Gestionado | Acoplado a Supabase | [V: 40] |
| Neon Auth | Free: hasta 60.000 MAU por proyecto; Launch: hasta 1 M | Gestionado | Acoplado a Neon | [V: 39] |
| Auth0 / Clerk / Firebase Auth | [NV] | Gestionado y maduro | Coste por MAU y dependencia de proveedor | [NV] |

**Recomendación para el MVP:** Keycloak 26.8.x autogestionado, con `quarkus-oidc` en el backend y el flujo *Authorization Code + PKCE* en Ionic/Capacitor.

- En local se levanta solo con Dev Services.
- En producción comparte VM (8 GB) o va en una CX23 aparte.
- Si se necesita el mínimo absoluto de infraestructura en la beta cerrada, la autenticación propia es aceptable de forma temporal, pero el backend debe validar JWT estándar para poder pasar a Keycloak sin tocar los módulos de negocio.
- Ojo: si la app ofrece inicio de sesión con terceros, la App Store suele exigir "Sign in with Apple" [NV].

---

## 6. Escenarios de coste mensual

### 6.1 Supuestos y fórmulas

| Código | Supuesto | Valor |
|---|---|---|
| S1 | MAU (usuarios activos mensuales) | 30 % de los registrados (U) |
| S2 | Tamaño de BD | `BD_GB = 0,5 + 0,002 × U` (catálogo de alimentos de 0,5 GB más 2 MB por usuario y año: diario, pesos, objetivos e índices) |
| S3 | Fotos almacenadas (acumulado de 12 meses) | `Fotos_GB = 0,024 × MAU` (unas 10 fotos de unos 200 KB por MAU y mes) |
| S4 | Tráfico saliente (API + fotos) | `Egress_GB/mes = 0,021 × MAU` (15 MB de API + 6 MB de fotos) |
| S5 | Correos transaccionales | `Emails/mes = 5 × MAU` |
| S6 | Pico de carga | `RPS_pico = MAU × 0,4 (DAU) × 50 peticiones / 86.400 × 10` |
| S7 | Operaciones en R2 | Clase A = 10 × MAU; clase B = 30 × MAU (siempre dentro de la parte gratuita en estos escenarios) |
| S8 | Horas al mes | 730 |
| S9 | Tipo de cambio | 1 US$ ≈ 0,87 € [NV] |
| S10 | Almacenamiento aprovisionado en RDS | 20 / 20 / 30 / 250 GB (con margen) |

| Magnitud | Beta (50) | 1.000 | 10.000 | 100.000 |
|---|---|---|---|---|
| MAU | 15 | 300 | 3.000 | 30.000 |
| BD (GB) | 0,6 | 2,5 | 20,5 | 200,5 |
| Fotos (GB) | 0,36 | 7,2 | 72 | 720 |
| Salida (GB/mes) | 0,3 | 6,3 | 63 | 630 |
| Correos al mes | 75 | 1.500 | 15.000 | 150.000 |
| Pico (peticiones/s) | 0,03 | 0,7 | 6,9 | 69 |

**Fórmulas de coste:**

- `R2 = max(0, Fotos_GB − 10) × 0,015 US$` [V]
- `SES = Emails × 0,0001 US$` [V]
- `Neon = CU_medio × horas × 0,106 + BD_GB × 0,35` [V]
- `ADB = 2 × 0,336 × 730 + max(20, BD_GB) × 0,1156` [V, tarifa de 2024]
- `RDS = tarifa_h × 730 + GB_aprov × 0,127` [V]
- `Fly = n.º de máquinas × precio_máquina + Egress × 0,02` [V]

### 6.2 Gastos únicos y fijos no ligados a usuarios

| Concepto | Tipo | Importe | Fuente |
|---|---|---|---|
| Ordenador de desarrollo Windows 11 (16 GB mínimo práctico; 32 GB recomendado con emulador Android + Oracle + IDE) | Único, si no se tiene | — | Requisito de 8 GB de Docker [V]; recomendación propia [NV] |
| Docker Desktop | — | 0 € (uso personal o pyme con menos de 250 empleados **y** menos de 10 M US$ de ingresos) | [V: 52] |
| Dominio `.es` o `.app` | Fijo anual | 8–25 €/año (≈ 1–2 €/mes) | [NV] |
| Alta de desarrollador en Google Play | Único (fase móvil) | 25 US$ | [NV] |
| Apple Developer Program | Fijo anual (fase móvil) | 99 US$/año (≈ 7 €/mes) | [NV] |
| Mac para compilar y firmar en iOS (o minutos de CI macOS) | Único o variable (fase móvil) | [NV] | Capacitor exige macOS y Xcode [V: 4] |

### 6.3 Coste mensual por escenario: partidas comunes

Partidas iguales en todas las rutas; las de base de datos y backend están en la sección 6.4.

| Partida | MVP local | Beta (~50) | 1.000 | 10.000 | 100.000 | Tipo |
|---|---|---|---|---|---|---|
| Frontend (Cloudflare) | 0 | 0 | 0 | 0 | 0 | Fijo [V] |
| Fotos (R2) | 0 | 0 | 0 | 0,93 US$ | 10,65 US$ | Variable [V] |
| Correo (SES) | 0 | ≈ 0,01 US$ | 0,15 US$ | 1,50 US$ | 15,00 US$ | Variable [V] |
| Dominio | 0 | ≈ 1 € | ≈ 1 € | ≈ 1 € | ≈ 1 € | Fijo [NV] |
| Monitorización | 0 | 0 (Sentry Developer) | 0 | Sentry Team [NV] | Sentry Team [NV] + Grafana [NV] | Fijo por tramos |
| Identidad (Keycloak autogestionado) | 0 | 0 (cabe en la VM) | 0 | 0 | 0, más RAM en la VM | — |
| **IA** | **ver `integraciones-ia-normativa.md`** | ídem | ídem | ídem | ídem | — |
| **Subtotal común** | **0 €** | **≈ 1 €** | **≈ 1,13 €** | **≈ 3,11 €** | **≈ 23,32 €** | — |

### 6.4 Base de datos y backend por ruta, y total mensual

Importes en € al mes, sin IVA, sin IA y sin Sentry de pago.

| Ruta | MVP local | Beta (~50) | 1.000 | 10.000 | 100.000 |
|---|---|---|---|---|---|
| **O — Oracle en OCI** (Always Free → ADB de pago) | 0 (contenedor Free) | 0 (ADB AF + A1 AF) | 0 (ADB AF + A1 AF; sin SLA) | ADB 2 ECPU: 492,93 US$ ≈ **428,85**; backend en A1 AF: 0 | ADB: 513,74 US$ ≈ **446,95**; backend en A1 AF: 0 (sin alta disponibilidad) |
| **Total ruta O** | **0** | **≈ 1** | **≈ 1** | **≈ 432** | **≈ 470** |
| O′ — Oracle Free en Hetzner | 0 | CX23 5,99 + copias 1,10 [NV] = 7,09 | CX33 8,99 + copias 1,70 [NV] = 10,69 | **No viable** sin licencia (más de 12 GB) | No viable |
| Total ruta O′ | 0 | ≈ 8 | ≈ 12 | — | — |
| O″ — solo BD en AWS RDS Oracle SE2 (el backend tendría que estar en AWS: coste [NV]) | — | 58,75 US$ ≈ 51 | ≈ 51 | 116,23 US$ ≈ **101** | 256,59 US$ ≈ **223** (Multi-AZ: más de 391) |
| **P1 — PostgreSQL autogestionado en Hetzner** | 0 | CX23 + IPv4 5,99 + copias 1,10 [NV] = 7,09 | CX33 + IPv4 8,99 + copias 1,70 [NV] = 10,69 | App CX33 8,99 + BD CX33 8,99 + copias 3,40 [NV] = 21,38 | App 2 × CX33 17,98 + balanceador ≈ 6 [NV] + BD CX43 16,49 + volumen de 260 GB ≈ 13 [NV] + copias ≈ 6,89 [NV] = ≈ 60,36 |
| **Total ruta P1** | **0** | **≈ 8** | **≈ 12** | **≈ 24** | **≈ 84** (unos 26 € son [NV]) |
| **P2 — PostgreSQL gestionado (Neon + Fly.io Frankfurt)** | 0 | Neon Free + Fly 512 MB (factura < 5 US$, se condona) = 0 | Neon 10,55 + Fly 1 GB 7,73 = 18,28 US$ ≈ 15,90 | Neon 45,87 + 2 × Fly 1 GB 15,46 + salida 1,26 = 62,59 US$ ≈ 54,45 | Neon 147,56 + 2 × `shared-cpu-2x` 2 GB ≈ 30,90 (Frankfurt estimado [NV]) + salida 12,60 = 191,06 US$ ≈ 166,22 |
| **Total ruta P2** | **0** | **≈ 1** | **≈ 17** | **≈ 58** | **≈ 190** |
| P3 — solo BD en AWS RDS PostgreSQL | — | 15,68 US$ ≈ 13,64 | ≈ 13,64 | 29,36 US$ ≈ 25,54 (Multi-AZ: 51,10 US$ más almacenamiento) | 167,82 US$ ≈ 146,00 |
| P4 — solo BD en Supabase Pro | — | 0 (Free, pero 500 MB < 0,6 GB → justo) | 25 US$ ≈ 21,75 | 26,56 US$ ≈ 23,11 | 49,06 US$ ≈ 42,68, más cómputo mayor [NV] |

**Coste por usuario** (ruta P1 / ruta O):

- 10.000 registrados: unos 0,0024 € frente a 0,043 € al mes por registrado.
- 100.000 registrados: unos 0,0008 € frente a 0,0047 € al mes por registrado (0,0028 € y 0,016 € por MAU).

**Notas:**

1. En las rutas O y O′ hay que sumar a partir de 10.000 usuarios el coste de un SLA y de copias gestionadas (ADB lo incluye; Oracle Free no).
2. Con 100.000 usuarios conviene tener al menos 2 instancias de backend y una BD con réplica o Multi-AZ. El total de P1 incluye 2 instancias pero no réplica de BD (+16,49 € por una CX43 réplica [V-sec]).
3. Las tarifas *reserved* o *savings plans* de AWS y los compromisos anuales de OCI reducirían estos importes [NV].

---

## 7. Configuración de desarrollo en Windows 11

### 7.1 Requisitos verificados

| Elemento | Requisito | Fuente |
|---|---|---|
| Windows | Windows 11 de 64 bits, **23H2 (build 22631) o posterior**. Docker lo documenta para Enterprise, Pro y Education; Home y Education solo ejecutan contenedores Linux (suficiente para este proyecto). | [V: 52] |
| WSL | **WSL 2.1.5 o posterior** (2.6 o posterior si se usa Enhanced Container Isolation). Instalación con `wsl --install` (Windows 10 2004+ o Windows 11). | [V: 52, 53] |
| Hardware | CPU de 64 bits con SLAT, **8 GB de RAM como mínimo**, virtualización activada en la BIOS/UEFI | [V: 52] |
| Servicio de Windows | *Server* (LanmanServer) activo y en inicio **automático** | [V: 52] |
| Memoria de WSL | Por defecto, **el 50 % de la RAM de Windows**; *swap* del 25 %; `autoMemoryReclaim` y `sparseVhd` en `[experimental]` | [V: 53] |
| **Licencia de Docker Desktop** | Gratis salvo para "grandes empresas" (**más de 250 empleados O más de 10 M US$ de ingresos anuales**), que necesitan suscripción de pago | [V: 52] |
| Oracle Free en contenedor | La BD usa como máximo 2 GB de RAM y 2 hilos [V\*: 27]. Imagen `slim-faststart`: 1,33 GB comprimida (amd64) [V: 26]. Conviene reservar unos 3 GB para el contenedor [NV]. | — |
| Android | Android Studio Otter 2025.2.1 o posterior (Capacitor 8); incluye su propio JDK | [V: 4, 5] |
| iOS | **No se puede compilar en Windows**: hace falta macOS + Xcode 26 o posterior (Capacitor 8) | [V: 4, 5] |

### 7.2 Dimensionamiento recomendado

Estimación propia [NV]:

| RAM del equipo | Viabilidad | Reparto orientativo |
|---|---|---|
| 8 GB | Mínimo de Docker; **insuficiente** para Oracle + Quarkus dev + Angular + IDE + emulador | — |
| **16 GB** | Viable sin emulador Android (o con dispositivo físico) | WSL 8 GB (Oracle unos 3 GB, Quarkus unos 1 GB, Keycloak unos 1,3 GB) |
| **32 GB** | Cómodo, con emulador Android | WSL 12 GB y emulador 4 GB |

### 7.3 Pasos (PowerShell)

```powershell
# 1) WSL2 y distribución Ubuntu (PowerShell como administrador)
wsl --install
wsl --update
wsl --version          # comprobar WSL >= 2.1.5

# 2) Limitar recursos de la VM de WSL: %UserProfile%\.wslconfig
@"
[wsl2]
memory=8GB
processors=4
swap=4GB

[experimental]
autoMemoryReclaim=dropCache
sparseVhd=true
"@ | Set-Content -Path "$env:USERPROFILE\.wslconfig" -Encoding ascii
wsl --shutdown          # aplicar cambios

# 3) Docker Desktop 4.99.x (backend WSL 2) y comprobación
docker version

# 4) Oracle Free para desarrollo, persistente
docker volume create oracle-data
docker run -d --name oracle-free -p 1521:1521 `
  -e ORACLE_PASSWORD=CambiaEsto123 -e APP_USER=fitona -e APP_USER_PASSWORD=CambiaEsto123 `
  -v oracle-data:/opt/oracle/oradata gvenzl/oracle-free:23-slim-faststart

# 5) Herramientas: JDK 25 (Temurin), Maven 3.9.16, Node 26 LTS, Ionic CLI
winget install EclipseAdoptium.Temurin.25.JDK      # identificador del paquete [NV]
node -v                                              # v26.x
npm i -g @angular/cli@22.2.7 @ionic/cli@7.2.1
```

**Notas:**

- Con Quarkus en `mvn quarkus:dev`, si no se configura una URL JDBC, **Dev Services arranca solo** `gvenzl/oracle-free:23-slim-faststart` [V: 19]. El paso 4 solo hace falta si se quiere una BD persistente y compartida entre ejecuciones.
- Las variables `ORACLE_PASSWORD`, `APP_USER` y `APP_USER_PASSWORD` están documentadas en el README de la imagen gvenzl [V: 26].
- Para mejor rendimiento de E/S, conviene guardar los repositorios dentro del sistema de ficheros de WSL (`\\wsl$\Ubuntu\home\…`) y no en `C:\` [NV].
- Para iOS: hace falta un Mac o un servicio de CI con macOS cuando llegue la fase de apps móviles.

---

## 8. Fuentes

Todas las fuentes se consultaron el 18-nov-2026. Entre paréntesis, la URL pública equivalente cuando lo leído fue el repositorio de documentación.

1. Registro npm, consultado con `npm view <paquete> version time dist-tags engines peerDependencies` para `@angular/core`, `@angular/cli`, `@angular/compiler-cli`, `@ionic/angular`, `@ionic/cli`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` y `typescript` — https://registry.npmjs.org/
2. Angular — *Releases / Actively supported versions*: https://github.com/angular/angular/blob/main/adev/src/content/reference/releases.md (https://angular.dev/reference/releases)
3. Ionic — *Support Policy*: https://github.com/ionic-team/ionic-docs/blob/main/docs/reference/support.mdx (https://ionicframework.com/docs/reference/support)
4. Capacitor — *Environment Setup*: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/getting-started/environment-setup.md (https://capacitorjs.com/docs/getting-started/environment-setup)
5. Capacitor — *Updating to 8.0*: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/updating/8-0.md
6. Capacitor — *Updating to 9.0*: https://github.com/ionic-team/capacitor-docs/blob/main/docs/main/updating/9-0.md
7. Node.js — *Previous releases*: https://nodejs.org/en/about/previous-releases
8. Node.js — calendario de versiones: https://github.com/nodejs/Release/blob/main/schedule.json
9. Maven Central — metadatos de `quarkus-bom`: https://repo1.maven.org/maven2/io/quarkus/quarkus-bom/maven-metadata.xml
10. Quarkus — datos de versiones y política LTS: https://github.com/quarkusio/quarkusio.github.io/blob/develop/_data/releases.yaml (https://quarkus.io/releases)
11. Quarkus — `versions.yaml` (JDK 17+, Maven 3.9.6+): https://github.com/quarkusio/quarkusio.github.io/blob/develop/_data/versions.yaml
12. Quarkus 3.40 LTS: https://quarkus.io/blog/quarkus-3-40-released/ (leído en el repositorio `content/posts/2026/2026-09-30-quarkus-3-40-released.adoc`)
13. Quarkus 3.33 LTS: https://quarkus.io/blog/quarkus-3-33-released/
14. Quarkus 3.31 (soporte completo de Java 25): https://quarkus.io/blog/quarkus-3-31-released/
15. Quarkus 4.0.0.Beta1: https://quarkus.io/blog/quarkus-4-0-0-beta1-released/
16. Guía de Flyway en Quarkus (rama 3.40): https://github.com/quarkusio/quarkus/blob/3.40/docs/src/main/asciidoc/flyway.adoc (https://quarkus.io/guides/flyway)
17. POM de `quarkus-flyway-oracle` 3.40.1.2: https://repo1.maven.org/maven2/io/quarkus/quarkus-flyway-oracle/3.40.1.2/quarkus-flyway-oracle-3.40.1.2.pom
18. POM del BOM de Quarkus 3.40.1.2: https://repo1.maven.org/maven2/io/quarkus/quarkus-bom/3.40.1.2/quarkus-bom-3.40.1.2.pom
19. Quarkus `build-parent` (imágenes de Dev Services de Oracle y Keycloak): https://github.com/quarkusio/quarkus/blob/3.40/build-parent/pom.xml
20. Flyway — módulo Oracle (`OracleDatabase.ensureSupported`): https://github.com/flyway/flyway/blob/main/flyway-database/flyway-database-oracle/src/main/java/org/flywaydb/database/oracle/OracleDatabase.java
21. Flyway — licencia Apache 2.0 y versiones de `flyway-database-oracle`: https://github.com/flyway/flyway/blob/main/LICENSE.txt · https://repo1.maven.org/maven2/org/flywaydb/flyway-database-oracle/maven-metadata.xml
22. Redgate — *Database version support* (no se pudo leer directamente): https://documentation.red-gate.com/fd/database-version-support-143754067.html
23. Liquibase — POM 5.0.4 (FSL-1.1-ALv2) y 4.33.0 (Apache 2.0): https://repo1.maven.org/maven2/org/liquibase/liquibase-core/5.0.4/liquibase-core-5.0.4.pom
24. Oracle JDBC en Maven Central: https://repo1.maven.org/maven2/com/oracle/database/jdbc/ojdbc17/maven-metadata.xml
25. Testcontainers — módulo Oracle Free: https://github.com/testcontainers/testcontainers-java/blob/main/docs/modules/databases/oraclefree.md · https://repo1.maven.org/maven2/org/testcontainers/testcontainers-oracle-free/maven-metadata.xml
26. Imagen `gvenzl/oracle-free`: https://github.com/gvenzl/oci-oracle-free · API de Docker Hub: https://hub.docker.com/v2/repositories/gvenzl/oracle-free/tags
27. Oracle AI Database Free (límites) y FAQ: https://www.oracle.com/database/free/ · https://www.oracle.com/database/free/faq/
28. Oracle — *Licensing Restrictions* (Free): https://docs.oracle.com/en/database/oracle/oracle-database/26/xeinw/licensing-restrictions.html
29. Oracle — *Java SE Support Roadmap*: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
30. OCI — *Always Free Resources*: https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm · https://developer.oracle.com/free.html
31. Recorte de A1 en 2026: InfoQ (jul-2026) https://www.infoq.com/news/2026/07/oracle-cloud-free-tier-limits/ · Oracle Customer Connect https://community.oracle.com/customerconnect/discussion/970310/oci-always-free-updated-ampere-a1-compute-allocation
32. OCI — *Always Free Autonomous AI Database*: https://docs.oracle.com/en-us/iaas/Content/GSG/Concepts/alwaysfree.htm · https://docs.oracle.com/iaas/autonomous-database-shared/doc/autonomous-always-free.html
33. Oracle — FAQ de ECPU de Autonomous Database (precios; documento de 2024): https://www.oracle.com/a/ocom/docs/autonomous-database-ecpu-faq.pdf · https://www.oracle.com/autonomous-database/pricing/
34. Oracle — precios de Base Database Service y lista de precios: https://www.oracle.com/database/base-database-service/pricing/ · https://www.oracle.com/cloud/price-list/
35. OCI Object Storage, precios (secundaria): https://oraclelicensingexperts.com/blog/oracle-oci-object-storage-licensing/
36. AWS Price List API — RDS eu-south-2 (publicación del 17-nov-2026): https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/eu-south-2/index.csv
37. AWS Price List API — S3, transferencia de datos y SES eu-south-2: https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/eu-south-2/index.csv · …/AWSDataTransfer/… · …/AmazonSES/…
38. AWS App Runner — *availability change*: https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html
39. Neon — *Plans* (actualizado el 12-nov-2026): https://github.com/neondatabase/website/blob/main/content/docs/introduction/plans.md (https://neon.com/docs/introduction/plans)
40. Supabase — datos de planes: https://github.com/supabase/supabase/blob/master/packages/shared-data/plans.ts (https://supabase.com/pricing)
41. Fly.io — *Resource Pricing* (commit del 16-nov-2026): https://github.com/superfly/docs/blob/main/about/pricing.mdx (https://fly.io/docs/about/pricing/)
42. Hetzner Cloud, precios de 2026 (secundarias): https://cloudtally.eu/hetzner-cloud-prices · https://trackvps.com/hetzner-cloud-pricing · https://northflank.com/blog/hetzner-cloud-server-price-increases
43. Cloudflare R2 — *Pricing*: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/r2/pricing.mdx (https://developers.cloudflare.com/r2/pricing/)
44. Cloudflare Pages — *Limits* · Workers — *Static assets billing*: https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/platform/limits.mdx · https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/static-assets/billing-and-limitations.mdx
45. Vercel — *Fair use guidelines* y precios: https://vercel.com/docs/limits/fair-use-guidelines · https://vercel.com/pricing
46. Netlify, precios de 2026 (secundarias): https://netli.fyi/blog/netlify-free-plan-limits-2026 · https://www.stork.ai/blog/netlify-pricing-2026
47. Firebase — *Pricing*: https://firebase.google.com/pricing
48. Backblaze B2, precios de 2026 (secundaria): https://upstash.com/blog/backblaze-b2-pricing-explained-2026
49. Azure Container Apps — *Billing* (ms.date 09-dic-2025): https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/container-apps/billing.md (https://learn.microsoft.com/azure/container-apps/billing)
50. Sentry — *Pricing*: https://github.com/getsentry/sentry-docs/blob/master/docs/pricing/index.mdx (https://docs.sentry.io/pricing/)
51. Keycloak — versión en Maven Central y dimensionamiento: https://repo1.maven.org/maven2/org/keycloak/keycloak-quarkus-dist/maven-metadata.xml · https://github.com/keycloak/keycloak/blob/main/docs/guides/high-availability/partials/concepts/perf_recommendations.adoc
52. Docker Desktop — instalación en Windows (requisitos y licencia) y notas de versión: https://github.com/docker/docs/blob/main/content/manuals/desktop/setup/install/windows-install.md (https://docs.docker.com/desktop/setup/install/windows-install/) · https://github.com/docker/docs/blob/main/content/manuals/desktop/release-notes.md
53. Microsoft — instalación de WSL y configuración de `.wslconfig`: https://github.com/MicrosoftDocs/WSL/blob/main/WSL/install.md · https://github.com/MicrosoftDocs/WSL/blob/main/WSL/wsl-config.md
54. PostgreSQL — etiquetas del repositorio (`REL_18_7`, `REL_19_0`): https://github.com/postgres/postgres (`git ls-remote --tags`)
55. PgJDBC en Maven Central: https://repo1.maven.org/maven2/org/postgresql/postgresql/maven-metadata.xml
56. Licencia de Oracle Free en producción (secundarias que discrepan entre sí; no usadas como base): https://oraclelicensingexperts.com/blog/oracle-database-free-edition/ · https://redresscompliance.com/oracle-23ai-free-vs-enterprise-edition-feature-gaps
