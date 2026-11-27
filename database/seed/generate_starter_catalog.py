#!/usr/bin/env python3
"""Genera database/migrations/V010__starter_catalog.sql.

AVISO DE PROCEDENCIA: los valores son cifras de referencia APROXIMADAS (típicas de tablas de composición como
USDA FoodData Central), escritas a mano SIN haberlas descargado ni contrastado con la fuente. Por eso se cargan con
fiabilidad ESTIMATE, revisión PENDING y fuente FITONA_EDITORIAL. Deben sustituirse por una importación verificada
(BEDCA con autorización de AESAN, USDA CC0, CIQUAL) antes de dar el catálogo por bueno.
Hidratos = disponibles (sin fibra), como en la etiqueta UE. Por 100 g. Uso: python3 generate_starter_catalog.py
"""
import re, unicodedata, pathlib

def key(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

# (nombre, categoría, [sinónimos (texto, tipo, nota)], [variantes])
# variante: (etiqueta, estado, kcal, prot, hidr, azuc, grasa, sat, fibra, sal, densidad, [(unidad, gramos)])
N = None
FOODS = [
 ("Manzana","FRUITS",[],[(N,"RAW",52,0.3,11.4,10.4,0.2,0.0,2.4,N,N,[("UNIT",180)])]),
 ("Plátano","FRUITS",[("Banana","REGIONAL","Latinoamérica")],[(N,"RAW",89,1.1,20.2,12.2,0.3,0.1,2.6,N,N,[("UNIT",120)])]),
 ("Naranja","FRUITS",[],[(N,"RAW",47,0.9,9.4,9.4,0.1,0.0,2.4,N,N,[("UNIT",180)])]),
 ("Mandarina","FRUITS",[],[(N,"RAW",53,0.8,11.2,10.6,0.3,0.0,1.8,N,N,[("UNIT",80)])]),
 ("Pera","FRUITS",[],[(N,"RAW",57,0.4,12.3,9.8,0.1,0.0,3.1,N,N,[("UNIT",170)])]),
 ("Fresas","FRUITS",[("Frutillas","REGIONAL","Sudamérica")],[(N,"RAW",32,0.7,5.7,4.9,0.3,0.0,2.0,N,N,[])]),
 ("Uvas","FRUITS",[],[(N,"RAW",69,0.7,17.2,15.5,0.2,0.1,0.9,N,N,[])]),
 ("Tomate","VEGETABLES",[],[(N,"RAW",18,0.9,2.7,2.6,0.2,0.0,1.2,N,N,[("UNIT",120)])]),
 ("Zanahoria","VEGETABLES",[],[(N,"RAW",41,0.9,6.9,4.7,0.2,0.0,2.8,N,N,[("UNIT",70)])]),
 ("Cebolla","VEGETABLES",[],[(N,"RAW",40,1.1,7.6,4.2,0.1,0.0,1.7,N,N,[("UNIT",110)])]),
 ("Lechuga","VEGETABLES",[],[(N,"RAW",15,1.4,1.6,0.8,0.2,0.0,1.3,N,N,[])]),
 ("Espinacas","VEGETABLES",[],[(N,"RAW",23,2.9,1.4,0.4,0.4,0.1,2.2,N,N,[])]),
 ("Pimiento rojo","VEGETABLES",[],[(N,"RAW",31,1.0,3.9,4.2,0.3,0.0,2.1,N,N,[("UNIT",150)])]),
 ("Calabacín","VEGETABLES",[],[(N,"RAW",17,1.2,2.1,2.5,0.3,0.1,1.0,N,N,[("UNIT",200)])]),
 ("Brócoli","VEGETABLES",[("Brécol","SYNONYM",None)],[(N,"RAW",34,2.8,4.4,1.7,0.4,0.0,2.6,N,N,[])]),
 ("Judías verdes","VEGETABLES",[("Habichuelas","REGIONAL","Caribe"),("Ejotes","REGIONAL","México")],[(N,"RAW",31,1.8,4.3,3.3,0.2,0.1,2.7,N,N,[])]),
 ("Boniato","CEREALS_STARCHES",[("Batata","SYNONYM",None),("Camote","REGIONAL","Latinoamérica")],[(N,"RAW",86,1.6,17.1,4.2,0.1,0.0,3.0,N,N,[("UNIT",150)])]),
 ("Patata","CEREALS_STARCHES",[("Papa","REGIONAL","Canarias y Latinoamérica")],[
    ("crudo","RAW",77,2.0,15.3,0.8,0.1,0.0,2.2,N,N,[("UNIT",170)]),
    ("cocido","BOILED",87,1.9,18.3,0.9,0.1,0.0,1.8,N,N,[("UNIT",150)])]),
 ("Arroz blanco","CEREALS_STARCHES",[],[
    ("crudo","DRY",365,7.1,78.7,0.1,0.7,0.2,1.3,N,N,[]),
    ("cocido","BOILED",130,2.7,27.8,0.1,0.3,0.1,0.4,N,N,[])]),
 ("Pasta","CEREALS_STARCHES",[("Espaguetis","SYNONYM",None),("Macarrones","SYNONYM",None)],[
    ("cruda","DRY",371,13.0,71.5,2.7,1.5,0.3,3.2,N,N,[]),
    ("cocida","BOILED",158,5.8,29.1,0.6,0.9,0.2,1.8,N,N,[])]),
 ("Pan blanco","CEREALS_STARCHES",[],[(N,"AS_SOLD",265,9.0,46.5,5.0,3.2,0.7,2.7,1.2,N,[("SLICE",30)])]),
 ("Pan integral","CEREALS_STARCHES",[],[(N,"AS_SOLD",252,12.5,37.0,5.6,3.5,0.7,6.0,1.1,N,[("SLICE",30)])]),
 ("Copos de avena","CEREALS_STARCHES",[],[(N,"DRY",389,16.9,55.7,1.0,6.9,1.2,10.6,N,N,[("TBSP",10)])]),
 ("Harina de trigo","CEREALS_STARCHES",[],[(N,"DRY",364,10.3,73.6,0.3,1.0,0.2,2.7,N,N,[])]),
 ("Garbanzos","LEGUMES",[],[(("cocidos"),"BOILED",164,8.9,19.8,4.8,2.6,0.3,7.6,N,N,[])]),
 ("Lentejas","LEGUMES",[],[("cocidas","BOILED",116,9.0,12.2,1.8,0.4,0.1,7.9,N,N,[])]),
 ("Alubias blancas","LEGUMES",[("Judías blancas","SYNONYM",None),("Habichuelas blancas","REGIONAL","Caribe")],[("cocidas","BOILED",139,9.7,18.8,0.3,0.4,0.1,6.3,N,N,[])]),
 ("Huevo","EGGS",[],[(N,"RAW",143,12.6,0.7,0.4,9.5,3.1,0.0,0.4,N,[("UNIT",55)])]),
 ("Leche entera","DAIRY",[],[(N,"AS_SOLD",61,3.2,4.8,5.0,3.3,1.9,0.0,0.1,1.03,[("GLASS",206)])]),
 ("Leche semidesnatada","DAIRY",[],[(N,"AS_SOLD",50,3.3,4.8,4.8,1.9,1.2,0.0,0.1,1.03,[("GLASS",206)])]),
 ("Leche desnatada","DAIRY",[],[(N,"AS_SOLD",34,3.4,5.0,5.0,0.1,0.1,0.0,0.1,1.03,[("GLASS",206)])]),
 ("Yogur natural","DAIRY",[],[(N,"AS_SOLD",61,3.5,4.7,4.7,3.3,2.1,0.0,0.1,N,[("UNIT",125)])]),
 ("Yogur griego natural","DAIRY",[],[(N,"AS_SOLD",97,9.0,4.0,4.0,5.0,3.2,0.0,0.1,N,[("UNIT",125)])]),
 ("Queso cottage","DAIRY",[("Queso granulado","SYNONYM",None)],[(N,"AS_SOLD",98,11.1,3.4,2.7,4.3,1.7,0.0,0.9,N,[("TBSP",25)])]),
 ("Pechuga de pollo","MEAT",[],[
    ("cruda","RAW",120,22.5,0.0,0.0,2.6,0.6,0.0,0.2,N,[]),
    ("cocinada","ROASTED",165,31.0,0.0,0.0,3.6,1.0,0.0,0.2,N,[])]),
 ("Salmón","FISH_SEAFOOD",[],[("crudo","RAW",208,20.4,0.0,0.0,13.4,3.1,0.0,0.1,N,[])]),
 ("Bacalao","FISH_SEAFOOD",[],[("crudo","RAW",82,17.8,0.0,0.0,0.7,0.1,0.0,0.2,N,[])]),
 ("Atún al natural","FISH_SEAFOOD",[],[("en conserva, escurrido","CANNED_DRAINED",116,25.5,0.0,0.0,0.8,0.2,0.0,0.9,N,[("CAN",52)])]),
 ("Aceite de oliva","FATS_OILS",[],[(N,"AS_SOLD",884,0.0,0.0,0.0,100.0,13.8,0.0,0.0,0.91,[("TBSP",14),("TSP",5)])]),
 ("Mantequilla","FATS_OILS",[],[(N,"AS_SOLD",717,0.9,0.1,0.1,81.1,51.4,0.0,N,N,[("TBSP",14)])]),
 ("Almendras","NUTS_SEEDS",[],[(N,"AS_SOLD",579,21.2,9.1,4.4,49.9,3.8,12.5,0.0,N,[("HANDFUL",30)])]),
 ("Nueces","NUTS_SEEDS",[],[(N,"AS_SOLD",654,15.2,7.0,2.6,65.2,6.1,6.7,0.0,N,[("HANDFUL",30)])]),
 ("Chocolate negro (70-85 % cacao)","SWEETS",[],[(N,"AS_SOLD",598,7.8,35.0,24.0,42.6,24.5,10.9,0.0,N,[("PIECE",10)])]),
 ("Azúcar","SWEETS",[],[(N,"AS_SOLD",387,0.0,99.98,99.8,0.0,0.0,0.0,0.0,N,[("TSP",5)])]),
 ("Miel","SWEETS",[],[(N,"AS_SOLD",304,0.3,82.4,82.1,0.0,0.0,0.2,0.0,1.4,[("TSP",7)])]),
 ("Zumo de naranja","BEVERAGES",[],[(N,"AS_SOLD",45,0.7,10.2,8.4,0.2,0.0,0.2,0.0,1.04,[("GLASS",208)])]),
]

def sql(v):
    return "NULL" if v is None else (str(v) if not isinstance(v, str) else "'" + v.replace("'", "''") + "'")

out = ["""-- =============================================================================
-- FITona · V010 · Catálogo inicial de ARRANQUE (generado por database/seed/generate_starter_catalog.py)
-- ¡ATENCIÓN! Valores de referencia APROXIMADOS escritos a mano (típicos de tablas tipo USDA), NO descargados
-- ni contrastados con la fuente. Se cargan como ESTIMATE / PENDING / fuente FITONA_EDITORIAL y se muestran en la
-- aplicación como «Estimación». Sustituir por importación verificada (BEDCA con autorización, USDA CC0, CIQUAL).
-- Hidratos = disponibles (sin fibra). Por 100 g.
-- =============================================================================
DECLARE
    v_src NUMBER;
    v_food NUMBER;
    v_rank NUMBER := 0;

    FUNCTION new_food(p_name VARCHAR2, p_key VARCHAR2, p_cat VARCHAR2) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        v_rank := v_rank + 1;
        INSERT INTO FOODS (CATEGORY_ID, CANONICAL_NAME, FOOD_KIND, STATUS, POPULARITY_RANK)
        VALUES ((SELECT ID FROM FOOD_CATEGORIES WHERE CODE = p_cat), p_name, 'INGREDIENT', 'PUBLISHED', v_rank)
        RETURNING ID INTO v_id;
        INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND) VALUES (v_id, 'es-ES', p_name, p_key, 'PRIMARY');
        RETURN v_id;
    END;

    PROCEDURE add_name(p_food NUMBER, p_name VARCHAR2, p_key VARCHAR2, p_kind VARCHAR2, p_note VARCHAR2) IS
    BEGIN
        INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND, REGION_NOTE)
        VALUES (p_food, 'es-ES', p_name, p_key, p_kind, p_note);
    END;

    FUNCTION add_variant(p_food NUMBER, p_label VARCHAR2, p_state VARCHAR2, p_default BOOLEAN, p_order NUMBER,
                         p_kcal NUMBER, p_prot NUMBER, p_carb NUMBER, p_sug NUMBER, p_fat NUMBER, p_sat NUMBER,
                         p_fib NUMBER, p_salt NUMBER, p_dens NUMBER) RETURN NUMBER IS
        v_prof NUMBER;
        v_var NUMBER;
    BEGIN
        INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G,
                                       FIBER_G, SALT_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS, NOTES)
        VALUES ('REPRESENTATIVE', 'PER_100G', p_kcal, p_prot, p_carb, p_sug, p_fat, p_sat, p_fib, p_salt, 'DECLARED',
                'ESTIMATE', 'MANUAL', 'PENDING', 'Valor de referencia aproximado SIN VERIFICAR (arranque).')
        RETURNING ID INTO v_prof;
        INSERT INTO FOOD_VARIANTS (FOOD_ID, VARIANT_LABEL, PREPARATION_STATE, CURRENT_PROFILE_ID, DENSITY_G_PER_ML,
                                   IS_DEFAULT, STATUS, SORT_ORDER)
        VALUES (p_food, p_label, p_state, v_prof, p_dens, p_default, 'PUBLISHED', p_order)
        RETURNING ID INTO v_var;
        IF p_default THEN
            UPDATE FOODS SET DEFAULT_VARIANT_ID = v_var WHERE ID = p_food;
        END IF;
        RETURN v_var;
    END;

    PROCEDURE add_portion(p_var NUMBER, p_unit VARCHAR2, p_grams NUMBER) IS
    BEGIN
        INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, SOURCE_ID, NOTE)
        VALUES (p_var, p_unit, p_grams, 'APPROXIMATE', FALSE, v_src, 'Medida casera aproximada');
    END;

    PROCEDURE ignore_var(p_var NUMBER) IS BEGIN NULL; END;
BEGIN
    SELECT ID INTO v_src FROM DATA_SOURCES WHERE CODE = 'FITONA_EDITORIAL';
    DECLARE
        v_var NUMBER;
    BEGIN"""]

def num(v):
    return "NULL" if v is None else repr(float(v)) if not isinstance(v, str) else v

for name, cat, syns, variants in FOODS:
    out.append(f"        v_food := new_food({sql(name)}, {sql(key(name))}, {sql(cat)});")
    for s, kind, note in syns:
        out.append(f"        add_name(v_food, {sql(s)}, {sql(key(s))}, {sql(kind)}, {sql(note)});")
    for i, (label, state, kcal, p, c, sg, f, sat, fib, salt, dens, portions) in enumerate(variants):
        default = "TRUE" if i == (1 if len(variants) > 1 and name in ("Patata","Arroz blanco","Pasta","Pechuga de pollo") else 0) and True else "FALSE"
        # por defecto: la variante «cocinada» en alimentos que se registran normalmente cocinados
        out.append(f"        v_var := add_variant(v_food, {sql(label)}, {sql(state)}, {default}, {i+1}, {num(kcal)}, {num(p)}, {num(c)}, {num(sg)}, {num(f)}, {num(sat)}, {num(fib)}, {num(salt)}, {num(dens)});")
        for unit, grams in portions:
            out.append(f"        add_portion(v_var, {sql(unit)}, {grams});")
out.append("""    END;
    COMMIT;
END;
/
""")
pathlib.Path(__file__).resolve().parents[1].joinpath("migrations", "V010__starter_catalog.sql").write_text("\n".join(out), encoding="utf-8")
print(len(FOODS), "alimentos")
