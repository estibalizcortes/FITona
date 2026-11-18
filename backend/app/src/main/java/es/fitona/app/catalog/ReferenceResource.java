package es.fitona.app.catalog;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

/** Datos de referencia para los formularios: unidades y franjas de comida. */
@Path("/api/v1/reference")
@Produces(MediaType.APPLICATION_JSON)
public class ReferenceResource {

    public record UnitDto(String code, String kind, String singular, String plural) {}

    public record ReferenceDto(List<UnitDto> units, List<Map<String, String>> mealSlots) {}

    @Inject
    UnitCatalog units;

    @GET
    public ReferenceDto get() {
        List<UnitDto> u = units.all().stream().map(i -> new UnitDto(i.spec().code(), i.spec().kind().name(),
                i.singular(), i.plural())).toList();
        List<Map<String, String>> slots = List.of(
                Map.of("code", "BREAKFAST", "name", "Desayuno"),
                Map.of("code", "MID_MORNING", "name", "Media mañana"),
                Map.of("code", "LUNCH", "name", "Comida"),
                Map.of("code", "AFTERNOON_SNACK", "name", "Merienda"),
                Map.of("code", "DINNER", "name", "Cena"),
                Map.of("code", "OTHER", "name", "Otra"));
        return new ReferenceDto(u, slots);
    }
}
