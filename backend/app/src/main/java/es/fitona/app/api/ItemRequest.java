package es.fitona.app.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Un elemento a calcular o registrar. Exactamente uno de: alimento (variantId + quantity/unitCode),
 * receta (recipeId + servings) o texto libre sin cifras (freeText).
 */
public record ItemRequest(
        Long variantId,
        UUID recipeId,
        @DecimalMin("0") BigDecimal quantity,
        @Size(max = 20) String unitCode,
        @DecimalMin("0") BigDecimal servings,
        @Size(max = 200) String freeText) {}
