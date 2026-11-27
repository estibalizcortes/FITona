package es.fitona.app.account;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.api.FoodDto;
import es.fitona.app.api.RecipeDto;
import es.fitona.app.catalog.FoodService;
import es.fitona.app.diary.DiaryRepository;
import es.fitona.app.diary.DiaryService;
import es.fitona.app.infra.Db;
import es.fitona.app.infra.Ids;
import es.fitona.app.recipes.RecipeService;
import es.fitona.app.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Derechos RGPD: portabilidad (exportar) y supresión de cuenta. */
@Path("/api/v1/me")
@Produces(MediaType.APPLICATION_JSON)
public class AccountResource {

    @Inject
    CurrentUser user;

    @Inject
    FoodService foods;

    @Inject
    RecipeService recipes;

    @Inject
    DiaryService diary;

    @Inject
    DiaryRepository diaryRepo;

    @Inject
    Db db;

    @GET
    @Path("/export")
    public Map<String, Object> export() {
        UUID u = user.id();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("exportedAt", OffsetDateTime.now().toString());
        out.put("format", "fitona-export-v1");
        List<FoodDto> mine = foods.listOwn(u);
        out.put("foods", mine);
        List<RecipeDto> rs = new ArrayList<>();
        for (RecipeDto.Summary s : recipes.list(u)) rs.add(recipes.get(u, s.id()));
        out.put("recipes", rs);
        List<DiaryDto.EntryDto> entries = new ArrayList<>();
        for (UUID id : diaryRepo.allEntryIds(u)) entries.add(diary.get(u, id));
        out.put("diaryEntries", entries);
        return out;
    }

    /** Borra la cuenta y TODOS sus datos personales. Irreversible. */
    @DELETE
    @Transactional
    public Response deleteAccount() {
        byte[] id = Ids.toRaw(user.id());
        // Orden obligado por las claves foráneas: recetas -> alimentos -> perfiles -> persona.
        db.update("UPDATE RECIPES SET CURRENT_VERSION_ID = NULL WHERE OWNER_USER_ID = ?", ps -> ps.setBytes(1, id));
        db.update("DELETE FROM RECIPES WHERE OWNER_USER_ID = ?", ps -> ps.setBytes(1, id));
        List<Long> profiles = db.query("SELECT v.CURRENT_PROFILE_ID FROM FOOD_VARIANTS v JOIN FOODS f ON f.ID = v.FOOD_ID "
                + "WHERE f.OWNER_USER_ID = ? AND v.CURRENT_PROFILE_ID IS NOT NULL", ps -> ps.setBytes(1, id),
                rs -> rs.getLong(1));
        db.update("UPDATE FOODS SET DEFAULT_VARIANT_ID = NULL WHERE OWNER_USER_ID = ?", ps -> ps.setBytes(1, id));
        db.update("DELETE FROM USER_FOOD_USAGE WHERE USER_ID = ?", ps -> ps.setBytes(1, id));
        db.update("DELETE FROM FOODS WHERE OWNER_USER_ID = ?", ps -> ps.setBytes(1, id));
        for (Long p : profiles) db.update("DELETE FROM NUTRIENT_PROFILES WHERE ID = ?", ps -> ps.setLong(1, p));
        db.update("DELETE FROM APP_USERS WHERE ID = ?", ps -> ps.setBytes(1, id));
        return Response.noContent().build();
    }
}
