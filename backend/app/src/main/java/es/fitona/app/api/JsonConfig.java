package es.fitona.app.api;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import io.quarkus.jackson.ObjectMapperCustomizer;
import jakarta.inject.Singleton;
import java.io.IOException;
import java.math.BigDecimal;

/** Los decimales salen sin ceros finales (500, no 500.00) para que la API sea idéntica con Oracle y con PostgreSQL. */
@Singleton
public class JsonConfig implements ObjectMapperCustomizer {
    @Override
    public void customize(ObjectMapper mapper) {
        SimpleModule m = new SimpleModule();
        m.addSerializer(BigDecimal.class, new JsonSerializer<>() {
            @Override
            public void serialize(BigDecimal v, JsonGenerator g, SerializerProvider p) throws IOException {
                g.writeNumber(v.signum() == 0 ? "0" : v.stripTrailingZeros().toPlainString());
            }
        });
        mapper.registerModule(m);
    }
}
