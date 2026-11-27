package es.fitona.app.plan;

import es.fitona.app.api.DiaryDto;
import es.fitona.app.api.DiaryEntryRequest;
import es.fitona.app.api.ItemRequest;
import es.fitona.app.api.RecipeDto;
import es.fitona.app.diary.DiaryService;
import es.fitona.app.goal.NutritionGoalService;
import es.fitona.app.recipes.RecipeService;
import es.fitona.app.recipes.RecipeTemplates;
import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.Total;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Menú del día orientativo y DETERMINISTA: reparte el objetivo calórico entre las comidas que la persona no ha elegido y
 * propone recetas (típicas o suyas) con las raciones que más se acercan. Solo propone: no escribe nada en el diario
 * hasta que la persona lo confirma (/plan/log). Plan y diario son independientes.
 */
@ApplicationScoped
public class PlanService {

    static final List<String> FILL_ORDER = List.of("LUNCH", "DINNER", "BREAKFAST", "SNACK");
    static final Map<String, Double> WEIGHT = Map.of("BREAKFAST", 0.25, "LUNCH", 0.35, "SNACK", 0.10, "DINNER", 0.30);
    static final double[] STEPS = {0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3};
    private static final Map<String, String> DIARY_SLOT = Map.of("BREAKFAST", "BREAKFAST", "LUNCH", "LUNCH", "SNACK", "AFTERNOON_SNACK", "DINNER", "DINNER");

    public record Candidate(String kind, String key, UUID recipeId, String title, int kcalPerServing, List<String> meals) {}

    public record Option(String kind, String key, UUID recipeId, String title, BigDecimal servings, int kcalPerServing, int kcal) {}

    public record Meal(String slot, String source, Option option, List<Option> alternatives) {}

    public record Plan(int targetKcal, int chosenKcal, int totalKcal, String message, List<Meal> meals) {}

    @Inject
    RecipeTemplates templates;

    @Inject
    RecipeService recipes;

    @Inject
    NutritionGoalService goals;

    @Inject
    DiaryService diary;

    /** kcal por ración de cada receta típica (se calcula una vez con el catálogo; -1 = no calculable). */
    private final Map<String, Integer> templateKcal = new ConcurrentHashMap<>();

    /** Recetas que se pueden elegir o sugerir: las típicas calculables y las propias con valor completo. */
    public List<Candidate> candidates(UUID user) {
        List<Candidate> out = new ArrayList<>();
        for (RecipeTemplates.Template t : templates.all()) {
            int kcal = templateKcal.computeIfAbsent(t.key(), k -> kcalOfTemplate(user, t));
            if (kcal > 0) out.add(new Candidate("TEMPLATE", t.key(), null, t.title(), kcal, t.mealsOrDefault()));
        }
        for (RecipeDto.Summary s : recipes.list(user)) {
            if ("COMPLETE".equals(s.completeness()) && s.energyKcalPerServing() != null && s.energyKcalPerServing().signum() > 0) {
                out.add(new Candidate("RECIPE", null, s.id(), s.title(), s.energyKcalPerServing().setScale(0, RoundingMode.HALF_UP).intValue(),
                        List.of("BREAKFAST", "LUNCH", "SNACK", "DINNER")));
            }
        }
        return out;
    }

    private int kcalOfTemplate(UUID user, RecipeTemplates.Template t) {
        try {
            RecipeService.Preview p = recipes.preview(user, templates.toRequest(t));
            Total e = p.perServing().get(Nutrient.ENERGY_KCAL);
            return "COMPLETE".equals(p.completeness()) && e.known() ? e.value().setScale(0, RoundingMode.HALF_UP).intValue() : -1;
        } catch (RuntimeException e) {
            return -1;
        }
    }

    public Plan suggest(UUID user, PlanRequests.Suggest req) {
        Integer target = req.targetKcal() != null ? req.targetKcal() : goals.targetKcal(user);
        if (target == null) throw new IllegalArgumentException("Falta el objetivo: rellena tu perfil nutricional o indica las kcal del día.");
        LocalDate date = req.date() == null ? LocalDate.now() : req.date();
        List<Candidate> all = candidates(user);

        Map<String, Meal> meals = new HashMap<>();
        Set<String> used = new HashSet<>();
        int chosenKcal = 0;
        for (PlanRequests.Chosen c : req.chosen() == null ? List.<PlanRequests.Chosen>of() : req.chosen()) {
            if (meals.containsKey(c.slot())) throw new IllegalArgumentException("Hay dos comidas elegidas para el mismo momento del día.");
            Option o = chosenOption(c, all);
            chosenKcal += o.kcal();
            if (o.key() != null) used.add(o.key());
            if (o.recipeId() != null) used.add(o.recipeId().toString());
            meals.put(c.slot(), new Meal(c.slot(), "CHOSEN", o, List.of()));
        }

        double remaining = target - chosenKcal;
        List<String> unfilled = FILL_ORDER.stream().filter(s -> !meals.containsKey(s)).toList();
        double weightSum = unfilled.stream().mapToDouble(WEIGHT::get).sum();
        for (String slot : unfilled) {
            if (remaining <= 0) { meals.put(slot, new Meal(slot, "SKIPPED", null, List.of())); continue; }
            double budget = remaining * WEIGHT.get(slot) / weightSum;
            List<Option> ranked = rank(slot, budget, all, used, date);
            if (ranked.isEmpty()) { meals.put(slot, new Meal(slot, "SKIPPED", null, List.of())); continue; }
            Option first = ranked.get(0);
            used.add(first.key() != null ? first.key() : first.recipeId().toString());
            meals.put(slot, new Meal(slot, "SUGGESTED", first, ranked.subList(0, Math.min(3, ranked.size()))));
        }

        List<Meal> ordered = new ArrayList<>();
        for (String s : List.of("BREAKFAST", "LUNCH", "SNACK", "DINNER")) ordered.add(meals.get(s));
        int total = ordered.stream().filter(m -> m.option() != null).mapToInt(m -> m.option().kcal()).sum();
        return new Plan(target, chosenKcal, total, message(target, chosenKcal, total, ordered), ordered);
    }

