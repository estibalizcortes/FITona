package es.fitona.app.recipes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RecipeRecord(UUID id, UUID versionId, int versionNumber, String title, String description,
                           BigDecimal servings, Integer prepMinutes, Integer cookMinutes, List<Ingredient> ingredients,
                           List<Step> steps) {

    public record Ingredient(Long variantId, String freeText, BigDecimal quantity, String unitCode, BigDecimal grams,
                             String note) {}

    public record Step(int number, String instruction, Integer durationMinutes) {}
}
