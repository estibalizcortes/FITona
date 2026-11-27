#!/usr/bin/env python3
"""valores-aproximados.txt -> nutrientes-aproximados.csv (para apply_nutrients.py). Valida nombres y coherencia kcal/macros."""
import csv, pathlib, sys
S = pathlib.Path(__file__).resolve().parent
# kcal que no cuadran con Atwater por naturaleza (polioles, sal/bicarbonato, ácido acético, cacao...): revisados a mano
ALLOW = {"Cacao puro en polvo", "Levadura química", "Vinagre de manzana", "Vinagre de vino", "Vinagre balsámico",
         "Pastilla de caldo", "Chocolate sin azúcar añadido", "Galletas sin azúcar añadido", "Café soluble"}
pend = {r["nombre"] for r in csv.DictReader(open(S / "nutrientes-pendientes.csv", encoding="utf-8"))}
cols = ["kcal", "proteina", "hidratos", "azucares", "grasa", "saturadas", "fibra", "sal", "alcohol", "densidad"]
rows, bad = [], []
for ln in (S / "valores-aproximados.txt").read_text(encoding="utf-8").splitlines():
    if not ln.strip() or ln.startswith("#"):
        continue
    p = ln.split("|")
    name, v = p[0], dict(zip(cols, p[1:] + [""] * 10))
    if name not in pend:
        sys.exit(f"{name}: no es un alimento pendiente")
    n = {c: float(v[c] or 0) for c in cols}
    exp = 4 * n["proteina"] + 4 * n["hidratos"] + 9 * n["grasa"] + 2 * n["fibra"] + 7 * n["alcohol"]
    if name not in ALLOW and abs(n["kcal"] - exp) > max(20, 0.25 * exp):
        bad.append(f"{name}: declara {n['kcal']:g} kcal, macros dan {exp:.0f}")
    rows.append([name] + [v[c] for c in cols] + ["", "FITONA_EDITORIAL", "ESTIMATE"])
    pend.discard(name)
if bad:
    sys.exit("\n".join(bad))
with open(S / "nutrientes-aproximados.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["nombre", "kcal", "proteina", "hidratos", "azucares", "grasa", "saturadas", "fibra", "sal", "alcohol", "densidad", "medida", "fuente", "calidad"])
    w.writerows(rows)
print(f"{len(rows)} filas; sin valor a propósito: {sorted(pend)}")
