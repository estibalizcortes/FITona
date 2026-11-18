package es.fitona.app;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * Pruebas de integración contra Oracle REAL (requiere `docker compose up -d oracle` + migraciones y
 * FITONA_DB_PASSWORD en el entorno). Cada prueba usa personas (UUID) nuevas para no interferir.
 */
@QuarkusTest
class ApiJourneyTest {

    private static final String APPLE = "{\"name\":\"Manzana de prueba\",\"per100\":{\"proteinG\":0.3,\"carbsG\":11.4,"
            + "\"fatG\":0.2,\"fiberG\":2.4},\"portions\":[{\"unitCode\":\"UNIT\",\"grams\":180,\"precision\":\"APPROXIMATE\"}]}";

    private static RequestSpecification as(UUID user) {
        return given().header("X-Dev-User", user.toString()).contentType(ContentType.JSON);
    }

    private static long createFood(UUID user, String body) {
        return as(user).body(body).post("/api/v1/foods").then().statusCode(201).extract().jsonPath().getLong("food.variantId");
    }

    @Test
    void fullJourney_createFood_calculate_log_reload_delete() {
        UUID me = UUID.randomUUID();
        String today = LocalDate.now().toString();

        Response created = as(me).body(APPLE).post("/api/v1/foods");
        created.then().statusCode(201).body("food.quality", equalTo("CUSTOM"))
                .body("warnings[0]", containsString("factores de la UE"));
        long variantId = created.jsonPath().getLong("food.variantId");
        // 0,3·4 + 11,4·4 + 0,2·9 + 2,4·2 = 53,4 kcal/100 g (factores UE, fibra a 2 kcal/g)
        created.then().body("food.per100.energyKcal", equalTo(53.4f));

        // Calcular (sin guardar): 2 unidades = 360 g -> 192,24 kcal -> se muestra 192
        as(me).body("{\"items\":[{\"variantId\":" + variantId + ",\"quantity\":2,\"unitCode\":\"UNIT\"}]}")
                .post("/api/v1/calc").then().statusCode(200)
                .body("items[0].grams", equalTo(360))
                .body("total.nutrients.energyKcal.value", equalTo(192))
                .body("total.quality", equalTo("CUSTOM")).body("total.precision", equalTo("APPROXIMATE"));
        as(me).get("/api/v1/diary?date=" + today).then().body("entries", empty());

        // Registrar y volver a consultar
        String entryBody = "{\"date\":\"" + today + "\",\"mealSlot\":\"BREAKFAST\",\"items\":[{\"variantId\":" + variantId
                + ",\"quantity\":2,\"unitCode\":\"UNIT\"},{\"freeText\":\"Café con leche\"}]}";
        String entryId = as(me).body(entryBody).post("/api/v1/diary/entries").then().statusCode(201)
                .body("items", hasSize(2)).extract().path("id");
        as(me).get("/api/v1/diary?date=" + today).then().statusCode(200)
                .body("entries", hasSize(1))
                .body("entries[0].items[0].displayName", equalTo("Manzana de prueba"))
                .body("entries[0].items[0].totals.nutrients.energyKcal.value", equalTo(192))
                .body("entries[0].items[1].totals.nutrients.energyKcal.value", org.hamcrest.Matchers.nullValue())
                .body("totals.nutrients.energyKcal.value", equalTo(192))
                .body("totals.nutrients.energyKcal.complete", equalTo(false)); // el texto libre no tiene cifras

        // Al buscar, lo usado aparece primero y el buscador ignora tildes y mayúsculas
        as(me).get("/api/v1/foods?q=MANZANA").then().body("[0].variantId", equalTo((int) variantId));

        as(me).delete("/api/v1/diary/entries/" + entryId).then().statusCode(204);
        as(me).get("/api/v1/diary?date=" + today).then().body("entries", empty());
    }

    @Test
    void historyKeepsItsSnapshotWhenTheFoodChanges() {
        UUID me = UUID.randomUUID();
        String today = LocalDate.now().toString();
        long v = createFood(me, APPLE);
        as(me).body("{\"date\":\"" + today + "\",\"mealSlot\":\"LUNCH\",\"items\":[{\"variantId\":" + v
                + ",\"quantity\":100,\"unitCode\":\"G\"}]}").post("/api/v1/diary/entries").then().statusCode(201);
        // El alimento cambia (ahora 100 kcal declaradas por 100 g)...
        as(me).body("{\"name\":\"Manzana de prueba\",\"per100\":{\"energyKcal\":100,\"carbsG\":20}}")
                .put("/api/v1/foods/" + v).then().statusCode(200).body("food.per100.energyKcal", equalTo(100));
        // ...pero el registro anterior conserva lo que valía entonces (53,4 -> 53)
        as(me).get("/api/v1/diary?date=" + today).then()
                .body("entries[0].items[0].totals.nutrients.energyKcal.value", equalTo(53));
    }

