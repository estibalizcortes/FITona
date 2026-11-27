package es.fitona.app.catalog;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import es.fitona.app.infra.TextKeys;
import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.NutrientProfile;
import es.fitona.nutrition.Portion;
import es.fitona.nutrition.Precision;
import es.fitona.nutrition.Quality;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class FoodRepository {

    private static final String SELECT = "SELECT v.ID, f.ID, f.CANONICAL_NAME, v.VARIANT_LABEL, p.ID, p.BASIS, "
            + "p.ENERGY_KCAL, p.PROTEIN_G, p.CARBS_G, p.SUGARS_G, p.FAT_G, p.SAT_FAT_G, p.FIBER_G, p.SALT_G, p.ALCOHOL_G, "
            + "p.DATA_QUALITY, v.DENSITY_G_PER_ML, CASE WHEN f.OWNER_USER_ID IS NULL THEN 0 ELSE 1 END, "
            + "COALESCE(f.ICON, c.ICON), c.CODE, c.NAME_ES, CASE WHEN f.OVERRIDES_FOOD_ID IS NULL THEN 0 ELSE 1 END "
            + "FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID LEFT JOIN NUTRIENT_PROFILES p ON p.ID = v.CURRENT_PROFILE_ID "
            + "LEFT JOIN FOOD_CATEGORIES c ON c.ID = f.CATEGORY_ID ";

    /** Lo que se ofrece en el buscador: propios y catálogo publicado, sin los del catálogo que la persona ya sustituyó. */
    private static final String VISIBLE = "(f.OWNER_USER_ID = ? OR (f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' "
            + "AND v.STATUS = 'PUBLISHED' AND NOT EXISTS (SELECT 1 FROM FOODS o WHERE o.OVERRIDES_FOOD_ID = f.ID "
            + "AND o.OWNER_USER_ID = ?)))";

    /** Para resolver referencias ya existentes (registros, recetas): incluye alimentos retirados (DEPRECATED). */
    private static final String RESOLVABLE = "(f.OWNER_USER_ID = ? OR (f.OWNER_USER_ID IS NULL "
            + "AND f.STATUS IN ('PUBLISHED', 'DEPRECATED') AND v.STATUS IN ('PUBLISHED', 'DEPRECATED')))";

    @Inject
    Db db;

    public List<FoodRecord> search(UUID user, String q, int limit) {
        return search(user, q, limit, false);
    }

    public List<FoodRecord> search(UUID user, String q, int limit, boolean ownOnly) {
        return search(user, q, limit, ownOnly, null);
    }

    /** @param category código de categoría; «MINE» = solo los propios; null = todas */
    public List<FoodRecord> search(UUID user, String q, int limit, boolean ownOnly, String category) {
        List<String> tokens = TextKeys.tokens(q);
        boolean mine = ownOnly || "MINE".equals(category);
        boolean byCategory = category != null && !category.isBlank() && !"MINE".equals(category);
        StringBuilder sql = new StringBuilder(SELECT)
                .append("LEFT JOIN USER_FOOD_USAGE u ON u.USER_ID = ? AND u.VARIANT_ID = v.ID WHERE ").append(VISIBLE);
        if (mine) sql.append(" AND f.OWNER_USER_ID IS NOT NULL");
        if (byCategory) sql.append(" AND c.CODE = ?");
        for (int i = 0; i < tokens.size(); i++) {
            sql.append(" AND EXISTS (SELECT 1 FROM FOOD_NAMES n WHERE n.FOOD_ID = f.ID AND n.NAME_KEY LIKE ?)");
        }
        sql.append(" ORDER BY COALESCE(u.USE_COUNT, 0) DESC, f.CANONICAL_NAME, v.SORT_ORDER FETCH FIRST ? ROWS ONLY");
        List<FoodRecord> rows = db.query(sql.toString(), ps -> {
            int i = 1;
            ps.setBytes(i++, Ids.toRaw(user));
            ps.setBytes(i++, Ids.toRaw(user));
            ps.setBytes(i++, Ids.toRaw(user));
            if (byCategory) ps.setString(i++, category);
            for (String t : tokens) ps.setString(i++, "%" + t + "%");
            ps.setInt(i, limit);
        }, FoodRepository::map);
        return withPortions(rows);
    }

    /** Variante del catálogo compartido por nombre exacto (y etiqueta si se indica; si no, la variante por defecto). */
    public Long findCatalogVariantId(String name, String label) {
        return db.queryOne("SELECT v.ID FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID WHERE f.OWNER_USER_ID IS NULL "
                + "AND f.STATUS = 'PUBLISHED' AND v.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = ? "
                + "AND (? IS NULL OR v.VARIANT_LABEL = ?) ORDER BY CASE WHEN v.IS_DEFAULT THEN 0 ELSE 1 END FETCH FIRST 1 ROWS ONLY",
                ps -> { ps.setString(1, name); ps.setString(2, label); ps.setString(3, label); }, rs -> rs.getLong(1));
    }

    public FoodRecord findVariant(UUID user, long variantId) {
        List<FoodRecord> rows = db.query(SELECT + "WHERE v.ID = ? AND " + RESOLVABLE, ps -> {
            ps.setLong(1, variantId);
            ps.setBytes(2, Ids.toRaw(user));
        }, FoodRepository::map);
        return rows.isEmpty() ? null : withPortions(rows).get(0);
    }

    private List<FoodRecord> withPortions(List<FoodRecord> rows) {
        if (rows.isEmpty()) return rows;
        String in = rows.stream().map(r -> "?").collect(Collectors.joining(","));
        Map<Long, List<Portion>> byVariant = new java.util.HashMap<>();
        db.query("SELECT VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND FROM FOOD_PORTIONS WHERE VARIANT_ID IN (" + in + ")",
                ps -> {
                    int i = 1;
                    for (FoodRecord r : rows) ps.setLong(i++, r.variantId());
                },
                rs -> {
                    byVariant.computeIfAbsent(rs.getLong(1), k -> new ArrayList<>()).add(new Portion(rs.getString(2),
                            rs.getBigDecimal(3), precision(rs.getString(4))));
                    return null;
                });
        return rows.stream().map(r -> new FoodRecord(r.variantId(), r.foodId(), r.name(), r.variantLabel(), r.profile(),
                r.profileId(), r.basis(), r.densityGPerMl(), byVariant.getOrDefault(r.variantId(), List.of()),
                r.editable(), r.source(), r.icon(), r.categoryCode(), r.categoryName(), r.overridesCatalog())).toList();
    }

    private static Precision precision(String s) {
        return switch (s) {
            case "EXACT" -> Precision.EXACT;
            case "ROUGH" -> Precision.ROUGH;
            default -> Precision.APPROXIMATE;
        };
    }

    private static FoodRecord map(ResultSet rs) throws SQLException {
        Map<Nutrient, BigDecimal> m = new EnumMap<>(Nutrient.class);
        Nutrient[] order = {Nutrient.ENERGY_KCAL, Nutrient.PROTEIN_G, Nutrient.CARBS_G, Nutrient.SUGARS_G, Nutrient.FAT_G,
                Nutrient.SAT_FAT_G, Nutrient.FIBER_G, Nutrient.SALT_G, Nutrient.ALCOHOL_G};
        for (int i = 0; i < order.length; i++) {
            BigDecimal v = rs.getBigDecimal(7 + i);
            if (v != null) m.put(order[i], v);
        }
        boolean editable = rs.getInt(18) == 1;
        boolean hasProfile = rs.getObject(5) != null;
        return new FoodRecord(rs.getLong(1), rs.getLong(2), rs.getString(3), rs.getString(4),
                hasProfile ? new NutrientProfile(m, Quality.valueOf(rs.getString(16))) : null,
                hasProfile ? rs.getLong(5) : 0L, hasProfile ? rs.getString(6) : "PER_100G",
                rs.getBigDecimal(17), List.of(), editable,
                editable ? "Dato personalizado" : (hasProfile ? "Catálogo (aproximado, sin verificar)" : "Catálogo (sin datos nutricionales)"),
                rs.getString(19), rs.getString(20), rs.getString(21), rs.getInt(22) == 1);
    }

    public record Category(String code, String name, String icon, int count) {}

    /** Categorías con el número de alimentos visibles para la persona (catálogo + propios), más «Mis alimentos». */
    public List<Category> categories(UUID user) {
        List<Category> rows = db.query("SELECT c.CODE, c.NAME_ES, c.ICON, COUNT(f.ID) FROM FOOD_CATEGORIES c "
                + "LEFT JOIN FOODS f ON f.CATEGORY_ID = c.ID AND ((f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' "
                + "AND NOT EXISTS (SELECT 1 FROM FOODS o WHERE o.OVERRIDES_FOOD_ID = f.ID AND o.OWNER_USER_ID = ?)) "
                + "OR f.OWNER_USER_ID = ?) GROUP BY c.CODE, c.NAME_ES, c.ICON, c.SORT_ORDER ORDER BY c.SORT_ORDER",
                ps -> { ps.setBytes(1, Ids.toRaw(user)); ps.setBytes(2, Ids.toRaw(user)); },
                rs -> new Category(rs.getString(1), rs.getString(2), rs.getString(3), rs.getInt(4)));
        Integer mine = db.queryOne("SELECT COUNT(*) FROM FOODS WHERE OWNER_USER_ID = ?",
                ps -> ps.setBytes(1, Ids.toRaw(user)), rs -> rs.getInt(1));
        List<Category> out = new ArrayList<>();
        out.add(new Category("MINE", "Mis alimentos", "⭐", mine == null ? 0 : mine));
        out.addAll(rows);
        return out;
    }

    // ---- escritura (solo alimentos propios y privados) ----

    public record NewFood(String name, Map<Nutrient, BigDecimal> values, String energyOrigin, String basis,
                          BigDecimal density, List<Portion> portions, String categoryCode, Long overridesFoodId) {}

    public long create(UUID user, NewFood f) {
        long foodId = db.insertReturningId("INSERT INTO FOODS (OWNER_USER_ID, CANONICAL_NAME, FOOD_KIND, STATUS) "
                + "VALUES (?, ?, 'INGREDIENT', 'PRIVATE')", ps -> {
            ps.setBytes(1, Ids.toRaw(user));
            ps.setString(2, f.name());
        });
        long profileId = insertProfile(f);
        long variantId = db.insertReturningId("INSERT INTO FOOD_VARIANTS (FOOD_ID, PREPARATION_STATE, CURRENT_PROFILE_ID, "
                + "DENSITY_G_PER_ML, IS_DEFAULT, STATUS) VALUES (?, 'AS_SOLD', ?, ?, TRUE, 'PRIVATE')", ps -> {
            ps.setLong(1, foodId);
            ps.setLong(2, profileId);
            ps.setBigDecimal(3, f.density());
        });
        db.update("UPDATE FOODS SET DEFAULT_VARIANT_ID = ? WHERE ID = ?", ps -> {
            ps.setLong(1, variantId);
            ps.setLong(2, foodId);
        });
        if (f.overridesFoodId() != null) {
            // Sustituye, solo para esta persona, a un alimento del catálogo: hereda su categoría e icono.
            db.update("UPDATE FOODS SET OVERRIDES_FOOD_ID = ?, ICON = (SELECT ICON FROM FOODS WHERE ID = ?), "
                    + "CATEGORY_ID = (SELECT CATEGORY_ID FROM FOODS WHERE ID = ?) WHERE ID = ?", ps -> {
                ps.setLong(1, f.overridesFoodId());
                ps.setLong(2, f.overridesFoodId());
                ps.setLong(3, f.overridesFoodId());
                ps.setLong(4, foodId);
            });
        }
        if (f.categoryCode() != null && !f.categoryCode().isBlank()) {
            db.update("UPDATE FOODS SET CATEGORY_ID = (SELECT ID FROM FOOD_CATEGORIES WHERE CODE = ?) WHERE ID = ?", ps -> {
                ps.setString(1, f.categoryCode());
                ps.setLong(2, foodId);
            });
        }
        insertName(foodId, f.name());
        insertPortions(variantId, f.portions());
        return variantId;
    }

    /** @return false si el alimento no existe o no es de la persona */
    public boolean update(UUID user, long variantId, NewFood f) {
        FoodRecord cur = findVariant(user, variantId);
        if (cur == null || !cur.editable()) return false;
        db.update("UPDATE FOODS SET CANONICAL_NAME = ?, CATEGORY_ID = COALESCE((SELECT ID FROM FOOD_CATEGORIES WHERE CODE = ?), CATEGORY_ID) "
                + "WHERE ID = ?", ps -> {
            ps.setString(1, f.name());
            ps.setString(2, f.categoryCode());
            ps.setLong(3, cur.foodId());
        });
        db.update("DELETE FROM FOOD_NAMES WHERE FOOD_ID = ?", ps -> ps.setLong(1, cur.foodId()));
        insertName(cur.foodId(), f.name());
        db.update("UPDATE FOOD_VARIANTS SET DENSITY_G_PER_ML = ? WHERE ID = ?", ps -> {
            ps.setBigDecimal(1, f.density());
            ps.setLong(2, variantId);
        });
        // El perfil de un dato personalizado está PENDING (editable). Los registros históricos conservan su instantánea.
        db.update("UPDATE NUTRIENT_PROFILES SET BASIS = ?, ENERGY_KCAL = ?, PROTEIN_G = ?, CARBS_G = ?, SUGARS_G = ?, "
                + "FAT_G = ?, SAT_FAT_G = ?, FIBER_G = ?, SALT_G = ?, ALCOHOL_G = ?, ENERGY_ORIGIN = ? WHERE ID = ?", ps -> {
            ps.setString(1, f.basis());
            bindNutrients(ps, 2, f.values());
            ps.setString(11, f.energyOrigin());
            ps.setLong(12, cur.profileId());
        });
        db.update("DELETE FROM FOOD_PORTIONS WHERE VARIANT_ID = ?", ps -> ps.setLong(1, variantId));
        insertPortions(variantId, f.portions());
        return true;
    }

    public boolean usedInRecipes(long variantId) {
        Integer n = db.queryOne("SELECT COUNT(*) FROM RECIPE_INGREDIENTS WHERE VARIANT_ID = ?",
                ps -> ps.setLong(1, variantId), rs -> rs.getInt(1));
        return n != null && n > 0;
    }

    public boolean delete(UUID user, long variantId) {
        FoodRecord cur = findVariant(user, variantId);
        if (cur == null || !cur.editable()) return false;
        db.update("UPDATE FOODS SET DEFAULT_VARIANT_ID = NULL WHERE ID = ?", ps -> ps.setLong(1, cur.foodId()));
        db.update("DELETE FROM USER_FOOD_USAGE WHERE VARIANT_ID = ?", ps -> ps.setLong(1, variantId));
        db.update("DELETE FROM FOODS WHERE ID = ? AND OWNER_USER_ID = ?", ps -> {
            ps.setLong(1, cur.foodId());
            ps.setBytes(2, Ids.toRaw(user));
        });
        db.update("DELETE FROM NUTRIENT_PROFILES WHERE ID = ?", ps -> ps.setLong(1, cur.profileId()));
        return true;
    }

    public void touchUsage(UUID user, long variantId, BigDecimal quantity, String unitCode, BigDecimal grams) {
        int updated = db.update("UPDATE USER_FOOD_USAGE SET USE_COUNT = USE_COUNT + 1, LAST_USED_AT = CURRENT_TIMESTAMP, "
                + "LAST_QUANTITY = ?, LAST_UNIT_CODE = ?, LAST_GRAMS = ? WHERE USER_ID = ? AND VARIANT_ID = ?", ps -> {
            ps.setBigDecimal(1, quantity);
            ps.setString(2, unitCode);
            ps.setBigDecimal(3, grams);
            ps.setBytes(4, Ids.toRaw(user));
            ps.setLong(5, variantId);
        });
        if (updated == 0) {
            db.update("INSERT INTO USER_FOOD_USAGE (USER_ID, VARIANT_ID, LAST_QUANTITY, LAST_UNIT_CODE, LAST_GRAMS) "
                    + "VALUES (?, ?, ?, ?, ?)", ps -> {
                ps.setBytes(1, Ids.toRaw(user));
                ps.setLong(2, variantId);
                ps.setBigDecimal(3, quantity);
                ps.setString(4, unitCode);
                ps.setBigDecimal(5, grams);
            });
        }
    }

    private long insertProfile(NewFood f) {
        return db.insertReturningId("INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, "
                + "SUGARS_G, FAT_G, SAT_FAT_G, FIBER_G, SALT_G, ALCOHOL_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS) "
                + "VALUES ('CUSTOM', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CUSTOM', 'MANUAL', 'PENDING')", ps -> {
            ps.setString(1, f.basis());
            bindNutrients(ps, 2, f.values());
            ps.setString(11, f.energyOrigin());
        });
    }

    private static void bindNutrients(java.sql.PreparedStatement ps, int from, Map<Nutrient, BigDecimal> v)
            throws SQLException {
        Nutrient[] order = {Nutrient.ENERGY_KCAL, Nutrient.PROTEIN_G, Nutrient.CARBS_G, Nutrient.SUGARS_G, Nutrient.FAT_G,
                Nutrient.SAT_FAT_G, Nutrient.FIBER_G, Nutrient.SALT_G, Nutrient.ALCOHOL_G};
        for (int i = 0; i < order.length; i++) ps.setBigDecimal(from + i, v.get(order[i]));
    }

    private void insertName(long foodId, String name) {
        db.update("INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND) VALUES (?, 'es-ES', ?, ?, 'PRIMARY')",
                ps -> {
                    ps.setLong(1, foodId);
                    ps.setString(2, name);
                    ps.setString(3, TextKeys.key(name));
                });
    }

    private void insertPortions(long variantId, List<Portion> portions) {
        for (Portion p : portions) {
            db.update("INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT) "
                    + "VALUES (?, ?, ?, ?, FALSE)", ps -> {
                ps.setLong(1, variantId);
                ps.setString(2, p.unitCode());
                ps.setBigDecimal(3, p.grams());
                ps.setString(4, p.precision().name());
            });
        }
    }
}
