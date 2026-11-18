package es.fitona.app.security;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;
import java.util.UUID;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;

/**
 * AUTENTICACIÓN DE DESARROLLO. No es seguridad real: cualquiera que conozca un UUID puede actuar como esa persona.
 * Solo se activa con fitona.auth.dev-enabled=true. La autenticación real (OIDC/Keycloak) está pendiente (ADR-004).
 * Sirve para demostrar y probar el aislamiento por persona: cada UUID ve únicamente sus datos.
 */
public class DevAuthFilter {

    private static final Logger LOG = Logger.getLogger(DevAuthFilter.class);

    @ConfigProperty(name = "fitona.auth.dev-enabled", defaultValue = "false")
    boolean devEnabled;

    @Inject
    CurrentUser currentUser;

    @Inject
    Db db;

    @ServerRequestFilter
    public Response filter(ContainerRequestContext ctx) {
        if (!devEnabled) {
            return problem(401, "Autenticación no disponible", "La autenticación real aún no está implementada.");
        }
        String header = ctx.getHeaderString("X-Dev-User");
        UUID id;
        try {
            id = UUID.fromString(header == null ? "" : header.trim());
        } catch (IllegalArgumentException e) {
            return problem(401, "No autenticado", "Falta la cabecera X-Dev-User con un UUID válido.");
        }
        ensureUser(id);
        currentUser.set(id);
        return null;
    }

    private void ensureUser(UUID id) {
        try {
            db.update("INSERT INTO APP_USERS (ID, AUTH_SUBJECT, ADULT_CONFIRMED_AT) "
                            + "SELECT ?, ?, SYSTIMESTAMP FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM APP_USERS WHERE ID = ?)",
                    ps -> {
                        ps.setBytes(1, Ids.toRaw(id));
                        ps.setString(2, "dev:" + id);
                        ps.setBytes(3, Ids.toRaw(id));
                    });
        } catch (Db.DataAccessException e) {
            // Carrera entre dos peticiones simultáneas de la misma persona nueva: la clave única ya existe.
            if (e.errorCode() != 1) {
                LOG.error("No se pudo crear la persona de desarrollo", e);
                throw e;
            }
        }
    }

    private static Response problem(int status, String title, String detail) {
        return Response.status(status).type(MediaType.APPLICATION_JSON)
                .entity(Map.of("type", "about:blank", "title", title, "status", status, "detail", detail)).build();
    }
}
