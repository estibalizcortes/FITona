package es.fitona.app.home;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.diary.DiaryService;
import es.fitona.app.prefs.PreferencesResource;
import es.fitona.app.security.CurrentUser;
import es.fitona.app.work.WorkEntryRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Todo lo que necesita la pantalla principal en UNA petición (antes eran tres): preferencias de la cuenta y un resumen de hoy por módulo.
 * Con el servidor gratuito cada petición cuesta una vuelta de red, otra de comprobación de sesión y otra de CORS, así que juntarlas
 * acorta la apertura. Los datos son de la persona autenticada; las tarjetas de módulos aún no construidos no aparecen.
 */
@Path("/api/v1/home")
@Produces(MediaType.APPLICATION_JSON)
public class HomeResource {

    /** foodKcal/foodEntries: lo registrado en Comida ese día (null si no hay registros); workEntries: registros de Trabajo (0 si no hay). */
    public record Summary(PreferencesResource.Prefs preferences, BigDecimal foodKcal, int foodEntries, int workEntries) {}

    @Inject
    PreferencesResource prefs;

    @Inject
    DiaryService diary;

    @Inject
    WorkEntryRepository work;

    @Inject
    CurrentUser user;

    @GET
    public Summary get(@QueryParam("date") LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        DiaryDto day = diary.day(user.id(), d);
        var kcal = day.entries().isEmpty() ? null : day.totals().nutrients().get("energyKcal");
        return new Summary(prefs.get(), kcal == null ? null : kcal.value(), day.entries().size(), work.onDate(user.id(), d).size());
    }
}
