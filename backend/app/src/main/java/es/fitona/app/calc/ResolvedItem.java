package es.fitona.app.calc;

import es.fitona.nutrition.NutrientTotals;
import java.math.BigDecimal;
import java.util.UUID;

/** Elemento ya resuelto: cantidades en gramos y nutrientes calculados por el motor. */
public record ResolvedItem(String kind, String displayName, Long variantId, Long profileId, UUID recipeId,
                           UUID recipeVersionId, BigDecimal quantity, String unitCode, BigDecimal grams,
                           BigDecimal servings, NutrientTotals totals) {}
