package es.fitona.nutrition;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;

/**
 * Convierte cantidades a gramos. Reglas:
 * <ul>
 *   <li>MASS: exacta (factor a gramos).</li>
 *   <li>VOLUME: requiere densidad del alimento; precisión APPROXIMATE.</li>
 *   <li>HOUSEHOLD: requiere una medida del alimento (o personal de la persona, que tiene prioridad);
 *       la precisión es la de la medida.</li>
 * </ul>
 * Si no se puede convertir se lanza {@link UnknownPortionException}: nunca se inventan gramos.
 */
public final class PortionConverter {

    private static final MathContext MC = MathContext.DECIMAL64;

    private PortionConverter() {}

    /**
     * @param personalPortions medidas personales («mi vaso»), con prioridad sobre las generales
     * @param foodPortions     medidas caseras del alimento
     * @param densityGPerMl    densidad del alimento, o null si no se conoce
     */
    public static Conversion toGrams(BigDecimal quantity, UnitSpec unit, List<Portion> personalPortions,
                                     List<Portion> foodPortions, BigDecimal densityGPerMl) {
        if (quantity == null || quantity.signum() < 0) throw new IllegalArgumentException("Cantidad negativa");
        switch (unit.kind()) {
            case MASS:
                return new Conversion(quantity.multiply(unit.baseFactor(), MC), Precision.EXACT);
            case VOLUME:
                if (densityGPerMl == null) {
                    throw new UnknownPortionException("Sin densidad para convertir " + unit.code() + " a gramos");
                }
                return new Conversion(quantity.multiply(unit.baseFactor(), MC).multiply(densityGPerMl, MC),
                        Precision.APPROXIMATE);
            case HOUSEHOLD:
            default:
                Portion p = find(unit.code(), personalPortions);
                if (p == null) p = find(unit.code(), foodPortions);
                if (p == null) {
                    throw new UnknownPortionException("Sin medida casera «" + unit.code() + "» para este alimento");
                }
                return new Conversion(quantity.multiply(p.grams(), MC), p.precision());
        }
    }

    private static Portion find(String code, List<Portion> portions) {
        for (Portion p : portions) {
            if (p.unitCode().equals(code)) return p;
        }
        return null;
    }
}
