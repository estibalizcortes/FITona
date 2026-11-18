package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.MathContext;

/**
 * Conversión entre estados de preparación (VARIANT_CONVERSIONS): peso_destino = peso_origen × factor.
 * Evita confundir 100 g de arroz crudo con 100 g de arroz cocido: el perfil de cada estado se aplica
 * a su propio peso.
 */
public final class CookingYield {
    private CookingYield() {}

    public static BigDecimal convertWeight(BigDecimal weightG, BigDecimal weightFactor) {
        if (weightFactor == null || weightFactor.signum() <= 0) throw new IllegalArgumentException("Factor inválido");
        return weightG.multiply(weightFactor, MathContext.DECIMAL64);
    }
}
