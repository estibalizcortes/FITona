package es.fitona.app.recipes;

import es.fitona.app.api.RecipeDto;
import es.fitona.app.api.RecipeRequest;
import es.fitona.app.api.TotalsDto;
import es.fitona.app.catalog.FoodRecord;
import es.fitona.app.catalog.FoodRepository;
import es.fitona.app.catalog.UnitCatalog;
import es.fitona.nutrition.Conversion;
import es.fitona.nutrition.Intake;
import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.NutrientTotals;
import es.fitona.nutrition.NutritionCalculator;
import es.fitona.nutrition.PortionConverter;
import es.fitona.nutrition.Precision;
import es.fitona.nutrition.Quality;
import es.fitona.nutrition.RecipeCalculator;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class RecipeService {

    public record PerServing(String title, UUID versionId, NutrientTotals totals) {}

    private record Computed(NutrientTotals total, String completeness, List<RecipeRepository.IngredientRow> rows) {}

    @Inject
    RecipeRepository repo;

    @Inject
    FoodRepository foods;

    @Inject
    UnitCatalog units;

    @Transactional
    public RecipeDto create(UUID user, RecipeRequest req) {
        UUID recipeId = UUID.randomUUID();
        repo.insertRecipe(user, recipeId);
        saveVersion(user, recipeId, 1, req);
        return get(user, recipeId);
    }

    @Transactional
    public RecipeDto update(UUID user, UUID recipeId, RecipeRequest req) {
        RecipeRecord cur = repo.find(user, recipeId);
        if (cur == null) throw new NotFoundException();
        saveVersion(user, recipeId, repo.nextVersionNumber(recipeId), req);
        return get(user, recipeId);
    }

    @Transactional
    public void delete(UUID user, UUID recipeId) {
        if (!repo.softDelete(user, recipeId)) throw new NotFoundException();
    }

    public List<RecipeDto.Summary> list(UUID user) {
        return repo.list(user);
    }

    public RecipeDto get(UUID user, UUID recipeId) {
        RecipeRecord r = repo.find(user, recipeId);
        if (r == null) throw new NotFoundException();
        Computed c = compute(user, r.ingredients().stream().map(i -> new Input(i.variantId(), i.freeText(), i.quantity(),
                i.unitCode(), i.note())).toList());
        NutrientTotals perServing = RecipeCalculator.perServing(c.total(), r.servings());
        List<RecipeDto.IngredientDto> ing = new ArrayList<>();
        for (RecipeRecord.Ingredient i : r.ingredients()) {
            String name = i.freeText();
            if (i.variantId() != null) {
                FoodRecord f = foods.findVariant(user, i.variantId());
                name = f == null ? "(alimento eliminado)" : f.displayName();
            }
            ing.add(new RecipeDto.IngredientDto(i.variantId(), name, i.freeText(), i.quantity(), i.unitCode(), i.grams(),
                    i.note()));
        }
        return new RecipeDto(r.id(), r.title(), r.description(), r.servings(), r.prepMinutes(), r.cookMinutes(),
                r.versionNumber(), c.completeness(), ing,
                r.steps().stream().map(s -> new RecipeDto.StepDto(s.number(), s.instruction(), s.durationMinutes())).toList(),
                TotalsDto.from(perServing), TotalsDto.from(c.total()));
    }

    /** Nutrición por ración calculada en este momento con el catálogo vigente (para registrar en el diario). */
    public PerServing perServing(UUID user, UUID recipeId) {
        RecipeRecord r = repo.find(user, recipeId);
        if (r == null) throw new NotFoundException();
        Computed c = compute(user, r.ingredients().stream().map(i -> new Input(i.variantId(), i.freeText(), i.quantity(),
                i.unitCode(), i.note())).toList());
        return new PerServing(r.title(), r.versionId(), RecipeCalculator.perServing(c.total(), r.servings()));
    }

    private void saveVersion(UUID user, UUID recipeId, int number, RecipeRequest req) {
        List<Input> inputs = req.ingredients().stream().map(i -> new Input(i.variantId(), i.freeText(), i.quantity(),
                i.unitCode(), i.note())).toList();
        Computed c = compute(user, inputs);
        NutrientTotals per = RecipeCalculator.perServing(c.total(), req.servings());
        RecipeRepository.Snapshot snap = new RecipeRepository.Snapshot(c.completeness(), val(per, Nutrient.ENERGY_KCAL),
                val(per, Nutrient.PROTEIN_G), val(per, Nutrient.CARBS_G), val(per, Nutrient.FAT_G),
                val(per, Nutrient.FIBER_G));
        List<RecipeRecord.Step> steps = new ArrayList<>();
        if (req.steps() != null) {
            int n = 0;
            for (RecipeRequest.Step s : req.steps()) steps.add(new RecipeRecord.Step(++n, s.instruction().trim(), s.durationMinutes()));
        }
        repo.insertVersion(user, recipeId, UUID.randomUUID(), number, req.title().trim(), req.description(),
                req.servings(), req.prepMinutes(), req.cookMinutes(), snap, c.rows(), steps);
    }

    private static BigDecimal val(NutrientTotals t, Nutrient n) {
        return t.get(n).known() ? t.get(n).value().setScale(2, RoundingMode.HALF_UP) : null;
    }

    private record Input(Long variantId, String freeText, BigDecimal quantity, String unitCode, String note) {}

    private Computed compute(UUID user, List<Input> inputs) {
        List<NutrientTotals> parts = new ArrayList<>();
        List<RecipeRepository.IngredientRow> rows = new ArrayList<>();
        boolean anyResolved = false;
        boolean anyUnresolved = false;
        for (Input i : inputs) {
            boolean hasFood = i.variantId() != null;
            boolean hasText = i.freeText() != null && !i.freeText().isBlank();
            if (hasFood == hasText) {
                throw new IllegalArgumentException("Cada ingrediente debe indicar un alimento o un texto libre (no ambos).");
            }
            if (hasText) {
                parts.add(new NutrientTotals(Map.of(), Quality.NONE, Precision.ROUGH));
                rows.add(new RecipeRepository.IngredientRow(null, i.freeText().trim(), i.quantity(), i.unitCode(), null,
                        i.note()));
                anyUnresolved = true;
                continue;
            }
            if (i.quantity() == null) throw new IllegalArgumentException("Indica la cantidad de cada ingrediente.");
            FoodRecord f = foods.findVariant(user, i.variantId());
            if (f == null) throw new NotFoundException();
            UnitCatalog.UnitInfo unit = units.get(i.unitCode());
            Conversion cv;
            try {
                cv = PortionConverter.toGrams(i.quantity(), unit.spec(), List.of(), f.portions(), f.densityGPerMl());
            } catch (es.fitona.nutrition.UnknownPortionException e) {
                throw new es.fitona.nutrition.UnknownPortionException("No sé cuántos gramos son «" + unit.plural() + "» de "
                        + f.name() + ". Usa gramos o añade esa medida al alimento.");
            }
            parts.add(NutritionCalculator.forIntake(new Intake(f.profile(), cv.grams(), cv.precision())));
            rows.add(new RecipeRepository.IngredientRow(i.variantId(), null, i.quantity(), unit.spec().code(),
                    cv.grams().setScale(2, RoundingMode.HALF_UP), i.note()));
            anyResolved = true;
        }
        NutrientTotals total = NutrientTotals.sum(parts);
        String completeness = !anyResolved ? "NONE"
                : (anyUnresolved || !total.get(Nutrient.ENERGY_KCAL).complete()) ? "PARTIAL" : "COMPLETE";
        return new Computed(total, completeness, rows);
    }
}
