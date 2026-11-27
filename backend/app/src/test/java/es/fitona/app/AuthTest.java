package es.fitona.app;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

import es.fitona.app.security.PasswordHasher;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

@QuarkusTest
class AuthTest {

    private static Response post(String path, String body) {
        return given().contentType(ContentType.JSON).body(body).post(path);
    }

    private static String reg(String email, String pwd, boolean adult, boolean consent) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + pwd + "\",\"adult\":" + adult + ",\"healthConsent\":" + consent + "}";
    }

    @Test
    void passwordsAreHashedWithSaltAndVerified() {
        String h1 = PasswordHasher.hash("una-clave-larga-1");
        Assertions.assertNotEquals(h1, PasswordHasher.hash("una-clave-larga-1"), "la sal debe ser distinta");
        Assertions.assertTrue(PasswordHasher.verify("una-clave-larga-1", h1));
        Assertions.assertFalse(PasswordHasher.verify("otra-clave-larga-1", h1));
        Assertions.assertFalse(h1.contains("una-clave"));
    }

    @Test
    void registerLoginUseSessionAndIsolationBetweenAccounts() {
        String mail = "Persona" + UUID.randomUUID() + "@Example.com";
        // sin sesión no se entra
        given().get("/api/v1/foods?q=manzana").then().statusCode(401);
        // validaciones: adulta, consentimiento, contraseña corta, correo inválido
        post("/api/v1/auth/register", reg(mail, "clave-muy-larga-1", false, true)).then().statusCode(400);
        post("/api/v1/auth/register", reg(mail, "clave-muy-larga-1", true, false)).then().statusCode(400);
        post("/api/v1/auth/register", reg(mail, "abc", true, true)).then().statusCode(400);
        post("/api/v1/auth/register", reg("no-es-correo", "clave-muy-larga-1", true, true)).then().statusCode(400);
        String token = post("/api/v1/auth/register", reg(mail, "clave-muy-larga-1", true, true)).then().statusCode(201)
                .body("token", notNullValue()).extract().path("token");
        // correo repetido (aunque cambien las mayúsculas)
        post("/api/v1/auth/register", reg(mail.toLowerCase(), "clave-muy-larga-1", true, true)).then().statusCode(409);
        given().header("Authorization", "Bearer " + token).get("/api/v1/auth/me").then().statusCode(200)
                .body("email", equalTo(mail.toLowerCase()));
        // login correcto e incorrecto
        post("/api/v1/auth/login", "{\"email\":\"" + mail + "\",\"password\":\"mala-clave-larga-1\"}").then().statusCode(401)
                .body("detail", equalTo("Correo o contraseña incorrectos."));
        post("/api/v1/auth/login", "{\"email\":\"desconocido" + UUID.randomUUID() + "@example.com\",\"password\":\"x-clave-larga-1\"}").then().statusCode(401);
        String t2 = post("/api/v1/auth/login", "{\"email\":\"" + mail + "\",\"password\":\"clave-muy-larga-1\"}").then().statusCode(200)
                .extract().path("token");
        // los datos son de cada cuenta
        String foodId = given().header("Authorization", "Bearer " + token).contentType(ContentType.JSON)
                .body("{\"name\":\"Solo mío\",\"per100\":{\"proteinG\":1,\"carbsG\":1,\"fatG\":1}}").post("/api/v1/foods").then()
                .statusCode(201).extract().path("food.variantId").toString();
        String other = post("/api/v1/auth/register", reg("otra" + UUID.randomUUID() + "@example.com", "clave-muy-larga-2", true, true))
                .then().statusCode(201).extract().path("token");
        given().header("Authorization", "Bearer " + other).get("/api/v1/foods/" + foodId).then().statusCode(404);
        given().header("Authorization", "Bearer " + t2).get("/api/v1/foods/" + foodId).then().statusCode(200);
        // cerrar sesión invalida el token; token inventado = 401
        given().header("Authorization", "Bearer " + t2).post("/api/v1/auth/logout").then().statusCode(204);
        given().header("Authorization", "Bearer " + t2).get("/api/v1/foods/" + foodId).then().statusCode(401);
        given().header("Authorization", "Bearer inventado").get("/api/v1/auth/me").then().statusCode(401);
        // borrar la cuenta elimina también las credenciales: ya no se puede entrar
        given().header("Authorization", "Bearer " + token).delete("/api/v1/me").then().statusCode(204);
        post("/api/v1/auth/login", "{\"email\":\"" + mail + "\",\"password\":\"clave-muy-larga-1\"}").then().statusCode(401);
    }

    @Test
    void repeatedFailuresAreThrottled() {
        String mail = "fuerza" + UUID.randomUUID() + "@example.com";
        post("/api/v1/auth/register", reg(mail, "clave-muy-larga-1", true, true)).then().statusCode(201);
        for (int i = 0; i < 5; i++) {
            post("/api/v1/auth/login", "{\"email\":\"" + mail + "\",\"password\":\"mala-clave-larga-" + i + "\"}").then().statusCode(401);
        }
        post("/api/v1/auth/login", "{\"email\":\"" + mail + "\",\"password\":\"clave-muy-larga-1\"}").then().statusCode(429);
    }
}
