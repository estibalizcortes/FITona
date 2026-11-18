package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Comprueba si un objetivo de kcal y macros es coherente con los factores 4/4/9. NUNCA modifica nada:
 * devuelve la diferencia y las opciones para que decida la persona.
 */
public final class EnergyCoherence {

    private static final BigDecimal FOUR = BigDecimal.valueOf(4);
    private static final BigDecimal NINE = BigDecimal.valueOf(9);

    public enum Option { KEEP_BOTH, ENERGY_FROM_MACROS, ADJUST_CARBS, ADJUST_FAT, ADJUST_PROTEIN }

    /** Una opción de resolución. {@code gramsDelta} solo aplica a los ajustes de un macro. */
    public record Choice(Option option, BigDecimal gramsDelta) {}

    public record Result(BigDecimal targetKcal, BigDecimal calculatedKcal, BigDecimal differenceKcal,
                         boolean coherent, List<Choice> choices) {}

    private EnergyCoherence() {}

    public static BigDecimal atwater(BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG) {
        return proteinG.multiply(FOUR).add(carbsG.multiply(FOUR)).add(fatG.multiply(NINE));
    }

    /**
     * @param toleranceKcal diferencia absoluta máxima que se considera coherente (configurable, p. ej. 10)
     */
    public static Result check(BigDecimal targetKcal, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG,
                               BigDecimal toleranceKcal) {
        BigDecimal calc = atwater(proteinG, carbsG, fatG);
        BigDecimal diff = targetKcal.subtract(calc);
        boolean coherent = diff.abs().compareTo(toleranceKcal) <= 0;
        List<Choice> choices = new ArrayList<>();
        if (!coherent) {
            choices.add(new Choice(Option.KEEP_BOTH, BigDecimal.ZERO));
            choices.add(new Choice(Option.ENERGY_FROM_MACROS, BigDecimal.ZERO));
            choices.add(new Choice(Option.ADJUST_CARBS, diff.divide(FOUR, 1, RoundingMode.HALF_UP)));
            choices.add(new Choice(Option.ADJUST_FAT, diff.divide(NINE, 1, RoundingMode.HALF_UP)));
            choices.add(new Choice(Option.ADJUST_PROTEIN, diff.divide(FOUR, 1, RoundingMode.HALF_UP)));
        }
        return new Result(targetKcal, calc, diff, coherent, List.copyOf(choices));
    }
}
