package es.fitona.nutrition;

import java.util.ArrayList;
import java.util.List;

/**
 * Objetivo calórico ORIENTATIVO (determinista, sin IA): metabolismo basal de Mifflin-St Jeor × nivel de actividad + deporte.
 * Es una estimación, no un consejo médico; el déficit es moderado y con suelos de seguridad. Un objetivo es una referencia:
 * no genera restricciones ni «compensaciones» diarias (el deporte entra como promedio semanal, no se descuenta día a día).
 */
public final class EnergyTarget {

    public enum Sex { FEMALE, MALE }
    public enum DailyActivity { LOW, MODERATE, HIGH }
    public enum JobType { DESK, ON_FEET, PHYSICAL }
    public enum Mode { MAINTAIN, DEFICIT }

    public record Profile(Sex sex, int ageYears, double heightCm, double weightKg, double targetWeightKg, DailyActivity dailyActivity,
                          JobType jobType, double sportHoursPerWeek, Mode mode) {}

    /** notes: códigos que la interfaz traduce a mensajes (FLOOR_APPLIED, LOW_BMI_NO_DEFICIT, TARGET_BELOW_HEALTHY_BMI, TARGET_NOT_BELOW). */
    public record Result(int bmr, int maintenance, int target, int deficit, double bmi, List<String> notes) {}

    static final double DEFICIT_FRACTION = 0.15;
    static final int FLOOR_FEMALE = 1200;
    static final int FLOOR_MALE = 1500;
    /** kcal netas por hora de deporte y kg (≈ MET 6 menos el gasto en reposo): estimación media. */
    static final double SPORT_KCAL_PER_HOUR_PER_KG = 5.0;

    private EnergyTarget() {}

    public static Result compute(Profile p) {
        if (p.ageYears() < 18 || p.ageYears() > 100) throw new IllegalArgumentException("La edad debe estar entre 18 y 100 años.");
        if (p.heightCm() < 120 || p.heightCm() > 230) throw new IllegalArgumentException("La altura debe estar entre 120 y 230 cm.");
        if (p.weightKg() < 30 || p.weightKg() > 300 || p.targetWeightKg() < 30 || p.targetWeightKg() > 300) {
            throw new IllegalArgumentException("El peso debe estar entre 30 y 300 kg.");
        }
        if (p.sportHoursPerWeek() < 0 || p.sportHoursPerWeek() > 40) throw new IllegalArgumentException("El deporte semanal debe estar entre 0 y 40 horas.");

        double bmr = 10 * p.weightKg() + 6.25 * p.heightCm() - 5 * p.ageYears() + (p.sex() == Sex.MALE ? 5 : -161);
        double pal = 1.2 + switch (p.jobType()) { case DESK -> 0.0; case ON_FEET -> 0.10; case PHYSICAL -> 0.25; }
                + switch (p.dailyActivity()) { case LOW -> 0.0; case MODERATE -> 0.10; case HIGH -> 0.20; };
        double sportPerDay = p.sportHoursPerWeek() * SPORT_KCAL_PER_HOUR_PER_KG * p.weightKg() / 7.0;
        int maintenance = round10(bmr * pal + sportPerDay);

        double bmi = p.weightKg() / Math.pow(p.heightCm() / 100.0, 2);
        List<String> notes = new ArrayList<>();
        int target = maintenance;
        if (p.mode() == Mode.DEFICIT) {
            if (bmi < 18.5) {
                notes.add("LOW_BMI_NO_DEFICIT");
            } else if (p.targetWeightKg() >= p.weightKg()) {
                notes.add("TARGET_NOT_BELOW");
            } else {
                int floor = p.sex() == Sex.MALE ? FLOOR_MALE : FLOOR_FEMALE;
                int wanted = round10(maintenance * (1 - DEFICIT_FRACTION));
                if (wanted < floor) { notes.add("FLOOR_APPLIED"); wanted = floor; }
                target = Math.min(wanted, maintenance); // nunca por encima del mantenimiento
            }
        }
        double targetBmi = p.targetWeightKg() / Math.pow(p.heightCm() / 100.0, 2);
        if (targetBmi < 18.5) notes.add("TARGET_BELOW_HEALTHY_BMI");
        return new Result((int) Math.round(bmr), maintenance, target, maintenance - target, Math.round(bmi * 10) / 10.0, List.copyOf(notes));
    }

    private static int round10(double kcal) {
        return (int) (Math.round(kcal / 10.0) * 10);
    }
}
