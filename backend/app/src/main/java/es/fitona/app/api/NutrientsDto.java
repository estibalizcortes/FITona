package es.fitona.app.api;

import es.fitona.nutrition.Nutrient;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

/** Valores nutricionales por 100 g/ml. Un campo ausente (null) significa DESCONOCIDO, nunca 0. */
public record NutrientsDto(
        @DecimalMin("0") @DecimalMax("900") BigDecimal energyKcal,
        @DecimalMin("0") @DecimalMax("100") BigDecimal proteinG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal carbsG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal sugarsG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal fatG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal satFatG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal fiberG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal saltG,
        @DecimalMin("0") @DecimalMax("100") BigDecimal alcoholG) {

    public Map<Nutrient, BigDecimal> toMap() {
        Map<Nutrient, BigDecimal> m = new EnumMap<>(Nutrient.class);
        put(m, Nutrient.ENERGY_KCAL, energyKcal);
        put(m, Nutrient.PROTEIN_G, proteinG);
        put(m, Nutrient.CARBS_G, carbsG);
        put(m, Nutrient.SUGARS_G, sugarsG);
        put(m, Nutrient.FAT_G, fatG);
        put(m, Nutrient.SAT_FAT_G, satFatG);
        put(m, Nutrient.FIBER_G, fiberG);
        put(m, Nutrient.SALT_G, saltG);
        put(m, Nutrient.ALCOHOL_G, alcoholG);
        return m;
    }

    public static NutrientsDto fromMap(Map<Nutrient, BigDecimal> m) {
        return new NutrientsDto(m.get(Nutrient.ENERGY_KCAL), m.get(Nutrient.PROTEIN_G), m.get(Nutrient.CARBS_G),
                m.get(Nutrient.SUGARS_G), m.get(Nutrient.FAT_G), m.get(Nutrient.SAT_FAT_G), m.get(Nutrient.FIBER_G),
                m.get(Nutrient.SALT_G), m.get(Nutrient.ALCOHOL_G));
    }

    private static void put(Map<Nutrient, BigDecimal> m, Nutrient n, BigDecimal v) {
        if (v != null) m.put(n, v);
    }
}
