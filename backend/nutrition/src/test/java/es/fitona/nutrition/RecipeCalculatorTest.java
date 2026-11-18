package es.fitona.nutrition;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class RecipeCalculatorTest {

    private static BigDecimal bd(String s) {
        return new BigDecimal(s);
    }

    private static NutrientTotals lentilStew() {
        NutrientProfile lentils = NutrientProfile.of(Quality.AVERAGE, "116", "9", "20", "0.4");
        NutrientProfile oil = NutrientProfile.of(Quality.VERIFIED, "884", "0", "0", "100");
        return RecipeCalculator.total(List.of(
                new Intake(lentils, bd("1000"), Precision.EXACT),
                new Intake(oil, bd("50"), Precision.APPROXIMATE)));
    }

    @Test
    void totalAddsIngredients() {
        NutrientTotals t = lentilStew();
        assertThat(t.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("1602");
        assertThat(t.precision()).isEqualTo(Precision.APPROXIMATE);
        assertThat(t.quality()).isEqualTo(Quality.AVERAGE);
    }

    @Test
    void perServingDividesTheTotal() {
        NutrientTotals perServing = RecipeCalculator.perServing(lentilStew(), bd("4"));
        assertThat(perServing.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("400.5");
    }

    @Test
    void fractionOfPotDowngradesToEstimateAndApproximate() {
        NutrientTotals fifth = RecipeCalculator.fractionOfPot(lentilStew(), 1, 5);
        assertThat(fifth.get(Nutrient.ENERGY_KCAL).value()).isEqualByComparingTo("320.4");
        assertThat(fifth.quality()).isEqualTo(Quality.ESTIMATE);
        assertThat(fifth.precision()).isEqualTo(Precision.APPROXIMATE);
    }

    @Test
    void scalingNeverImprovesReliability() {
        NutrientTotals base = lentilStew();
        assertThat(base.scale(bd("2")).quality()).isEqualTo(base.quality());
    }

    @Test
    void cookingYieldDoesNotMixRawAndCooked() {
        // 100 g de arroz crudo -> 250 g cocido; 130 kcal/100 g cocido frente a 360 kcal/100 g crudo.
        NutrientProfile raw = NutrientProfile.of(Quality.AVERAGE, "360", "7", "79", "0.6");
        NutrientProfile cooked = NutrientProfile.of(Quality.AVERAGE, "130", "2.7", "28", "0.3");
        BigDecimal cookedWeight = CookingYield.convertWeight(bd("100"), bd("2.5"));
        BigDecimal kcalRaw = NutritionCalculator.forIntake(new Intake(raw, bd("100"), Precision.EXACT))
                .get(Nutrient.ENERGY_KCAL).value();
        BigDecimal kcalCooked = NutritionCalculator.forIntake(new Intake(cooked, cookedWeight, Precision.APPROXIMATE))
                .get(Nutrient.ENERGY_KCAL).value();
        assertThat(cookedWeight).isEqualByComparingTo("250");
        assertThat(kcalRaw).isEqualByComparingTo("360");
        assertThat(kcalCooked).isEqualByComparingTo("325");
        // 100 g de crudo y 100 g de cocido NO son equivalentes.
        assertThat(kcalRaw).isNotEqualByComparingTo(
                NutritionCalculator.forIntake(new Intake(cooked, bd("100"), Precision.EXACT)).get(Nutrient.ENERGY_KCAL).value());
    }
}
