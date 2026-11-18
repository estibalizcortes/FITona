package es.fitona.app.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

/** Alta/edición de un alimento personalizado (dato de la persona, nivel de fiabilidad CUSTOM). */
public record FoodRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull @Valid NutrientsDto per100,
        @Pattern(regexp = "PER_100G|PER_100ML") String basis,
        @DecimalMin("0.1") @DecimalMax("3") BigDecimal densityGPerMl,
        @Valid List<PortionDto> portions) {}
