package es.fitona.nutrition;

import java.math.BigDecimal;

/** Medida casera de un alimento: 1 unidad = {@code grams} g, con su precisión (p. ej. «un puñado» = ROUGH). */
public record Portion(String unitCode, BigDecimal grams, Precision precision) {
    public Portion {
        if (grams == null || grams.signum() <= 0) throw new IllegalArgumentException("La porción debe pesar más de 0 g");
    }
}
