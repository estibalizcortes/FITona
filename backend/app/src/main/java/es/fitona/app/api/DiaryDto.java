package es.fitona.app.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DiaryDto(LocalDate date, List<EntryDto> entries, TotalsDto totals) {

    public record ItemDto(UUID id, String kind, String displayName, BigDecimal quantity, String unitCode,
                          BigDecimal grams, BigDecimal servings, TotalsDto totals) {}

    public record EntryDto(UUID id, LocalDate date, String mealSlot, String note, List<ItemDto> items,
                           TotalsDto totals) {}
}
