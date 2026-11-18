package es.fitona.app.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

/** Medida casera: 1 unidad = grams g. */
public record PortionDto(
        @NotBlank String unitCode,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("5000") BigDecimal grams,
        @Pattern(regexp = "EXACT|APPROXIMATE|ROUGH") String precision) {}
