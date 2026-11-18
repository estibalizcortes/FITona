import { describe, expect, it } from 'vitest';
import { approxPrefix, formatValue, hasFigures, reliability, shiftDate } from './format';
import { Totals } from './models';

function totals(kcal: number | null, complete: boolean, quality: string, precision: string): Totals {
  const empty = { value: null, complete: false };
  return {
    nutrients: {
      energyKcal: { value: kcal, complete }, proteinG: empty, carbsG: empty, sugarsG: empty, fatG: empty,
      satFatG: empty, fiberG: empty, saltG: empty, alcoholG: empty,
    },
    quality,
    precision,
  };
}

describe('format', () => {
  it('muestra fiabilidad con símbolo y texto', () => {
    expect(reliability('VERIFIED')).toEqual({ symbol: '●', label: 'Dato contrastado' });
    expect(reliability('CUSTOM').label).toBe('Dato personalizado');
    expect(reliability('NONE').symbol).toBe('');
  });

  it('un dato exacto y contrastado no lleva prefijo', () => {
    const t = totals(100, true, 'VERIFIED', 'EXACT');
    expect(approxPrefix(t, t.nutrients.energyKcal)).toBe('');
  });

  it('los datos incompletos se marcan como mínimo (≥)', () => {
    const t = totals(100, false, 'VERIFIED', 'EXACT');
    expect(formatValue(t, 'energyKcal', 'kcal')).toBe('≥ 100 kcal');
  });

  it('las estimaciones y cantidades groseras usan ~; las aproximadas ≈', () => {
    expect(formatValue(totals(300, true, 'ESTIMATE', 'EXACT'), 'energyKcal', 'kcal')).toBe('~ 300 kcal');
    expect(formatValue(totals(300, true, 'VERIFIED', 'ROUGH'), 'energyKcal', 'kcal')).toBe('~ 300 kcal');
    expect(formatValue(totals(192, true, 'CUSTOM', 'APPROXIMATE'), 'energyKcal', 'kcal')).toBe('≈ 192 kcal');
  });

  it('un nutriente desconocido nunca se muestra como 0', () => {
    const t = totals(null, false, 'NONE', 'ROUGH');
    expect(formatValue(t, 'proteinG', 'g')).toBe('sin dato');
    expect(hasFigures(t)).toBe(false);
  });

  it('desplaza fechas sin errores de mes', () => {
    expect(shiftDate('2026-11-30', 1)).toBe('2026-12-01');
    expect(shiftDate('2026-03-01', -1)).toBe('2026-02-28');
  });
});
