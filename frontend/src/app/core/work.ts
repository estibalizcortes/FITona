import { WorkEntry, WorkKind } from './models';

export const KIND_NAMES: Record<WorkKind, string> = { NOTE: 'Nota', SUMMARY: 'Resumen', PROMPT: 'Texto / prompt' };
export const MAX_BODY = 20000;

export function entryTitle(e: WorkEntry): string {
  return e.title?.trim() || (e.body.split('\n').find((l) => l.trim()) ?? '').slice(0, 80) || '(sin título)';
}

/** «2026-11-27» -> «27 de noviembre de 2026». */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
