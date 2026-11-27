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
        as(me).get("/api/v1/foods?q=manzana").then().body("name", org.hamcrest.Matchers.hasItems("Manzana", "Manzana de prueba"));

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
        as(b).get("/api/v1/foods?q=prueba").then().body("", empty());
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
                .then().statusCode(422).body("detail", containsString("vasos"));
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

    @Test
    void starterCatalogIsSearchableLabelledAsUnverifiedAndKeepsRawAndCookedApart() {
        UUID me = UUID.randomUUID();
        as(me).get("/api/v1/foods?q=batata").then().statusCode(200).body("name", org.hamcrest.Matchers.hasItem("Boniato"));
        as(me).get("/api/v1/foods?q=Habichuelas").then().body("name", org.hamcrest.Matchers.hasItem("Judías verdes"));
        as(me).get("/api/v1/foods?q=queso granulado").then().body("name", org.hamcrest.Matchers.hasItem("Queso cottage"));
        Response rice = as(me).get("/api/v1/foods?q=arroz blanco");
        rice.then().body("$", hasSize(2)).body("quality", org.hamcrest.Matchers.everyItem(equalTo("ESTIMATE")))
                .body("source", org.hamcrest.Matchers.everyItem(containsString("sin verificar")))
                .body("icon", org.hamcrest.Matchers.everyItem(equalTo("🍚")))
                .body("editable", org.hamcrest.Matchers.everyItem(equalTo(false)));
        // 100 g de arroz crudo y 100 g de arroz cocido NO son equivalentes (365 frente a 130 kcal)
        rice.then().body("find { it.displayName.contains('crudo') }.per100.energyKcal", equalTo(365))
                .body("find { it.displayName.contains('cocido') }.per100.energyKcal", equalTo(130));
        // Un alimento del catálogo no se puede editar ni borrar
        long id = rice.jsonPath().getLong("[0].variantId");
        as(me).body(APPLE).put("/api/v1/foods/" + id).then().statusCode(404);
        as(me).delete("/api/v1/foods/" + id).then().statusCode(404);
        // Medida casera del huevo y registro con cantidad en unidades
        long egg = as(me).get("/api/v1/foods?q=huevo de gallina").jsonPath().getLong("[0].variantId");
        as(me).body("{\"items\":[{\"variantId\":" + egg + ",\"quantity\":2,\"unitCode\":\"UNIT\"}]}").post("/api/v1/calc")
                .then().statusCode(200).body("items[0].grams", equalTo(110)).body("total.quality", equalTo("ESTIMATE"));
    }

    @Test
    void typicalRecipesCanBeCopiedAndAreComputedByTheEngine() {
        UUID me = UUID.randomUUID();
        as(me).get("/api/v1/recipes/templates").then().statusCode(200).body("$", hasSize(12));
        // 500 g patata + 5 huevos + 1 cebolla + 4 cucharadas de aceite = 1.317 kcal en total / 4 raciones
        as(me).post("/api/v1/recipes/templates/tortilla-de-patatas/copy").then().statusCode(201)
                .body("title", equalTo("Tortilla de patatas")).body("completeness", equalTo("COMPLETE"))
                .body("perServing.nutrients.energyKcal.value", equalTo(329))
                .body("perServing.quality", equalTo("ESTIMATE"));
        as(me).get("/api/v1/recipes").then().body("$", hasSize(1));
        as(me).post("/api/v1/recipes/templates/no-existe/copy").then().statusCode(404);
        // todas las plantillas se resuelven contra el catálogo (si falta un alimento, esta prueba falla)
        for (String key : as(me).get("/api/v1/recipes/templates").jsonPath().getList("key", String.class)) {
            as(me).post("/api/v1/recipes/templates/" + key + "/copy").then().statusCode(201).body("completeness", equalTo("COMPLETE"));
        }
    }

    @Test
    void absurdQuantitiesAndOversizedListsAreRejectedWithAClearMessageNotA500() {
        UUID me = UUID.randomUUID();
        long egg = as(me).get("/api/v1/foods?q=huevo de gallina").jsonPath().getLong("[0].variantId");
        as(me).body("{\"items\":[{\"variantId\":" + egg + ",\"quantity\":1e30,\"unitCode\":\"G\"}]}").post("/api/v1/calc")
                .then().statusCode(400);
        as(me).body("{\"date\":\"" + LocalDate.now() + "\",\"mealSlot\":\"LUNCH\",\"items\":[{\"variantId\":" + egg
                + ",\"quantity\":99999999999,\"unitCode\":\"G\"}]}").post("/api/v1/diary/entries").then().statusCode(400);
        as(me).body("{\"title\":\"x\",\"servings\":1,\"ingredients\":[{\"variantId\":" + egg
                + ",\"quantity\":99999999999,\"unitCode\":\"G\"}]}").post("/api/v1/recipes").then().statusCode(400);
        StringBuilder steps = new StringBuilder();
        for (int i = 0; i < 101; i++) steps.append(i == 0 ? "" : ",").append("{\"instruction\":\"p\"}");
        as(me).body("{\"title\":\"x\",\"servings\":1,\"ingredients\":[{\"freeText\":\"sal\"}],\"steps\":[" + steps + "]}")
                .post("/api/v1/recipes").then().statusCode(400);
        // el límite razonable sigue funcionando
        as(me).body("{\"items\":[{\"variantId\":" + egg + ",\"quantity\":100000,\"unitCode\":\"G\"}]}").post("/api/v1/calc")
                .then().statusCode(200);
    }

    @Test
    void invalidDateIsA400AndUnitErrorsSpeakSpanish() {
        UUID me = UUID.randomUUID();
        as(me).get("/api/v1/diary?date=abc").then().statusCode(400).body("detail", containsString("AAAA-MM-DD"));
        long rice = as(me).get("/api/v1/foods?q=arroz blanco cocido").jsonPath().getLong("[0].variantId");
        as(me).body("{\"items\":[{\"variantId\":" + rice + ",\"quantity\":1,\"unitCode\":\"GLASS\"}]}").post("/api/v1/calc")
                .then().statusCode(422).body("detail", containsString("vasos")).body("detail", containsString("Arroz"));
    }

    @Test
    void parallelRetriesOfTheSameEntryAllSucceedAndStoreOnlyOne() throws Exception {
        UUID me = UUID.randomUUID();
        UUID id = UUID.randomUUID();
        String body = "{\"id\":\"" + id + "\",\"date\":\"" + LocalDate.now()
                + "\",\"mealSlot\":\"LUNCH\",\"items\":[{\"freeText\":\"Lentejas\"}]}";
        java.util.concurrent.ExecutorService pool = java.util.concurrent.Executors.newFixedThreadPool(8);
        java.util.List<java.util.concurrent.Future<Integer>> calls = new java.util.ArrayList<>();
        for (int i = 0; i < 8; i++) calls.add(pool.submit(() -> as(me).body(body).post("/api/v1/diary/entries").statusCode()));
        for (java.util.concurrent.Future<Integer> f : calls) org.junit.jupiter.api.Assertions.assertEquals(201, f.get());
        pool.shutdown();
        as(me).get("/api/v1/diary").then().body("entries", hasSize(1));
    }

    @Test
    void categoriesIconsAndFoodsWithoutNutrientData() {
        UUID me = UUID.randomUUID();
        Response cats = as(me).get("/api/v1/foods/categories");
        cats.then().statusCode(200).body("$", hasSize(34)).body("[0].code", equalTo("MINE"))
                .body("find { it.code == 'FRUTAS' }.name", equalTo("Frutas")).body("find { it.code == 'FRUTAS' }.icon", equalTo("🍎"));
        int total = cats.jsonPath().getList("count", Integer.class).stream().mapToInt(Integer::intValue).sum();
        org.junit.jupiter.api.Assertions.assertTrue(total >= 576, "el catálogo debe tener al menos 576 alimentos, hay " + total);
        // filtro por categoría: solo esa categoría, y cada alimento con su imagen
        as(me).get("/api/v1/foods?category=FRUTAS&limit=200").then().body("$", hasSize(31))
                .body("categoryCode", org.hamcrest.Matchers.everyItem(equalTo("FRUTAS")))
                .body("icon", org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.notNullValue()));
        // sin icono propio, hereda el de su categoría
        as(me).get("/api/v1/foods?q=fuet").then().body("[0].icon", equalTo("🥓")).body("[0].categoryName", equalTo("Embutidos y fiambres"));
        // sin datos: se puede ver, pero no calcular ni usar en recetas (no se inventan cifras)
        Response avocado = as(me).get("/api/v1/foods?q=edulcorante");
        avocado.then().body("[0].hasNutrients", equalTo(false)).body("[0].quality", equalTo("NONE"))
                .body("[0].per100.energyKcal", org.hamcrest.Matchers.nullValue());
        long av = avocado.jsonPath().getLong("[0].variantId");
        as(me).body("{\"items\":[{\"variantId\":" + av + ",\"quantity\":100,\"unitCode\":\"G\"}]}").post("/api/v1/calc")
                .then().statusCode(422).body("detail", containsString("datos nutricionales"));
        as(me).body("{\"title\":\"x\",\"servings\":1,\"ingredients\":[{\"variantId\":" + av + ",\"quantity\":100,\"unitCode\":\"G\"}]}")
                .post("/api/v1/recipes").then().statusCode(422);
        // Retirados (DEPRECATED) del catálogo antiguo no salen en el buscador
        as(me).get("/api/v1/foods?q=arroz blanco").then().body("name", org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Arroz blanco")));
    }

    @Test
    void aPersonCanSetOwnValuesForACatalogFoodAndGoBackToTheCatalogOne() {
        UUID me = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        Response avocado = as(me).get("/api/v1/foods?q=edulcorante");
        long av = avocado.jsonPath().getLong("[0].variantId");
        String icon = avocado.jsonPath().getString("[0].icon");
        String category = avocado.jsonPath().getString("[0].categoryCode");
        Response mine = as(me).body("{\"name\":\"Edulcorante\",\"basedOnVariantId\":" + av
                + ",\"per100\":{\"energyKcal\":160,\"proteinG\":2,\"carbsG\":1.8,\"fatG\":14.7}}").post("/api/v1/foods");
        mine.then().statusCode(201).body("food.overridesCatalog", equalTo(true)).body("food.editable", equalTo(true))
                .body("food.icon", equalTo(icon)).body("food.categoryCode", equalTo(category)).body("food.quality", equalTo("CUSTOM"));
        long mineId = mine.jsonPath().getLong("food.variantId");
        // para mí el de catálogo desaparece del buscador y aparece el mío (con datos); para otra persona sigue el del catálogo
        as(me).get("/api/v1/foods?q=edulcorante").then().body("$", hasSize(1)).body("[0].variantId", equalTo((int) mineId))
                .body("[0].hasNutrients", equalTo(true));
        as(other).get("/api/v1/foods?q=edulcorante").then().body("$", hasSize(1)).body("[0].variantId", equalTo((int) av))
                .body("[0].hasNutrients", equalTo(false));
        as(me).body("{\"items\":[{\"variantId\":" + mineId + ",\"quantity\":100,\"unitCode\":\"G\"}]}").post("/api/v1/calc")
                .then().statusCode(200).body("total.nutrients.energyKcal.value", equalTo(160));
        // un alimento propio no se puede «personalizar» y el del catálogo no se puede editar
        as(me).body("{\"name\":\"x\",\"basedOnVariantId\":" + mineId + ",\"per100\":{\"proteinG\":1}}").post("/api/v1/foods").then().statusCode(400);
        as(me).body("{\"name\":\"x\",\"per100\":{\"proteinG\":1}}").put("/api/v1/foods/" + av).then().statusCode(404);
        // volver al valor del catálogo = borrar lo mío
        as(me).delete("/api/v1/foods/" + mineId).then().statusCode(204);
        as(me).get("/api/v1/foods?q=edulcorante").then().body("[0].variantId", equalTo((int) av));
    }
}
