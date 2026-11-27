package es.fitona.app.security;

import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Base64;
import java.util.Deque;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Registro, inicio y cierre de sesión con correo y contraseña. Sesiones con token opaco (se guarda solo su hash). */
@ApplicationScoped
public class AuthService {

    public static final String POLICY_VERSION = "2026-11-borrador";
    static final Duration SESSION_LIFETIME = Duration.ofDays(90);
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final SecureRandom RANDOM = new SecureRandom();
    /** Hash de relleno para que «correo desconocido» tarde lo mismo que «contraseña incorrecta». */
    private static final String DUMMY = PasswordHasher.hash("relleno-no-valido");

    public record Session(String token, UUID userId, String email) {}

    public static final class AuthException extends RuntimeException {
        public final int status;

        public AuthException(int status, String message) {
            super(message);
            this.status = status;
        }
    }

    @Inject
    Db db;

    // shortcut: contador en memoria (una sola instancia del backend); con varias instancias, moverlo a la BD.
    private final ConcurrentHashMap<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public static String normalizeEmail(String email) {
        String e = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (e.length() > 254 || !e.matches("[^@\\s]+@[^@\\s]+\\.[^@\\s]+")) {
            throw new AuthException(400, "Escribe un correo válido.");
        }
        return e;
    }

    @Transactional
    public Session register(String emailRaw, String password, boolean adult, boolean healthConsent) {
        String email = normalizeEmail(emailRaw);
        if (password == null || password.length() < 4 || password.length() > 128) {
            throw new AuthException(400, "La contraseña debe tener entre 4 y 128 caracteres.");
        }
        if (!adult) throw new AuthException(400, "FITona es solo para personas adultas.");
        if (!healthConsent) {
            throw new AuthException(400, "Necesitamos tu consentimiento para tratar tus datos de alimentación (datos de salud).");
        }
        UUID id = UUID.randomUUID();
        try {
            db.update("INSERT INTO APP_USERS (ID, AUTH_SUBJECT, ADULT_CONFIRMED_AT) VALUES (?, ?, SYSTIMESTAMP)", ps -> {
                ps.setBytes(1, Ids.toRaw(id));
                ps.setString(2, "local:" + id);
            });
            db.update("INSERT INTO USER_CREDENTIALS (USER_ID, EMAIL_NORM, PASSWORD_HASH) VALUES (?, ?, ?)", ps -> {
                ps.setBytes(1, Ids.toRaw(id));
                ps.setString(2, email);
                ps.setString(3, PasswordHasher.hash(password));
            });
        } catch (Db.DataAccessException e) {
            if (e.errorCode() == 1) throw new AuthException(409, "Ya existe una cuenta con ese correo. Inicia sesión.");
            throw e;
        }
        db.update("INSERT INTO USER_CONSENTS (USER_ID, CONSENT_CODE, POLICY_VERSION, GRANTED, DECISION_SOURCE) "
                + "VALUES (?, 'HEALTH_DATA_PROCESSING', ?, TRUE, 'ONBOARDING')", ps -> {
            ps.setBytes(1, Ids.toRaw(id));
            ps.setString(2, POLICY_VERSION);
        });
        return openSession(id, email);
    }

    public Session login(String emailRaw, String password) {
        String email = normalizeEmail(emailRaw);
        Deque<Instant> recent = failures.computeIfAbsent(email, k -> new ArrayDeque<>());
        synchronized (recent) {
            Instant cutoff = Instant.now().minus(WINDOW);
            while (!recent.isEmpty() && recent.peekFirst().isBefore(cutoff)) recent.pollFirst();
            if (recent.size() >= MAX_FAILURES) {
                throw new AuthException(429, "Demasiados intentos. Espera unos 15 minutos y vuelve a probar.");
            }
        }
        Object[] row = db.queryOne("SELECT USER_ID, PASSWORD_HASH FROM USER_CREDENTIALS WHERE EMAIL_NORM = ?",
                ps -> ps.setString(1, email), rs -> new Object[] {Ids.fromRaw(rs.getBytes(1)), rs.getString(2)});
        boolean ok = PasswordHasher.verify(password == null ? "" : password, row == null ? DUMMY : (String) row[1]);
        if (row == null || !ok) {
            synchronized (recent) {
                recent.addLast(Instant.now());
            }
            throw new AuthException(401, "Correo o contraseña incorrectos.");
        }
        failures.remove(email);
        return openSession((UUID) row[0], email);
    }

    /** Persona dueña de un token vigente, o null. */
    public UUID userForToken(String token) {
        return db.queryOne("SELECT USER_ID FROM AUTH_SESSIONS WHERE TOKEN_HASH = ? AND EXPIRES_AT > SYSTIMESTAMP",
                ps -> ps.setString(1, sha256(token)), rs -> Ids.fromRaw(rs.getBytes(1)));
    }

    public String emailOf(UUID user) {
        return db.queryOne("SELECT EMAIL_NORM FROM USER_CREDENTIALS WHERE USER_ID = ?", ps -> ps.setBytes(1, Ids.toRaw(user)),
                rs -> rs.getString(1));
    }

    public void logout(String token) {
        db.update("DELETE FROM AUTH_SESSIONS WHERE TOKEN_HASH = ?", ps -> ps.setString(1, sha256(token)));
    }

    private Session openSession(UUID user, String email) {
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        Timestamp expires = Timestamp.from(Instant.now().plus(SESSION_LIFETIME));
        db.update("DELETE FROM AUTH_SESSIONS WHERE USER_ID = ? AND EXPIRES_AT < SYSTIMESTAMP", ps -> ps.setBytes(1, Ids.toRaw(user)));
        db.update("INSERT INTO AUTH_SESSIONS (TOKEN_HASH, USER_ID, EXPIRES_AT) VALUES (?, ?, ?)", ps -> {
            ps.setString(1, sha256(token));
            ps.setBytes(2, Ids.toRaw(user));
            ps.setTimestamp(3, expires);
        });
        return new Session(token, user, email);
    }

    static String sha256(String s) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
