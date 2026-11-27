package es.fitona.app.plan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class PlanRequests {

    private PlanRequests() {}

    /**
     * Una comida elegida por la persona: una receta típica (TEMPLATE + key), una receta suya (RECIPE + recipeId)
     * o algo ya registrado (FIXED + kcal + label).
     */
    public record Chosen(
            @NotNull @Pattern(regexp = "BREAKFAST|LUNCH|SNACK|DINNER") String slot,
            @NotNull @Pattern(regexp = "TEMPLATE|RECIPE|FIXED") String kind,
            @Size(max = 100) String key,
            UUID recipeId,
            @DecimalMin("0.25") @DecimalMax("20") BigDecimal servings,
            @Min(0) @Max(6000) Integer kcal,
            @Size(max = 200) String label) {}

    /** targetKcal vacío = el del perfil nutricional. date da variedad estable dentro de un día y distinta entre días. */
    public record Suggest(@Min(800) @Max(6000) Integer targetKcal, LocalDate date, @Size(max = 4) @Valid List<Chosen> chosen) {}

    /** Añade al diario (la persona confirma) una comida del plan. */
    public record Log(
            UUID id,
            @NotNull LocalDate date,
            @NotNull @Pattern(regexp = "BREAKFAST|LUNCH|SNACK|DINNER") String slot,
            @NotNull @Pattern(regexp = "TEMPLATE|RECIPE") String kind,
            @Size(max = 100) String key,
            UUID recipeId,
            @NotNull @DecimalMin("0.25") @DecimalMax("20") BigDecimal servings) {}
}
