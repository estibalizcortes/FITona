import { Injectable, signal } from '@angular/core';

interface InstallPromptEvent extends Event { prompt(): Promise<void> }

/** Instalación como app: Android/Chrome ofrece un diálogo propio; en iPhone hay que usar «Añadir a pantalla de inicio». */
@Injectable({ providedIn: 'root' })
export class Install {
  private deferred: InstallPromptEvent | null = null;
  readonly canPrompt = signal(false);
  readonly standalone = signal(
    window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true,
  );
  readonly ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); this.deferred = e as InstallPromptEvent; this.canPrompt.set(true); });
    window.addEventListener('appinstalled', () => { this.standalone.set(true); this.canPrompt.set(false); this.deferred = null; });
  }

  async prompt(): Promise<void> {
    const d = this.deferred;
    if (!d) return;
    this.deferred = null;
    this.canPrompt.set(false);
    await d.prompt();
  }
}
