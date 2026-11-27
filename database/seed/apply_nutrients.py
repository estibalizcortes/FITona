#!/usr/bin/env python3
"""Genera una migración Flyway que RELLENA los datos nutricionales de alimentos del catálogo a partir de un CSV con
procedencia (p. ej. exportado de USDA FoodData Central, CIQUAL o BEDCA con autorización). No inventa nada.

CSV (UTF-8, coma, decimales con PUNTO, valores por 100 g; vacío = desconocido, no 0):
  nombre,kcal,proteina,hidratos,azucares,grasa,saturadas,fibra,sal,fuente,calidad
  - nombre: EXACTAMENTE como en database/seed/catalogo-alimentos.md
  - hidratos: disponibles (sin fibra), como en la etiqueta UE
  - fuente: USDA_FDC | CIQUAL | BEDCA | FITONA_EDITORIAL  (BEDCA/CIQUAL solo si ya tienes permiso de uso comercial)
  - calidad: VERIFIED (dato de laboratorio de la fuente) | AVERAGE (promedio representativo)

Reglas: solo rellena alimentos SIN datos; con --replace crea un perfil nuevo para los que ya tienen valores aproximados
(el antiguo se conserva en el histórico). Valida rangos físicos como la base de datos.

Uso:  python3 database/seed/apply_nutrients.py datos.csv V012 [--replace]
Salida: database/migrations/V012__nutrients_<fuente>.sql   (aplicar con scripts/dev/db-up.ps1)
La plantilla con los alimentos pendientes está en database/seed/nutrientes-pendientes.csv.
"""
import csv, pathlib, re, sys

SEED = pathlib.Path(__file__).resolve().parent
SOURCES = {"USDA_FDC", "CIQUAL", "BEDCA", "FITONA_EDITORIAL"}
QUALITIES = {"VERIFIED", "AVERAGE"}
COLS = ["kcal", "proteina", "hidratos", "azucares", "grasa", "saturadas", "fibra", "sal"]


def names_in_catalog():
    return {l[2:].strip() for l in (SEED / "catalogo-alimentos.md").read_text(encoding="utf-8").splitlines() if l.startswith("- ")}


def num(s, col, name):
    s = (s or "").strip()
    if s == "":
        return None
    try:
        v = float(s)
    except ValueError:
        sys.exit(f"{name}: «{s}» no es un número en la columna {col}")
    if v < 0:
        sys.exit(f"{name}: valor negativo en {col}")
    return v


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    replace = "--replace" in sys.argv
    if len(args) != 2 or not re.fullmatch(r"V\d{3}", args[1]):
        sys.exit(__doc__)
    csv_path, version = pathlib.Path(args[0]), args[1]
    known = names_in_catalog()
    rows, seen = [], set()
    with csv_path.open(encoding="utf-8", newline="") as fh:
        for r in csv.DictReader(fh):
            name = (r.get("nombre") or "").strip()
            if not name:
                continue
            if name not in known:
                sys.exit(f"«{name}» no está en el catálogo (el nombre debe coincidir exactamente)")
            if name in seen:
                sys.exit(f"«{name}» aparece repetido")
            seen.add(name)
            src, qual = (r.get("fuente") or "").strip(), (r.get("calidad") or "").strip()
            if src not in SOURCES or qual not in QUALITIES:
                sys.exit(f"{name}: fuente ({src}) o calidad ({qual}) no válidas")
            v = {c: num(r.get(c), c, name) for c in COLS}
            if all(x is None for x in v.values()):
                continue  # fila de plantilla sin rellenar
            mass = sum(v[c] or 0 for c in ("proteina", "hidratos", "grasa", "fibra"))
            if mass > 101 or (v["kcal"] or 0) > 900:
                sys.exit(f"{name}: valores imposibles (>100 g por 100 g o >900 kcal)")
            if v["azucares"] is not None and v["hidratos"] is not None and v["azucares"] > v["hidratos"] + 0.5:
                sys.exit(f"{name}: azúcares mayores que hidratos")
            if v["saturadas"] is not None and v["grasa"] is not None and v["saturadas"] > v["grasa"] + 0.5:
                sys.exit(f"{name}: saturadas mayores que grasa total")
            rows.append((name, src, qual, v))
    if not rows:
        sys.exit("El CSV no contiene ninguna fila con datos")

    sources = sorted({s for _, s, _, _ in rows})
    out = [f"-- {version} · Datos nutricionales importados desde {csv_path.name} (fuentes: {', '.join(sources)}).",
           "-- GENERADO por database/seed/apply_nutrients.py. Con procedencia por alimento (DATA_SOURCES).",
           "DECLARE",
           "    v_var NUMBER;",
           "    v_old NUMBER;",
           "    v_prof NUMBER;",
           "    PROCEDURE fill(p_name VARCHAR2, p_src VARCHAR2, p_qual VARCHAR2, p_kcal NUMBER, p_prot NUMBER, p_carb NUMBER,",
           "                   p_sug NUMBER, p_fat NUMBER, p_sat NUMBER, p_fib NUMBER, p_salt NUMBER, p_replace BOOLEAN) IS",
           "    BEGIN",
           "        SELECT v.ID, v.CURRENT_PROFILE_ID INTO v_var, v_old FROM FOODS f JOIN FOOD_VARIANTS v ON v.FOOD_ID = f.ID",
           "         WHERE f.OWNER_USER_ID IS NULL AND f.STATUS = 'PUBLISHED' AND f.CANONICAL_NAME = p_name AND v.IS_DEFAULT;",
           "        IF v_old IS NOT NULL AND NOT p_replace THEN",
           "            RAISE_APPLICATION_ERROR(-20020, p_name || ' ya tiene datos (use --replace para sustituirlos)');",
           "        END IF;",
           "        INSERT INTO NUTRIENT_PROFILES (PROFILE_ROLE, BASIS, ENERGY_KCAL, PROTEIN_G, CARBS_G, SUGARS_G, FAT_G, SAT_FAT_G,",
           "                                       FIBER_G, SALT_G, ENERGY_ORIGIN, DATA_QUALITY, METHOD, REVIEW_STATUS, NOTES)",
           "        VALUES ('REPRESENTATIVE', 'PER_100G', p_kcal, p_prot, p_carb, p_sug, p_fat, p_sat, p_fib, p_salt, 'DECLARED',",
           "                p_qual, 'SINGLE_SOURCE', 'PENDING', 'Fuente: ' || p_src) RETURNING ID INTO v_prof;",
           "        UPDATE FOOD_VARIANTS SET CURRENT_PROFILE_ID = v_prof WHERE ID = v_var;",
           "        IF v_old IS NOT NULL THEN UPDATE NUTRIENT_PROFILES SET SUPERSEDED_BY_ID = v_prof WHERE ID = v_old; END IF;",
           "    END;",
           "BEGIN"]

    def n(x):
        return "NULL" if x is None else repr(x)

    for name, src, qual, v in rows:
        out.append("    fill('" + name.replace("'", "''") + f"', '{src}', '{qual}', " + ", ".join(n(v[c]) for c in COLS) +
                   f", {'TRUE' if replace else 'FALSE'});")
    out.append("END;\n/")
    target = SEED.parent / "migrations" / f"{version}__nutrients_{'_'.join(s.lower() for s in sources)}.sql"
    target.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"{len(rows)} alimentos -> {target}")


if __name__ == "__main__":
    main()
