package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Redondeo SOLO para mostrar. Los cálculos internos conservan la precisión completa. */
public final class Rounding {
    private Rounding() {}

    public static BigDecimal kcal(BigDecimal v) {
        return v.setScale(0, RoundingMode.HALF_UP);
    }

    public static BigDecimal grams(BigDecimal v) {
        return v.setScale(1, RoundingMode.HALF_UP);
    }
}