    @Test
    void peopleNeverSeeEachOthersData() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        String today = LocalDate.now().toString();
        long v = createFood(a, APPLE);
        String entryId = as(a).body("{\"date\":\"" + today + "\",\"mealSlot\":\"DINNER\",\"items\":[{\"variantId\":" + v
                + ",\"quantity\":1,\"unitCode\":\"UNIT\"}]}").post("/api/v1/diary/entries").then().statusCode(201)
                .extract().path("id");
        String recipeId = as(a).body("{\"title\":\"Privada\",\"servings\":1,\"ingredients\":[{\"variantId\":" + v
                + ",\"quantity\":100,\"unitCode\":\"G\"}]}").post("/api/v1/recipes").then().statusCode(201).extract().path("id");

        as(b).get("/api/v1/foods/" + v).then().statusCode(404);
        as(b).get("/api/v1/foods?q=manzana").then().body("", empty());
        as(b).get("/api/v1/diary/entries/" + entryId).then().statusCode(404);
        as(b).delete("/api/v1/diary/entries/" + entryId).then().statusCode(404);
        as(b).get("/api/v1/diary?date=" + today).then().body("entries", empty());
        as(b).get("/api/v1/recipes/" + recipeId).then().statusCode(404);
        as(b).body("{\"items\":[{\"variantId\":" + v + ",\"quantity\":1,\"unitCode\":\"G\"}]}").post("/api/v1/calc")
                .then().statusCode(404);
        as(b).body("{\"id\":\"" + entryId + "\",\"date\":\"" + today + "\",\"mealSlot\":\"DINNER\",\"items\":[{\"freeText\":\"x\"}]}")
                .post("/api/v1/diary/entries").then().statusCode(400);
        // Y A sigue viendo lo suyo
        as(a).get("/api/v1/diary/entries/" + entryId).then().statusCode(200);
    }

    @Test
    void requestsWithoutIdentityAreRejected() {
        given().get("/api/v1/foods").then().statusCode(401);
        given().header("X-Dev-User", "no-es-un-uuid").get("/api/v1/foods").then().statusCode(401);
    }

    @Test
    void invalidDataIsRejectedWithClearMessages() {
        UUID me = UUID.randomUUID();
        as(me).body("{\"name\":\"Imposible\",\"per100\":{\"proteinG\":60,\"carbsG\":60,\"fatG\":10}}")
                .post("/api/v1/foods").then().statusCode(400).body("detail", containsString("superan 100 g"));
        as(me).body("{\"name\":\"\",\"per100\":{\"proteinG\":1}}").post("/api/v1/foods").then().statusCode(400);
        as(me).body("{\"name\":\"Sin nada\",\"per100\":{}}").post("/api/v1/foods").then().statusCode(400)
                .body("detail", containsString("energía"));
        as(me).body("{\"name\":\"Azúcar rara\",\"per100\":{\"carbsG\":10,\"sugarsG\":20}}").post("/api/v1/foods")
                .then().statusCode(400);
        as(me).body("{\"name\":\"Negativo\",\"per100\":{\"proteinG\":-1}}").post("/api/v1/foods").then().statusCode(400);
        long v = createFood(me, APPLE);
        // Sin medida casera para esa unidad: NO se inventan gramos
        as(me).body("{\"items\":[{\"variantId\":" + v + ",\"quantity\":1,\"unitCode\":\"GLASS\"}]}").post("/api/v1/calc")
                .then().statusCode(422).body("detail", containsString("GLASS"));
        // Volumen sin densidad: tampoco
        as(me).body("{\"items\":[{\"variantId\":" + v + ",\"quantity\":1,\"unitCode\":\"ML\"}]}").post("/api/v1/calc")
                .then().statusCode(422);
        as(me).body("{\"items\":[{\"variantId\":" + v + ",\"freeText\":\"a\",\"quantity\":1,\"unitCode\":\"G\"}]}")
                .post("/api/v1/calc").then().statusCode(400);
        as(me).body("{\"date\":\"2001-01-01\",\"mealSlot\":\"LUNCH\",\"items\":[{\"freeText\":\"x\"}]}")
                .post("/api/v1/diary/entries").then().statusCode(400);
        as(me).body("{\"date\":\"" + LocalDate.now() + "\",\"mealSlot\":\"BRUNCH\",\"items\":[{\"freeText\":\"x\"}]}")
                .post("/api/v1/diary/entries").then().statusCode(400);
    }

    @Test
    void declaredCaloriesThatDontMatchMacrosProduceAWarningButAreStoredAsWritten() {
        UUID me = UUID.randomUUID();
        as(me).body("{\"name\":\"Raro\",\"per100\":{\"energyKcal\":500,\"proteinG\":10,\"carbsG\":10,\"fatG\":1}}")
                .post("/api/v1/foods").then().statusCode(201)
                .body("warnings[0]", containsString("difieren")).body("food.per100.energyKcal", equalTo(500));
    }

    @Test
    void recipesComputePerServingAndCanBeLogged() {
        UUID me = UUID.randomUUID();
        long v = createFood(me, APPLE);
        Response r = as(me).body("{\"title\":\"Compota\",\"servings\":2,\"ingredients\":[{\"variantId\":" + v
                + ",\"quantity\":4,\"unitCode\":\"UNIT\"}],\"steps\":[{\"instruction\":\"Cocer 15 min\"}]}")
                .post("/api/v1/recipes");
        r.then().statusCode(201).body("completeness", equalTo("COMPLETE")).body("version", equalTo(1))
                // 4 manzanas = 720 g -> 384,48 kcal; por ración (2): 192
                .body("perServing.nutrients.energyKcal.value", equalTo(192))
                .body("total.nutrients.energyKcal.value", equalTo(384));
        String id = r.path("id");

        // Con un ingrediente sin resolver la receta queda PARTIAL y se avisa
        as(me).body("{\"title\":\"Con canela\",\"servings\":1,\"ingredients\":[{\"variantId\":" + v
                + ",\"quantity\":100,\"unitCode\":\"G\"},{\"freeText\":\"canela\"}]}").post("/api/v1/recipes").then()
                .statusCode(201).body("completeness", equalTo("PARTIAL"))
                .body("perServing.nutrients.energyKcal.complete", equalTo(false));

        as(me).get("/api/v1/recipes").then().body("$", hasSize(2));
        as(me).body("{\"date\":\"" + LocalDate.now() + "\",\"mealSlot\":\"DINNER\",\"items\":[{\"recipeId\":\"" + id
                + "\",\"servings\":0.5}]}").post("/api/v1/diary/entries").then().statusCode(201)
                .body("items[0].totals.nutrients.energyKcal.value", equalTo(96));

        // Editar crea una versión nueva
        as(me).body("{\"title\":\"Compota v2\",\"servings\":4,\"ingredients\":[{\"variantId\":" + v
                + ",\"quantity\":4,\"unitCode\":\"UNIT\"}]}").put("/api/v1/recipes/" + id).then().statusCode(200)
                .body("version", equalTo(2)).body("perServing.nutrients.energyKcal.value", equalTo(96));

        // Un alimento usado en recetas no se puede borrar
        as(me).delete("/api/v1/foods/" + v).then().statusCode(409);
        as(me).delete("/api/v1/recipes/" + id).then().statusCode(204);
        as(me).get("/api/v1/recipes/" + id).then().statusCode(404);
    }

    @Test
    void sameEntryIdIsIdempotent() {
        UUID me = UUID.randomUUID();
        UUID id = UUID.randomUUID();
        String body = "{\"id\":\"" + id + "\",\"date\":\"" + LocalDate.now()
                + "\",\"mealSlot\":\"LUNCH\",\"items\":[{\"freeText\":\"Lentejas de mi madre\"}]}";
        as(me).body(body).post("/api/v1/diary/entries").then().statusCode(201);
        as(me).body(body).post("/api/v1/diary/entries").then().statusCode(201);
        as(me).get("/api/v1/diary").then().body("entries", hasSize(1))
                .body("entries[0].items[0].totals.quality", equalTo("NONE"));
    }

    @Test
    void exportAndAccountDeletionRemoveEverythingPersonal() {
        UUID me = UUID.randomUUID();
        long v = createFood(me, APPLE);
        as(me).body("{\"title\":\"R\",\"servings\":1,\"ingredients\":[{\"variantId\":" + v
                + ",\"quantity\":100,\"unitCode\":\"G\"}]}").post("/api/v1/recipes").then().statusCode(201);
        as(me).body("{\"date\":\"" + LocalDate.now() + "\",\"mealSlot\":\"LUNCH\",\"items\":[{\"variantId\":" + v
                + ",\"quantity\":1,\"unitCode\":\"UNIT\"}]}").post("/api/v1/diary/entries").then().statusCode(201);

        as(me).get("/api/v1/me/export").then().statusCode(200).body("format", equalTo("fitona-export-v1"))
                .body("foods", hasSize(1)).body("recipes", hasSize(1)).body("diaryEntries", hasSize(1))
                .body("exportedAt", notNullValue());

        as(me).delete("/api/v1/me").then().statusCode(204);
        // La cuenta se recrea vacía al volver a entrar con el mismo identificador de desarrollo
        as(me).get("/api/v1/me/export").then().statusCode(200).body("foods", empty()).body("recipes", empty())
                .body("diaryEntries", empty());
        as(me).get("/api/v1/foods/" + v).then().statusCode(404);
    }
}
