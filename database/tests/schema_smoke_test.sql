-- =============================================================================
-- FITona · Prueba de humo del esquema (ejecutar como FITONA_OWNER tras migrar)
-- Comprueba invariantes del modelo y deja la base como estaba (ROLLBACK final).
-- Uso: sqlplus -s FITONA_OWNER/<clave>@//localhost:1521/FREEPDB1 @database/tests/schema_smoke_test.sql
-- =============================================================================
SET SERVEROUTPUT ON SIZE UNLIMITED
SET FEEDBACK OFF
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

DECLARE
    v_count     NUMBER;
    v_user      RAW(16) := SYS_GUID();
    v_user2     RAW(16) := SYS_GUID();
    v_house     RAW(16) := SYS_GUID();
    v_entry     RAW(16) := SYS_GUID();
    v_recipe    RAW(16) := SYS_GUID();
    v_seq1      NUMBER;
    v_seq2      NUMBER;
    v_profile   NUMBER;
    v_passed    NUMBER := 0;

    PROCEDURE ok(p_name VARCHAR2) IS
    BEGIN
        v_passed := v_passed + 1;
        DBMS_OUTPUT.PUT_LINE('OK  ' || p_name);
    END;

    PROCEDURE fail(p_name VARCHAR2, p_detail VARCHAR2) IS
    BEGIN
        RAISE_APPLICATION_ERROR(-20999, 'FALLO ' || p_name || ': ' || p_detail);
    END;

    -- Ejecuta una sentencia que DEBE fallar con el código indicado.
    PROCEDURE expect_error(p_name VARCHAR2, p_sql VARCHAR2, p_code NUMBER) IS
    BEGIN
        BEGIN
            EXECUTE IMMEDIATE p_sql;
        EXCEPTION
            WHEN OTHERS THEN
                IF SQLCODE = p_code THEN ok(p_name); RETURN; END IF;
                fail(p_name, 'error inesperado ' || SQLCODE || ' ' || SQLERRM);
        END;
        fail(p_name, 'la sentencia no falló');
    END;
