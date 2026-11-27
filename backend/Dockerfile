# syntax=docker/dockerfile:1
# Backend FITona: compila dentro de Docker (solo necesitas Docker, no Java ni Maven).
# Contexto de construcción: la raíz del repositorio (ver docker-compose.yml).
ARG MAVEN_IMAGE=maven:3.9-eclipse-temurin-21
ARG JRE_IMAGE=eclipse-temurin:21-jre
# oracle (local) | postgresql (Render + Neon, ver Dockerfile.render). El tipo de base de datos se fija al compilar.
ARG DB_KIND=oracle

FROM ${MAVEN_IMAGE} AS build
ARG DB_KIND
WORKDIR /src
COPY backend/pom.xml backend/pom.xml
COPY backend/nutrition/pom.xml backend/nutrition/pom.xml
COPY backend/app/pom.xml backend/app/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f backend/pom.xml -pl app -am dependency:go-offline
COPY backend backend
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -f backend/pom.xml -pl app -am -DskipTests -Dquarkus.datasource.db-kind=${DB_KIND} package

FROM ${JRE_IMAGE} AS runtime
RUN useradd --system --create-home --uid 10001 fitona
WORKDIR /app
COPY --from=build --chown=fitona /src/backend/app/target/quarkus-app/ /app/
USER fitona
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/quarkus-run.jar"]
