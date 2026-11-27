#!/usr/bin/env python3
"""Convierte las semillas PL/SQL generadas (V011 catálogo, V012 nutrientes, V013 medidas) a PostgreSQL.
Se conserva el cuerpo (llamadas a procedimientos auxiliares) y se sustituyen la cabecera y los prefijos.
Las semillas V010 (catálogo de arranque antiguo, ya reemplazado por V011) no se incluyen en PostgreSQL.
Uso: python3 database/tools/seed_to_pg.py   (tras regenerar los Oracle con database/seed/*.py)
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC, DST = ROOT / "migrations", ROOT / "migrations-pg"

V011_PROLOGUE = """ALTER TABLE FOOD_CATEGORIES ADD COLUMN ICON VARCHAR(16);
ALTER TABLE FOODS ADD COLUMN ICON VARCHAR(16), ADD COLUMN OVERRIDES_FOOD_ID INTEGER;
ALTER TABLE FOODS ADD CONSTRAINT FK_FOODS_OVERRIDES FOREIGN KEY (OVERRIDES_FOOD_ID) REFERENCES FOODS (ID) ON DELETE SET NULL;
CREATE INDEX IX_FOODS_OVERRIDES ON FOODS (OVERRIDES_FOOD_ID);
COMMENT ON COLUMN FOOD_CATEGORIES.ICON IS 'Emoji representativo de la categoría.';
COMMENT ON COLUMN FOODS.ICON IS 'Emoji representativo del alimento (si es nulo se usa el de la categoría).';
COMMENT ON COLUMN FOODS.OVERRIDES_FOOD_ID IS 'Alimento del catálogo al que sustituye, solo para su dueña (sus valores personalizados).';

CREATE TEMP SEQUENCE SEED_RANK;
CREATE FUNCTION pg_temp.new_food(p_name VARCHAR, p_key VARCHAR, p_cat VARCHAR, p_icon VARCHAR) RETURNS BIGINT LANGUAGE plpgsql AS $f$
DECLARE v_id BIGINT;
BEGIN
    INSERT INTO FOODS (CATEGORY_ID, CANONICAL_NAME, FOOD_KIND, STATUS, POPULARITY_RANK, ICON)
    VALUES ((SELECT ID FROM FOOD_CATEGORIES WHERE CODE = p_cat), p_name, 'INGREDIENT', 'PUBLISHED', nextval('SEED_RANK'), p_icon)
    RETURNING ID INTO v_id;
    INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND) VALUES (v_id, 'es-ES', p_name, p_key, 'PRIMARY');
    RETURN v_id;
END $f$;
CREATE PROCEDURE pg_temp.add_name(p_food BIGINT, p_name VARCHAR, p_key VARCHAR, p_kind VARCHAR, p_note VARCHAR) LANGUAGE plpgsql AS $f$
BEGIN
    INSERT INTO FOOD_NAMES (FOOD_ID, LOCALE, NAME, NAME_KEY, NAME_KIND, REGION_NOTE) VALUES (p_food, 'es-ES', p_name, p_key, p_kind, p_note);
END $f$;
CREATE FUNCTION pg_temp.add_variant(p_food BIGINT, p_state VARCHAR, p_has BOOLEAN, p_kcal NUMERIC, p_prot NUMERIC, p_carb NUMERIC,
        p_sug NUMERIC, p_fat NUMERIC, p_sat NUMERIC, p_fib NUMERIC, p_salt NUMERIC, p_dens NUMERIC) RETURNS BIGINT LANGUAGE plpgsql AS $f$
DECLARE v_prof BIGINT; v_var BIGINT;
BEGIN
    IF p_has THEN
        INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G,
                                       FIBER_G, SALT_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS, NOTES)
        VALUES ('REPRESENTATIVE', 'PER_100G', p_kcal, p_prot, p_carb, p_sug, p_fat, p_sat, p_fib, p_salt, 'DECLARED',
                'ESTIMATE', 'MANUAL', 'PENDING', 'Valor de referencia aproximado SIN VERIFICAR.') RETURNING ID INTO v_prof;
    END IF;
    INSERT INTO FOOD_VARIANTS (FOOD_ID, PREPARATION_STATE, CURRENT_PROFILE_ID, DENSITY_G_PER_ML, IS_DEFAULT, STATUS, SORT_ORDER)
    VALUES (p_food, p_state, v_prof, p_dens, TRUE, 'PUBLISHED', 1) RETURNING ID INTO v_var;
    UPDATE FOODS SET DEFAULT_VARIANT_ID = v_var WHERE ID = p_food;
    RETURN v_var;
END $f$;
CREATE PROCEDURE pg_temp.add_portion(p_var BIGINT, p_unit VARCHAR, p_grams NUMERIC) LANGUAGE plpgsql AS $f$
BEGIN
    INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, SOURCE_ID, NOTE)
    VALUES (p_var, p_unit, p_grams, 'APPROXIMATE', FALSE, (SELECT ID FROM DATA_SOURCES WHERE CODE = 'FITONA_EDITORIAL'), 'Medida casera aproximada');
END $f$;
"""

V012_HELPERS = """CREATE TEMP TABLE SEED_CTX (VAR_ID BIGINT);
INSERT INTO SEED_CTX VALUES (NULL);
CREATE PROCEDURE pg_temp.fill(p_name VARCHAR, p_src VARCHAR, p_qual VARCHAR, p_kcal NUMERIC, p_prot NUMERIC, p_carb NUMERIC,
        p_sug NUMERIC, p_fat NUMERIC, p_sat NUMERIC, p_fib NUMERIC, p_salt NUMERIC, p_alc NUMERIC, p_dens NUMERIC, p_replace BOOLEAN)
