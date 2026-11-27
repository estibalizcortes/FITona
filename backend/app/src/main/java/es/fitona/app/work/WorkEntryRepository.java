package es.fitona.app.work;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class WorkEntryRepository {

    /** body = texto completo (get) o vista previa de 280 caracteres (listas); length = longitud total. */
    public record Row(UUID id, LocalDate date, String kind, String title, String body, int length, Instant createdAt, Instant updatedAt) {}

    public record DayCount(LocalDate date, int count) {}

    private static final String COLS_FULL = "ID, ENTRY_DATE, KIND, TITLE, BODY, LENGTH(BODY), CREATED_AT, UPDATED_AT";
    private static final String COLS_PREVIEW = "ID, ENTRY_DATE, KIND, TITLE, SUBSTR(BODY, 1, 280), LENGTH(BODY), CREATED_AT, UPDATED_AT";

    @Inject
    Db db;

    private static Row map(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Row(Ids.fromRaw(rs.getBytes(1)), rs.getDate(2).toLocalDate(), rs.getString(3), rs.getString(4), rs.getString(5),
                rs.getInt(6), rs.getTimestamp(7).toInstant(), rs.getTimestamp(8).toInstant());
    }

    public UUID insert(UUID user, WorkEntryRequest r) {
        UUID id = UUID.randomUUID();
        db.update("INSERT INTO WORK_ENTRIES (ID, USER_ID, ENTRY_DATE, KIND, TITLE, BODY) VALUES (?, ?, ?, ?, ?, ?)", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setBytes(2, Ids.toRaw(user));
            ps.setDate(3, Date.valueOf(r.date()));
            ps.setString(4, r.kind());
            ps.setString(5, blankToNull(r.title()));
            ps.setString(6, r.body());
        });
        return id;
    }

    public boolean update(UUID user, UUID id, WorkEntryRequest r) {
        return db.update("UPDATE WORK_ENTRIES SET ENTRY_DATE = ?, KIND = ?, TITLE = ?, BODY = ?, UPDATED_AT = CURRENT_TIMESTAMP "
                + "WHERE ID = ? AND USER_ID = ?", ps -> {
            ps.setDate(1, Date.valueOf(r.date()));
            ps.setString(2, r.kind());
            ps.setString(3, blankToNull(r.title()));
            ps.setString(4, r.body());
            ps.setBytes(5, Ids.toRaw(id));
            ps.setBytes(6, Ids.toRaw(user));
        }) > 0;
    }

    public boolean delete(UUID user, UUID id) {
        return db.update("DELETE FROM WORK_ENTRIES WHERE ID = ? AND USER_ID = ?", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setBytes(2, Ids.toRaw(user));
        }) > 0;
    }

    /** Solo si pertenece a la persona (si no, null: el recurso ajeno «no existe»). */
    public Row find(UUID user, UUID id) {
        return db.queryOne("SELECT " + COLS_FULL + " FROM WORK_ENTRIES WHERE ID = ? AND USER_ID = ?", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setBytes(2, Ids.toRaw(user));
        }, WorkEntryRepository::map);
    }

    public List<Row> onDate(UUID user, LocalDate date) {
        return db.query("SELECT " + COLS_PREVIEW + " FROM WORK_ENTRIES WHERE USER_ID = ? AND ENTRY_DATE = ? ORDER BY CREATED_AT", ps -> {
            ps.setBytes(1, Ids.toRaw(user));
            ps.setDate(2, Date.valueOf(date));
        }, WorkEntryRepository::map);
    }

    public List<DayCount> monthCounts(UUID user, LocalDate from, LocalDate toExclusive) {
        return db.query("SELECT ENTRY_DATE, COUNT(*) FROM WORK_ENTRIES WHERE USER_ID = ? AND ENTRY_DATE >= ? AND ENTRY_DATE < ? "
                + "GROUP BY ENTRY_DATE ORDER BY ENTRY_DATE", ps -> {
            ps.setBytes(1, Ids.toRaw(user));
            ps.setDate(2, Date.valueOf(from));
            ps.setDate(3, Date.valueOf(toExclusive));
        }, rs -> new DayCount(rs.getDate(1).toLocalDate(), rs.getInt(2)));
    }

    /** Historial: más recientes primero; con texto, busca (sin distinguir mayúsculas) en el título y en el cuerpo. */
    public List<Row> search(UUID user, String q, String kind, int limit, int offset) {
        StringBuilder sql = new StringBuilder("SELECT " + COLS_PREVIEW + " FROM WORK_ENTRIES WHERE USER_ID = ?");
        boolean hasQ = q != null && !q.isBlank();
        if (hasQ) sql.append(" AND (UPPER(TITLE) LIKE ? ESCAPE '\\' OR UPPER(BODY) LIKE ? ESCAPE '\\')");
        if (kind != null && !kind.isBlank()) sql.append(" AND KIND = ?");
        sql.append(" ORDER BY ENTRY_DATE DESC, CREATED_AT DESC OFFSET ? ROWS FETCH FIRST ? ROWS ONLY");
        String like = hasQ ? "%" + q.trim().toUpperCase(java.util.Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%" : null;
        return db.query(sql.toString(), ps -> {
            int i = 1;
            ps.setBytes(i++, Ids.toRaw(user));
            if (hasQ) { ps.setString(i++, like); ps.setString(i++, like); }
            if (kind != null && !kind.isBlank()) ps.setString(i++, kind);
            ps.setInt(i++, offset);
            ps.setInt(i, limit);
        }, WorkEntryRepository::map);
    }

    /** Para exportar los datos de la persona (RGPD): todo el texto completo. */
    public List<Row> all(UUID user) {
        return db.query("SELECT " + COLS_FULL + " FROM WORK_ENTRIES WHERE USER_ID = ? ORDER BY ENTRY_DATE, CREATED_AT",
                ps -> ps.setBytes(1, Ids.toRaw(user)), WorkEntryRepository::map);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
