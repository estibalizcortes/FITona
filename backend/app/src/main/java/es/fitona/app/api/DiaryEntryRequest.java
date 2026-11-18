package es.fitona.app.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Registro de una comida. {@code id} opcional: lo genera el cliente para reintentos seguros (idempotencia). */
public record DiaryEntryRequest(
        UUID id,
        @NotNull LocalDate date,
        @NotNull @Pattern(regexp = "BREAKFAST|MID_MORNING|LUNCH|AFTERNOON_SNACK|DINNER|OTHER") String mealSlot,
        @Size(max = 500) String note,
        @NotEmpty @Valid List<ItemRequest> items) {}
