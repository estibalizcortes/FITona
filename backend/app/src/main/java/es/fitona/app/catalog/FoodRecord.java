package es.fitona.app.catalog;

import es.fitona.nutrition.NutrientProfile;
import es.fitona.nutrition.Portion;
import java.math.BigDecimal;
import java.util.List;

/** Variante de alimento tal como la necesita el cálculo. */
public record FoodRecord(long variantId, long foodId, String name, String variantLabel, NutrientProfile profile,
                         long profileId, String basis, BigDecimal densityGPerMl, List<Portion> portions,
                         boolean editable, String source) {

    public String displayName() {
        return variantLabel == null || variantLabel.isBlank() ? name : name + " (" + variantLabel + ")";
    }
}
