package es.fitona.nutrition;

import java.math.BigDecimal;

/**
 * Valor acumulado de un nutriente. {@code value} es null si ningún componente lo conocía;
 * {@code complete} es false si algún componente no lo conocía (el total es entonces un mínimo, no el real).
 */
public record Total(BigDecimal value, boolean complete) {
    public static final Total UNKNOWN = new Total(null, false);

    public boolean known() {
        return value != null;
    }
}
