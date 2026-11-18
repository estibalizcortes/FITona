package es.fitona.app.catalog;

import es.fitona.app.api.FoodDto;
import es.fitona.app.api.FoodRequest;
import es.fitona.app.api.FoodResponse;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.util.List;

@Path("/api/v1/foods")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FoodResource {

    @Inject
    FoodService service;

    @Inject
    CurrentUser user;

    @GET
    public List<FoodDto> search(@QueryParam("q") String q, @QueryParam("limit") @DefaultValue("20") int limit) {
        return service.search(user.id(), q, limit);
    }

    @GET
    @Path("/{variantId}")
    public FoodDto get(@PathParam("variantId") long variantId) {
        return service.get(user.id(), variantId);
    }

    @POST
    public Response create(@Valid FoodRequest req) {
        FoodResponse r = service.create(user.id(), req);
        return Response.created(URI.create("/api/v1/foods/" + r.food().variantId())).entity(r).build();
    }

    @PUT
    @Path("/{variantId}")
    public FoodResponse update(@PathParam("variantId") long variantId, @Valid FoodRequest req) {
        return service.update(user.id(), variantId, req);
    }

    @DELETE
    @Path("/{variantId}")
    public Response delete(@PathParam("variantId") long variantId) {
        service.delete(user.id(), variantId);
        return Response.noContent().build();
    }
}
