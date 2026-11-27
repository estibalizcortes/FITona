package es.fitona.app.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record RecipeRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("200") BigDecimal servings,
        Integer prepMinutes,
        Integer cookMinutes,
        @NotEmpty @Size(max = 100) @Valid List<Ingredient> ingredients,
        @Size(max = 100) @Valid List<Step> steps) {

    /** Ingrediente: un alimento del catálogo con cantidad, o texto libre sin resolver (la nutrición quedará PARTIAL). */
    public record Ingredient(Long variantId, @Size(max = 200) String freeText,
                             @DecimalMin("0") @DecimalMax("100000") BigDecimal quantity, @Size(max = 20) String unitCode,
                             @Size(max = 300) String note) {}

    public record Step(@NotBlank @Size(max = 2000) String instruction, Integer durationMinutes) {}
}