    private static Option chosenOption(PlanRequests.Chosen c, List<Candidate> all) {
        if ("FIXED".equals(c.kind())) {
            if (c.kcal() == null) throw new IllegalArgumentException("Indica las kcal de lo ya registrado.");
            return new Option("FIXED", null, null, c.label() == null || c.label().isBlank() ? "Ya registrado" : c.label(), BigDecimal.ONE, c.kcal(), c.kcal());
        }
        if (c.servings() == null) throw new IllegalArgumentException("Indica las raciones.");
        Candidate cand = all.stream().filter(x -> x.kind().equals(c.kind())
                && (c.kind().equals("TEMPLATE") ? x.key().equals(c.key()) : x.recipeId().equals(c.recipeId()))).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Esa receta no está disponible para el plan."));
        return option(cand, c.servings().doubleValue());
    }

    private static Option option(Candidate c, double servings) {
        return new Option(c.kind(), c.key(), c.recipeId(), c.title(), BigDecimal.valueOf(servings), c.kcalPerServing(),
                (int) Math.round(c.kcalPerServing() * servings));
    }

    /** Mejores opciones para una comida: la ración que más se acerca al presupuesto; con empates por «cubos» de 30 kcal, orden variado por día. */
    private static List<Option> rank(String slot, double budget, List<Candidate> all, Set<String> used, LocalDate date) {
        double maxStep = slot.equals("SNACK") ? 2 : 3;
        record Scored(Option option, long bucket, int tie) {}
        List<Scored> list = new ArrayList<>();
        for (Candidate c : all) {
            if (!c.meals().contains(slot)) continue;
            String id = c.key() != null ? c.key() : c.recipeId().toString();
            if (used.contains(id)) continue;
            double best = STEPS[0];
            for (double s : STEPS) {
                if (s > maxStep) break;
                if (Math.abs(c.kcalPerServing() * s - budget) < Math.abs(c.kcalPerServing() * best - budget)) best = s;
            }
            Option o = option(c, best);
            list.add(new Scored(o, Math.round(Math.abs(o.kcal() - budget) / 30.0), Math.floorMod((date + slot + id).hashCode(), 1000)));
        }
        return list.stream().sorted(Comparator.comparingLong(Scored::bucket).thenComparingInt(Scored::tie)).map(Scored::option).toList();
    }

    private static String message(int target, int chosen, int total, List<Meal> meals) {
        boolean anySuggested = meals.stream().anyMatch(m -> "SUGGESTED".equals(m.source()));
        if (!anySuggested && chosen >= target) {
            return "Con lo que has elegido ya llegas a tu objetivo orientativo; el resto del día puede ser algo ligero o nada: tú decides.";
        }
        int diff = total - target;
        if (Math.abs(diff) <= 50) return "El menú queda muy cerca de tu objetivo orientativo.";
        return diff < 0
                ? "El menú queda unas " + (-diff) + " kcal por debajo del objetivo: es solo una orientación, puedes añadir algo si te apetece."
                : "El menú queda unas " + diff + " kcal por encima del objetivo: es solo una orientación.";
    }

    /** Añade al diario (a petición de la persona) una comida del plan. Las recetas típicas se registran como sus ingredientes escalados. */
    public DiaryDto.EntryDto log(UUID user, PlanRequests.Log req) {
        List<ItemRequest> items = new ArrayList<>();
        String note;
        if ("TEMPLATE".equals(req.kind())) {
            RecipeTemplates.Template t = templates.get(req.key());
            BigDecimal factor = req.servings().divide(t.servings(), 6, RoundingMode.HALF_UP);
            for (var ing : templates.toRequest(t).ingredients()) {
                items.add(new ItemRequest(ing.variantId(), null, ing.quantity().multiply(factor).setScale(3, RoundingMode.HALF_UP), ing.unitCode(), null, null));
            }
            note = t.title();
        } else {
            if (req.recipeId() == null) throw new IllegalArgumentException("Indica la receta.");
            RecipeDto r = recipes.get(user, req.recipeId());
            items.add(new ItemRequest(null, req.recipeId(), null, null, req.servings(), null));
            note = r.title();
        }
        return diary.create(user, new DiaryEntryRequest(req.id(), req.date(), DIARY_SLOT.get(req.slot()), note, items));
    }
}
