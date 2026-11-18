package es.fitona.app.infra;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/** Normalización de nombres para búsqueda: minúsculas, sin tildes ni signos (FOOD_NAMES.NAME_KEY). */
public final class TextKeys {
    private TextKeys() {}

    public static String key(String text) {
        if (text == null) return "";
        String n = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        return n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    public static List<String> tokens(String text) {
        String k = key(text);
        return k.isEmpty() ? List.of() : Arrays.asList(k.split(" "));
    }
}
