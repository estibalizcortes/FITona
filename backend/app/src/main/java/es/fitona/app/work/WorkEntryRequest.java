package es.fitona.app.work;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Registro del módulo Trabajo: nota, resumen o texto/prompt pegado, de una fecha. */
public record WorkEntryRequest(
        @NotNull LocalDate date,
        @NotNull @Pattern(regexp = "NOTE|SUMMARY|PROMPT") String kind,
        @Size(max = 200) String title,
        @NotBlank @Size(max = 20000) String body) {}
