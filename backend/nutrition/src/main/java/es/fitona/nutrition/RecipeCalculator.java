package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;

/** Nutrición de recetas: total, por ración y fracción de la olla. */
public final class RecipeCalculator {

    private static final MathContext MC = MathContext.DECIMAL64;

    private RecipeCalculator() {}

    /** Total de la receta: suma de ingredientes. */
    public static NutrientTotals total(List<Intake> ingredients) {
        return NutritionCalculator.forIntakes(ingredients);
    }

    /** Una ración de una receta de {@code servings} raciones. */
    public static NutrientTotals perServing(NutrientTotals total, BigDecimal servings) {
        if (servings == null || servings.signum() <= 0) throw new IllegalArgumentException("Raciones inválidas");
        return total.scale(BigDecimal.ONE.divide(servings, MC));
    }

    /**
     * Una fracción de la olla («me serví 1/5»). Como la cantidad real no se pesa, la precisión del resultado
     * es como mínimo APPROXIMATE y la fiabilidad como mínimo ESTIMATE.
     */
    public static NutrientTotals fractionOfPot(NutrientTotals total, int numerator, int denominator) {
        if (numerator < 0 || denominator <= 0) throw new IllegalArgumentException("Fracción inválida");
        NutrientTotals scaled = total.scale(BigDecimal.valueOf(numerator).divide(BigDecimal.valueOf(denominator), MC));
        return new NutrientTotals(scaled.totals(), Quality.worst(scaled.quality(), Quality.ESTIMATE),
                Precision.worst(scaled.precision(), Precision.APPROXIMATE));
    }
}
