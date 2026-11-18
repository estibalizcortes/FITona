package es.fitona.nutrition;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/** Resultado del cálculo de una comida, receta o día. Inmutable. */
public record NutrientTotals(Map<Nutrient, Total> totals, Quality quality, Precision precision) {

    public NutrientTotals {
        totals = Map.copyOf(totals);
    }

    public Total get(Nutrient n) {
        return totals.getOrDefault(n, Total.UNKNOWN);
    }

    public static NutrientTotals empty() {
        return new NutrientTotals(Map.of(), Quality.VERIFIED, Precision.EXACT);
    }

    /** Suma varios resultados. Fiabilidad y precisión resultantes: la peor de las partes. */
    public static NutrientTotals sum(List<NutrientTotals> parts) {
        if (parts.isEmpty()) return empty();
        EnumMap<Nutrient, Total> acc = new EnumMap<>(Nutrient.class);
        // Las partes sin cifras (NONE, p. ej. texto libre) no aportan valores: no degradan la fiabilidad de las demás.
        // Su ausencia ya queda reflejada en Total.complete=false. Solo si TODAS carecen de cifras el resultado es NONE.
        Quality q = null;
        Precision p = null;
        for (NutrientTotals part : parts) {
            if (part.quality == Quality.NONE) continue;
            q = q == null ? part.quality : Quality.worst(q, part.quality);
            p = p == null ? part.precision : Precision.worst(p, part.precision);
        }
        if (q == null) {
            q = Quality.NONE;
            p = Precision.ROUGH;
        }
        for (Nutrient n : Nutrient.values()) {
            BigDecimal sum = null;
            boolean complete = true;
            for (NutrientTotals part : parts) {
                Total t = part.get(n);
                if (t.known()) sum = sum == null ? t.value() : sum.add(t.value());
                if (!t.known() || !t.complete()) complete = false;
            }
            acc.put(n, new Total(sum, sum != null && complete));
        }
        return new NutrientTotals(acc, q, p);
    }

    /** Multiplica por un factor (p. ej. raciones o fracción de una olla). La fiabilidad no mejora. */
    public NutrientTotals scale(BigDecimal factor) {
        if (factor.signum() < 0) throw new IllegalArgumentException("El factor no puede ser negativo");
        EnumMap<Nutrient, Total> m = new EnumMap<>(Nutrient.class);
        totals.forEach((n, t) -> m.put(n, t.known() ? new Total(t.value().multiply(factor), t.complete()) : t));
        return new NutrientTotals(m, quality, precision);
    }
}
