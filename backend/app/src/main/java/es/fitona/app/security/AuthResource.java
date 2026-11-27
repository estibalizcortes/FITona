package es.fitona.app.security;

import jakarta.inject.Inject;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

/** Registro e inicio de sesión (públicos) y cierre de sesión / «quién soy» (con sesión). */
@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public record Credentials(@Size(max = 254) String email, @Size(max = 128) String password) {}

    public record Registration(@Size(max = 254) String email, @Size(max = 128) String password, boolean adult,
                               boolean healthConsent) {}

    @Inject
    AuthService auth;

    @Inject
    CurrentUser user;

    @POST
    @Path("/register")
    public Response register(Registration r) {
        return session(auth.register(r.email(), r.password(), r.adult(), r.healthConsent()), 201);
    }

    @POST
    @Path("/login")
    public Response login(Credentials c) {
        return session(auth.login(c.email(), c.password()), 200);
    }

    @POST
    @Path("/logout")
    @Consumes(MediaType.WILDCARD)
    public Response logout(@HeaderParam("Authorization") String authorization) {
        String t = AuthFilter.bearer(authorization);
        if (t != null) auth.logout(t);
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    public Map<String, Object> me() {
        return Map.of("userId", user.id().toString(), "email", String.valueOf(auth.emailOf(user.id())));
    }

    private static Response session(AuthService.Session s, int status) {
        return Response.status(status).entity(Map.of("token", s.token(), "email", s.email())).build();
    }
}
