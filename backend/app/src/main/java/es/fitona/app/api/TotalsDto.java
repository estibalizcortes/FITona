package es.fitona.app.api;

import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.NutrientTotals;
import es.fitona.nutrition.Total;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Totales para mostrar. {@code value} redondeado solo para presentación (energía a 0 decimales, resto a 1);
 * {@code complete=false} indica que faltan datos de algún componente (el valor es un mínimo).
 */
public record TotalsDto(Map<String, Value> nutrients, String quality, String precision) {

    public record Value(BigDecimal value, boolean complete) {}

    public static TotalsDto from(NutrientTotals t) {
        Map<String, Value> m = new LinkedHashMap<>();
        for (Nutrient n : Nutrient.values()) {
            Total total = t.get(n);
            BigDecimal v = null;
            if (total.known()) {
                v = total.value().setScale(n == Nutrient.ENERGY_KCAL ? 0 : 1, RoundingMode.HALF_UP);
            }
            m.put(camel(n), new Value(v, total.known() && total.complete()));
        }
        return new TotalsDto(m, t.quality().name(), t.precision().name());
    }

    static String camel(Nutrient n) {
        return switch (n) {
            case ENERGY_KCAL -> "energyKcal";
            case PROTEIN_G -> "proteinG";
            case CARBS_G -> "carbsG";
            case SUGARS_G -> "sugarsG";
            case FAT_G -> "fatG";
            case SAT_FAT_G -> "satFatG";
            case FIBER_G -> "fiberG";
            case SALT_G -> "saltG";
            case ALCOHOL_G -> "alcoholG";
        };
    }
}
