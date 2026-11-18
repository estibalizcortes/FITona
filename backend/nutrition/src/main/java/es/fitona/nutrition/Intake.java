package es.fitona.nutrition;

import java.math.BigDecimal;

/** Una cantidad de un alimento en gramos, con la precisión con que se conoce. */
public record Intake(NutrientProfile profile, BigDecimal grams, Precision precision) {
    public Intake {
        if (grams == null || grams.signum() < 0) throw new IllegalArgumentException("Los gramos no pueden ser negativos");
    }
}
