package es.fitona.app.calc;

import es.fitona.app.api.ItemRequest;
import es.fitona.app.catalog.FoodRecord;
import es.fitona.app.catalog.FoodRepository;
import es.fitona.app.catalog.UnitCatalog;
import es.fitona.app.recipes.RecipeService;
import es.fitona.nutrition.Conversion;
import es.fitona.nutrition.Intake;
import es.fitona.nutrition.NutrientTotals;
import es.fitona.nutrition.NutritionCalculator;
import es.fitona.nutrition.PortionConverter;
import es.fitona.nutrition.Precision;
import es.fitona.nutrition.Quality;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Traduce peticiones de cantidad a nutrientes usando SOLO el motor determinista (nunca la IA). */
@ApplicationScoped
public class NutritionResolver {

    @Inject
    FoodRepository foods;

    @Inject
    UnitCatalog units;

    @Inject
    RecipeService recipes;

    public ResolvedItem resolve(UUID user, ItemRequest r) {
        int given = (r.variantId() != null ? 1 : 0) + (r.recipeId() != null ? 1 : 0)
                + (r.freeText() != null && !r.freeText().isBlank() ? 1 : 0);
        if (given != 1) {
            throw new IllegalArgumentException("Cada elemento debe indicar exactamente uno de: alimento, receta o texto libre.");
        }
        if (r.freeText() != null && !r.freeText().isBlank()) return freeText(r.freeText().trim());
        if (r.recipeId() != null) return recipe(user, r);
        return food(user, r);
    }

    /** Texto sin cifras («lentejas de mi madre»): no inventa calorías. */
    static ResolvedItem freeText(String text) {
        NutrientTotals none = new NutrientTotals(Map.of(), Quality.NONE, Precision.ROUGH);
        return new ResolvedItem("FREE_TEXT", text, null, null, null, null, null, null, null, null, none);
    }

    private ResolvedItem food(UUID user, ItemRequest r) {
        FoodRecord f = foods.findVariant(user, r.variantId());
        if (f == null) throw new NotFoundException();
        if (!f.hasNutrients()) {
            throw new es.fitona.app.infra.NoNutrientDataException("«" + f.name() + "» aún no tiene datos nutricionales. "
                    + "Ponle tus valores o apúntalo sin cifras.");
        }
        if (r.quantity() == null) throw new IllegalArgumentException("Indica la cantidad.");
        UnitCatalog.UnitInfo unit = units.get(r.unitCode());
        Conversion c;
        try {
            c = PortionConverter.toGrams(r.quantity(), unit.spec(), List.of(), f.portions(), f.densityGPerMl());
        } catch (es.fitona.nutrition.UnknownPortionException e) {
            throw new es.fitona.nutrition.UnknownPortionException("No sé cuántos gramos son «" + unit.plural() + "» de "
                    + f.name() + ". Usa gramos o añade esa medida al alimento.");
        }
        NutrientTotals totals = NutritionCalculator.forIntake(new Intake(f.profile(), c.grams(), c.precision()));
        return new ResolvedItem("FOOD", f.displayName(), f.variantId(), f.profileId(), null, null, r.quantity(),
                unit.spec().code(), c.grams(), null, totals);
    }

    private ResolvedItem recipe(UUID user, ItemRequest r) {
        BigDecimal servings = r.servings() == null ? BigDecimal.ONE : r.servings();
        if (servings.signum() <= 0) throw new IllegalArgumentException("Las raciones deben ser mayores que 0.");
        RecipeService.PerServing ps = recipes.perServing(user, r.recipeId());
        return new ResolvedItem("RECIPE", ps.title(), null, null, r.recipeId(), ps.versionId(), null, null, null,
                servings, ps.totals().scale(servings));
    }
}
