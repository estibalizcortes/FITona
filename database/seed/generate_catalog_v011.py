#!/usr/bin/env python3
"""Genera database/migrations/V011__catalog_simplified.sql a partir de database/seed/catalogo-alimentos.md.

El archivo .md (576 alimentos genéricos en 33 grupos) es la FUENTE DE VERDAD de los nombres y las categorías.
Valores nutricionales: SOLO los de la tabla VALUES de abajo (aproximados, escritos a mano, SIN verificar contra
ninguna fuente; se cargan como ESTIMATE/PENDING). El resto de alimentos se carga SIN datos nutricionales: no se
inventan. La persona puede ponerles sus propios valores en la aplicación, o se pueden importar datos verificados
con database/seed/apply_nutrients.py.

La «imagen» de cada alimento es un emoji (no hay fotos con licencia disponibles sin conexión).
Uso: python3 database/seed/generate_catalog_v011.py
"""
import pathlib, re, unicodedata

SEED = pathlib.Path(__file__).resolve().parent
OUT = SEED.parent / "migrations" / "V011__catalog_simplified.sql"


def key(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def q(v):
    return "NULL" if v is None else "'" + str(v).replace("'", "''") + "'"


# ---- lectura del catálogo -------------------------------------------------------------------------
groups = []
for line in (SEED / "catalogo-alimentos.md").read_text(encoding="utf-8").splitlines():
    if line.startswith("## "):
        groups.append((line[3:].strip(), []))
    elif line.startswith("- "):
        groups[-1][1].append(line[2:].strip())
assert len(groups) == 33 and sum(len(f) for _, f in groups) == 576, "el catálogo no tiene 33 grupos / 576 alimentos"
assert len({n for _, fs in groups for n in fs}) == 576, "hay nombres repetidos"

# ---- categorías: (icono, sección del súper, rol para sustituciones) --------------------------------
CAT = {
    "Frutas": ("🍎", "FRUIT_VEG", "FRUIT"), "Verduras y hortalizas": ("🥦", "FRUIT_VEG", "VEGETABLE"),
    "Leche y bebidas vegetales": ("🥛", "DAIRY_EGGS", "DAIRY"), "Yogures y postres lácteos": ("🍮", "DAIRY_EGGS", "DAIRY"),
    "Quesos": ("🧀", "DELI", "DAIRY"), "Huevos": ("🥚", "DAIRY_EGGS", "PROTEIN"),
    "Carne de ave": ("🍗", "MEAT", "PROTEIN"), "Carne de cerdo": ("🥩", "MEAT", "PROTEIN"),
    "Vacuno y otras carnes": ("🥩", "MEAT", "PROTEIN"), "Embutidos y fiambres": ("🥓", "DELI", "PROTEIN"),
    "Pescados y mariscos": ("🐟", "FISH", "PROTEIN"), "Legumbres": ("🫘", "PANTRY", "LEGUME"),
    "Arroz y cereales": ("🍚", "PANTRY", "STARCH"), "Pasta": ("🍝", "PANTRY", "STARCH"),
    "Pan y masas": ("🍞", "BAKERY", "STARCH"), "Harinas y repostería": ("🌾", "PANTRY", None),
    "Cereales de desayuno": ("🥣", "PANTRY", "STARCH"), "Frutos secos y semillas": ("🥜", "PANTRY", "FAT"),
    "Chocolate y cacao": ("🍫", "PANTRY", "SWEET"), "Galletas y bollería": ("🍪", "BAKERY", "SWEET"),
    "Azúcar y untables": ("🍯", "PANTRY", "SWEET"), "Aceites y grasas": ("🫒", "PANTRY", "FAT"),
    "Salsas y condimentos": ("🧂", "PANTRY", "CONDIMENT"), "Conservas y encurtidos": ("🥫", "CANNED", None),
    "Aperitivos y chucherías": ("🍿", "PANTRY", "SWEET"), "Congelados": ("🧊", "FROZEN", None),
    "Platos preparados": ("🍲", "OTHER", "DISH"), "Alternativas vegetales": ("🌱", "PANTRY", "PROTEIN"),
    "Helados": ("🍨", "FROZEN", "SWEET"), "Caldos y sopas": ("🍜", "PANTRY", None),
    "Café, té y bebidas": ("☕", "DRINKS", "BEVERAGE"), "Bebidas alcohólicas": ("🍷", "DRINKS", "BEVERAGE"),
    "Alimentación deportiva": ("💪", "OTHER", "PROTEIN"),
}
assert set(CAT) == {g for g, _ in groups}, "categorías sin metadatos"
OLD_CATEGORIES = ["CEREALS_STARCHES", "LEGUMES", "VEGETABLES", "FRUITS", "MEAT", "FISH_SEAFOOD", "EGGS", "DAIRY", "DELI",
                  "FATS_OILS", "NUTS_SEEDS", "SWEETS", "BEVERAGES", "CONDIMENTS", "DISHES"]

# ---- imagen (emoji) por alimento: primera regla que coincide; si no, la de su categoría ------------------
ICON_RULES = [
    (r"^aguacate", "🥑"), (r"^coco\b", "🥥"), (r"^fresa|frutos rojos", "🍓"), (r"^kiwi", "🥝"), (r"^lim[oó]n", "🍋"),
    (r"^mango", "🥭"), (r"^manzana$", "🍎"), (r"^melocot|^nectarina|^paraguayo", "🍑"), (r"^mel[oó]n", "🍈"),
    (r"^naranja$|^mandarina", "🍊"), (r"^pera$", "🍐"), (r"^pi[nñ]a$", "🍍"), (r"^pl[aá]tano", "🍌"),
    (r"^sand[ií]a", "🍉"), (r"^uva$", "🍇"), (r"^cereza", "🍒"), (r"^ar[aá]ndano", "🫐"),
    (r"^tomate$|^tomate cherry", "🍅"), (r"^zanahoria", "🥕"), (r"^cebolla$|^cebolleta", "🧅"), (r"^ajo$", "🧄"),
    (r"^ma[ií]z en mazorca", "🌽"), (r"^patata \(", "🥔"), (r"^boniato", "🍠"), (r"^berenjena", "🍆"),
    (r"^pepino", "🥒"), (r"^br[oó]coli", "🥦"), (r"^champi|^setas", "🍄"), (r"^pimiento", "🫑"),
    (r"^lechuga|^espinaca|^acelga|^r[uú]cula|^can[oó]nigo|^escarola|^cogollo", "🥬"),
    (r"^guisante|^jud[ií]as verdes|^habas$", "🫛"), (r"^huevo|^clara|^yema", "🥚"),
    (r"^alitas|^muslo|^contramuslo|^pollo", "🍗"), (r"^gambas|^langostinos", "🦐"), (r"^calamar|^sepia", "🦑"),
    (r"^pulpo", "🐙"), (r"^pan$|^pan |^mollete|^picos", "🍞"), (r"^croissant|^napolitana", "🥐"), (r"^pizza", "🍕"),
    (r"^hamburguesa", "🍔"), (r"^s[aá]ndwich", "🥪"), (r"^tortillas de", "🫓"), (r"^donut|^rosquillas", "🍩"),
    (r"^galletas|^cookies", "🍪"), (r"^cono de helado|^helado de vainilla", "🍦"), (r"^chocolate|^barrita de chocolate|^bombones", "🍫"),
    (r"^miel", "🍯"), (r"^agua", "💧"), (r"^caf[eé]", "☕"), (r"^t[eé]$|^infusi", "🍵"), (r"^cerveza", "🍺"),
    (r"^vino|^sangr[ií]a|^tinto", "🍷"), (r"^cava", "🥂"), (r"^whisky|^ron$|^vodka|^ginebra", "🥃"),
    (r"^leche|^batido", "🥛"), (r"^arroz", "🍚"),
    (r"^espagueti|^macarron|^pasta|^fideos|^[ñn]oquis|^canelones|^placas de lasa", "🍝"), (r"^palomitas", "🍿"),
    (r"^cacahuete|^almendras|^avellanas|^pistachos|^anacardos|^nueces", "🥜"), (r"^bacon|^panceta", "🥓"),
    (r"^paella|^fideu", "🥘"), (r"^cocido|^fabada|^callos|^lentejas estofadas", "🍲"), (r"^gazpacho|^salmorejo", "🥣"),
    (r"^aceite|^aceitunas", "🫒"), (r"^mantequilla", "🧈"), (r"^sal$", "🧂"), (r"^queso", "🧀"),
    (r"^tortilla de patatas", "🍳"), (r"^croquetas", "🍘"), (r"^salm[oó]n|^at[uú]n|^merluza|^bacalao|^dorada|^lubina", "🐟"),
    (r"^caldo", "🍜"), (r"^zumo", "🧃"), (r"^refresco|^gaseosa|^t[oó]nica", "🥤"),
]


def icon(name):
    n = name.lower()
    for rx, ic in ICON_RULES:
        if re.search(rx, n):
            return ic
    return None


# ---- sinónimos / nombres regionales (sin implicar igualdad nutricional) ----------------------------------
SYN = {
    "Boniato": [("Batata", "SYNONYM", None), ("Camote", "REGIONAL", "Latinoamérica")],
    "Judías verdes": [("Habichuelas", "REGIONAL", "Caribe"), ("Ejotes", "REGIONAL", "México")],
    "Queso cottage": [("Queso granulado", "SYNONYM", None)],
    "Plátano": [("Banana", "REGIONAL", "Latinoamérica")],
    "Fresa": [("Frutilla", "REGIONAL", "Sudamérica")],
    "Patata (cruda)": [("Papa", "REGIONAL", "Canarias y Latinoamérica")],
    "Patata (cocida)": [("Papa", "REGIONAL", "Canarias y Latinoamérica")],
    "Patata (asada)": [("Papa", "REGIONAL", "Canarias y Latinoamérica")],
    "Brócoli": [("Brécol", "SYNONYM", None)],
    "Alubias blancas cocidas": [("Judías blancas", "SYNONYM", None), ("Habichuelas blancas", "REGIONAL", "Caribe")],
    "Aguacate": [("Palta", "REGIONAL", "Chile y Perú")],
    "Melocotón": [("Durazno", "REGIONAL", "Latinoamérica")],
    "Guisantes": [("Chícharos", "REGIONAL", "México")],
    "Cacahuetes": [("Maní", "REGIONAL", "Latinoamérica")],
    "Maíz dulce": [("Choclo", "REGIONAL", "Sudamérica")],
    "Huevo de gallina": [("Huevo", "SYNONYM", None)],
    "Chocolate negro": [("Chocolate puro", "SYNONYM", None)],
}

# ---- valores aproximados SIN VERIFICAR (por 100 g; hidratos disponibles): kcal, prot, hidr, azúc, grasa, sat,
# ---- fibra, sal, densidad (g/ml), medidas caseras --------------------------------------------------------
N = None
_PASTA_S = (371, 13.0, 71.5, 2.7, 1.5, 0.3, 3.2, N, N, [])
_PASTA_C = (158, 5.8, 29.1, 0.6, 0.9, 0.2, 1.8, N, N, [])
_OIL = (884, 0.0, 0.0, 0.0, 100.0, 13.8, 0.0, 0.0, 0.91, [("TBSP", 14), ("TSP", 5)])
_CHOC = (598, 7.8, 35.0, 24.0, 42.6, 24.5, 10.9, 0.0, N, [("PIECE", 10)])
VALUES = {
    "Manzana": (52, 0.3, 11.4, 10.4, 0.2, 0.0, 2.4, N, N, [("UNIT", 180)]),
    "Plátano": (89, 1.1, 20.2, 12.2, 0.3, 0.1, 2.6, N, N, [("UNIT", 120)]),
    "Naranja": (47, 0.9, 9.4, 9.4, 0.1, 0.0, 2.4, N, N, [("UNIT", 180)]),
    "Mandarina": (53, 0.8, 11.2, 10.6, 0.3, 0.0, 1.8, N, N, [("UNIT", 80)]),
    "Pera": (57, 0.4, 12.3, 9.8, 0.1, 0.0, 3.1, N, N, [("UNIT", 170)]),
    "Fresa": (32, 0.7, 5.7, 4.9, 0.3, 0.0, 2.0, N, N, []),
    "Uva": (69, 0.7, 17.2, 15.5, 0.2, 0.1, 0.9, N, N, []),
    "Tomate": (18, 0.9, 2.7, 2.6, 0.2, 0.0, 1.2, N, N, [("UNIT", 120)]),
    "Zanahoria": (41, 0.9, 6.9, 4.7, 0.2, 0.0, 2.8, N, N, [("UNIT", 70)]),
    "Cebolla": (40, 1.1, 7.6, 4.2, 0.1, 0.0, 1.7, N, N, [("UNIT", 110)]),
    "Lechuga": (15, 1.4, 1.6, 0.8, 0.2, 0.0, 1.3, N, N, []),
    "Espinacas": (23, 2.9, 1.4, 0.4, 0.4, 0.1, 2.2, N, N, []),
    "Pimiento rojo": (31, 1.0, 3.9, 4.2, 0.3, 0.0, 2.1, N, N, [("UNIT", 150)]),
    "Calabacín": (17, 1.2, 2.1, 2.5, 0.3, 0.1, 1.0, N, N, [("UNIT", 200)]),
    "Brócoli": (34, 2.8, 4.4, 1.7, 0.4, 0.0, 2.6, N, N, []),
    "Judías verdes": (31, 1.8, 4.3, 3.3, 0.2, 0.1, 2.7, N, N, []),
    "Boniato": (86, 1.6, 17.1, 4.2, 0.1, 0.0, 3.0, N, N, [("UNIT", 150)]),
    "Patata (cruda)": (77, 2.0, 15.3, 0.8, 0.1, 0.0, 2.2, N, N, [("UNIT", 170)]),
    "Patata (cocida)": (87, 1.9, 18.3, 0.9, 0.1, 0.0, 1.8, N, N, [("UNIT", 150)]),
    "Arroz blanco (crudo)": (365, 7.1, 78.7, 0.1, 0.7, 0.2, 1.3, N, N, []),
    "Arroz blanco (cocido)": (130, 2.7, 27.8, 0.1, 0.3, 0.1, 0.4, N, N, []),
    "Espaguetis (secos)": _PASTA_S, "Espaguetis (cocidos)": _PASTA_C,
    "Macarrones (secos)": _PASTA_S, "Macarrones (cocidos)": _PASTA_C,
    "Pan blanco": (265, 9.0, 46.5, 5.0, 3.2, 0.7, 2.7, 1.2, N, [("SLICE", 30)]),
    "Pan integral": (252, 12.5, 37.0, 5.6, 3.5, 0.7, 6.0, 1.1, N, [("SLICE", 30)]),
    "Copos de avena": (389, 16.9, 55.7, 1.0, 6.9, 1.2, 10.6, N, N, [("TBSP", 10)]),
    "Harina de trigo": (364, 10.3, 73.6, 0.3, 1.0, 0.2, 2.7, N, N, []),
    "Garbanzos cocidos": (164, 8.9, 19.8, 4.8, 2.6, 0.3, 7.6, N, N, []),
    "Lentejas cocidas": (116, 9.0, 12.2, 1.8, 0.4, 0.1, 7.9, N, N, []),
    "Alubias blancas cocidas": (139, 9.7, 18.8, 0.3, 0.4, 0.1, 6.3, N, N, []),
    "Huevo de gallina": (143, 12.6, 0.7, 0.4, 9.5, 3.1, 0.0, 0.4, N, [("UNIT", 55)]),
    "Leche entera": (61, 3.2, 4.8, 5.0, 3.3, 1.9, 0.0, 0.1, 1.03, [("GLASS", 206)]),
    "Leche semidesnatada": (50, 3.3, 4.8, 4.8, 1.9, 1.2, 0.0, 0.1, 1.03, [("GLASS", 206)]),
    "Leche desnatada": (34, 3.4, 5.0, 5.0, 0.1, 0.1, 0.0, 0.1, 1.03, [("GLASS", 206)]),
    "Yogur natural": (61, 3.5, 4.7, 4.7, 3.3, 2.1, 0.0, 0.1, N, [("UNIT", 125)]),
    "Yogur griego": (97, 9.0, 4.0, 4.0, 5.0, 3.2, 0.0, 0.1, N, [("UNIT", 125)]),
    "Queso cottage": (98, 11.1, 3.4, 2.7, 4.3, 1.7, 0.0, 0.9, N, [("TBSP", 25)]),
    "Pechuga de pollo (cruda)": (120, 22.5, 0.0, 0.0, 2.6, 0.6, 0.0, 0.2, N, []),
    "Pechuga de pollo (cocinada)": (165, 31.0, 0.0, 0.0, 3.6, 1.0, 0.0, 0.2, N, []),
    "Salmón": (208, 20.4, 0.0, 0.0, 13.4, 3.1, 0.0, 0.1, N, []),
    "Bacalao": (82, 17.8, 0.0, 0.0, 0.7, 0.1, 0.0, 0.2, N, []),
    "Atún al natural (escurrido)": (116, 25.5, 0.0, 0.0, 0.8, 0.2, 0.0, 0.9, N, [("CAN", 52)]),
    "Aceite de oliva": _OIL, "Aceite de oliva virgen extra": _OIL,
    "Mantequilla": (717, 0.9, 0.1, 0.1, 81.1, 51.4, 0.0, N, N, [("TBSP", 14)]),
    "Almendras naturales": (579, 21.2, 9.1, 4.4, 49.9, 3.8, 12.5, 0.0, N, [("HANDFUL", 30)]),
    "Nueces": (654, 15.2, 7.0, 2.6, 65.2, 6.1, 6.7, 0.0, N, [("HANDFUL", 30)]),
    "Chocolate negro": _CHOC, "Chocolate negro 75 %": _CHOC,
    "Azúcar blanco": (387, 0.0, 99.98, 99.8, 0.0, 0.0, 0.0, 0.0, N, [("TSP", 5)]),
    "Miel": (304, 0.3, 82.4, 82.1, 0.0, 0.0, 0.2, 0.0, 1.4, [("TSP", 7)]),
    "Zumo de naranja": (45, 0.7, 10.2, 8.4, 0.2, 0.0, 0.2, 0.0, 1.04, [("GLASS", 208)]),
}
all_names = {n for _, fs in groups for n in fs}
assert set(VALUES) <= all_names, "valores para alimentos que no están en el catálogo: " + str(set(VALUES) - all_names)


def state(name):
    n = name.lower()
    for rx, st in [(r"\(cocid", "BOILED"), (r"\(crud", "RAW"), (r"\(sec", "DRY"), (r"\(asad|\(cocinad", "ROASTED"),
                   (r"\(escurrid", "CANNED_DRAINED"), (r"^huevo cocido", "BOILED")]:
        if re.search(rx, n):
            return st
    return "AS_SOLD"


def num(v):
    return "NULL" if v is None else repr(float(v))


o = []
o.append("""-- =============================================================================
-- FITona · V011 · Catálogo simplificado: 33 categorías (con icono) y 576 alimentos genéricos
-- GENERADO por database/seed/generate_catalog_v011.py a partir de database/seed/catalogo-alimentos.md. No editar a mano.
-- Valores nutricionales: SOLO los de un subconjunto, aproximados y SIN VERIFICAR (ESTIMATE/PENDING). El resto de
-- alimentos se carga SIN datos nutricionales (no se inventan): la persona les pone sus valores en la aplicación.
-- Sustituye al catálogo de arranque V010 (esos alimentos pasan a DEPRECATED: siguen resolviendo registros y recetas
-- existentes, pero ya no aparecen en el buscador).
-- =============================================================================
ALTER TABLE FOOD_CATEGORIES ADD (ICON VARCHAR2(16 CHAR));
ALTER TABLE FOODS ADD (ICON VARCHAR2(16 CHAR), OVERRIDES_FOOD_ID NUMBER(10));
ALTER TABLE FOODS ADD CONSTRAINT FK_FOODS_OVERRIDES FOREIGN KEY (OVERRIDES_FOOD_ID) REFERENCES FOODS (ID) ON DELETE SET NULL;
CREATE INDEX IX_FOODS_OVERRIDES ON FOODS (OVERRIDES_FOOD_ID);
COMMENT ON COLUMN FOOD_CATEGORIES.ICON IS 'Emoji representativo de la categoría.';
COMMENT ON COLUMN FOODS.ICON IS 'Emoji representativo del alimento (si es nulo se usa el de la categoría).';
COMMENT ON COLUMN FOODS.OVERRIDES_FOOD_ID IS 'Alimento del catálogo al que sustituye, solo para su dueña (sus valores personalizados).';

DECLARE
    v_src NUMBER;
    v_food NUMBER;
    v_var NUMBER;
    v_rank NUMBER := 0;

    FUNCTION new_food(p_name VARCHAR2, p_key VARCHAR2, p_cat VARCHAR2, p_icon VARCHAR2) RETURN NUMBER IS
        v_id NUMBER;
    BEGIN
        v_rank := v_rank + 1;
        INSERT INTO FOODS (CATEGORY_ID, CANONICAL_NAME, FOOD_KIND, STATUS, POPULARITY_RANK, ICON)
        VALUES ((SELECT ID FROM FOOD_CATEGORIES WHERE CODE = p_cat), p_name, 'INGREDIENT', 'PUBLISHED', v_rank, p_icon)
        RETURNING ID INTO v_id;
        INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND) VALUES (v_id, 'es-ES', p_name, p_key, 'PRIMARY');
        RETURN v_id;
    END;

    PROCEDURE add_name(p_food NUMBER, p_name VARCHAR2, p_key VARCHAR2, p_kind VARCHAR2, p_note VARCHAR2) IS
    BEGIN
        INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND, REGION_NOTE)
        VALUES (p_food, 'es-ES', p_name, p_key, p_kind, p_note);
    END;

    -- Variante única por defecto. Sin valores no se crea perfil: el alimento queda «sin datos nutricionales».
    FUNCTION add_variant(p_food NUMBER, p_state VARCHAR2, p_has BOOLEAN, p_kcal NUMBER, p_prot NUMBER, p_carb NUMBER,
                         p_sug NUMBER, p_fat NUMBER, p_sat NUMBER, p_fib NUMBER, p_salt NUMBER, p_dens NUMBER) RETURN NUMBER IS
        v_prof NUMBER;
        v_var NUMBER;
    BEGIN
        IF p_has THEN
            INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G,
                                           FIBER_G, SALT_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS, NOTES)
            VALUES ('REPRESENTATIVE', 'PER_100G', p_kcal, p_prot, p_carb, p_sug, p_fat, p_sat, p_fib, p_salt, 'DECLARED',
                    'ESTIMATE', 'MANUAL', 'PENDING', 'Valor de referencia aproximado SIN VERIFICAR.')
            RETURNING ID INTO v_prof;
        END IF;
        INSERT INTO FOOD_VARIANTS (FOOD_ID, PREPARATION_STATE, CURRENT_PROFILE_ID, DENSITY_G_PER_ML, IS_DEFAULT, STATUS, SORT_ORDER)
        VALUES (p_food, p_state, v_prof, p_dens, TRUE, 'PUBLISHED', 1)
        RETURNING ID INTO v_var;
        UPDATE FOODS SET DEFAULT_VARIANT_ID = v_var WHERE ID = p_food;
        RETURN v_var;
    END;

    PROCEDURE add_portion(p_var NUMBER, p_unit VARCHAR2, p_grams NUMBER) IS
    BEGIN
        INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, SOURCE_ID, NOTE)
        VALUES (p_var, p_unit, p_grams, 'APPROXIMATE', FALSE, v_src, 'Medida casera aproximada');
    END;
BEGIN
    SELECT ID INTO v_src FROM DATA_SOURCES WHERE CODE = 'FITONA_EDITORIAL';

    -- 1) Los alimentos del catálogo de arranque (V010) pasan a DEPRECATED y se desvinculan de las categorías antiguas.
    UPDATE FOODS SET STATUS = 'DEPRECATED', CATEGORY_ID = NULL WHERE OWNER_USER_ID IS NULL AND STATUS = 'PUBLISHED';
    UPDATE FOOD_VARIANTS SET STATUS = 'DEPRECATED'
     WHERE STATUS = 'PUBLISHED' AND FOOD_ID IN (SELECT ID FROM FOODS WHERE OWNER_USER_ID IS NULL AND STATUS = 'DEPRECATED');
    DELETE FROM FOOD_CATEGORIES WHERE CODE IN (""" + ", ".join(q(c) for c in OLD_CATEGORIES) + """);
""")
o.append("    -- 2) Categorías")
codes = {}
for i, (g, _) in enumerate(groups, 1):
    code = key(g).upper().replace(" ", "_")
    codes[g] = code
    ic, sec, role = CAT[g]
    o.append(f"    INSERT INTO FOOD_CATEGORIES (CODE, NAME_ES, ICON, SHOPPING_SECTION, SUBSTITUTION_ROLE, SORT_ORDER) "
             f"VALUES ({q(code)}, {q(g)}, {q(ic)}, {q(sec)}, {q(role)}, {i * 10});")
o.append("\n    -- 3) Alimentos")
with_values = 0
for g, foods in groups:
    for name in foods:
        v = VALUES.get(name)
        o.append(f"    v_food := new_food({q(name)}, {q(key(name))}, {q(codes[g])}, {q(icon(name))});")
        for s, kind, note in SYN.get(name, []):
            o.append(f"    add_name(v_food, {q(s)}, {q(key(s))}, {q(kind)}, {q(note)});")
        if v:
            with_values += 1
            kcal, p, c, sg, f, sat, fib, salt, dens, portions = v
            o.append(f"    v_var := add_variant(v_food, {q(state(name))}, TRUE, {num(kcal)}, {num(p)}, {num(c)}, {num(sg)}, "
                     f"{num(f)}, {num(sat)}, {num(fib)}, {num(salt)}, {num(dens)});")
            for unit, grams in portions:
                o.append(f"    add_portion(v_var, {q(unit)}, {grams});")
        else:
            o.append(f"    v_var := add_variant(v_food, {q(state(name))}, FALSE, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);")
o.append("    COMMIT;\nEND;\n/\n")
OUT.write_text("\n".join(o), encoding="utf-8")
print(f"{len(groups)} categorías, {sum(len(f) for _, f in groups)} alimentos, {with_values} con valores aproximados, "
      f"{sum(len(f) for _, f in groups) - with_values} sin datos")
