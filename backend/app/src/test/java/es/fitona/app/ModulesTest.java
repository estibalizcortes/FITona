package es.fitona.app;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** Módulos Comida (perfil, objetivo, plan) y Trabajo (notas por fecha). */
@QuarkusTest
class ModulesTest {

    private static RequestSpecification as(UUID u) {
        return given().header("X-Dev-User", u.toString()).contentType(ContentType.JSON);
    }

    private static final String PROFILE = "{\"sex\":\"F\",\"ageYears\":30,\"heightCm\":165,\"weightKg\":65,\"targetWeightKg\":60,"
            + "\"dailyActivity\":\"MODERATE\",\"jobType\":\"DESK\",\"sportHoursWeek\":3,\"mode\":\"%s\"}";

    // ---------- Perfil nutricional ----------

    @Test
    void nutritionProfileComputesTheTargetAndIsPrivate() {
        UUID me = UUID.randomUUID();
        as(me).get("/api/v1/nutrition/profile").then().statusCode(204);
        // mantenimiento: BMR 1370 · PAL 1,3 + deporte -> objetivo = mantenimiento
        Response maintain = as(me).body(String.format(PROFILE, "MAINTAIN")).put("/api/v1/nutrition/profile");
        maintain.then().statusCode(200).body("target.bmr", equalTo(1370)).body("target.deficit", equalTo(0));
        int maint = maintain.jsonPath().getInt("target.maintenance");
        Assertions.assertEquals(maint, maintain.jsonPath().getInt("target.target"));
        // déficit moderado: ~15 % menos, redondeado a 10 y nunca por encima del mantenimiento
        Response deficit = as(me).body(String.format(PROFILE, "DEFICIT")).put("/api/v1/nutrition/profile");
        int target = deficit.jsonPath().getInt("target.target");
        Assertions.assertTrue(target < maint && target >= Math.round(maint * 0.85 / 10.0) * 10 - 10, "déficit moderado: " + target + " vs " + maint);
        as(me).get("/api/v1/nutrition/profile").then().statusCode(200).body("mode", equalTo("DEFICIT")).body("target.target", equalTo(target));
        // datos imposibles -> 400 con mensaje, y nada se guarda
        as(me).body(String.format(PROFILE, "MAINTAIN").replace("\"ageYears\":30", "\"ageYears\":17")).put("/api/v1/nutrition/profile").then().statusCode(400);
        as(me).body(String.format(PROFILE, "OTRO")).put("/api/v1/nutrition/profile").then().statusCode(400);
        as(me).get("/api/v1/nutrition/profile").then().body("ageYears", equalTo(30));
        // otra persona no lo ve
        as(UUID.randomUUID()).get("/api/v1/nutrition/profile").then().statusCode(204);
    }

    // ---------- Preferencias y estado ----------

    @Test
    void homePreferencesArePerAccountValidatedAndPrivate() {
        UUID me = UUID.randomUUID();
        as(me).get("/api/v1/me/preferences").then().statusCode(200).body("homeOrder", hasSize(0)).body("homeIndicators", equalTo(true));
        // se guardan en el orden pedido; los identificadores desconocidos o repetidos se descartan
        as(me).body(Map.of("homeOrder", List.of("work", "food", "work", "zzz"), "homeHidden", List.of("sport"), "homeIndicators", false))
                .put("/api/v1/me/preferences").then().statusCode(200).body("homeOrder", equalTo(List.of("work", "food")));
        as(me).get("/api/v1/me/preferences").then().body("homeOrder", equalTo(List.of("work", "food")))
                .body("homeHidden", equalTo(List.of("sport"))).body("homeIndicators", equalTo(false));
        // formato no válido -> 400 y nada cambia
        as(me).body(Map.of("homeOrder", List.of("Food; DROP"), "homeHidden", List.of(), "homeIndicators", true))
                .put("/api/v1/me/preferences").then().statusCode(400);
        as(me).get("/api/v1/me/preferences").then().body("homeOrder", equalTo(List.of("work", "food")));
        // otra cuenta no las ve
        as(UUID.randomUUID()).get("/api/v1/me/preferences").then().body("homeOrder", hasSize(0));
        // sin sesión no hay acceso
        given().get("/api/v1/me/preferences").then().statusCode(401);
        // y se exportan con los datos de la cuenta
        as(me).get("/api/v1/me/export").then().statusCode(200).body("preferences.homeOrder", equalTo(List.of("work", "food")));
    }

