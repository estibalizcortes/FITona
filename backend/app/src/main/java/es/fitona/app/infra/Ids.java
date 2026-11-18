package es.fitona.app.infra;

import java.nio.ByteBuffer;
import java.util.UUID;

/** Conversión UUID <-> RAW(16). */
public final class Ids {
    private Ids() {}

    public static byte[] toRaw(UUID id) {
        ByteBuffer b = ByteBuffer.allocate(16);
        b.putLong(id.getMostSignificantBits());
        b.putLong(id.getLeastSignificantBits());
        return b.array();
    }

    public static UUID fromRaw(byte[] raw) {
        if (raw == null) return null;
        ByteBuffer b = ByteBuffer.wrap(raw);
        return new UUID(b.getLong(), b.getLong());
    }
}
