package es.fitona.app.goal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

/** Perfil nutricional. Los rangos coinciden con los de la base de datos y con el motor de cálculo. */
public record NutritionGoalRequest(
        @NotNull @Pattern(regexp = "F|M") String sex,
        @NotNull @Min(18) @Max(100) Integer ageYears,
        @NotNull @DecimalMin("120") @DecimalMax("230") BigDecimal heightCm,
        @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal weightKg,
        @NotNull @DecimalMin("30") @DecimalMax("300") BigDecimal targetWeightKg,
        @NotNull @Pattern(regexp = "LOW|MODERATE|HIGH") String dailyActivity,
        @NotNull @Pattern(regexp = "DESK|ON_FEET|PHYSICAL") String jobType,
        @NotNull @DecimalMin("0") @DecimalMax("40") BigDecimal sportHoursWeek,
        @NotNull @Pattern(regexp = "MAINTAIN|DEFICIT") String mode) {}
