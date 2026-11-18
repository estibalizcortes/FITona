import { Injectable, signal } from '@angular/core';
import { Mode } from './models';

const MODE_KEY = 'fitona.mode';

/** Preferencias de la persona (modo de visualización). Cambiar de modo NO pierde ni oculta datos guardados. */
@Injectable({ providedIn: 'root' })
export class Prefs {
  readonly mode = signal<Mode>(this.read());

  set(mode: Mode): void {
    this.mode.set(mode);
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* sin almacenamiento: se mantiene en memoria */ }
  }

  private read(): Mode {
    try {
      const v = localStorage.getItem(MODE_KEY);
      if (v === 'SIMPLE' || v === 'BALANCED' || v === 'ADVANCED') return v;
    } catch { /* ignorar */ }
    return 'BALANCED';
  }
}
