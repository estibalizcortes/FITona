package es.fitona.nutrition;

/** Precisión con que se conoce una cantidad en gramos. El resultado combinado es la peor. */
public enum Precision {
    EXACT, APPROXIMATE, ROUGH;

    public static Precision worst(Precision a, Precision b) {
        return a.ordinal() >= b.ordinal() ? a : b;
    }
}
