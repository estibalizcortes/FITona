package es.fitona.nutrition;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import es.fitona.nutrition.EnergyTarget.DailyActivity;
import es.fitona.nutrition.EnergyTarget.JobType;
import es.fitona.nutrition.EnergyTarget.Mode;
import es.fitona.nutrition.EnergyTarget.Profile;
import es.fitona.nutrition.EnergyTarget.Sex;
import org.junit.jupiter.api.Test;

class EnergyTargetTest {

    private static Profile p(Sex sex, int age, double h, double w, double tw, DailyActivity a, JobType j, double sport, Mode m) {
        return new Profile(sex, age, h, w, tw, a, j, sport, m);
    }

    @Test
    void mifflinStJeorBasalAndMaintenanceMatchHandCalculation() {
        // mujer 30 a, 165 cm, 65 kg: 10*65 + 6.25*165 - 5*30 - 161 = 1370,25 -> 1370
        var r = EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 65, 65, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN));
        assertEquals(1370, r.bmr());
        assertEquals(1640, r.maintenance()); // 1370,25 * 1,2 = 1644,3 -> 1640
        assertEquals(1640, r.target());
        assertEquals(0, r.deficit());
        // hombre 40 a, 180 cm, 80 kg: 800 + 1125 - 200 + 5 = 1730
        assertEquals(1730, EnergyTarget.compute(p(Sex.MALE, 40, 180, 80, 80, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)).bmr());
    }

    @Test
    void jobDailyActivityAndSportRaiseMaintenance() {
        var base = EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 65, 65, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)).maintenance();
        var more = EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 65, 65, DailyActivity.MODERATE, JobType.ON_FEET, 3, Mode.MAINTAIN)).maintenance();
        // PAL 1,4 -> 1918 + deporte 3 h * 5 * 65 / 7 = 139 -> ~2060
        assertEquals(2060, more);
        assertTrue(more > base);
    }

    @Test
    void deficitIsModerateRoundedAndNeverAboveMaintenance() {
        var r = EnergyTarget.compute(p(Sex.MALE, 40, 180, 90, 80, DailyActivity.MODERATE, JobType.DESK, 2, Mode.DEFICIT));
        assertEquals((int) (Math.round(r.maintenance() * 0.85 / 10.0) * 10), r.target());
        assertEquals(r.maintenance() - r.target(), r.deficit());
        assertTrue(r.target() < r.maintenance());
        assertEquals(0, r.target() % 10);
    }

    @Test
    void safetyFloorsApplyToTheDeficit() {
        // mantenimiento 1300: el 85 % (1105) queda bajo el suelo de 1200 -> se queda en 1200
        var r = EnergyTarget.compute(p(Sex.FEMALE, 55, 155, 55, 50, DailyActivity.LOW, JobType.DESK, 0, Mode.DEFICIT));
        assertEquals(1300, r.maintenance());
        assertTrue(r.notes().contains("FLOOR_APPLIED"));
        assertEquals(1200, r.target());
        // mantenimiento ya por debajo del suelo: no se rebaja nunca (objetivo = mantenimiento)
        var small = EnergyTarget.compute(p(Sex.FEMALE, 60, 150, 50, 45, DailyActivity.LOW, JobType.DESK, 0, Mode.DEFICIT));
        assertEquals(small.maintenance(), small.target());
    }

    @Test
    void noDeficitWhenUnderweightOrTargetIsNotLower() {
        var low = EnergyTarget.compute(p(Sex.FEMALE, 25, 170, 50, 48, DailyActivity.LOW, JobType.DESK, 0, Mode.DEFICIT)); // IMC 17,3
        assertTrue(low.notes().contains("LOW_BMI_NO_DEFICIT"));
        assertEquals(low.maintenance(), low.target());
        var up = EnergyTarget.compute(p(Sex.MALE, 30, 180, 75, 80, DailyActivity.LOW, JobType.DESK, 0, Mode.DEFICIT));
        assertTrue(up.notes().contains("TARGET_NOT_BELOW"));
        assertEquals(up.maintenance(), up.target());
    }

    @Test
    void warnsWhenTheTargetWeightIsBelowAHealthyBmi() {
        var r = EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 60, 48, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)); // 48 kg -> IMC 17,6
        assertTrue(r.notes().contains("TARGET_BELOW_HEALTHY_BMI"));
    }

    @Test
    void rejectsImpossibleValues() {
        assertThrows(IllegalArgumentException.class, () -> EnergyTarget.compute(p(Sex.FEMALE, 17, 165, 65, 65, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)));
        assertThrows(IllegalArgumentException.class, () -> EnergyTarget.compute(p(Sex.FEMALE, 30, 90, 65, 65, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)));
        assertThrows(IllegalArgumentException.class, () -> EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 20, 65, DailyActivity.LOW, JobType.DESK, 0, Mode.MAINTAIN)));
        assertThrows(IllegalArgumentException.class, () -> EnergyTarget.compute(p(Sex.FEMALE, 30, 165, 65, 65, DailyActivity.LOW, JobType.DESK, 50, Mode.MAINTAIN)));
    }
}
