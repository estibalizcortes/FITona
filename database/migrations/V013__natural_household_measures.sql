-- V013 · Medidas caseras más naturales: tamaños (pequeña/grande), chorrito, pizca, diente, onza.
-- Los gramos son APROXIMADOS (se muestran como «cantidad aproximada»); la persona puede usar siempre gramos.
DECLARE
    PROCEDURE p(p_name VARCHAR2, p_unit VARCHAR2, p_grams NUMBER, p_prec VARCHAR2) IS
        v_var NUMBER; v_n NUMBER;
    BEGIN
        SELECT v.ID INTO v_var FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID
         WHERE f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = p_name AND v.IS_DEFAULT;
        SELECT COUNT(*) INTO v_n FROM FOOD_PORTIONS WHERE VARIANT_ID = v_var AND UNIT_CODE = p_unit;
        IF v_n = 0 THEN
            INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, NOTE)
            VALUES (v_var, p_unit, p_grams, p_prec, FALSE, 'Medida casera aproximada');
        END IF;
    END;
BEGIN
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('UNIT_S', 'HOUSEHOLD', NULL, 30);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('UNIT_S', 'es-ES', 'unidad pequeña', 'unidades pequeñas');
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('UNIT_L', 'HOUSEHOLD', NULL, 31);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('UNIT_L', 'es-ES', 'unidad grande', 'unidades grandes');
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('SPLASH', 'HOUSEHOLD', NULL, 32);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('SPLASH', 'es-ES', 'chorrito', 'chorritos');
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('PINCH', 'HOUSEHOLD', NULL, 33);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('PINCH', 'es-ES', 'pizca', 'pizcas');
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('CLOVE', 'HOUSEHOLD', NULL, 34);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('CLOVE', 'es-ES', 'diente', 'dientes');
    INSERT INTO PORTION_UNITS (CODE, MEASURE_KIND, BASE_FACTOR, SORT_ORDER) VALUES ('SQUARE', 'HOUSEHOLD', NULL, 35);
    INSERT INTO PORTION_UNIT_NAMES (UNIT_CODE, LOCALE, SINGULAR, PLURAL) VALUES ('SQUARE', 'es-ES', 'onza', 'onzas');
    p('Patata (cruda)', 'UNIT_S', 100, 'APPROXIMATE');
    p('Patata (cruda)', 'UNIT', 170, 'APPROXIMATE');
    p('Patata (cruda)', 'UNIT_L', 250, 'APPROXIMATE');
    p('Cebolla', 'UNIT_S', 70, 'APPROXIMATE');
    p('Cebolla', 'UNIT', 110, 'APPROXIMATE');
    p('Cebolla', 'UNIT_L', 180, 'APPROXIMATE');
    p('Tomate', 'UNIT_S', 80, 'APPROXIMATE');
    p('Tomate', 'UNIT', 120, 'APPROXIMATE');
    p('Tomate', 'UNIT_L', 200, 'APPROXIMATE');
    p('Zanahoria', 'UNIT_S', 50, 'APPROXIMATE');
    p('Zanahoria', 'UNIT', 70, 'APPROXIMATE');
    p('Zanahoria', 'UNIT_L', 100, 'APPROXIMATE');
    p('Pimiento rojo', 'UNIT_S', 100, 'APPROXIMATE');
    p('Pimiento rojo', 'UNIT', 150, 'APPROXIMATE');
    p('Pimiento rojo', 'UNIT_L', 220, 'APPROXIMATE');
    p('Calabacín', 'UNIT_S', 150, 'APPROXIMATE');
    p('Calabacín', 'UNIT', 250, 'APPROXIMATE');
    p('Calabacín', 'UNIT_L', 350, 'APPROXIMATE');
    p('Manzana', 'UNIT_S', 130, 'APPROXIMATE');
    p('Manzana', 'UNIT', 180, 'APPROXIMATE');
    p('Manzana', 'UNIT_L', 250, 'APPROXIMATE');
    p('Plátano', 'UNIT_S', 100, 'APPROXIMATE');
    p('Plátano', 'UNIT', 120, 'APPROXIMATE');
    p('Plátano', 'UNIT_L', 160, 'APPROXIMATE');
    p('Naranja', 'UNIT_S', 150, 'APPROXIMATE');
    p('Naranja', 'UNIT', 200, 'APPROXIMATE');
    p('Naranja', 'UNIT_L', 280, 'APPROXIMATE');
    p('Pera', 'UNIT_S', 140, 'APPROXIMATE');
    p('Pera', 'UNIT', 180, 'APPROXIMATE');
    p('Pera', 'UNIT_L', 250, 'APPROXIMATE');
    p('Huevo de gallina', 'UNIT_S', 46, 'APPROXIMATE');
    p('Huevo de gallina', 'UNIT', 55, 'APPROXIMATE');
    p('Huevo de gallina', 'UNIT_L', 63, 'APPROXIMATE');
    p('Boniato', 'UNIT_S', 150, 'APPROXIMATE');
    p('Boniato', 'UNIT', 250, 'APPROXIMATE');
    p('Boniato', 'UNIT_L', 400, 'APPROXIMATE');
    p('Patata (cocida)', 'UNIT_S', 100, 'APPROXIMATE');
    p('Patata (cocida)', 'UNIT', 150, 'APPROXIMATE');
    p('Patata (cocida)', 'UNIT_L', 220, 'APPROXIMATE');
    p('Aguacate', 'UNIT_S', 110, 'APPROXIMATE');
    p('Aguacate', 'UNIT', 150, 'APPROXIMATE');
    p('Aguacate', 'UNIT_L', 200, 'APPROXIMATE');
    p('Berenjena', 'UNIT_S', 180, 'APPROXIMATE');
    p('Berenjena', 'UNIT', 250, 'APPROXIMATE');
    p('Berenjena', 'UNIT_L', 350, 'APPROXIMATE');
    p('Pepino', 'UNIT_S', 200, 'APPROXIMATE');
    p('Pepino', 'UNIT', 250, 'APPROXIMATE');
    p('Pepino', 'UNIT_L', 350, 'APPROXIMATE');
    p('Ajo', 'CLOVE', 4, 'ROUGH');
    p('Chocolate negro', 'SQUARE', 10, 'APPROXIMATE');
    p('Chocolate negro 75 %', 'SQUARE', 10, 'APPROXIMATE');
    p('Sal', 'PINCH', 0.5, 'ROUGH');
    p('Pimienta', 'PINCH', 0.3, 'ROUGH');
    p('Pimentón', 'PINCH', 0.5, 'ROUGH');
    p('Semillas de lino', 'TBSP', 10, 'APPROXIMATE');
    p('Semillas de chía', 'TBSP', 12, 'APPROXIMATE');
    p('Semillas de sésamo', 'TBSP', 9, 'APPROXIMATE');
    p('Pipas de calabaza', 'TBSP', 9, 'APPROXIMATE');
    p('Pipas de girasol', 'TBSP', 9, 'APPROXIMATE');
    p('Mezcla de frutos secos', 'HANDFUL', 30, 'ROUGH');
    p('Nueces', 'HANDFUL', 30, 'ROUGH');
    p('Almendras naturales', 'HANDFUL', 30, 'ROUGH');
    p('Copos de avena', 'HANDFUL', 30, 'ROUGH');
    p('Yogur natural', 'UNIT', 125, 'EXACT');
    p('Pan integral', 'SLICE', 30, 'APPROXIMATE');
    p('Mantequilla', 'TSP', 5, 'APPROXIMATE');
    p('Miel', 'TSP', 7, 'APPROXIMATE');
    p('Azúcar blanco', 'TSP', 5, 'APPROXIMATE');
    p('Harina de trigo', 'TBSP', 10, 'APPROXIMATE');
    p('Aceite de oliva', 'SPLASH', 7, 'ROUGH');
    p('Aceite de oliva virgen extra', 'SPLASH', 7, 'ROUGH');
    p('Aceite de girasol', 'SPLASH', 7, 'ROUGH');
    p('Salsa de soja', 'SPLASH', 5, 'ROUGH');
    p('Vinagre de vino', 'SPLASH', 5, 'ROUGH');
    p('Vinagre balsámico', 'SPLASH', 5, 'ROUGH');
    p('Vinagre de manzana', 'SPLASH', 5, 'ROUGH');
END;
/