LANGUAGE plpgsql AS $f$
DECLARE v_var BIGINT; v_old BIGINT; v_prof BIGINT;
BEGIN
    SELECT v.ID, v.CURRENT_PROFILE_ID INTO STRICT v_var, v_old FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID
     WHERE f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = p_name AND v.IS_DEFAULT;
    IF v_old IS NOT NULL AND NOT p_replace THEN
        RAISE EXCEPTION '% ya tiene datos (use --replace para sustituirlos)', p_name;
    END IF;
    PERFORM 1 FROM DATA_SOURCES WHERE CODE = p_src;
    IF NOT FOUND THEN RAISE EXCEPTION 'Fuente desconocida %', p_src; END IF;
    INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G,
                                   FIBER_G, SALT_G, ALCOHOL_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS, NOTES)
    VALUES ('REPRESENTATIVE', 'PER_100G', p_kcal, p_prot, p_carb, p_sug, p_fat, p_sat, p_fib, p_salt, p_alc, 'DECLARED',
            p_qual, CASE WHEN p_qual = 'ESTIMATE' THEN 'MANUAL' ELSE 'SINGLE_SOURCE' END, 'PENDING',
            'Fuente: ' || p_src || CASE WHEN p_qual = 'ESTIMATE' THEN ' (aproximado, SIN VERIFICAR)' ELSE '' END) RETURNING ID INTO v_prof;
    UPDATE FOOD_VARIANTS SET CURRENT_PROFILE_ID = v_prof, DENSITY_G_PER_ML = COALESCE(p_dens, DENSITY_G_PER_ML) WHERE ID = v_var;
    IF v_old IS NOT NULL THEN UPDATE NUTRIENT_PROFILES SET SUPERSEDED_BY_ID = v_prof WHERE ID = v_old; END IF;
    UPDATE SEED_CTX SET VAR_ID = v_var;
END $f$;
CREATE PROCEDURE pg_temp.portion(p_unit VARCHAR, p_grams NUMERIC) LANGUAGE plpgsql AS $f$
BEGIN
    INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, NOTE)
    VALUES ((SELECT VAR_ID FROM SEED_CTX), p_unit, p_grams, 'APPROXIMATE', FALSE, 'Medida casera aproximada');
END $f$;
"""

V013_HELPERS = """CREATE PROCEDURE pg_temp.p(p_name VARCHAR, p_unit VARCHAR, p_grams NUMERIC, p_prec VARCHAR) LANGUAGE plpgsql AS $f$
DECLARE v_var BIGINT;
BEGIN
    SELECT v.ID INTO STRICT v_var FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID
     WHERE f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = p_name AND v.IS_DEFAULT;
    IF NOT EXISTS (SELECT 1 FROM FOOD_PORTIONS WHERE VARIANT_ID = v_var AND UNIT_CODE = p_unit) THEN
        INSERT INTO FOOD_PORTIONS (VARIANT_ID, UNIT_CODE, GRAMS, PRECISION_KIND, IS_DEFAULT, NOTE)
        VALUES (v_var, p_unit, p_grams, p_prec, FALSE, 'Medida casera aproximada');
    END IF;
END $f$;
"""


def body_of(text: str) -> str:
    """Cuerpo entre el BEGIN principal y el END; final."""
    start = text.index("\nBEGIN\n", text.index("DECLARE")) + len("\nBEGIN\n")
    return text[start:text.rindex("END;")]


def calls(body: str) -> str:
    body = re.sub(r"(?m)^(\s*)COMMIT;\n", "", body)
    body = re.sub(r"v_food := new_food\(", "v_food := pg_temp.new_food(", body)
    body = re.sub(r"v_var := add_variant\(", "v_var := pg_temp.add_variant(", body)
    body = re.sub(r"(?m)^(\s+)(add_name|add_portion|fill|portion|p)\(", r"\1CALL pg_temp.\2(", body)
    return body


def main():
    t11 = (SRC / "V011__catalog_simplified.sql").read_text(encoding="utf-8")
    head = t11[:t11.index("ALTER TABLE")]
    (DST / "V011__catalog_simplified.sql").write_text(
        head + V011_PROLOGUE + "\nDO $do$\nDECLARE v_src BIGINT; v_food BIGINT; v_var BIGINT;\nBEGIN\n" + calls(body_of(t11)) + "END $do$;\n",
        encoding="utf-8")
    t12 = next(SRC.glob("V012__*.sql")).read_text(encoding="utf-8")
    (DST / next(SRC.glob("V012__*.sql")).name).write_text(
        t12[:t12.index("DECLARE")] + V012_HELPERS + "\nDO $do$\nBEGIN\n" + calls(body_of(t12)) + "END $do$;\n", encoding="utf-8")
    t13 = (SRC / "V013__natural_household_measures.sql").read_text(encoding="utf-8")
    ins = "\n".join(l for l in t13.splitlines() if l.strip().startswith("INSERT INTO PORTION_UNIT"))
    pcalls = "\n".join(l for l in calls(body_of(t13)).splitlines() if "CALL pg_temp.p(" in l)
    (DST / "V013__natural_household_measures.sql").write_text(
        t13[:t13.index("DECLARE")] + V013_HELPERS + "\n" + ins + "\n\nDO $do$\nBEGIN\n" + pcalls + "\nEND $do$;\n", encoding="utf-8")
    print("semillas convertidas")


if __name__ == "__main__":
    main()
