package es.fitona.app.infra;

/** El alimento está en el catálogo pero aún no tiene datos nutricionales: no se inventan ni se calculan. */
public class NoNutrientDataException extends RuntimeException {
    public NoNutrientDataException(String message) {
        super(message);
    }
}