    @Test
    void homeSummaryJoinsPreferencesAndTodayInOneCallAndIsPrivate() {
        UUID me = UUID.randomUUID();
        String today = LocalDate.now().toString();
        as(me).queryParam("date", today).get("/api/v1/home").then().statusCode(200)
                .body("foodEntries", equalTo(0)).body("workEntries", equalTo(0)).body("preferences.homeIndicators", equalTo(true));
        as(me).body(Map.of("date", today, "kind", "NOTE", "title", "x", "body", "y")).post("/api/v1/work/entries").then().statusCode(201);
        as(me).body(Map.of("homeOrder", List.of("work"), "homeHidden", List.of(), "homeIndicators", true)).put("/api/v1/me/preferences").then().statusCode(200);
        as(me).queryParam("date", today).get("/api/v1/home").then().body("workEntries", equalTo(1)).body("preferences.homeOrder", equalTo(List.of("work")));
        // otra cuenta no ve nada de lo mío
        as(UUID.randomUUID()).queryParam("date", today).get("/api/v1/home").then().body("workEntries", equalTo(0)).body("preferences.homeOrder", hasSize(0));
        given().get("/api/v1/home").then().statusCode(401);
    }

    @Test
    void statusIsPublicAndReportsDatabaseWithoutPersonalData() {
        given().get("/api/v1/status").then().statusCode(200).body("api", equalTo("up")).body("db", equalTo("ok"))
                .body("uptimeSeconds", greaterThan(-1)).body("$", not(org.hamcrest.Matchers.hasKey("email")));
    }

    // ---------- Trabajo ----------

    @Test
    void workEntriesByDateCalendarHistoryAndSearch() {
        UUID me = UUID.randomUUID();
        String d1 = LocalDate.now().toString();
        String d2 = LocalDate.now().minusDays(1).toString();
        // texto largo (20.000 caracteres con acentos) para comprobar el campo CLOB/TEXT
        String longText = "Reunión de planificación ñandú. ".repeat(625).substring(0, 20000);
        String id1 = as(me).body(Map.of("date", d1, "kind", "NOTE", "title", "Ideas del día", "body", "Revisar el presupuesto con Ángel"))
                .post("/api/v1/work/entries").then().statusCode(201).body("kind", equalTo("NOTE")).extract().path("id");
        String id2 = as(me).body(Map.of("date", d1, "kind", "PROMPT", "title", "", "body", longText)).post("/api/v1/work/entries")
                .then().statusCode(201).extract().path("id");
        as(me).body(Map.of("date", d2, "kind", "SUMMARY", "title", "Resumen semanal", "body", "Cerrado el informe TRIMESTRAL")).post("/api/v1/work/entries").then().statusCode(201);

        // el día: vista previa (no el texto entero); el detalle sí lo trae completo y sin pérdidas
        as(me).get("/api/v1/work/entries?date=" + d1).then().statusCode(200).body("$", hasSize(2));
        Response day = as(me).get("/api/v1/work/entries?date=" + d1);
        Assertions.assertTrue(day.jsonPath().getString("[1].body").length() <= 280 && day.jsonPath().getBoolean("[1].truncated"));
        Assertions.assertEquals(20000, day.jsonPath().getInt("[1].length"));
        Assertions.assertEquals(longText, as(me).get("/api/v1/work/entries/" + id2).jsonPath().getString("body"));

        // calendario del mes: cuántos registros hay cada día
        String month = LocalDate.now().toString().substring(0, 7);
        Response cal = as(me).get("/api/v1/work/calendar?month=" + month);
        cal.then().statusCode(200);
        Assertions.assertTrue(cal.jsonPath().getList("findAll { it.date == '" + d1 + "' }.count", Integer.class).contains(2));
        as(me).get("/api/v1/work/calendar?month=2026-13").then().statusCode(400);

        // historial y búsqueda (sin distinguir mayúsculas), con filtro por tipo
        as(me).get("/api/v1/work/entries/search").then().body("$", hasSize(3)).body("[0].date", equalTo(d1));
        as(me).get("/api/v1/work/entries/search?q=trimestral").then().body("$", hasSize(1)).body("[0].kind", equalTo("SUMMARY"));
        as(me).get("/api/v1/work/entries/search?q=ÁNGEL").then().body("$", hasSize(1));
        as(me).get("/api/v1/work/entries/search?q=100%25").then().body("$", hasSize(0)); // el % no es comodín
        as(me).get("/api/v1/work/entries/search?kind=PROMPT").then().body("$", hasSize(1));
        as(me).get("/api/v1/work/entries/search?kind=OTRO").then().statusCode(400);

        // editar y borrar
        as(me).body(Map.of("date", d2, "kind", "NOTE", "title", "Movida", "body", "Ahora es de ayer")).put("/api/v1/work/entries/" + id1)
                .then().statusCode(200).body("date", equalTo(d2)).body("title", equalTo("Movida"));
        as(me).delete("/api/v1/work/entries/" + id1).then().statusCode(204);
        as(me).get("/api/v1/work/entries/" + id1).then().statusCode(404);

        // validación: cuerpo vacío, tipo inválido, demasiado largo
        as(me).body(Map.of("date", d1, "kind", "NOTE", "body", "  ")).post("/api/v1/work/entries").then().statusCode(400);
        as(me).body(Map.of("date", d1, "kind", "XX", "body", "a")).post("/api/v1/work/entries").then().statusCode(400);
        as(me).body(Map.of("date", d1, "kind", "NOTE", "body", "a".repeat(20001))).post("/api/v1/work/entries").then().statusCode(400);
        as(me).get("/api/v1/work/entries?date=ayer").then().statusCode(400);
    }

