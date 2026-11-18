package es.fitona.nutrition;

import java.math.BigDecimal;

/** Resultado de convertir una cantidad a gramos, con su precisión. */
public record Conversion(BigDecimal grams, Precision precision) {}
