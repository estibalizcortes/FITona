package es.fitona.app.catalog;

import es.fitona.app.api.FoodDto;
import es.fitona.app.api.FoodRequest;
import es.fitona.app.api.FoodResponse;
import es.fitona.app.api.NutrientsDto;
import es.fitona.app.api.PortionDto;
import es.fitona.app.infra.ConflictException;
import es.fitona.nutrition.EnergyFactors;
import es.fitona.nutrition.Nutrient;
import es.fitona.nutrition.Portion;
import es.fitona.nutrition.Precision;
import es.fitona.nutrition.UnitKind;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class FoodService {

    private static final BigDecimal MAX_KCAL = new BigDecimal("900");
    private static final BigDecimal HALF = new BigDecimal("0.5");

    @Inject
    FoodRepository repo;

    @Inject
    UnitCatalog units;

    public List<FoodDto> search(UUID user, String q, int limit) {
        int l = Math.max(1, Math.min(limit, 50));
        return repo.search(user, q, l).stream().map(FoodService::toDto).toList();
    }

    /** Solo los alimentos propios (sin límite práctico), para exportar los datos de la persona. */
    public List<FoodDto> listOwn(UUID user) {
        return repo.search(user, "", 1000, true).stream().map(FoodService::toDto).toList();
    }

    public FoodDto get(UUID user, long variantId) {
        FoodRecord r = repo.findVariant(user, variantId);
        if (r == null) throw new NotFoundException();
        return toDto(r);
    }

    @Transactional
    public FoodResponse create(UUID user, FoodRequest req) {
        List<String> warnings = new ArrayList<>();
        FoodRepository.NewFood nf = prepare(req, warnings);
        long variantId = repo.create(user, nf);
        return new FoodResponse(get(user, variantId), warnings);
    }

    @Transactional
    public FoodResponse update(UUID user, long variantId, FoodRequest req) {
        List<String> warnings = new ArrayList<>();
        FoodRepository.NewFood nf = prepare(req, warnings);
        if (!repo.update(user, variantId, nf)) throw new NotFoundException();
        return new FoodResponse(get(user, variantId), warnings);
    }

    @Transactional
    public void delete(UUID user, long variantId) {
        FoodRecord cur = repo.findVariant(user, variantId);
        // Los alimentos del catálogo compartido no se borran: respuesta idéntica a «no existe», sin depender del uso.
        if (cur == null || !cur.editable()) throw new NotFoundException();
        if (repo.usedInRecipes(variantId)) {
            throw new ConflictException("El alimento se usa en alguna receta. Quítalo de las recetas antes de borrarlo.");
        }
        if (!repo.delete(user, variantId)) throw new NotFoundException();
    }

    /** Valida coherencia física y resuelve la energía (declarada o calculada con factores UE). */
    FoodRepository.NewFood prepare(FoodRequest req, List<String> warnings) {
        String basis = req.basis() == null ? "PER_100G" : req.basis();
        if (!basis.equals("PER_100G")) {
            throw new IllegalArgumentException("Por ahora solo se admiten valores por 100 g (usa la densidad para líquidos).");
        }
        Map<Nutrient, BigDecimal> v = new EnumMap<>(req.per100().toMap());
        BigDecimal carbs = v.get(Nutrient.CARBS_G);
        BigDecimal fat = v.get(Nutrient.FAT_G);
        if (v.get(Nutrient.SUGARS_G) != null && carbs != null && v.get(Nutrient.SUGARS_G).compareTo(carbs.add(HALF)) > 0) {
            throw new IllegalArgumentException("Los azúcares no pueden superar a los hidratos de carbono.");
        }
        if (v.get(Nutrient.SAT_FAT_G) != null && fat != null && v.get(Nutrient.SAT_FAT_G).compareTo(fat.add(HALF)) > 0) {
            throw new IllegalArgumentException("Las grasas saturadas no pueden superar a la grasa total.");
        }
        if (basis.equals("PER_100G")) {
            BigDecimal mass = BigDecimal.ZERO;
            for (Nutrient n : new Nutrient[] {Nutrient.PROTEIN_G, Nutrient.CARBS_G, Nutrient.FAT_G, Nutrient.FIBER_G,
                    Nutrient.ALCOHOL_G}) {
                if (v.get(n) != null) mass = mass.add(v.get(n));
            }
            if (mass.compareTo(new BigDecimal("101")) > 0) {
                throw new IllegalArgumentException("Proteínas + hidratos + grasas + fibra + alcohol superan 100 g por 100 g.");
            }
        }
        String origin;
        EnergyFactors.Result eu = EnergyFactors.euKcal(v.get(Nutrient.PROTEIN_G), carbs, fat, v.get(Nutrient.FIBER_G),
                v.get(Nutrient.ALCOHOL_G));
        if (v.get(Nutrient.ENERGY_KCAL) == null) {
            if (eu == null) throw new IllegalArgumentException("Indica la energía (kcal) o al menos algún macronutriente.");
            BigDecimal kcal = eu.kcal().setScale(1, RoundingMode.HALF_UP);
            if (kcal.compareTo(MAX_KCAL) > 0) throw new IllegalArgumentException("La energía calculada supera 900 kcal por 100 g.");
            v.put(Nutrient.ENERGY_KCAL, kcal);
            origin = "CALCULATED_EU";
            warnings.add("Energía calculada con los factores de la UE a partir de los macronutrientes"
                    + (eu.complete() ? "." : " conocidos (faltan datos: es un mínimo)."));
        } else {
            origin = "DECLARED";
            if (eu != null && eu.complete()) {
                BigDecimal diff = v.get(Nutrient.ENERGY_KCAL).subtract(eu.kcal()).abs();
                BigDecimal tolerance = v.get(Nutrient.ENERGY_KCAL).multiply(new BigDecimal("0.15")).max(new BigDecimal("20"));
                if (diff.compareTo(tolerance) > 0) {
                    warnings.add("Las kcal indicadas (" + v.get(Nutrient.ENERGY_KCAL).stripTrailingZeros().toPlainString()
                            + ") difieren de las que salen de los macros (" + eu.kcal().setScale(0, RoundingMode.HALF_UP)
                            + "). Revisa los datos; se guardan tal como los has escrito.");
                }
            }
        }
        List<Portion> portions = new ArrayList<>();
        if (req.portions() != null) {
            for (PortionDto p : req.portions()) {
                UnitCatalog.UnitInfo u = units.get(p.unitCode());
                if (u.spec().kind() != UnitKind.HOUSEHOLD) {
                    throw new IllegalArgumentException("Las medidas caseras solo admiten unidades caseras (" + p.unitCode() + ").");
                }
                portions.add(new Portion(u.spec().code(), p.grams(),
                        p.precision() == null ? Precision.APPROXIMATE : Precision.valueOf(p.precision())));
            }
        }
        return new FoodRepository.NewFood(req.name().trim(), v, origin, basis, req.densityGPerMl(), portions);
    }

    static FoodDto toDto(FoodRecord r) {
        List<PortionDto> portions = r.portions().stream()
                .map(p -> new PortionDto(p.unitCode(), p.grams(), p.precision().name())).toList();
        return new FoodDto(r.variantId(), r.foodId(), r.name(), r.displayName(), r.profile().quality().name(), r.basis(),
                NutrientsDto.fromMap(r.profile().per100()), r.densityGPerMl(), portions, r.editable(), r.source());
    }
}
