package es.fitona.nutrition;

import java.math.BigDecimal;

/**
 * Energía calculada con los factores de conversión del anexo XIV del Reglamento (UE) 1169/2011
 * (kcal/g): proteínas 4, hidratos disponibles 4, grasas 9, fibra 2, alcohol 7, polialcoholes 2,4.
 * Los hidratos son los DISPONIBLES (sin fibra). Los valores desconocidos no se suman (no se asumen 0):
 * el resultado es un mínimo si faltaba alguno, y se indica con {@code complete=false}.
 */
public final class EnergyFactors {

    public static final BigDecimal PROTEIN = new BigDecimal("4");
    public static final BigDecimal CARBS = new BigDecimal("4");
    public static final BigDecimal FAT = new BigDecimal("9");
    public static final BigDecimal FIBER = new BigDecimal("2");
    public static final BigDecimal ALCOHOL = new BigDecimal("7");

    public record Result(BigDecimal kcal, boolean complete) {}

    private EnergyFactors() {}

    /** @return null si no se conoce ningún macronutriente */
    public static Result euKcal(BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG, BigDecimal fiberG,
                                BigDecimal alcoholG) {
        BigDecimal sum = null;
        boolean complete = true;
        BigDecimal[] grams = {proteinG, carbsG, fatG};
        BigDecimal[] factors = {PROTEIN, CARBS, FAT};
        for (int i = 0; i < grams.length; i++) {
            if (grams[i] == null) {
                complete = false;
            } else {
                BigDecimal part = grams[i].multiply(factors[i]);
                sum = sum == null ? part : sum.add(part);
            }
        }
        if (sum == null) return null;
        if (fiberG != null) sum = sum.add(fiberG.multiply(FIBER));
        if (alcoholG != null) sum = sum.add(alcoholG.multiply(ALCOHOL));
        return new Result(sum, complete);
    }
}
