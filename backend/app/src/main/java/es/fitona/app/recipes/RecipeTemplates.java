package es.fitona.app.recipes;

import com.fasterxml.jackson.databind.ObjectMapper;
import es.fitona.app.api.RecipeDto;
import es.fitona.app.api.RecipeRequest;
import es.fitona.app.catalog.FoodRepository;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Recetas típicas de ejemplo (recipe-templates.json). Solo definen ingredientes y cantidades orientativas; los
 * nutrientes los calcula el motor con el catálogo al copiarlas a «mis recetas». No se escriben cifras a mano.
 */
@ApplicationScoped
public class RecipeTemplates {

    public record Ingredient(String food, String label, BigDecimal quantity, String unit, String note) {}

    public record Template(String key, String title, String description, BigDecimal servings, List<Ingredient> ingredients,
                           List<String> steps) {}

    /** ingredientNames permite buscar «garbanzos» en las recetas típicas sin abrirlas. */
    public record Summary(String key, String title, BigDecimal servings, int ingredients, List<String> ingredientNames) {}

    @Inject
    ObjectMapper mapper;

    @Inject
    FoodRepository foods;

    @Inject
    RecipeService recipes;

    private List<Template> templates = List.of();

    @PostConstruct
    void load() {
        try (InputStream in = getClass().getResourceAsStream("/recipe-templates.json")) {
            templates = List.of(mapper.readValue(in, Template[].class));
        } catch (IOException e) {
            throw new IllegalStateException("No se pudieron leer las recetas típicas", e);
        }
    }

    public List<Summary> list() {
        return templates.stream().map(t -> new Summary(t.key(), t.title(), t.servings(), t.ingredients().size(),
                t.ingredients().stream().map(Ingredient::food).toList())).toList();
    }

    public Template get(String key) {
        return templates.stream().filter(x -> x.key().equals(key)).findFirst().orElseThrow(NotFoundException::new);
    }

    /** Copia la plantilla a las recetas de la persona. Si falta algún alimento en el catálogo, falla sin crear nada. */
    public RecipeDto copy(UUID user, String key) {
        Template t = get(key);
        List<RecipeRequest.Ingredient> ing = new ArrayList<>();
        for (Ingredient i : t.ingredients()) {
            Long variant = foods.findCatalogVariantId(i.food(), i.label());
            if (variant == null) {
                throw new IllegalArgumentException("Falta en el catálogo: " + i.food() + (i.label() == null ? "" : " (" + i.label() + ")"));
            }
            ing.add(new RecipeRequest.Ingredient(variant, null, i.quantity(), i.unit(), i.note()));
        }
        List<RecipeRequest.Step> steps = t.steps().stream().map(s -> new RecipeRequest.Step(s, null)).toList();
        return recipes.create(user, new RecipeRequest(t.title(), t.description() != null ? t.description() : "Receta típica de ejemplo: cantidades orientativas.",
                t.servings(), null, null, ing, steps));
    }
}
