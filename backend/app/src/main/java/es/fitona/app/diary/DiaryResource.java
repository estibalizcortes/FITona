package es.fitona.app.diary;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.api.DiaryEntryRequest;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;

@Path("/api/v1/diary")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DiaryResource {

    @Inject
    DiaryService service;

    @Inject
    CurrentUser user;

    @GET
    public DiaryDto day(@QueryParam("date") String date) {
        LocalDate d;
        try {
            d = date == null || date.isBlank() ? LocalDate.now() : LocalDate.parse(date);
        } catch (java.time.format.DateTimeParseException e) {
            throw new IllegalArgumentException("Fecha no válida (use AAAA-MM-DD).");
        }
        return service.day(user.id(), d);
    }

    @POST
    @Path("/entries")
    public Response create(@Valid DiaryEntryRequest req) {
        DiaryDto.EntryDto e = service.create(user.id(), req);
        return Response.created(URI.create("/api/v1/diary/entries/" + e.id())).entity(e).build();
    }

    @GET
    @Path("/entries/{id}")
    public DiaryDto.EntryDto get(@PathParam("id") UUID id) {
        return service.get(user.id(), id);
    }

    @DELETE
    @Path("/entries/{id}")
    public Response delete(@PathParam("id") UUID id) {
        service.delete(user.id(), id);
        return Response.noContent().build();
    }
}
