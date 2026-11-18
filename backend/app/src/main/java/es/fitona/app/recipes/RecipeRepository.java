package es.fitona.app.recipes;

import es.fitona.app.api.RecipeDto;
import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class RecipeRepository {

    /** Valores por ración guardados con la versión (instantánea para listados). */
    public record Snapshot(String completeness, BigDecimal kcal, BigDecimal protein, BigDecimal carbs, BigDecimal fat,
                           BigDecimal fiber) {}

    @Inject
    Db db;

    public void insertRecipe(UUID user, UUID recipeId) {
        db.update("INSERT INTO RECIPES (ID, OWNER_USER_ID, ORIGIN, VISIBILITY) VALUES (?, ?, 'USER', 'PRIVATE')", ps -> {
            ps.setBytes(1, Ids.toRaw(recipeId));
            ps.setBytes(2, Ids.toRaw(user));
        });
    }

    public int nextVersionNumber(UUID recipeId) {
        Integer n = db.queryOne("SELECT NVL(MAX(VERSION_NUMBER), 0) + 1 FROM RECIPE_VERSIONS WHERE RECIPE_ID = ?",
                ps -> ps.setBytes(1, Ids.toRaw(recipeId)), rs -> rs.getInt(1));
        return n == null ? 1 : n;
    }

    public void insertVersion(UUID user, UUID recipeId, UUID versionId, int number, String title, String description,
                              BigDecimal servings, Integer prep, Integer cook, Snapshot s,
                              List<IngredientRow> ingredients, List<RecipeRecord.Step> steps) {
        db.update("INSERT INTO RECIPE_VERSIONS (ID, RECIPE_ID, VERSION_NUMBER, TITLE, DESCRIPTION, SERVINGS, PREP_MINUTES, "
                + "COOK_MINUTES, NUTRITION_COMPLETENESS, SERVING_ENERGY_KCAL, SERVING_PROTEIN_G, SERVING_CARBS_G, "
                + "SERVING_FAT_G, SERVING_FIBER_G, NUTRITION_COMPUTED_AT, CREATED_BY_USER_ID) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSTIMESTAMP, ?)", ps -> {
            ps.setBytes(1, Ids.toRaw(versionId));
            ps.setBytes(2, Ids.toRaw(recipeId));
            ps.setInt(3, number);
            ps.setString(4, title);
            ps.setString(5, description);
            ps.setBigDecimal(6, servings);
            setInt(ps, 7, prep);
            setInt(ps, 8, cook);
            ps.setString(9, s.completeness());
            ps.setBigDecimal(10, s.kcal());
            ps.setBigDecimal(11, s.protein());
            ps.setBigDecimal(12, s.carbs());
            ps.setBigDecimal(13, s.fat());
            ps.setBigDecimal(14, s.fiber());
            ps.setBytes(15, Ids.toRaw(user));
        });
        int order = 0;
        for (IngredientRow i : ingredients) {
            int sort = ++order;
            db.update("INSERT INTO RECIPE_INGREDIENTS (RECIPE_VERSION_ID, SORT_ORDER, VARIANT_ID, FREE_TEXT, QUANTITY, "
                    + "UNIT_CODE, GRAMS, NOTE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", ps -> {
                ps.setBytes(1, Ids.toRaw(versionId));
                ps.setInt(2, sort);
                if (i.variantId() == null) ps.setNull(3, Types.NUMERIC); else ps.setLong(3, i.variantId());
                ps.setString(4, i.freeText());
                ps.setBigDecimal(5, i.quantity());
                ps.setString(6, i.unitCode());
                ps.setBigDecimal(7, i.grams());
                ps.setString(8, i.note());
            });
        }
        for (RecipeRecord.Step st : steps) {
            db.update("INSERT INTO RECIPE_STEPS (RECIPE_VERSION_ID, STEP_NUMBER, INSTRUCTION, DURATION_MINUTES) "
                    + "VALUES (?, ?, ?, ?)", ps -> {
                ps.setBytes(1, Ids.toRaw(versionId));
                ps.setInt(2, st.number());
                ps.setString(3, st.instruction());
                setInt(ps, 4, st.durationMinutes());
            });
        }
        db.update("UPDATE RECIPES SET CURRENT_VERSION_ID = ?, ROW_VERSION = ROW_VERSION + 1 WHERE ID = ?", ps -> {
            ps.setBytes(1, Ids.toRaw(versionId));
            ps.setBytes(2, Ids.toRaw(recipeId));
        });
    }

    public record IngredientRow(Long variantId, String freeText, BigDecimal quantity, String unitCode, BigDecimal grams,
                                String note) {}

    private static void setInt(java.sql.PreparedStatement ps, int i, Integer v) throws java.sql.SQLException {
        if (v == null) ps.setNull(i, Types.NUMERIC); else ps.setInt(i, v);
    }

    public RecipeRecord find(UUID user, UUID recipeId) {
        RecipeRecord head = db.queryOne("SELECT r.CURRENT_VERSION_ID, v.VERSION_NUMBER, v.TITLE, v.DESCRIPTION, v.SERVINGS, "
                + "v.PREP_MINUTES, v.COOK_MINUTES FROM RECIPES r JOIN RECIPE_VERSIONS v ON v.ID = r.CURRENT_VERSION_ID "
                + "WHERE r.ID = ? AND r.OWNER_USER_ID = ? AND r.DELETED_AT IS NULL", ps -> {
            ps.setBytes(1, Ids.toRaw(recipeId));
            ps.setBytes(2, Ids.toRaw(user));
        }, rs -> new RecipeRecord(recipeId, Ids.fromRaw(rs.getBytes(1)), rs.getInt(2), rs.getString(3), rs.getString(4),
                rs.getBigDecimal(5), (Integer) rs.getObject(6, Integer.class), (Integer) rs.getObject(7, Integer.class),
                List.of(), List.of()));
        if (head == null) return null;
        List<RecipeRecord.Ingredient> ing = db.query("SELECT VARIANT_ID, FREE_TEXT, QUANTITY, UNIT_CODE, GRAMS, NOTE "
                        + "FROM RECIPE_INGREDIENTS WHERE RECIPE_VERSION_ID = ? ORDER BY SORT_ORDER",
                ps -> ps.setBytes(1, Ids.toRaw(head.versionId())),
                rs -> new RecipeRecord.Ingredient(rs.getObject(1) == null ? null : rs.getLong(1), rs.getString(2),
                        rs.getBigDecimal(3), rs.getString(4), rs.getBigDecimal(5), rs.getString(6)));
        List<RecipeRecord.Step> steps = db.query("SELECT STEP_NUMBER, INSTRUCTION, DURATION_MINUTES FROM RECIPE_STEPS "
                        + "WHERE RECIPE_VERSION_ID = ? ORDER BY STEP_NUMBER",
                ps -> ps.setBytes(1, Ids.toRaw(head.versionId())),
                rs -> new RecipeRecord.Step(rs.getInt(1), rs.getString(2), (Integer) rs.getObject(3, Integer.class)));
        return new RecipeRecord(head.id(), head.versionId(), head.versionNumber(), head.title(), head.description(),
                head.servings(), head.prepMinutes(), head.cookMinutes(), ing, steps);
    }

    public List<RecipeDto.Summary> list(UUID user) {
        return db.query("SELECT r.ID, v.TITLE, v.SERVINGS, v.NUTRITION_COMPLETENESS, v.SERVING_ENERGY_KCAL, "
                + "v.SERVING_PROTEIN_G, v.SERVING_CARBS_G, v.SERVING_FAT_G FROM RECIPES r "
                + "JOIN RECIPE_VERSIONS v ON v.ID = r.CURRENT_VERSION_ID "
                + "WHERE r.OWNER_USER_ID = ? AND r.DELETED_AT IS NULL ORDER BY v.TITLE",
                ps -> ps.setBytes(1, Ids.toRaw(user)),
                rs -> new RecipeDto.Summary(Ids.fromRaw(rs.getBytes(1)), rs.getString(2), rs.getBigDecimal(3),
                        rs.getString(4), rs.getBigDecimal(5), rs.getBigDecimal(6), rs.getBigDecimal(7),
                        rs.getBigDecimal(8)));
    }

    public boolean softDelete(UUID user, UUID recipeId) {
        return db.update("UPDATE RECIPES SET DELETED_AT = SYSTIMESTAMP, STATUS = 'ARCHIVED' "
                + "WHERE ID = ? AND OWNER_USER_ID = ? AND DELETED_AT IS NULL", ps -> {
            ps.setBytes(1, Ids.toRaw(recipeId));
            ps.setBytes(2, Ids.toRaw(user));
        }) > 0;
    }

}
