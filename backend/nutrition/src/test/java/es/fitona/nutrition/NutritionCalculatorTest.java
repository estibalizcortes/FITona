package es.fitona.nutrition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class NutritionCalculatorTest {

    private static BigDecimal bd(String s) {
        return new BigDecimal(s);
    }

    @Test
    void scalesPer100gToTheGivenGrams() {
        NutrientProfile rice = NutrientProfile.of(Quality.AVERAGE, "130", "2.7", "28", "0.3");
        NutrientTotals t = NutritionCalculator.forIntake(new Intake(rice, bd("150"), Precision.EXACT));
        assertThat(t.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("195");
        assertThat(t.get(Nutrient.CARBS_G).value()).isEqualByComparingTo("42");
        assertThat(t.quality()).isEqualTo(Quality.AVERAGE);
    }

    @Test
    void unknownNutrientStaysUnknownNeverZero() {
        NutrientProfile p = NutrientProfile.of(Quality.VERIFIED, "100", null, null, null);
        NutrientTotals t = NutritionCalculator.forIntake(new Intake(p, bd("200"), Precision.EXACT));
        assertThat(t.get(Nutrient.PROTEIN_G).known()).isFalse();
        assertThat(t.get(Nutrient.PROTEIN_G).value()).isNull();
        assertThat(t.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("200");
    }

    @Test
    void sumMarksTotalIncompleteWhenAnyComponentLacksTheNutrient() {
        NutrientProfile withProtein = NutrientProfile.of(Quality.VERIFIED, "100", "10", "0", "0");
        NutrientProfile withoutProtein = NutrientProfile.of(Quality.VERIFIED, "50", null, "0", "0");
        NutrientTotals t = NutritionCalculator.forIntakes(List.of(
                new Intake(withProtein, bd("100"), Precision.EXACT),
                new Intake(withoutProtein, bd("100"), Precision.EXACT)));
        assertThat(t.get(Nutrient.ENERGY_KCAL).complete()).isTrue();
        assertThat(t.get(Nutrient.PROTEIN_G).value()).isEqualByComparingTo("10");
        assertThat(t.get(Nutrient.PROTEIN_G).complete()).as("el total de proteína es un mínimo").isFalse();
    }

    @Test
    void combinedQualityAndPrecisionAreTheWorstOfTheParts() {
        NutrientProfile good = NutrientProfile.of(Quality.VERIFIED, "100", "1", "1", "1");
        NutrientProfile estimate = NutrientProfile.of(Quality.ESTIMATE, "100", "1", "1", "1");
        NutrientTotals t = NutritionCalculator.forIntakes(List.of(
                new Intake(good, bd("100"), Precision.EXACT),
                new Intake(estimate, bd("100"), Precision.ROUGH)));
        assertThat(t.quality()).isEqualTo(Quality.ESTIMATE);
        assertThat(t.precision()).isEqualTo(Precision.ROUGH);
    }

    @Test
    void roundingIsOnlyForDisplay() {
        NutrientProfile p = NutrientProfile.of(Quality.AVERAGE, "33.333", "0", "0", "0");
        NutrientTotals t = NutritionCalculator.forIntake(new Intake(p, bd("100"), Precision.EXACT));
        assertThat(t.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("33.333");
        assertThat(Rounding.kcal(t.get(Nutrient.ENERGY_KCAL).value())).isEqualByComparingTo("33");
        assertThat(Rounding.kcal(bd("2.5"))).isEqualByComparingTo("3");
    }

    @Test
    void rejectsNegativeValues() {
        assertThatThrownBy(() -> NutrientProfile.of(Quality.AVERAGE, "-1", null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Intake(NutrientProfile.of(Quality.AVERAGE, "1", null, null, null), bd("-5"),
                Precision.EXACT)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void profileCannotClaimNoQuality() {
        assertThatThrownBy(() -> NutrientProfile.of(Quality.NONE, "1", null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void partsWithoutFiguresDoNotDegradeQualityButMarkTotalsIncomplete() {
        NutrientProfile p = NutrientProfile.of(Quality.CUSTOM, "100", "1", "1", "1");
        NutrientTotals food = NutritionCalculator.forIntake(new Intake(p, bd("100"), Precision.EXACT));
        NutrientTotals freeText = new NutrientTotals(java.util.Map.of(), Quality.NONE, Precision.ROUGH);
        NutrientTotals t = NutrientTotals.sum(List.of(food, freeText));
        assertThat(t.quality()).isEqualTo(Quality.CUSTOM);
        assertThat(t.precision()).isEqualTo(Precision.EXACT);
        assertThat(t.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("100");
        assertThat(t.get(Nutrient.ENERGY_KCAL).complete()).isFalse();
        assertThat(NutrientTotals.sum(List.of(freeText, freeText)).quality()).isEqualTo(Quality.NONE);
    }
}
