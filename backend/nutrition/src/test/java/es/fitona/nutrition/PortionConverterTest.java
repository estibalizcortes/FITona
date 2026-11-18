package es.fitona.nutrition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class PortionConverterTest {

    private static final UnitSpec G = new UnitSpec("G", UnitKind.MASS, BigDecimal.ONE);
    private static final UnitSpec KG = new UnitSpec("KG", UnitKind.MASS, new BigDecimal("1000"));
    private static final UnitSpec ML = new UnitSpec("ML", UnitKind.VOLUME, BigDecimal.ONE);
    private static final UnitSpec L = new UnitSpec("L", UnitKind.VOLUME, new BigDecimal("1000"));
    private static final UnitSpec GLASS = new UnitSpec("GLASS", UnitKind.HOUSEHOLD, null);
    private static final UnitSpec UNIT = new UnitSpec("UNIT", UnitKind.HOUSEHOLD, null);

    @Test
    void massIsExact() {
        Conversion c = PortionConverter.toGrams(new BigDecimal("1.5"), KG, List.of(), List.of(), null);
        assertThat(c.grams()).isEqualByComparingTo("1500");
        assertThat(c.precision()).isEqualTo(Precision.EXACT);
    }

    @Test
    void volumeNeedsDensityAndIsApproximate() {
        Conversion c = PortionConverter.toGrams(new BigDecimal("0.25"), L, List.of(), List.of(), new BigDecimal("1.03"));
        assertThat(c.grams()).isEqualByComparingTo("257.5");
        assertThat(c.precision()).isEqualTo(Precision.APPROXIMATE);
        assertThatThrownBy(() -> PortionConverter.toGrams(BigDecimal.ONE, ML, List.of(), List.of(), null))
                .isInstanceOf(UnknownPortionException.class);
    }

    @Test
    void householdUsesFoodPortionAndKeepsItsPrecision() {
        List<Portion> egg = List.of(new Portion("UNIT", new BigDecimal("60"), Precision.APPROXIMATE));
        Conversion c = PortionConverter.toGrams(new BigDecimal("2"), UNIT, List.of(), egg, null);
        assertThat(c.grams()).isEqualByComparingTo("120");
        assertThat(c.precision()).isEqualTo(Precision.APPROXIMATE);
    }

    @Test
    void personalPortionTakesPriorityOverTheGeneralOne() {
        List<Portion> general = List.of(new Portion("GLASS", new BigDecimal("200"), Precision.APPROXIMATE));
        List<Portion> mine = List.of(new Portion("GLASS", new BigDecimal("250"), Precision.EXACT));
        Conversion c = PortionConverter.toGrams(BigDecimal.ONE, GLASS, mine, general, null);
        assertThat(c.grams()).isEqualByComparingTo("250");
        assertThat(c.precision()).isEqualTo(Precision.EXACT);
    }

    @Test
    void neverInventsGramsForAnUnknownHouseholdMeasure() {
        assertThatThrownBy(() -> PortionConverter.toGrams(BigDecimal.ONE, GLASS, List.of(), List.of(), null))
                .isInstanceOf(UnknownPortionException.class);
    }

    @Test
    void massAndVolumeUnitsRequirePositiveFactor() {
        assertThatThrownBy(() -> new UnitSpec("X", UnitKind.MASS, null)).isInstanceOf(IllegalArgumentException.class);
        assertThat(G.baseFactor()).isEqualByComparingTo("1");
    }
}
