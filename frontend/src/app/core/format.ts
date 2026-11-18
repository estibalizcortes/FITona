import { NutrientKey, Nutrients, TotalValue, Totals } from './models';

export interface Reliability { symbol: string; label: string }

/** Fiabilidad del dato: SIEMPRE con símbolo y texto (nunca solo color). */
export function reliability(quality: string): Reliability {
  switch (quality) {
    case 'VERIFIED': return { symbol: '●', label: 'Dato contrastado' };
    case 'AVERAGE': return { symbol: '≈', label: 'Promedio representativo' };
    case 'CUSTOM': return { symbol: '✎', label: 'Dato personalizado' };
    case 'ESTIMATE': return { symbol: '~', label: 'Estimación' };
    default: return { symbol: '', label: 'Sin cifras' };
  }
}

/**
 * Prefijo de aproximación: «≥» si faltan datos (valor mínimo), «~» para estimaciones o cantidades groseras,
 * «≈» si el dato o la cantidad son aproximados, nada si es exacto.
 */
export function approxPrefix(t: Pick<Totals, 'quality' | 'precision'>, v: TotalValue): string {
  if (!v.complete) return '≥ ';
  if (t.quality === 'ESTIMATE' || t.precision === 'ROUGH') return '~ ';
  if (t.quality === 'AVERAGE' || t.quality === 'CUSTOM' || t.precision === 'APPROXIMATE') return '≈ ';
  return '';
}

export function formatValue(t: Totals, key: NutrientKey, unit: string): string {
  const v = t.nutrients[key];
  if (!v || v.value === null || v.value === undefined) return 'sin dato';
  return `${approxPrefix(t, v)}${v.value} ${unit}`;
}

export function hasFigures(t: Totals): boolean {
  return t.quality !== 'NONE' && Object.values(t.nutrients).some((v) => v.value !== null && v.value !== undefined);
}

/** Valor de un perfil por 100 g (null = desconocido). */
export function per100(n: Nutrients, key: NutrientKey, unit: string): string {
  const v = n[key];
  return v === null || v === undefined ? 'sin dato' : `${v} ${unit}`;
}

export function todayIso(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${`${dt.getMonth() + 1}`.padStart(2, '0')}-${`${dt.getDate()}`.padStart(2, '0')}`;
}

export function slotForNow(): string {
  const h = new Date().getHours();
  if (h < 11) return 'BREAKFAST';
  if (h < 13) return 'MID_MORNING';
  if (h < 17) return 'LUNCH';
  if (h < 19) return 'AFTERNOON_SNACK';
  return 'DINNER';
}

/** Nombre legible de una unidad («UNIT» -> «unidad/unidades») usando los datos de referencia. */
export function unitLabel(units: { code: string; singular: string; plural: string }[] | undefined, code: string | null, qty: number | null): string {
  if (!code) return '';
  const u = units?.find((x) => x.code === code);
  if (!u) return code;
  return qty === 1 ? u.singular : u.plural;
}

export const SLOT_NAMES: Record<string, string> = {
  BREAKFAST: 'Desayuno', MID_MORNING: 'Media mañana', LUNCH: 'Comida', AFTERNOON_SNACK: 'Merienda',
  DINNER: 'Cena', OTHER: 'Otra',
};
