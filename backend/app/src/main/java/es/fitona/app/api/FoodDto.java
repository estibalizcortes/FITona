package es.fitona.app.api;

import java.math.BigDecimal;
import java.util.List;

public record FoodDto(long variantId, long foodId, String name, String displayName, String quality, String basis,
                      NutrientsDto per100, BigDecimal densityGPerMl, List<PortionDto> portions, boolean editable,
                      String source, String icon, String categoryCode, String categoryName, boolean hasNutrients,
                      boolean overridesCatalog) {}
