-- V013 · Medidas caseras más naturales: tamaños (pequeña/grande), chorrito, pizca, diente, onza.
-- Los gramos son APROXIMADOS (se muestran como «cantidad aproximada»); la persona puede usar siempre gramos.
CREATE PROCEDURE pg_temp.p(p_name VARCHAR, p_unit VARCHAR, p_grams NUMERIC, p_prec VARCHAR) LANGUAGE plpgsql AS $f$
DECLARE v_var BIGINT;
BEGIN
    SELECT v.ID INTO STRICT v_var FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID
     WHERE f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = p_name AND v.IS_DEFAULT;
    IF NOT EXISTS (SELECT 1 FROM FOOD_PORTIONS WHERE VARIANT_ID = v_var AND UNIT_CODE = p_unit) THEN
        INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, NOTE)
        VALUES (v_var, p_unit, p_grams, p_prec, FALSE, 'Medida casera aproximada');
    END IF;
END $f$;

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

DO $do$
BEGIN
    CALL pg_temp.p('Patata (cruda)', 'UNIT_S', 100, 'APPROXIMATE');
    CALL pg_temp.p('Patata (cruda)', 'UNIT', 170, 'APPROXIMATE');
    CALL pg_temp.p('Patata (cruda)', 'UNIT_L', 250, 'APPROXIMATE');
    CALL pg_temp.p('Cebolla', 'UNIT_S', 70, 'APPROXIMATE');
    CALL pg_temp.p('Cebolla', 'UNIT', 110, 'APPROXIMATE');
    CALL pg_temp.p('Cebolla', 'UNIT_L', 180, 'APPROXIMATE');
    CALL pg_temp.p('Tomate', 'UNIT_S', 80, 'APPROXIMATE');
    CALL pg_temp.p('Tomate', 'UNIT', 120, 'APPROXIMATE');
    CALL pg_temp.p('Tomate', 'UNIT_L', 200, 'APPROXIMATE');
    CALL pg_temp.p('Zanahoria', 'UNIT_S', 50, 'APPROXIMATE');
    CALL pg_temp.p('Zanahoria', 'UNIT', 70, 'APPROXIMATE');
    CALL pg_temp.p('Zanahoria', 'UNIT_L', 100, 'APPROXIMATE');
    CALL pg_temp.p('Pimiento rojo', 'UNIT_S', 100, 'APPROXIMATE');
    CALL pg_temp.p('Pimiento rojo', 'UNIT', 150, 'APPROXIMATE');
    CALL pg_temp.p('Pimiento rojo', 'UNIT_L', 220, 'APPROXIMATE');
    CALL pg_temp.p('Calabacín', 'UNIT_S', 150, 'APPROXIMATE');
    CALL pg_temp.p('Calabacín', 'UNIT', 250, 'APPROXIMATE');
    CALL pg_temp.p('Calabacín', 'UNIT_L', 350, 'APPROXIMATE');
    CALL pg_temp.p('Manzana', 'UNIT_S', 130, 'APPROXIMATE');
    CALL pg_temp.p('Manzana', 'UNIT', 180, 'APPROXIMATE');
    CALL pg_temp.p('Manzana', 'UNIT_L', 250, 'APPROXIMATE');
    CALL pg_temp.p('Plátano', 'UNIT_S', 100, 'APPROXIMATE');
    CALL pg_temp.p('Plátano', 'UNIT', 120, 'APPROXIMATE');
    CALL pg_temp.p('Plátano', 'UNIT_L', 160, 'APPROXIMATE');
    CALL pg_temp.p('Naranja', 'UNIT_S', 150, 'APPROXIMATE');
    CALL pg_temp.p('Naranja', 'UNIT', 200, 'APPROXIMATE');
    CALL pg_temp.p('Naranja', 'UNIT_L', 280, 'APPROXIMATE');
    CALL pg_temp.p('Pera', 'UNIT_S', 140, 'APPROXIMATE');
    CALL pg_temp.p('Pera', 'UNIT', 180, 'APPROXIMATE');
    CALL pg_temp.p('Pera', 'UNIT_L', 250, 'APPROXIMATE');
    CALL pg_temp.p('Huevo de gallina', 'UNIT_S', 46, 'APPROXIMATE');
    CALL pg_temp.p('Huevo de gallina', 'UNIT', 55, 'APPROXIMATE');
    CALL pg_temp.p('Huevo de gallina', 'UNIT_L', 63, 'APPROXIMATE');
    CALL pg_temp.p('Boniato', 'UNIT_S', 150, 'APPROXIMATE');
    CALL pg_temp.p('Boniato', 'UNIT', 250, 'APPROXIMATE');
    CALL pg_temp.p('Boniato', 'UNIT_L', 400, 'APPROXIMATE');
    CALL pg_temp.p('Patata (cocida)', 'UNIT_S', 100, 'APPROXIMATE');
    CALL pg_temp.p('Patata (cocida)', 'UNIT', 150, 'APPROXIMATE');
    CALL pg_temp.p('Patata (cocida)', 'UNIT_L', 220, 'APPROXIMATE');
    CALL pg_temp.p('Aguacate', 'UNIT_S', 110, 'APPROXIMATE');
    CALL pg_temp.p('Aguacate', 'UNIT', 150, 'APPROXIMATE');
    CALL pg_temp.p('Aguacate', 'UNIT_L', 200, 'APPROXIMATE');
    CALL pg_temp.p('Berenjena', 'UNIT_S', 180, 'APPROXIMATE');
    CALL pg_temp.p('Berenjena', 'UNIT', 250, 'APPROXIMATE');
    CALL pg_temp.p('Berenjena', 'UNIT_L', 350, 'APPROXIMATE');
    CALL pg_temp.p('Pepino', 'UNIT_S', 200, 'APPROXIMATE');
    CALL pg_temp.p('Pepino', 'UNIT', 250, 'APPROXIMATE');
    CALL pg_temp.p('Pepino', 'UNIT_L', 350, 'APPROXIMATE');
    CALL pg_temp.p('Ajo', 'CLOVE', 4, 'ROUGH');
    CALL pg_temp.p('Chocolate negro', 'SQUARE', 10, 'APPROXIMATE');
    CALL pg_temp.p('Chocolate negro 75 %', 'SQUARE', 10, 'APPROXIMATE');
    CALL pg_temp.p('Sal', 'PINCH', 0.5, 'ROUGH');
    CALL pg_temp.p('Pimienta', 'PINCH', 0.3, 'ROUGH');
    CALL pg_temp.p('Pimentón', 'PINCH', 0.5, 'ROUGH');
    CALL pg_temp.p('Semillas de lino', 'TBSP', 10, 'APPROXIMATE');
    CALL pg_temp.p('Semillas de chía', 'TBSP', 12, 'APPROXIMATE');
    CALL pg_temp.p('Semillas de sésamo', 'TBSP', 9, 'APPROXIMATE');
    CALL pg_temp.p('Pipas de calabaza', 'TBSP', 9, 'APPROXIMATE');
    CALL pg_temp.p('Pipas de girasol', 'TBSP', 9, 'APPROXIMATE');
    CALL pg_temp.p('Mezcla de frutos secos', 'HANDFUL', 30, 'ROUGH');
    CALL pg_temp.p('Nueces', 'HANDFUL', 30, 'ROUGH');
    CALL pg_temp.p('Almendras naturales', 'HANDFUL', 30, 'ROUGH');
    CALL pg_temp.p('Copos de avena', 'HANDFUL', 30, 'ROUGH');
    CALL pg_temp.p('Yogur natural', 'UNIT', 125, 'EXACT');
    CALL pg_temp.p('Pan integral', 'SLICE', 30, 'APPROXIMATE');
    CALL pg_temp.p('Mantequilla', 'TSP', 5, 'APPROXIMATE');
    CALL pg_temp.p('Miel', 'TSP', 7, 'APPROXIMATE');
    CALL pg_temp.p('Azúcar blanco', 'TSP', 5, 'APPROXIMATE');
    CALL pg_temp.p('Harina de trigo', 'TBSP', 10, 'APPROXIMATE');
    CALL pg_temp.p('Aceite de oliva', 'SPLASH', 7, 'ROUGH');
    CALL pg_temp.p('Aceite de oliva virgen extra', 'SPLASH', 7, 'ROUGH');
    CALL pg_temp.p('Aceite de girasol', 'SPLASH', 7, 'ROUGH');
    CALL pg_temp.p('Salsa de soja', 'SPLASH', 5, 'ROUGH');
    CALL pg_temp.p('Vinagre de vino', 'SPLASH', 5, 'ROUGH');
    CALL pg_temp.p('Vinagre balsámico', 'SPLASH', 5, 'ROUGH');
    CALL pg_temp.p('Vinagre de manzana', 'SPLASH', 5, 'ROUGH');
END $do$;
