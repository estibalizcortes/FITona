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
        try (Connection c = dataSource.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, new String[] {"ID"})) {
            binder.bind(ps);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (!rs.next()) throw new DataAccessException(new SQLException("Sin clave generada"));
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new DataAccessException(e);
        }
    }

    public static final class DataAccessException extends RuntimeException {
        private final int errorCode;

        public DataAccessException(SQLException cause) {
            super(cause.getMessage(), cause);
            this.errorCode = cause.getErrorCode();
        }

        public int errorCode() {
            return errorCode;
        }
    }
}
