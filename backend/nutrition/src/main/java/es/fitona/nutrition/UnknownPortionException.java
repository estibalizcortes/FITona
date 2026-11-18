package es.fitona.nutrition;

/** No se puede convertir la unidad a gramos para ese alimento (no hay medida casera ni densidad). */
public class UnknownPortionException extends RuntimeException {
    public UnknownPortionException(String message) {
        super(message);
    }
}
