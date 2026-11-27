package es.fitona.app.diary;

import es.fitona.app.calc.ResolvedItem;
import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.NutrientTotals;
import es.fitona.nutrition.Precision;
import es.fitona.nutrition.Quality;
import es.fitona.nutrition.Total;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class DiaryRepository {

    public record StoredEntry(UUID id, LocalDate date, String slot, String note) {}

    public record StoredItem(UUID id, UUID entryId, String kind, String displayName, BigDecimal quantity, String unit,
                             BigDecimal grams, BigDecimal servings, NutrientTotals totals) {}

    private static final Nutrient[] ORDER = {Nutrient.ENERGY_KCAL, Nutrient.PROTEIN_G, Nutrient.CARBS_G, Nutrient.SUGARS_G,
            Nutrient.FAT_G, Nutrient.SAT_FAT_G, Nutrient.FIBER_G, Nutrient.SALT_G, Nutrient.ALCOHOL_G};

    @Inject
    Db db;

    public boolean exists(UUID user, UUID entryId) {
        Integer n = db.queryOne("SELECT COUNT(*) FROM FOOD_LOG_ENTRIES WHERE ID = ? AND USER_ID = ?", ps -> {
            ps.setBytes(1, Ids.toRaw(entryId));
            ps.setBytes(2, Ids.toRaw(user));
        }, rs -> rs.getInt(1));
        return n != null && n > 0;
    }

    /** Existe con ese ID para OTRA persona: el cliente no puede reutilizar ids ajenos. */
    public boolean existsForAnyone(UUID entryId) {
        Integer n = db.queryOne("SELECT COUNT(*) FROM FOOD_LOG_ENTRIES WHERE ID = ?",
                ps -> ps.setBytes(1, Ids.toRaw(entryId)), rs -> rs.getInt(1));
        return n != null && n > 0;
    }

    public void insertEntry(UUID user, UUID id, LocalDate date, String slot, String method, String note) {
        db.update("INSERT INTO FOOD_LOG_ENTRIES (ID, USER_ID, EATEN_ON, MEAL_SLOT, LOG_METHOD, NOTE) VALUES (?, ?, ?, ?, ?, ?)",
                ps -> {
                    ps.setBytes(1, Ids.toRaw(id));
                    ps.setBytes(2, Ids.toRaw(user));
                    ps.setObject(3, date);
                    ps.setString(4, slot);
                    ps.setString(5, method);
                    ps.setString(6, note);
                });
    }

    /** Guarda el elemento con INSTANTÁNEA de nutrientes: si el catálogo cambia, el histórico no cambia. */
    public void insertItem(UUID entryId, int sort, ResolvedItem it) {
        NutrientTotals t = it.totals();
        db.update("INSERT INTO FOOD_LOG_ITEMS (ENTRY_ID, SORT_ORDER, ITEM_KIND, VARIANT_ID, RECIPE_VERSION_ID, DISPLAY_NAME, "
                + "QUANTITY, UNIT_CODE, GRAMS, QUANTITY_SPECIFIED, SERVINGS, ESTIMATE_MODIFIERS, ENERGY_KCAL, PROTEIN_G, "
                + "CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G, FIBER_G, SALT_G, ALCOHOL_G, DATA_QUALITY, NUTRIENT_PROFILE_ID) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, " + db.json() + ", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ps -> {
            ps.setBytes(1, Ids.toRaw(entryId));
            ps.setInt(2, sort);
            ps.setString(3, it.kind());
            if (it.variantId() == null) ps.setNull(4, Types.NUMERIC); else ps.setLong(4, it.variantId());
            if (it.recipeVersionId() == null) ps.setNull(5, Types.BINARY); else ps.setBytes(5, Ids.toRaw(it.recipeVersionId()));
            ps.setString(6, it.displayName());
            ps.setBigDecimal(7, it.quantity());
            ps.setString(8, it.unitCode());
            ps.setBigDecimal(9, it.grams() == null ? null : it.grams().setScale(2, RoundingMode.HALF_UP));
            ps.setBigDecimal(10, it.servings());
            StringBuilder inc = new StringBuilder();
            for (Nutrient n : ORDER) {
                Total tt = t.get(n);
                if (tt.known() && !tt.complete()) inc.append(inc.length() == 0 ? "" : ",").append('"').append(n.name()).append('"');
            }
            ps.setString(11, "{\"precision\":\"" + t.precision().name() + "\",\"incomplete\":[" + inc + "]}");
            for (int i = 0; i < ORDER.length; i++) {
                Total v = t.get(ORDER[i]);
                BigDecimal val = v.known() ? v.value().setScale(ORDER[i] == Nutrient.SALT_G ? 3 : 2, RoundingMode.HALF_UP) : null;
                ps.setBigDecimal(12 + i, val);
            }
            ps.setString(21, t.quality().name());
            if (it.profileId() == null) ps.setNull(22, Types.NUMERIC); else ps.setLong(22, it.profileId());
        });
    }

    public List<StoredEntry> entriesOn(UUID user, LocalDate date) {
        return db.query("SELECT ID, EATEN_ON, MEAL_SLOT, NOTE FROM FOOD_LOG_ENTRIES WHERE USER_ID = ? AND EATEN_ON = ? "
                + "AND DELETED_AT IS NULL ORDER BY CASE MEAL_SLOT WHEN 'BREAKFAST' THEN 1 WHEN 'MID_MORNING' THEN 2 "
                + "WHEN 'LUNCH' THEN 3 WHEN 'AFTERNOON_SNACK' THEN 4 WHEN 'DINNER' THEN 5 ELSE 6 END, CREATED_AT", ps -> {
            ps.setBytes(1, Ids.toRaw(user));
            ps.setObject(2, date);
        }, rs -> new StoredEntry(Ids.fromRaw(rs.getBytes(1)), rs.getObject(2, LocalDate.class), rs.getString(3),
                rs.getString(4)));
    }

    public StoredEntry entry(UUID user, UUID id) {
        return db.queryOne("SELECT ID, EATEN_ON, MEAL_SLOT, NOTE FROM FOOD_LOG_ENTRIES WHERE ID = ? AND USER_ID = ? "
                + "AND DELETED_AT IS NULL", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setBytes(2, Ids.toRaw(user));
        }, rs -> new StoredEntry(Ids.fromRaw(rs.getBytes(1)), rs.getObject(2, LocalDate.class), rs.getString(3),
                rs.getString(4)));
    }

    public List<StoredItem> items(List<UUID> entryIds) {
        if (entryIds.isEmpty()) return List.of();
        String in = entryIds.stream().map(x -> "?").collect(Collectors.joining(","));
        return db.query("SELECT ID, ENTRY_ID, ITEM_KIND, DISPLAY_NAME, QUANTITY, UNIT_CODE, GRAMS, SERVINGS, "
                + "ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G, FIBER_G, SALT_G, ALCOHOL_G, DATA_QUALITY, "
                + "" + db.jsonText("ESTIMATE_MODIFIERS", "precision") + ", " + db.jsonQuery("ESTIMATE_MODIFIERS", "incomplete") + " FROM FOOD_LOG_ITEMS WHERE ENTRY_ID IN (" + in
                + ") ORDER BY SORT_ORDER", ps -> {
            int i = 1;
            for (UUID id : entryIds) ps.setBytes(i++, Ids.toRaw(id));
        }, rs -> {
            EnumMap<Nutrient, Total> m = new EnumMap<>(Nutrient.class);
            for (int i = 0; i < ORDER.length; i++) {
                BigDecimal v = rs.getBigDecimal(9 + i);
                boolean incomplete = rs.getString(20) != null && rs.getString(20).contains("\"" + ORDER[i].name() + "\"");
                m.put(ORDER[i], v == null ? Total.UNKNOWN : new Total(v, !incomplete));
            }
            String p = rs.getString(19);
            NutrientTotals t = new NutrientTotals(m, Quality.valueOf(rs.getString(18)),
                    p == null ? Precision.APPROXIMATE : Precision.valueOf(p));
            return new StoredItem(Ids.fromRaw(rs.getBytes(1)), Ids.fromRaw(rs.getBytes(2)), rs.getString(3),
                    rs.getString(4), rs.getBigDecimal(5), rs.getString(6), rs.getBigDecimal(7), rs.getBigDecimal(8), t);
        });
    }

    public boolean softDelete(UUID user, UUID id) {
        return db.update("UPDATE FOOD_LOG_ENTRIES SET DELETED_AT = CURRENT_TIMESTAMP, ROW_VERSION = ROW_VERSION + 1 "
                + "WHERE ID = ? AND USER_ID = ? AND DELETED_AT IS NULL", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setBytes(2, Ids.toRaw(user));
        }) > 0;
    }

    public List<UUID> allEntryIds(UUID user) {
        return db.query("SELECT ID FROM FOOD_LOG_ENTRIES WHERE USER_ID = ? AND DELETED_AT IS NULL ORDER BY EATEN_ON, CREATED_AT",
                ps -> ps.setBytes(1, Ids.toRaw(user)), rs -> Ids.fromRaw(rs.getBytes(1)));
    }

}