    @Test
    void workEntriesAreNeverVisibleToAnotherPersonAndExportAndDeletionCoverThem() {
        UUID me = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        String today = LocalDate.now().toString();
        String id = as(me).body(Map.of("date", today, "kind", "NOTE", "body", "secreto")).post("/api/v1/work/entries").then().statusCode(201).extract().path("id");
        as(other).get("/api/v1/work/entries/" + id).then().statusCode(404);
        as(other).body(Map.of("date", today, "kind", "NOTE", "body", "x")).put("/api/v1/work/entries/" + id).then().statusCode(404);
        as(other).delete("/api/v1/work/entries/" + id).then().statusCode(404);
        as(other).get("/api/v1/work/entries?date=" + today).then().body("$", hasSize(0));
        as(other).get("/api/v1/work/entries/search?q=secreto").then().body("$", hasSize(0));
        as(me).body(String.format(PROFILE, "MAINTAIN")).put("/api/v1/nutrition/profile").then().statusCode(200);
        // exportación (RGPD) incluye el perfil y los registros de trabajo
        as(me).get("/api/v1/me/export").then().statusCode(200).body("workEntries", hasSize(1)).body("workEntries[0].body", equalTo("secreto"))
                .body("nutritionProfile.sex", equalTo("F"));
        // borrar la cuenta elimina también todo esto
        as(me).delete("/api/v1/me").then().statusCode(204);
        as(me).get("/api/v1/work/entries/" + id).then().statusCode(404);
        as(me).get("/api/v1/nutrition/profile").then().statusCode(204);
    }

    // ---------- Plan del día ----------

