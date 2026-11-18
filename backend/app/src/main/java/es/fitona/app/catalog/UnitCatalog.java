package es.fitona.app.catalog;

import es.fitona.app.infra.Db;
import es.fitona.nutrition.UnitKind;
import es.fitona.nutrition.UnitSpec;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Unidades de PORTION_UNITS (datos de referencia, se cachean en memoria). */
@ApplicationScoped
public class UnitCatalog {

    public record UnitInfo(UnitSpec spec, String singular, String plural, int sortOrder) {}

    @Inject
    Db db;

    private final Map<String, UnitInfo> cache = new ConcurrentHashMap<>();

    public UnitInfo get(String code) {
        if (cache.isEmpty()) load();
        UnitInfo u = cache.get(code == null ? "G" : code.toUpperCase());
        if (u == null) throw new IllegalArgumentException("Unidad desconocida: " + code);
        return u;
    }

    public List<UnitInfo> all() {
        if (cache.isEmpty()) load();
        return cache.values().stream().sorted((a, b) -> Integer.compare(a.sortOrder(), b.sortOrder())).toList();
    }

    private synchronized void load() {
        List<UnitInfo> rows = db.query(
                "SELECT u.CODE, u.MEASURE_KIND, u.BASE_FACTOR, u.SORT_ORDER, n.SINGULAR, n.PLURAL "
                        + "FROM PORTION_UNITS u LEFT JOIN PORTION_UNIT_NAMES n ON n.UNIT_CODE = u.CODE AND n.LOCALE = 'es-ES'",
                ps -> {},
                rs -> new UnitInfo(
                        new UnitSpec(rs.getString(1), UnitKind.valueOf(rs.getString(2)), rs.getBigDecimal(3)),
                        rs.getString(5) == null ? rs.getString(1) : rs.getString(5),
                        rs.getString(6) == null ? rs.getString(1) : rs.getString(6), rs.getInt(4)));
        rows.forEach(u -> cache.put(u.spec().code(), u));
    }
}
