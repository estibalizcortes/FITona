package es.fitona.app.infra;

/** La operación choca con el estado actual (p. ej. borrar un alimento usado en recetas). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
