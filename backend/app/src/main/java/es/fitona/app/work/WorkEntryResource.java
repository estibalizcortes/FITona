package es.fitona.app.work;

import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

/** Módulo Trabajo: notas, resúmenes y textos/prompts por fecha. Cada persona ve solo lo suyo (404 ante lo ajeno). */
@Path("/api/v1/work")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WorkEntryResource {

    public record EntryDto(UUID id, LocalDate date, String kind, String title, String body, int length, boolean truncated,
                           java.time.Instant createdAt, java.time.Instant updatedAt) {}

    public record CalendarDay(LocalDate date, int count) {}

    @Inject
    WorkEntryRepository repo;

    @Inject
    CurrentUser user;

    private static EntryDto dto(WorkEntryRepository.Row r) {
        return new EntryDto(r.id(), r.date(), r.kind(), r.title(), r.body(), r.length(), r.body() != null && r.body().length() < r.length(),
                r.createdAt(), r.updatedAt());
    }

    /** Registros de un día (vista previa del texto). */
    @GET
    @Path("/entries")
    public List<EntryDto> day(@QueryParam("date") String date) {
        return repo.onDate(user.id(), parseDate(date)).stream().map(WorkEntryResource::dto).toList();
    }

    /** Historial: más recientes primero; q busca en título y texto; kind = NOTE|SUMMARY|PROMPT. */
    @GET
    @Path("/entries/search")
    public List<EntryDto> search(@QueryParam("q") String q, @QueryParam("kind") String kind,
                                 @QueryParam("limit") @DefaultValue("30") int limit, @QueryParam("offset") @DefaultValue("0") int offset) {
        if (kind != null && !kind.isBlank() && !kind.matches("NOTE|SUMMARY|PROMPT")) throw new IllegalArgumentException("Tipo no válido.");
        int lim = Math.max(1, Math.min(limit, 100));
        return repo.search(user.id(), q, kind, lim, Math.max(0, offset)).stream().map(WorkEntryResource::dto).toList();
    }

    /** Días del mes con registros (para el calendario): month = AAAA-MM. */
    @GET
    @Path("/calendar")
    public List<CalendarDay> calendar(@QueryParam("month") String month) {
        YearMonth ym;
        try {
            ym = YearMonth.parse(month);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new IllegalArgumentException("El mes debe tener el formato AAAA-MM.");
        }
        return repo.monthCounts(user.id(), ym.atDay(1), ym.plusMonths(1).atDay(1)).stream()
                .map(c -> new CalendarDay(c.date(), c.count())).toList();
    }

    @GET
    @Path("/entries/{id}")
    public EntryDto get(@PathParam("id") UUID id) {
        WorkEntryRepository.Row r = repo.find(user.id(), id);
        if (r == null) throw new NotFoundException();
        return dto(r);
    }

    @POST
    @Path("/entries")
    public Response create(@Valid WorkEntryRequest req) {
        UUID id = repo.insert(user.id(), req);
        return Response.created(URI.create("/api/v1/work/entries/" + id)).entity(dto(repo.find(user.id(), id))).build();
    }

    @PUT
    @Path("/entries/{id}")
    public EntryDto update(@PathParam("id") UUID id, @Valid WorkEntryRequest req) {
        if (!repo.update(user.id(), id, req)) throw new NotFoundException();
        return dto(repo.find(user.id(), id));
    }

    @DELETE
    @Path("/entries/{id}")
    public Response delete(@PathParam("id") UUID id) {
        if (!repo.delete(user.id(), id)) throw new NotFoundException();
        return Response.noContent().build();
    }

    private static LocalDate parseDate(String s) {
        try {
            return LocalDate.parse(s);
        } catch (DateTimeParseException | NullPointerException e) {
            throw new IllegalArgumentException("La fecha debe tener el formato AAAA-MM-DD.");
        }
    }
}
