package es.fitona.app.goal;

import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/nutrition/profile")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NutritionGoalResource {

    @Inject
    NutritionGoalService service;

    @Inject
    CurrentUser user;

    /** 204 si la persona aún no ha rellenado su perfil. */
    @GET
    public Response get() {
        NutritionGoalService.Dto d = service.get(user.id());
        return d == null ? Response.noContent().build() : Response.ok(d).build();
    }

    @PUT
    public NutritionGoalService.Dto put(@Valid NutritionGoalRequest req) {
        return service.save(user.id(), req);
    }
}
