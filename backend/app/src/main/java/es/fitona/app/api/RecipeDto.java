package es.fitona.app.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RecipeDto(UUID id, String title, String description, BigDecimal servings, Integer prepMinutes,
                        Integer cookMinutes, int version, String completeness, List<IngredientDto> ingredients,
                        List<StepDto> steps, TotalsDto perServing, TotalsDto total) {

    public record IngredientDto(Long variantId, String name, String freeText, BigDecimal quantity, String unitCode,
                                BigDecimal grams, String note) {}

    public record StepDto(int number, String instruction, Integer durationMinutes) {}

    /** Elemento de la lista (sin recalcular): usa los valores guardados al guardar la versión. */
    public record Summary(UUID id, String title, BigDecimal servings, String completeness, BigDecimal energyKcalPerServing,
                          BigDecimal proteinGPerServing, BigDecimal carbsGPerServing, BigDecimal fatGPerServing) {}
}
