package es.fitona.app.status;

import es.fitona.app.infra.Db;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.lang.management.ManagementFactory;

/**
 * Estado del servidor para que la app distinga «el servidor está despertando» de «la base de datos está despertando».
 * Pública y sin datos de nadie: solo tiempos. Se consulta una vez cuando una carga tarda, no de forma periódica.
 */
@Path("/api/v1/status")
@Produces(MediaType.APPLICATION_JSON)
public class StatusResource {

    /** db: ok | slow (tardó más de 1,5 s, p. ej. Neon despertando) | down. uptimeSeconds: segundos desde el arranque del servidor. */
    public record Status(String api, String db, long dbMs, long uptimeSeconds) {}

    @Inject
    Db db;

    @GET
    public Status get() {
        long t0 = System.nanoTime();
        String state;
        try {
            db.queryOne("SELECT 1" + (db.postgres() ? "" : " FROM DUAL"), ps -> { }, rs -> rs.getInt(1));
            state = (System.nanoTime() - t0) > 1_500_000_000L ? "slow" : "ok";
        } catch (RuntimeException e) {
            state = "down";
        }
        long ms = (System.nanoTime() - t0) / 1_000_000;
        return new Status("up", state, ms, ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
    }
}
