package es.fitona.app.plan;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** Plan del día (módulo Comida): opciones elegibles, menú sugerido y «añadir al diario». */
@Path("/api/v1/plan")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PlanResource {

    @Inject
    PlanService service;

    @Inject
    CurrentUser user;

    @GET
    @Path("/options")
    public List<PlanService.Candidate> options() {
        return service.candidates(user.id());
    }

    @POST
    @Path("/suggest")
    public PlanService.Plan suggest(@Valid PlanRequests.Suggest req) {
        return service.suggest(user.id(), req);
    }

    @POST
    @Path("/log")
    public Response log(@Valid PlanRequests.Log req) {
        DiaryDto.EntryDto e = service.log(user.id(), req);
        return Response.status(Response.Status.CREATED).entity(e).build();
    }
}
