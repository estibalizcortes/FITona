package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.EnumMap;
import java.util.List;

/**
 * Cálculo determinista de nutrientes. No redondea (el redondeo es solo de presentación, ver {@link Rounding}).
 */
public final class NutritionCalculator {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final MathContext MC = MathContext.DECIMAL64;

    private NutritionCalculator() {}

    public static NutrientTotals forIntake(Intake intake) {
        BigDecimal factor = intake.grams().divide(HUNDRED, MC);
        EnumMap<Nutrient, Total> m = new EnumMap<>(Nutrient.class);
        for (Nutrient n : Nutrient.values()) {
            m.put(n, intake.profile().get(n)
                    .map(v -> new Total(v.multiply(factor, MC), true))
                    .orElse(Total.UNKNOWN));
        }
        return new NutrientTotals(m, intake.profile().quality(), intake.precision());
    }

    public static NutrientTotals forIntakes(List<Intake> intakes) {
        return NutrientTotals.sum(intakes.stream().map(NutritionCalculator::forIntake).toList());
    }
}
