package es.fitona.app.recipes;

import es.fitona.app.api.RecipeDto;
import es.fitona.app.api.RecipeRequest;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/recipes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RecipeResource {

    @Inject
    RecipeService service;

    @Inject
    CurrentUser user;

    @GET
    public List<RecipeDto.Summary> list() {
        return service.list(user.id());
    }

    @GET
    @Path("/{id}")
    public RecipeDto get(@PathParam("id") UUID id) {
        return service.get(user.id(), id);
    }

    @POST
    public Response create(@Valid RecipeRequest req) {
        RecipeDto r = service.create(user.id(), req);
        return Response.created(URI.create("/api/v1/recipes/" + r.id())).entity(r).build();
    }

    @PUT
    @Path("/{id}")
    public RecipeDto update(@PathParam("id") UUID id, @Valid RecipeRequest req) {
        return service.update(user.id(), id, req);
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") UUID id) {
        service.delete(user.id(), id);
        return Response.noContent().build();
    }
}