    @Test
    void planSuggestsTheRestOfTheDayToMatchTheTargetAndNeverRepeats() {
        UUID me = UUID.randomUUID();
        Response options = as(me).get("/api/v1/plan/options");
        options.then().statusCode(200);
        List<Map<String, Object>> opts = options.jsonPath().getList("$");
        Assertions.assertTrue(opts.size() >= 25, "debe haber recetas típicas calculables: " + opts.size());
        // sin perfil ni objetivo indicado: 400 claro
        as(me).body(Map.of("chosen", List.of())).post("/api/v1/plan/suggest").then().statusCode(400).body("detail", containsString("objetivo"));

        // el usuario elige desayuno y cena; FITona sugiere comida y merienda para cuadrar 2.000 kcal
        Response plan = as(me).body(Map.of("targetKcal", 2000, "date", LocalDate.now().toString(), "chosen", List.of(
                Map.of("slot", "BREAKFAST", "kind", "TEMPLATE", "key", "avena-con-leche-y-platano", "servings", 1),
                Map.of("slot", "DINNER", "kind", "TEMPLATE", "key", "tortilla-francesa", "servings", 1)))).post("/api/v1/plan/suggest");
        plan.then().statusCode(200).body("meals", hasSize(4)).body("targetKcal", equalTo(2000));
        Assertions.assertEquals("CHOSEN", plan.jsonPath().getString("meals.find { it.slot == 'BREAKFAST' }.source"));
        Assertions.assertEquals("CHOSEN", plan.jsonPath().getString("meals.find { it.slot == 'DINNER' }.source"));
        Assertions.assertEquals("SUGGESTED", plan.jsonPath().getString("meals.find { it.slot == 'LUNCH' }.source"));
        Assertions.assertEquals("SUGGESTED", plan.jsonPath().getString("meals.find { it.slot == 'SNACK' }.source"));
        int total = plan.jsonPath().getInt("totalKcal");
        Assertions.assertTrue(Math.abs(total - 2000) <= 450, "el menú debe acercarse al objetivo: " + total);
        List<String> titles = plan.jsonPath().getList("meals.option.title");
        Assertions.assertEquals(titles.size(), titles.stream().distinct().count(), "no se repite ninguna receta en el día");
        Assertions.assertTrue(plan.jsonPath().getList("meals.find { it.slot == 'LUNCH' }.alternatives").size() >= 2);
        // determinista: misma petición, mismo menú
        Response again = as(me).body(Map.of("targetKcal", 2000, "date", LocalDate.now().toString(), "chosen", List.of(
                Map.of("slot", "BREAKFAST", "kind", "TEMPLATE", "key", "avena-con-leche-y-platano", "servings", 1),
                Map.of("slot", "DINNER", "kind", "TEMPLATE", "key", "tortilla-francesa", "servings", 1)))).post("/api/v1/plan/suggest");
        Assertions.assertEquals(titles, again.jsonPath().getList("meals.option.title"));

        // con el perfil guardado se usa su objetivo; lo ya registrado (FIXED) cuenta como elegido
        as(me).body(String.format(PROFILE, "MAINTAIN")).put("/api/v1/nutrition/profile").then().statusCode(200);
        int profileTarget = as(me).get("/api/v1/nutrition/profile").jsonPath().getInt("target.target");
        as(me).body(Map.of("chosen", List.of(Map.of("slot", "BREAKFAST", "kind", "FIXED", "kcal", 400, "label", "Lo que desayuné"))))
                .post("/api/v1/plan/suggest").then().statusCode(200).body("targetKcal", equalTo(profileTarget)).body("chosenKcal", equalTo(400));

        // si lo elegido ya supera el objetivo: sin culpa, sin sugerencias de más y mensaje neutro
        as(me).body(Map.of("targetKcal", 1200, "chosen", List.of(
                Map.of("slot", "LUNCH", "kind", "FIXED", "kcal", 800), Map.of("slot", "DINNER", "kind", "FIXED", "kcal", 600),
                Map.of("slot", "BREAKFAST", "kind", "FIXED", "kcal", 300))))
                .post("/api/v1/plan/suggest").then().statusCode(200).body("message", containsString("ya llegas")).body("message", not(containsString("exced")));

        // validaciones
        as(me).body(Map.of("targetKcal", 2000, "chosen", List.of(Map.of("slot", "LUNCH", "kind", "TEMPLATE", "key", "no-existe", "servings", 1))))
                .post("/api/v1/plan/suggest").then().statusCode(400);
        as(me).body(Map.of("targetKcal", 100, "chosen", List.of())).post("/api/v1/plan/suggest").then().statusCode(400);
    }

    @Test
    void addingAPlannedMealToTheDiaryIsExplicitAndIdempotent() {
        UUID me = UUID.randomUUID();
        String date = LocalDate.now().toString();
        // sugerir NO escribe en el diario
        as(me).body(Map.of("targetKcal", 1800, "chosen", List.of())).post("/api/v1/plan/suggest").then().statusCode(200);
        as(me).get("/api/v1/diary?date=" + date).then().body("entries", hasSize(0));
        // «añadir al diario» una receta típica: ingredientes escalados a las raciones elegidas
        UUID id = UUID.randomUUID();
        Map<String, Object> body = Map.of("id", id.toString(), "date", date, "slot", "BREAKFAST", "kind", "TEMPLATE", "key", "avena-con-leche-y-platano", "servings", 2);
        Response r = as(me).body(body).post("/api/v1/plan/log");
        r.then().statusCode(201).body("mealSlot", equalTo("BREAKFAST")).body("items", hasSize(3));
        Assertions.assertEquals(id.toString(), r.jsonPath().getString("id"));
        // la avena (50 g por ración) se escala a 100 g para 2 raciones
        Assertions.assertEquals(100.0, r.jsonPath().getDouble("items.find { it.displayName.contains('avena') }.grams"), 0.01);
        as(me).body(body).post("/api/v1/plan/log").then().statusCode(201); // reintento con el mismo id: no duplica
        as(me).get("/api/v1/diary?date=" + date).then().body("entries", hasSize(1)).body("entries[0].totals.nutrients.energyKcal.value", greaterThan(300));
        // una receta propia
        String recipeId = as(me).body(Map.of("title", "Mi bol", "servings", 1, "ingredients", List.of(Map.of("freeText", "algo"))))
                .post("/api/v1/recipes").then().statusCode(201).extract().path("id");
        as(me).body(Map.of("date", date, "slot", "SNACK", "kind", "RECIPE", "recipeId", recipeId, "servings", 1)).post("/api/v1/plan/log").then().statusCode(201).body("mealSlot", equalTo("AFTERNOON_SNACK"));
        // otra persona no puede usar mi receta
        as(UUID.randomUUID()).body(Map.of("date", date, "slot", "SNACK", "kind", "RECIPE", "recipeId", recipeId, "servings", 1)).post("/api/v1/plan/log").then().statusCode(404);
    }
}
