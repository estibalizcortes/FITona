package es.fitona.app.goal;

import es.fitona.nutrition.EnergyTarget;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.UUID;

@ApplicationScoped
public class NutritionGoalService {

    public record Dto(String sex, int ageYears, java.math.BigDecimal heightCm, java.math.BigDecimal weightKg,
                      java.math.BigDecimal targetWeightKg, String dailyActivity, String jobType, java.math.BigDecimal sportHoursWeek,
                      String mode, EnergyTarget.Result target) {}

    @Inject
    NutritionGoalRepository repo;

    @Transactional
    public Dto save(UUID user, NutritionGoalRequest r) {
        NutritionGoalRepository.Row row = new NutritionGoalRepository.Row(r.sex(), r.ageYears(), r.heightCm(), r.weightKg(),
                r.targetWeightKg(), r.dailyActivity(), r.jobType(), r.sportHoursWeek(), r.mode());
        toDto(row); // valida con el motor antes de guardar
        repo.save(user, row);
        return toDto(row);
    }

    /** El perfil con su objetivo calculado ahora, o null si la persona aún no lo ha rellenado. */
    public Dto get(UUID user) {
        NutritionGoalRepository.Row row = repo.find(user);
        return row == null ? null : toDto(row);
    }

    /** Objetivo calórico orientativo (kcal/día) o null si no hay perfil. */
    public Integer targetKcal(UUID user) {
        Dto d = get(user);
        return d == null ? null : d.target().target();
    }

    private static Dto toDto(NutritionGoalRepository.Row r) {
        EnergyTarget.Result t = EnergyTarget.compute(new EnergyTarget.Profile(
                "M".equals(r.sex()) ? EnergyTarget.Sex.MALE : EnergyTarget.Sex.FEMALE, r.ageYears(), r.heightCm().doubleValue(),
                r.weightKg().doubleValue(), r.targetWeightKg().doubleValue(), EnergyTarget.DailyActivity.valueOf(r.dailyActivity()),
                EnergyTarget.JobType.valueOf(r.jobType()), r.sportHoursWeek().doubleValue(), EnergyTarget.Mode.valueOf(r.mode())));
        return new Dto(r.sex(), r.ageYears(), r.heightCm(), r.weightKg(), r.targetWeightKg(), r.dailyActivity(), r.jobType(),
                r.sportHoursWeek(), r.mode(), t);
    }
}
