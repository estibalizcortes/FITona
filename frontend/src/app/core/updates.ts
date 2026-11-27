import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

const CHECK_EVERY_MS = 30 * 60 * 1000;
const MIN_BETWEEN_CHECKS_MS = 5 * 60 * 1000;
const APPLY_AFTER_HIDDEN_MS = 10 * 60 * 1000;

/**
 * Actualizaciones de la PWA. El service worker descarga la versión nueva en segundo plano; aquí se avisa y se aplica:
 *  - se busca versión nueva al abrir, al volver a la app y cada 30 min;
 *  - si hay una lista, se ofrece «Actualizar» (recarga);
 *  - si la app estuvo en segundo plano más de 10 min, se aplica sola al volver (no hay nada a medias que perder).
 * Así nadie se queda con una versión antigua indefinidamente.
 */
@Injectable({ providedIn: 'root' })
export class Updates {
  private readonly sw = inject(SwUpdate);
  readonly ready = signal(false);
  private lastCheck = 0;
  private hiddenAt = 0;

  constructor() {
    if (!this.sw.isEnabled) return; // desarrollo (ng serve) o navegador sin service worker
    this.sw.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.ready.set(true));
    this.sw.unrecoverable.subscribe(() => location.reload()); // caché corrupta: empezar de cero
    this.check();
    setInterval(() => this.check(), CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { this.hiddenAt = Date.now(); return; }
      if (this.ready() && this.hiddenAt && Date.now() - this.hiddenAt > APPLY_AFTER_HIDDEN_MS) { void this.apply(); return; }
      if (Date.now() - this.lastCheck > MIN_BETWEEN_CHECKS_MS) this.check();
    });
  }

  check(): void {
    this.lastCheck = Date.now();
    this.sw.checkForUpdate().catch(() => { /* sin conexión: se reintentará */ });
  }

  async apply(): Promise<void> {
    try { await this.sw.activateUpdate(); } catch { /* aunque falle, recargar trae la versión nueva */ }
    location.reload();
  }
}
