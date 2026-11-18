package es.fitona.nutrition;

/**
 * Fiabilidad de un dato. El orden de declaración va de más a menos fiable para los datos con valor
 * (VERIFIED, AVERAGE, CUSTOM, ESTIMATE); NONE significa «sin cifra».
 * El resultado combinado de varios datos es siempre el peor de ellos.
 */
public enum Quality {
    VERIFIED, AVERAGE, CUSTOM, ESTIMATE, NONE;

    public static Quality worst(Quality a, Quality b) {
        return a.ordinal() >= b.ordinal() ? a : b;
    }
}
