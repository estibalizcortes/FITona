package es.fitona.nutrition;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class EnergyCoherenceTest {

    private static BigDecimal bd(String s) {
        return new BigDecimal(s);
    }

    /** Ejemplo del enunciado: 1.864 kcal, 164 g de proteína, 66 g de grasa, 149 g de hidratos. */
    @Test
    void detectsThe18KcalDifferenceOfTheBriefExample() {
        EnergyCoherence.Result r = EnergyCoherence.check(bd("1864"), bd("164"), bd("149"), bd("66"), bd("10"));
        assertThat(r.calculatedKcal()).isEqualByComparingTo("1846");
        assertThat(r.differenceKcal()).isEqualByComparingTo("18");
        assertThat(r.coherent()).isFalse();
        assertThat(r.choices()).extracting(EnergyCoherence.Choice::option).containsExactly(
                EnergyCoherence.Option.KEEP_BOTH, EnergyCoherence.Option.ENERGY_FROM_MACROS,
                EnergyCoherence.Option.ADJUST_CARBS, EnergyCoherence.Option.ADJUST_FAT,
                EnergyCoherence.Option.ADJUST_PROTEIN);
        assertThat(delta(r, EnergyCoherence.Option.ADJUST_CARBS)).isEqualByComparingTo("4.5");
        assertThat(delta(r, EnergyCoherence.Option.ADJUST_FAT)).isEqualByComparingTo("2.0");
        assertThat(delta(r, EnergyCoherence.Option.ADJUST_PROTEIN)).isEqualByComparingTo("4.5");
    }

    @Test
    void withinToleranceIsCoherentAndOffersNoChoices() {
        EnergyCoherence.Result r = EnergyCoherence.check(bd("1864"), bd("164"), bd("149"), bd("66"), bd("20"));
        assertThat(r.coherent()).isTrue();
        assertThat(r.choices()).isEmpty();
    }

    @Test
    void doesNotMutateAnything() {
        BigDecimal target = bd("1864");
        EnergyCoherence.check(target, bd("164"), bd("149"), bd("66"), bd("10"));
        assertThat(target).isEqualByComparingTo("1864");
    }

    private static BigDecimal delta(EnergyCoherence.Result r, EnergyCoherence.Option o) {
        return r.choices().stream().filter(c -> c.option() == o).findFirst().orElseThrow().gramsDelta();
    }
}
