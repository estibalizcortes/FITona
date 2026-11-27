package es.fitona.app.goal;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.util.UUID;

@ApplicationScoped
public class NutritionGoalRepository {

    public record Row(String sex, int ageYears, BigDecimal heightCm, BigDecimal weightKg, BigDecimal targetWeightKg,
                      String dailyActivity, String jobType, BigDecimal sportHoursWeek, String mode) {}

    @Inject
    Db db;

    public Row find(UUID user) {
        return db.queryOne("SELECT SEX, AGE_YEARS, HEIGHT_CM, WEIGHT_KG, TARGET_WEIGHT_KG, DAILY_ACTIVITY, JOB_TYPE, "
                + "SPORT_HOURS_WEEK, GOAL_MODE FROM NUTRITION_GOALS WHERE USER_ID = ?", ps -> ps.setBytes(1, Ids.toRaw(user)),
                rs -> new Row(rs.getString(1), rs.getInt(2), rs.getBigDecimal(3), rs.getBigDecimal(4), rs.getBigDecimal(5),
                        rs.getString(6), rs.getString(7), rs.getBigDecimal(8), rs.getString(9)));
    }

    /** Guarda (crea o actualiza) el perfil de la persona. */
    public void save(UUID user, Row r) {
        int n = db.update("UPDATE NUTRITION_GOALS SET SEX = ?, AGE_YEARS = ?, HEIGHT_CM = ?, WEIGHT_KG = ?, TARGET_WEIGHT_KG = ?, "
                + "DAILY_ACTIVITY = ?, JOB_TYPE = ?, SPORT_HOURS_WEEK = ?, GOAL_MODE = ?, UPDATED_AT = CURRENT_TIMESTAMP WHERE USER_ID = ?",
                ps -> bind(ps, r, user));
        if (n == 0) {
            db.update("INSERT INTO NUTRITION_GOALS (SEX, AGE_YEARS, HEIGHT_CM, WEIGHT_KG, TARGET_WEIGHT_KG, DAILY_ACTIVITY, JOB_TYPE, "
                    + "SPORT_HOURS_WEEK, GOAL_MODE, USER_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ps -> bind(ps, r, user));
        }
    }

    private static void bind(java.sql.PreparedStatement ps, Row r, UUID user) throws java.sql.SQLException {
        ps.setString(1, r.sex());
        ps.setInt(2, r.ageYears());
        ps.setBigDecimal(3, r.heightCm());
        ps.setBigDecimal(4, r.weightKg());
        ps.setBigDecimal(5, r.targetWeightKg());
        ps.setString(6, r.dailyActivity());
        ps.setString(7, r.jobType());
        ps.setBigDecimal(8, r.sportHoursWeek());
        ps.setString(9, r.mode());
        ps.setBytes(10, Ids.toRaw(user));
    }
}
