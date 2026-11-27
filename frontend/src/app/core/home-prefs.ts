import { Injectable, computed, inject, signal } from '@angular/core';
import { Api } from './api';
import { FitModule, MODULES } from './modules';

const KEY = 'fitona.home';
interface Stored { order: string[]; hidden: string[]; indicators: boolean }

/**
 * Personalización de la pantalla principal (orden, módulos ocultos, datos en las tarjetas).
 * Se guarda en la cuenta (V016) para que sea igual en el iPhone y en el ordenador; una copia local (no sensible: solo ids de módulo)
 * permite pintar la pantalla al instante sin esperar al servidor, y se actualiza cuando llega la versión de la cuenta.
 */
@Injectable({ providedIn: 'root' })
export class HomePrefs {
  private readonly api = inject(Api);
  private readonly state = signal<Stored>(this.read());
  readonly indicators = computed(() => this.state().indicators);
  /** Módulos disponibles en el orden elegido (con los ocultos, para poder volver a mostrarlos). */
  readonly all = computed<FitModule[]>(() => {
    const order = this.state().order;
    const avail = MODULES.filter((m) => m.available);
    const rank = (m: FitModule) => { const i = order.indexOf(m.id); return i < 0 ? order.length + avail.indexOf(m) : i; };
    return [...avail].sort((a, b) => rank(a) - rank(b));
  });
  readonly visible = computed(() => this.all().filter((m) => !this.state().hidden.includes(m.id)));
  readonly soon = computed(() => MODULES.filter((m) => !m.available));

  isHidden(id: string): boolean { return this.state().hidden.includes(id); }

  /** Adopta las preferencias de la cuenta que llegan con el resumen de la pantalla principal (sin petición propia). */
  adopt(p: { homeOrder: string[]; homeHidden: string[]; homeIndicators: boolean }): void {
    this.apply({ order: p.homeOrder, hidden: p.homeHidden, indicators: p.homeIndicators }, false);
  }

  move(id: string, delta: -1 | 1): void {
    const ids = this.all().map((m) => m.id as string);
    const i = ids.indexOf(id), j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    this.apply({ ...this.state(), order: ids }, true);
  }

  toggle(id: string): void {
    const hidden = this.state().hidden;
    const next = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
    // Siempre queda al menos un módulo visible: si no, la pantalla principal quedaría vacía.
    if (this.all().every((m) => next.includes(m.id))) return;
    this.apply({ ...this.state(), hidden: next }, true);
  }

  setIndicators(on: boolean): void { this.apply({ ...this.state(), indicators: on }, true); }

  private apply(s: Stored, push: boolean): void {
    this.state.set(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sin almacenamiento: vale para esta sesión */ }
    if (push) void this.api.savePreferences({ homeOrder: s.order, homeHidden: s.hidden, homeIndicators: s.indicators }).catch(() => { /* se guardó en local; se reintentará al cambiar algo */ });
  }

  private read(): Stored {
    const d: Stored = { order: [], hidden: [], indicators: true };
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Stored> | null;
      if (raw) {
        const strs = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
        return { order: strs(raw.order), hidden: strs(raw.hidden), indicators: raw.indicators !== false };
      }
    } catch { /* datos corruptos: valores por defecto */ }
    return d;
  }
}
