package es.fitona.app;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import java.util.Map;
import org.junit.jupiter.api.Test;

@QuarkusTest
@TestProfile(ClosedRegistrationTest.Closed.class)
class ClosedRegistrationTest {

    public static class Closed implements QuarkusTestProfile {
        @Override
        public Map<String, String> getConfigOverrides() {
            return Map.of("fitona.auth.registration-open", "false");
        }
    }

    @Test
    void whenRegistrationIsClosedNobodyCanCreateAnAccount() {
        given().contentType(ContentType.JSON)
                .body("{\"email\":\"nuevo@example.com\",\"password\":\"clave-larga-1\",\"adult\":true,\"healthConsent\":true}")
                .post("/api/v1/auth/register").then().statusCode(403);
    }
}
