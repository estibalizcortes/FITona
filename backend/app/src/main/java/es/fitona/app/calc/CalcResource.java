package es.fitona.app.calc;

import es.fitona.app.api.ItemRequest;
import es.fitona.app.api.TotalsDto;
import es.fitona.app.security.CurrentUser;
import es.fitona.nutrition.NutrientTotals;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.math.BigDecimal;
import java.util.List;

/** Calculadora: nutrientes de una lista de elementos SIN guardar nada. */
@Path("/api/v1/calc")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalcResource {

    public record CalcRequest(@NotEmpty @jakarta.validation.constraints.Size(max = 50) @Valid List<ItemRequest> items) {}

    public record CalcItem(String kind, String displayName, BigDecimal grams, TotalsDto totals) {}

    public record CalcResponse(List<CalcItem> items, TotalsDto total) {}

    @Inject
    NutritionResolver resolver;

    @Inject
    CurrentUser user;

    @POST
    public CalcResponse calc(@Valid CalcRequest req) {
        List<ResolvedItem> resolved = req.items().stream().map(i -> resolver.resolve(user.id(), i)).toList();
        List<CalcItem> items = resolved.stream().map(r -> new CalcItem(r.kind(), r.displayName(), r.grams(),
                TotalsDto.from(r.totals()))).toList();
        NutrientTotals total = NutrientTotals.sum(resolved.stream().map(ResolvedItem::totals).toList());
        return new CalcResponse(items, TotalsDto.from(total));
    }
}
