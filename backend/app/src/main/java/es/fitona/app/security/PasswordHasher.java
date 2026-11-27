package es.fitona.app.security;

import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/** PBKDF2-HMAC-SHA256 con sal aleatoria (JDK, sin dependencias). Formato: pbkdf2$iteraciones$sal$hash (base64). */
public final class PasswordHasher {
    static final int DEFAULT_ITERATIONS = 600_000; // recomendación OWASP 2023 para PBKDF2-SHA256
    private static final int MIN_ITERATIONS = 10_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordHasher() {}

    public static String hash(String password) {
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        int it = iterations();
        return "pbkdf2$" + it + "$" + b64(salt) + "$" + b64(derive(password, salt, it));
    }

    public static boolean verify(String password, String stored) {
        String[] p = stored.split("\\$");
        if (p.length != 4 || !p[0].equals("pbkdf2")) return false;
        byte[] expected = Base64.getDecoder().decode(p[3]);
        byte[] actual = derive(password, Base64.getDecoder().decode(p[2]), Integer.parseInt(p[1]));
        return MessageDigest.isEqual(expected, actual);
    }

    /**
     * Iteraciones para contraseñas NUEVAS (fitona.auth.pbkdf2-iterations / FITONA_PBKDF2_ITERATIONS). Cada hash guarda las
     * suyas, así que bajarlas (p. ej. en un servidor de 0,1 CPU) no invalida las contraseñas ya guardadas.
     */
    static int iterations() {
        int v = org.eclipse.microprofile.config.ConfigProvider.getConfig()
                .getOptionalValue("fitona.auth.pbkdf2-iterations", Integer.class).orElse(DEFAULT_ITERATIONS);
        return Math.max(v, MIN_ITERATIONS);
    }

    private static byte[] derive(String password, byte[] salt, int iterations) {
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(new PBEKeySpec(password.toCharArray(), salt, iterations, 256)).getEncoded();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String b64(byte[] b) {
        return Base64.getEncoder().encodeToString(b);
    }
}
