package es.fitona.app.prefs;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/** Preferencias de la pantalla principal, guardadas en la cuenta (las ve solo su dueña). */
@Path("/api/v1/me/preferences")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PreferencesResource {

    private static final Set<String> MODULES = Set.of("food", "work", "health", "money", "sport", "care");

    public record Prefs(@Size(max = 10) List<@Pattern(regexp = "^[a-z]{2,12}$") String> homeOrder,
                        @Size(max = 10) List<@Pattern(regexp = "^[a-z]{2,12}$") String> homeHidden,
                        boolean homeIndicators) {}

    @Inject
    Db db;

    @Inject
    CurrentUser user;

    /** Sin preferencias guardadas devuelve los valores por defecto (listas vacías, datos visibles). */
    @GET
    public Prefs get() {
        Prefs p = db.queryOne("SELECT HOME_ORDER, HOME_HIDDEN, HOME_INDICATORS FROM USER_PREFERENCES WHERE USER_ID = ?",
                ps -> ps.setBytes(1, Ids.toRaw(user.id())),
                rs -> new Prefs(split(rs.getString(1)), split(rs.getString(2)), rs.getInt(3) == 1));
        return p != null ? p : new Prefs(List.of(), List.of(), true);
    }

    @PUT
    public Prefs put(@Valid Prefs p) {
        // Solo identificadores de módulo conocidos y sin repetir: lo demás se descarta.
        List<String> order = p.homeOrder() == null ? List.of() : p.homeOrder().stream().filter(MODULES::contains).distinct().toList();
        List<String> hidden = p.homeHidden() == null ? List.of() : p.homeHidden().stream().filter(MODULES::contains).distinct().toList();
        int n = db.update("UPDATE USER_PREFERENCES SET HOME_ORDER = ?, HOME_HIDDEN = ?, HOME_INDICATORS = ?, UPDATED_AT = CURRENT_TIMESTAMP WHERE USER_ID = ?",
                ps -> bind(ps, order, hidden, p.homeIndicators(), user.id()));
        if (n == 0) {
            db.update("INSERT INTO USER_PREFERENCES (HOME_ORDER, HOME_HIDDEN, HOME_INDICATORS, USER_ID) VALUES (?, ?, ?, ?)",
                    ps -> bind(ps, order, hidden, p.homeIndicators(), user.id()));
        }
        return new Prefs(order, hidden, p.homeIndicators());
    }

    private static void bind(java.sql.PreparedStatement ps, List<String> order, List<String> hidden, boolean ind, java.util.UUID id)
            throws java.sql.SQLException {
        ps.setString(1, String.join(",", order));
        ps.setString(2, String.join(",", hidden));
        ps.setInt(3, ind ? 1 : 0);
        ps.setBytes(4, Ids.toRaw(id));
    }

    private static List<String> split(String s) {
        return s == null || s.isBlank() ? List.of() : Arrays.asList(s.split(","));
    }
}