BEGIN
    -- 1. Diccionario: objetos válidos y toda FK con índice que la cubra.
    SELECT COUNT(*) INTO v_count FROM USER_OBJECTS WHERE STATUS <> 'VALID';
    IF v_count > 0 THEN fail('objetos validos', v_count || ' objetos inválidos'); END IF;
    ok('todos los objetos compilados y válidos');

    SELECT COUNT(*) INTO v_count
      FROM USER_CONSTRAINTS c JOIN USER_CONS_COLUMNS cc ON cc.CONSTRAINT_NAME = c.CONSTRAINT_NAME
     WHERE c.CONSTRAINT_TYPE = 'R'
       AND NOT EXISTS (SELECT 1 FROM USER_IND_COLUMNS ic
                        WHERE ic.TABLE_NAME = c.TABLE_NAME AND ic.COLUMN_NAME = cc.COLUMN_NAME
                          AND ic.COLUMN_POSITION = cc.POSITION);
    IF v_count > 0 THEN fail('indices de FK', v_count || ' columnas FK sin índice'); END IF;
    ok('todas las claves foráneas tienen índice');

    SELECT COUNT(*) INTO v_count FROM USER_TABLES t
     WHERE UPPER(t.TABLE_NAME) NOT LIKE 'FLYWAY%'
       AND NOT EXISTS (SELECT 1 FROM USER_TAB_COMMENTS tc WHERE tc.TABLE_NAME = t.TABLE_NAME AND tc.COMMENTS IS NOT NULL);
    IF v_count > 0 THEN fail('comentarios', v_count || ' tablas sin comentario'); END IF;
    ok('todas las tablas documentadas con COMMENT');

    SELECT COUNT(*) INTO v_count FROM ALLERGENS;
    IF v_count <> 14 THEN fail('alergenos', 'esperados 14, hay ' || v_count); END IF;
    ok('14 alérgenos del anexo II cargados');

    -- 2. Alta de persona, perfil y hogar.
    INSERT INTO APP_USERS (ID, AUTH_SUBJECT) VALUES (v_user, 'test-subject-1');
    INSERT INTO APP_USERS (ID, AUTH_SUBJECT) VALUES (v_user2, 'test-subject-2');
    INSERT INTO USER_PROFILES (USER_ID, ENABLED_MEAL_SLOTS) VALUES (v_user, JSON('["BREAKFAST","LUNCH","DINNER"]'));
    INSERT INTO HOUSEHOLDS (ID, NAME, CREATED_BY_USER_ID) VALUES (v_house, 'Casa', v_user);
    INSERT INTO HOUSEHOLD_MEMBERS (HOUSEHOLD_ID, USER_ID, MEMBER_ROLE) VALUES (v_house, v_user, 'OWNER');
    ok('alta de persona, perfil y hogar');

    expect_error('modo de visualización inválido',
        'INSERT INTO USER_PROFILES (USER_ID, DISPLAY_MODE) VALUES (HEXTORAW(''' || RAWTOHEX(v_user2) || '''), ''EXPERT'')', -2290);

    -- 3. Sincronización: SYNC_SEQ se asigna y crece en cada cambio.
    INSERT INTO FOOD_LOG_ENTRIES (ID, USER_ID, EATEN_ON, MEAL_SLOT, LOG_METHOD)
    VALUES (v_entry, v_user, DATE '2026-11-18', 'BREAKFAST', 'TEXT');
    SELECT SYNC_SEQ INTO v_seq1 FROM FOOD_LOG_ENTRIES WHERE ID = v_entry;
    UPDATE FOOD_LOG_ENTRIES SET NOTE = 'tostada' WHERE ID = v_entry;
    SELECT SYNC_SEQ INTO v_seq2 FROM FOOD_LOG_ENTRIES WHERE ID = v_entry;
    IF v_seq1 IS NULL OR v_seq2 <= v_seq1 THEN fail('sync_seq', v_seq1 || ' -> ' || v_seq2); END IF;
    ok('SYNC_SEQ asignado al insertar y creciente al actualizar');

    -- 4. Registro sin cifras: texto libre sin energía. Con energía debe fallar.
    INSERT INTO FOOD_LOG_ITEMS (ENTRY_ID, ITEM_KIND, DISPLAY_NAME, QUANTITY_SPECIFIED, DATA_QUALITY)
    VALUES (v_entry, 'FREE_TEXT', 'Lentejas de mi madre', FALSE, 'NONE');
    ok('registro de comida sin cifras (FREE_TEXT)');
    expect_error('texto libre con kcal inventadas',
        'INSERT INTO FOOD_LOG_ITEMS (ENTRY_ID, ITEM_KIND, DISPLAY_NAME, ENERGY_KCAL, DATA_QUALITY) VALUES (HEXTORAW(''' ||
        RAWTOHEX(v_entry) || '''), ''FREE_TEXT'', ''x'', 300, ''ESTIMATE'')', -2290);
    expect_error('rango de incertidumbre incoherente',
        'INSERT INTO FOOD_LOG_ITEMS (ENTRY_ID, ITEM_KIND, DISPLAY_NAME, ENERGY_KCAL, ENERGY_KCAL_LOW, ENERGY_KCAL_HIGH, DATA_QUALITY) VALUES (HEXTORAW(''' ||
        RAWTOHEX(v_entry) || '''), ''ESTIMATED_DISH'', ''x'', 500, 600, 700, ''ESTIMATE'')', -2290);

    -- 5. Perfiles nutricionales: imposibles físicos rechazados; aprobado = inmutable.
    expect_error('macros que superan 100 g por 100 g',
        'INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, PROTEIN_G, CARBS_G, FAT_G, DATA_QUALITY, METHOD) VALUES (''CUSTOM'', 40, 40, 30, ''CUSTOM'', ''MANUAL'')', -2290);
    expect_error('azúcares mayores que hidratos',
        'INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, CARBS_G, SUGARS_G, DATA_QUALITY, METHOD) VALUES (''CUSTOM'', 10, 20, ''CUSTOM'', ''MANUAL'')', -2290);
    INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, ENERGY_KCAL, PROTEIN_G, CARBS_G, FAT_G, DATA_QUALITY, METHOD, REVIEW_STATUS)
    VALUES ('REPRESENTATIVE', 100, 5, 10, 4, 'AVERAGE', 'MEDIAN', 'APPROVED')
    RETURNING ID INTO v_profile;
    expect_error('perfil aprobado inmutable',
        'UPDATE NUTRIENT_PROFILES SET PROTEIN_G = 6 WHERE ID = ' || v_profile, -20001);
    UPDATE NUTRIENT_PROFILES SET NOTES = 'nota editorial' WHERE ID = v_profile;
    ok('perfil aprobado admite notas pero no cambios de valores');

    -- 6. Objetivos: rango invertido rechazado.
    expect_error('objetivo con mínimo mayor que máximo',
        'INSERT INTO NUTRITION_TARGETS (USER_ID, VALID_FROM, PROTEIN_G_MIN, PROTEIN_G_MAX, TARGET_ORIGIN) VALUES (HEXTORAW(''' ||
        RAWTOHEX(v_user) || '''), DATE ''2026-11-18'', 180, 150, ''USER'')', -2290);

    -- 7. Precios: un ticket o precio manual siempre es privado de alguien.
    expect_error('precio de ticket sin propietaria',
        'INSERT INTO PRICE_OBSERVATIONS (FOOD_ID, PRODUCT_ID, PRICE_AMOUNT, PACK_QUANTITY, PACK_UNIT_CODE, PRICE_KIND, OBSERVED_ON) ' ||
        'SELECT NULL, NULL, 1, 1, ''KG'', ''RECEIPT'', SYSDATE FROM DUAL', -2290);

    -- 8. Seguridad alimentaria: días de nevera solo con fuente identificada.
    INSERT INTO RECIPES (ID, OWNER_USER_ID, ORIGIN) VALUES (v_recipe, v_user, 'AI_SUGGESTED');
    expect_error('plazo de conservación sin fuente',
        'INSERT INTO RECIPE_VERSIONS (RECIPE_ID, VERSION_NUMBER, TITLE, SERVINGS, FRIDGE_DAYS_MAX) VALUES (HEXTORAW(''' ||
        RAWTOHEX(v_recipe) || '''), 1, ''Lentejas'', 4, 4)', -2290);
    INSERT INTO RECIPE_VERSIONS (RECIPE_ID, VERSION_NUMBER, TITLE, SERVINGS, FRIDGE_DAYS_MAX, STORAGE_SOURCE_ID)
    SELECT v_recipe, 1, 'Lentejas', 4, 4, ID FROM DATA_SOURCES WHERE CODE = 'USDA_FSIS_SAFETY';
    ok('plazo de conservación aceptado solo con fuente identificada');

    -- 9. Supresión de cuenta: el borrado elimina en cascada los datos personales.
    DELETE FROM APP_USERS WHERE ID = v_user;
    SELECT COUNT(*) INTO v_count FROM FOOD_LOG_ENTRIES WHERE USER_ID = v_user;
    IF v_count > 0 THEN fail('cascada diario', v_count || ' entradas restantes'); END IF;
    SELECT COUNT(*) INTO v_count FROM FOOD_LOG_ITEMS WHERE ENTRY_ID = v_entry;
    IF v_count > 0 THEN fail('cascada items', v_count || ' elementos restantes'); END IF;
    SELECT COUNT(*) INTO v_count FROM HOUSEHOLD_MEMBERS WHERE USER_ID = v_user;
    IF v_count > 0 THEN fail('cascada hogar', v_count || ' pertenencias restantes'); END IF;
    ok('borrar la cuenta elimina diario, elementos y pertenencias');

    DBMS_OUTPUT.PUT_LINE('---');
    DBMS_OUTPUT.PUT_LINE('Pruebas superadas: ' || v_passed);
    ROLLBACK;
END;
/
EXIT
