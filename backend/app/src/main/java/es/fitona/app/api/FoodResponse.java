package es.fitona.app.api;

import java.util.List;

/** Alimento + avisos (p. ej. kcal declaradas que no cuadran con los macros). Los avisos no bloquean. */
public record FoodResponse(FoodDto food, List<String> warnings) {}
