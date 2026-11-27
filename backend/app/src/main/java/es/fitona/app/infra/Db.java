package es.fitona.app.infra;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

/** Acceso JDBC mínimo. Todas las consultas son parametrizadas. Participa en la transacción activa (JTA). */
@ApplicationScoped
public class Db {

    @FunctionalInterface
    public interface Binder {
        void bind(PreparedStatement ps) throws SQLException;
    }

    @FunctionalInterface
    public interface Mapper<T> {
        T map(ResultSet rs) throws SQLException;
    }

    @Inject
    DataSource dataSource;

    private volatile Boolean postgres;

    /** true con PostgreSQL (despliegue en Render + Neon); false con Oracle (desarrollo local). Se detecta una vez en la conexión. */
    public boolean postgres() {
        Boolean p = postgres;
        if (p == null) {
            try (Connection c = dataSource.getConnection()) {
                p = c.getMetaData().getDatabaseProductName().toLowerCase().contains("postgres");
            } catch (SQLException e) {
                throw new DataAccessException(e);
            }
            postgres = p;
        }
        return p;
    }

    /** Marcador de parámetro para una columna JSON. */
    public String json() {
        return postgres() ? "CAST(? AS JSONB)" : "JSON(?)";
    }

    /** Valor escalar de una clave JSON como texto. */
    public String jsonText(String column, String key) {
        return postgres() ? column + "->>'" + key + "'" : "JSON_VALUE(" + column + ", '$." + key + "')";
    }

    /** Fragmento JSON (p. ej. una lista) como texto. */
    public String jsonQuery(String column, String key) {
        return postgres() ? "(" + column + "->'" + key + "')::text" : "JSON_QUERY(" + column + ", '$." + key + "')";
    }

    public <T> List<T> query(String sql, Binder binder, Mapper<T> mapper) {
        try (Connection c = dataSource.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            binder.bind(ps);
            try (ResultSet rs = ps.executeQuery()) {
                List<T> out = new ArrayList<>();
                while (rs.next()) out.add(mapper.map(rs));
                return out;
            }
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    public <T> T queryOne(String sql, Binder binder, Mapper<T> mapper) {
        List<T> r = query(sql, binder, mapper);
        return r.isEmpty() ? null : r.get(0);
    }

    public int update(String sql, Binder binder) {
        try (Connection c = dataSource.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            binder.bind(ps);
            return ps.executeUpdate();
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    /** INSERT con clave numérica generada (columna ID). */
    public long insertReturningId(String sql, Binder binder) {
        try (Connection c = dataSource.getConnection()) {
            if (postgres()) {
                try (PreparedStatement ps = c.prepareStatement(sql + " RETURNING ID")) {
                    binder.bind(ps);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new DataAccessException(new SQLException("Sin clave generada"));
                        return rs.getLong(1);
                    }
                }
            }
            try (PreparedStatement ps = c.prepareStatement(sql, new String[] {"ID"})) {
                binder.bind(ps);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (!rs.next()) throw new DataAccessException(new SQLException("Sin clave generada"));
                    return rs.getLong(1);
                }
            }
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    public static final class DataAccessException extends RuntimeException {
        private final int errorCode;
        private final String sqlState;

        public DataAccessException(SQLException cause) {
            super(cause.getMessage(), cause);
            this.errorCode = cause.getErrorCode();
            this.sqlState = cause.getSQLState();
        }

        public int errorCode() {
            return errorCode;
        }

        /** Clave duplicada (Oracle ORA-00001 / PostgreSQL 23505). */
        public boolean isUnique() {
            return errorCode == 1 || "23505".equals(sqlState);
        }

        /** Restricción de integridad rechazada: única, CHECK o clave foránea (Oracle 1/2290/2291 · PostgreSQL 23505/23514/23503). */
        public boolean isIntegrity() {
            return errorCode == 2290 || errorCode == 2291 || isUnique() || "23514".equals(sqlState) || "23503".equals(sqlState);
        }
    }
}
