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
 * Autenticación de las peticiones a /api: token «Authorization: Bearer» de una sesión abierta con correo y contraseña
 * (/api/v1/auth/login). Solo con fitona.auth.dev-enabled=true se acepta además la cabecera X-Dev-User (UUID), que NO es
 * seguridad real y no debe activarse en un servidor público.
 */
public class AuthFilter {

    private static final Logger LOG = Logger.getLogger(AuthFilter.class);

    @ConfigProperty(name = "fitona.auth.dev-enabled", defaultValue = "false")
    boolean devEnabled;

    @Inject
    CurrentUser currentUser;

    @Inject
    Db db;

    @Inject
    AuthService auth;

    static String bearer(String header) {
        return header != null && header.regionMatches(true, 0, "Bearer ", 0, 7) ? header.substring(7).trim() : null;
    }

    @ServerRequestFilter
    public Response filter(ContainerRequestContext ctx) {
        String path = ctx.getUriInfo().getPath();
        if (path.endsWith("/api/v1/auth/register") || path.endsWith("/api/v1/auth/login") || path.endsWith("/api/v1/status")) return null;
        String token = bearer(ctx.getHeaderString("Authorization"));
        if (token != null) {
            UUID id = auth.userForToken(token);
            if (id == null) return problem(401, "Sesión caducada", "Vuelve a iniciar sesión.");
            currentUser.set(id);
            return null;
        }
        if (!devEnabled) return problem(401, "No autenticado", "Inicia sesión para continuar.");
        String header = ctx.getHeaderString("X-Dev-User");
        UUID id;
        try {
            id = UUID.fromString(header == null ? "" : header.trim());
        } catch (IllegalArgumentException e) {
            return problem(401, "No autenticado", "Falta la sesión (o la cabecera X-Dev-User en modo desarrollo).");
        }
        ensureUser(id);
        currentUser.set(id);
        return null;
    }

    private void ensureUser(UUID id) {
        try {
            db.update("INSERT INTO APP_USERS (ID, AUTH_SUBJECT, ADULT_CONFIRMED_AT) "
                            + "SELECT ?, ?, CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM APP_USERS WHERE ID = ?)",
                    ps -> {
                        ps.setBytes(1, Ids.toRaw(id));
                        ps.setString(2, "dev:" + id);
                        ps.setBytes(3, Ids.toRaw(id));
                    });
        } catch (Db.DataAccessException e) {
            // Carrera entre dos peticiones simultáneas de la misma persona nueva: la clave única ya existe.
            if (!e.isUnique()) {
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
