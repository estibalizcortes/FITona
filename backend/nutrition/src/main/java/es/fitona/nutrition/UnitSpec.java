package es.fitona.nutrition;

import java.math.BigDecimal;

/** Unidad: masa/volumen con factor a g o ml; las caseras (kind HOUSEHOLD) no tienen factor. */
public record UnitSpec(String code, UnitKind kind, BigDecimal baseFactor) {
    public UnitSpec {
        if (kind != UnitKind.HOUSEHOLD && (baseFactor == null || baseFactor.signum() <= 0)) {
            throw new IllegalArgumentException("Las unidades de masa y volumen necesitan un factor positivo");
        }
    }
}
