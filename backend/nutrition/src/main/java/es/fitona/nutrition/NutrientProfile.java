package es.fitona.nutrition;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;

/**
 * Perfil nutricional por 100 g (o 100 ml). Un valor ausente significa DESCONOCIDO, nunca cero.
 */
public record NutrientProfile(Map<Nutrient, BigDecimal> per100, Quality quality) {

    public NutrientProfile {
        EnumMap<Nutrient, BigDecimal> copy = new EnumMap<>(Nutrient.class);
        per100.forEach((n, v) -> {
            if (v == null) return;
            if (v.signum() < 0) throw new IllegalArgumentException("Valor negativo para " + n);
            copy.put(n, v);
        });
        per100 = Map.copyOf(copy);
        if (quality == null || quality == Quality.NONE) {
            throw new IllegalArgumentException("Un perfil con valores debe tener una fiabilidad distinta de NONE");
        }
    }

    public Optional<BigDecimal> get(Nutrient n) {
        return Optional.ofNullable(per100.get(n));
    }

    /** Constructor cómodo para pruebas y cargas: kcal, proteína, hidratos, grasa (el resto, desconocido). */
    public static NutrientProfile of(Quality quality, String kcal, String protein, String carbs, String fat) {
        EnumMap<Nutrient, BigDecimal> m = new EnumMap<>(Nutrient.class);
        if (kcal != null) m.put(Nutrient.ENERGY_KCAL, new BigDecimal(kcal));
        if (protein != null) m.put(Nutrient.PROTEIN_G, new BigDecimal(protein));
        if (carbs != null) m.put(Nutrient.CARBS_G, new BigDecimal(carbs));
        if (fat != null) m.put(Nutrient.FAT_G, new BigDecimal(fat));
        return new NutrientProfile(m, quality);
    }
}
