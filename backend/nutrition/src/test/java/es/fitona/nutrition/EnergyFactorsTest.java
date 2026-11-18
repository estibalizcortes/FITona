package es.fitona.nutrition;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class EnergyFactorsTest {

    private static BigDecimal bd(String s) {
        return s == null ? null : new BigDecimal(s);
    }

    @Test
    void computesWithEuFactorsIncludingFiberAndAlcohol() {
        EnergyFactors.Result r = EnergyFactors.euKcal(bd("10"), bd("20"), bd("5"), bd("3"), bd("2"));
        // 40 + 80 + 45 + 6 + 14
        assertThat(r.kcal()).isEqualByComparingTo("185");
        assertThat(r.complete()).isTrue();
    }

    @Test
    void unknownMacroIsNotAssumedZeroAndMarksResultIncomplete() {
        EnergyFactors.Result r = EnergyFactors.euKcal(bd("10"), null, bd("5"), null, null);
        assertThat(r.kcal()).isEqualByComparingTo("85");
        assertThat(r.complete()).isFalse();
    }

    @Test
    void noMacrosMeansNoResult() {
        assertThat(EnergyFactors.euKcal(null, null, null, bd("3"), null)).isNull();
    }
}
