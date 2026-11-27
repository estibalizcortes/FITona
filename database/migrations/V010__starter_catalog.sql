-- =============================================================================
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
    BEGIN
        v_food := new_food('Manzana', 'manzana', 'FRUITS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 52.0, 0.3, 11.4, 10.4, 0.2, 0.0, 2.4, NULL, NULL);
        add_portion(v_var, 'UNIT', 180);
        v_food := new_food('Plátano', 'platano', 'FRUITS');
        add_name(v_food, 'Banana', 'banana', 'REGIONAL', 'Latinoamérica');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 89.0, 1.1, 20.2, 12.2, 0.3, 0.1, 2.6, NULL, NULL);
        add_portion(v_var, 'UNIT', 120);
        v_food := new_food('Naranja', 'naranja', 'FRUITS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 47.0, 0.9, 9.4, 9.4, 0.1, 0.0, 2.4, NULL, NULL);
        add_portion(v_var, 'UNIT', 180);
        v_food := new_food('Mandarina', 'mandarina', 'FRUITS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 53.0, 0.8, 11.2, 10.6, 0.3, 0.0, 1.8, NULL, NULL);
        add_portion(v_var, 'UNIT', 80);
        v_food := new_food('Pera', 'pera', 'FRUITS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 57.0, 0.4, 12.3, 9.8, 0.1, 0.0, 3.1, NULL, NULL);
        add_portion(v_var, 'UNIT', 170);
        v_food := new_food('Fresas', 'fresas', 'FRUITS');
        add_name(v_food, 'Frutillas', 'frutillas', 'REGIONAL', 'Sudamérica');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 32.0, 0.7, 5.7, 4.9, 0.3, 0.0, 2.0, NULL, NULL);
        v_food := new_food('Uvas', 'uvas', 'FRUITS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 69.0, 0.7, 17.2, 15.5, 0.2, 0.1, 0.9, NULL, NULL);
        v_food := new_food('Tomate', 'tomate', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 18.0, 0.9, 2.7, 2.6, 0.2, 0.0, 1.2, NULL, NULL);
        add_portion(v_var, 'UNIT', 120);
        v_food := new_food('Zanahoria', 'zanahoria', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 41.0, 0.9, 6.9, 4.7, 0.2, 0.0, 2.8, NULL, NULL);
        add_portion(v_var, 'UNIT', 70);
        v_food := new_food('Cebolla', 'cebolla', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 40.0, 1.1, 7.6, 4.2, 0.1, 0.0, 1.7, NULL, NULL);
        add_portion(v_var, 'UNIT', 110);
        v_food := new_food('Lechuga', 'lechuga', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 15.0, 1.4, 1.6, 0.8, 0.2, 0.0, 1.3, NULL, NULL);
        v_food := new_food('Espinacas', 'espinacas', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 23.0, 2.9, 1.4, 0.4, 0.4, 0.1, 2.2, NULL, NULL);
        v_food := new_food('Pimiento rojo', 'pimiento rojo', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 31.0, 1.0, 3.9, 4.2, 0.3, 0.0, 2.1, NULL, NULL);
        add_portion(v_var, 'UNIT', 150);
        v_food := new_food('Calabacín', 'calabacin', 'VEGETABLES');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 17.0, 1.2, 2.1, 2.5, 0.3, 0.1, 1.0, NULL, NULL);
        add_portion(v_var, 'UNIT', 200);
        v_food := new_food('Brócoli', 'brocoli', 'VEGETABLES');
        add_name(v_food, 'Brécol', 'brecol', 'SYNONYM', NULL);
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 34.0, 2.8, 4.4, 1.7, 0.4, 0.0, 2.6, NULL, NULL);
        v_food := new_food('Judías verdes', 'judias verdes', 'VEGETABLES');
        add_name(v_food, 'Habichuelas', 'habichuelas', 'REGIONAL', 'Caribe');
        add_name(v_food, 'Ejotes', 'ejotes', 'REGIONAL', 'México');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 31.0, 1.8, 4.3, 3.3, 0.2, 0.1, 2.7, NULL, NULL);
        v_food := new_food('Boniato', 'boniato', 'CEREALS_STARCHES');
        add_name(v_food, 'Batata', 'batata', 'SYNONYM', NULL);
        add_name(v_food, 'Camote', 'camote', 'REGIONAL', 'Latinoamérica');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 86.0, 1.6, 17.1, 4.2, 0.1, 0.0, 3.0, NULL, NULL);
        add_portion(v_var, 'UNIT', 150);
        v_food := new_food('Patata', 'patata', 'CEREALS_STARCHES');
        add_name(v_food, 'Papa', 'papa', 'REGIONAL', 'Canarias y Latinoamérica');
        v_var := add_variant(v_food, 'crudo', 'RAW', FALSE, 1, 77.0, 2.0, 15.3, 0.8, 0.1, 0.0, 2.2, NULL, NULL);
        add_portion(v_var, 'UNIT', 170);
        v_var := add_variant(v_food, 'cocido', 'BOILED', TRUE, 2, 87.0, 1.9, 18.3, 0.9, 0.1, 0.0, 1.8, NULL, NULL);
        add_portion(v_var, 'UNIT', 150);
        v_food := new_food('Arroz blanco', 'arroz blanco', 'CEREALS_STARCHES');
        v_var := add_variant(v_food, 'crudo', 'DRY', FALSE, 1, 365.0, 7.1, 78.7, 0.1, 0.7, 0.2, 1.3, NULL, NULL);
        v_var := add_variant(v_food, 'cocido', 'BOILED', TRUE, 2, 130.0, 2.7, 27.8, 0.1, 0.3, 0.1, 0.4, NULL, NULL);
        v_food := new_food('Pasta', 'pasta', 'CEREALS_STARCHES');
        add_name(v_food, 'Espaguetis', 'espaguetis', 'SYNONYM', NULL);
        add_name(v_food, 'Macarrones', 'macarrones', 'SYNONYM', NULL);
        v_var := add_variant(v_food, 'cruda', 'DRY', FALSE, 1, 371.0, 13.0, 71.5, 2.7, 1.5, 0.3, 3.2, NULL, NULL);
        v_var := add_variant(v_food, 'cocida', 'BOILED', TRUE, 2, 158.0, 5.8, 29.1, 0.6, 0.9, 0.2, 1.8, NULL, NULL);
        v_food := new_food('Pan blanco', 'pan blanco', 'CEREALS_STARCHES');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 265.0, 9.0, 46.5, 5.0, 3.2, 0.7, 2.7, 1.2, NULL);
        add_portion(v_var, 'SLICE', 30);
        v_food := new_food('Pan integral', 'pan integral', 'CEREALS_STARCHES');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 252.0, 12.5, 37.0, 5.6, 3.5, 0.7, 6.0, 1.1, NULL);
        add_portion(v_var, 'SLICE', 30);
        v_food := new_food('Copos de avena', 'copos de avena', 'CEREALS_STARCHES');
        v_var := add_variant(v_food, NULL, 'DRY', TRUE, 1, 389.0, 16.9, 55.7, 1.0, 6.9, 1.2, 10.6, NULL, NULL);
        add_portion(v_var, 'TBSP', 10);
        v_food := new_food('Harina de trigo', 'harina de trigo', 'CEREALS_STARCHES');
        v_var := add_variant(v_food, NULL, 'DRY', TRUE, 1, 364.0, 10.3, 73.6, 0.3, 1.0, 0.2, 2.7, NULL, NULL);
        v_food := new_food('Garbanzos', 'garbanzos', 'LEGUMES');
        v_var := add_variant(v_food, 'cocidos', 'BOILED', TRUE, 1, 164.0, 8.9, 19.8, 4.8, 2.6, 0.3, 7.6, NULL, NULL);
        v_food := new_food('Lentejas', 'lentejas', 'LEGUMES');
        v_var := add_variant(v_food, 'cocidas', 'BOILED', TRUE, 1, 116.0, 9.0, 12.2, 1.8, 0.4, 0.1, 7.9, NULL, NULL);
        v_food := new_food('Alubias blancas', 'alubias blancas', 'LEGUMES');
        add_name(v_food, 'Judías blancas', 'judias blancas', 'SYNONYM', NULL);
        add_name(v_food, 'Habichuelas blancas', 'habichuelas blancas', 'REGIONAL', 'Caribe');
        v_var := add_variant(v_food, 'cocidas', 'BOILED', TRUE, 1, 139.0, 9.7, 18.8, 0.3, 0.4, 0.1, 6.3, NULL, NULL);
        v_food := new_food('Huevo', 'huevo', 'EGGS');
        v_var := add_variant(v_food, NULL, 'RAW', TRUE, 1, 143.0, 12.6, 0.7, 0.4, 9.5, 3.1, 0.0, 0.4, NULL);
        add_portion(v_var, 'UNIT', 55);
        v_food := new_food('Leche entera', 'leche entera', 'DAIRY');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 61.0, 3.2, 4.8, 5.0, 3.3, 1.9, 0.0, 0.1, 1.03);
        add_portion(v_var, 'GLASS', 206);
        v_food := new_food('Leche semidesnatada', 'leche semidesnatada', 'DAIRY');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 50.0, 3.3, 4.8, 4.8, 1.9, 1.2, 0.0, 0.1, 1.03);
        add_portion(v_var, 'GLASS', 206);
        v_food := new_food('Leche desnatada', 'leche desnatada', 'DAIRY');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 34.0, 3.4, 5.0, 5.0, 0.1, 0.1, 0.0, 0.1, 1.03);
        add_portion(v_var, 'GLASS', 206);
        v_food := new_food('Yogur natural', 'yogur natural', 'DAIRY');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 61.0, 3.5, 4.7, 4.7, 3.3, 2.1, 0.0, 0.1, NULL);
        add_portion(v_var, 'UNIT', 125);
        v_food := new_food('Yogur griego natural', 'yogur griego natural', 'DAIRY');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 97.0, 9.0, 4.0, 4.0, 5.0, 3.2, 0.0, 0.1, NULL);
        add_portion(v_var, 'UNIT', 125);
        v_food := new_food('Queso cottage', 'queso cottage', 'DAIRY');
        add_name(v_food, 'Queso granulado', 'queso granulado', 'SYNONYM', NULL);
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 98.0, 11.1, 3.4, 2.7, 4.3, 1.7, 0.0, 0.9, NULL);
        add_portion(v_var, 'TBSP', 25);
        v_food := new_food('Pechuga de pollo', 'pechuga de pollo', 'MEAT');
        v_var := add_variant(v_food, 'cruda', 'RAW', FALSE, 1, 120.0, 22.5, 0.0, 0.0, 2.6, 0.6, 0.0, 0.2, NULL);
        v_var := add_variant(v_food, 'cocinada', 'ROASTED', TRUE, 2, 165.0, 31.0, 0.0, 0.0, 3.6, 1.0, 0.0, 0.2, NULL);
        v_food := new_food('Salmón', 'salmon', 'FISH_SEAFOOD');
        v_var := add_variant(v_food, 'crudo', 'RAW', TRUE, 1, 208.0, 20.4, 0.0, 0.0, 13.4, 3.1, 0.0, 0.1, NULL);
        v_food := new_food('Bacalao', 'bacalao', 'FISH_SEAFOOD');
        v_var := add_variant(v_food, 'crudo', 'RAW', TRUE, 1, 82.0, 17.8, 0.0, 0.0, 0.7, 0.1, 0.0, 0.2, NULL);
        v_food := new_food('Atún al natural', 'atun al natural', 'FISH_SEAFOOD');
        v_var := add_variant(v_food, 'en conserva, escurrido', 'CANNED_DRAINED', TRUE, 1, 116.0, 25.5, 0.0, 0.0, 0.8, 0.2, 0.0, 0.9, NULL);
        add_portion(v_var, 'CAN', 52);
        v_food := new_food('Aceite de oliva', 'aceite de oliva', 'FATS_OILS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 884.0, 0.0, 0.0, 0.0, 100.0, 13.8, 0.0, 0.0, 0.91);
        add_portion(v_var, 'TBSP', 14);
        add_portion(v_var, 'TSP', 5);
        v_food := new_food('Mantequilla', 'mantequilla', 'FATS_OILS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 717.0, 0.9, 0.1, 0.1, 81.1, 51.4, 0.0, NULL, NULL);
        add_portion(v_var, 'TBSP', 14);
        v_food := new_food('Almendras', 'almendras', 'NUTS_SEEDS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 579.0, 21.2, 9.1, 4.4, 49.9, 3.8, 12.5, 0.0, NULL);
        add_portion(v_var, 'HANDFUL', 30);
        v_food := new_food('Nueces', 'nueces', 'NUTS_SEEDS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 654.0, 15.2, 7.0, 2.6, 65.2, 6.1, 6.7, 0.0, NULL);
        add_portion(v_var, 'HANDFUL', 30);
        v_food := new_food('Chocolate negro (70-85 % cacao)', 'chocolate negro 70 85 cacao', 'SWEETS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 598.0, 7.8, 35.0, 24.0, 42.6, 24.5, 10.9, 0.0, NULL);
        add_portion(v_var, 'PIECE', 10);
        v_food := new_food('Azúcar', 'azucar', 'SWEETS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 387.0, 0.0, 99.98, 99.8, 0.0, 0.0, 0.0, 0.0, NULL);
        add_portion(v_var, 'TSP', 5);
        v_food := new_food('Miel', 'miel', 'SWEETS');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 304.0, 0.3, 82.4, 82.1, 0.0, 0.0, 0.2, 0.0, 1.4);
        add_portion(v_var, 'TSP', 7);
        v_food := new_food('Zumo de naranja', 'zumo de naranja', 'BEVERAGES');
        v_var := add_variant(v_food, NULL, 'AS_SOLD', TRUE, 1, 45.0, 0.7, 10.2, 8.4, 0.2, 0.0, 0.2, 0.0, 1.04);
        add_portion(v_var, 'GLASS', 208);
    END;
    COMMIT;
END;
/
