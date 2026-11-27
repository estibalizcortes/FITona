#!/bin/bash
# Genera el archivo de clases compartidas (AppCDS) de la app durante `docker build` (sin base de datos: el pool no conecta al arrancar).
# Con él el arranque en frío baja ~30 % en 0,1 CPU (medido). Si falla, la imagen sigue funcionando sin él.
cd /app || exit 0
export PORT=18099 FITONA_DB_KIND=postgresql FITONA_DB_URL=jdbc:postgresql://localhost:1/x FITONA_DB_USER=u FITONA_DB_PASSWORD=p FITONA_DB_INIT_SQL="SELECT 1"
java -XX:ArchiveClassesAtExit=/app/app.jsa -XX:TieredStopAtLevel=1 -XX:+UseSerialGC -jar /app/quarkus-run.jar >/tmp/cds-train.log 2>&1 &
PID=$!
for _ in $(seq 1 180); do grep -q "started in" /tmp/cds-train.log 2>/dev/null && break; sleep 1; done
# unas peticiones para cargar también las clases HTTP/JSON/seguridad más usadas
for path in /q/health/live /api/v1/diary /api/v1/auth/me; do
  exec 3<>/dev/tcp/127.0.0.1/18099 && printf 'GET %s HTTP/1.0\r\nHost: x\r\n\r\n' "$path" >&3 && cat <&3 >/dev/null; exec 3>&-
done
kill -TERM $PID 2>/dev/null; wait $PID 2>/dev/null
rm -f /tmp/cds-train.log
test -s /app/app.jsa && echo "AppCDS generado: $(du -h /app/app.jsa | cut -f1)" || echo "AppCDS no generado (se arrancará sin él)"
exit 0
