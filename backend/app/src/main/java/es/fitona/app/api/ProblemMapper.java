package es.fitona.app.api;

import es.fitona.app.infra.Db;
import es.fitona.nutrition.UnknownPortionException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

/** Errores como application/problem+json, sin detalles internos ni datos personales. */
public class ProblemMapper {

    private static final Logger LOG = Logger.getLogger(ProblemMapper.class);

    @ServerExceptionMapper
    public Response validation(ConstraintViolationException e) {
        String detail = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage()).sorted().collect(Collectors.joining("; "));
        return problem(400, "Datos no válidos", detail);
    }

    @ServerExceptionMapper
    public Response badRequest(IllegalArgumentException e) {
        return problem(400, "Datos no válidos", e.getMessage());
    }

    @ServerExceptionMapper
    public Response unknownPortion(UnknownPortionException e) {
        return problem(422, "No se puede convertir la cantidad", e.getMessage());
    }

    @ServerExceptionMapper
    public Response noData(es.fitona.app.infra.NoNutrientDataException e) {
        return problem(422, "Sin datos nutricionales", e.getMessage());
    }

    @ServerExceptionMapper
    public Response conflict(es.fitona.app.infra.ConflictException e) {
        return problem(409, "Conflicto", e.getMessage());
    }

    @ServerExceptionMapper
    public Response notFound(NotFoundException e) {
        return problem(404, "No encontrado", "El recurso no existe.");
    }

    @ServerExceptionMapper
    public Response db(Db.DataAccessException e) {
        // ORA-02290 (CHECK), ORA-02291 (FK), ORA-00001 (único): datos que la BD rechaza por integridad.
        if (e.errorCode() == 2290 || e.errorCode() == 2291 || e.errorCode() == 1) {
            LOG.warnf("Restricción de integridad rechazada (ORA-%05d)", e.errorCode());
            return problem(400, "Datos no válidos", "La base de datos rechazó los valores por incoherentes.");
        }
        LOG.error("Error de acceso a datos", e);
        return problem(500, "Error interno", "No se pudo completar la operación.");
    }

    public static Response problem(int status, String title, String detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", "about:blank");
        body.put("title", title);
        body.put("status", status);
        body.put("detail", detail);
        return Response.status(status).type(MediaType.APPLICATION_JSON).entity(body).build();
    }
}
