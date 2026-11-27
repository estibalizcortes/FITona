import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Mode } from './core/models';
import { Prefs } from './core/prefs';
import { Install } from './core/install';
import { ServerStatus } from './core/server-status';
import { Session } from './core/session';
import { Updates } from './core/updates';
import { FitModule, moduleOf } from './core/modules';
import { Theme } from './core/theme';
import { Icon } from './shared/icon';
import { ConnectionBanner } from './shared/connection-banner';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, ConnectionBanner],
  host: { '[attr.data-module]': 'module()?.id ?? null' },
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly prefs = inject(Prefs);
  protected readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);
  /** Módulo en el que está la persona: define el menú inferior y el color (null = selector de módulos o pantallas sin menú). */
  protected readonly module = computed<FitModule | null>(() => this.session.token() ? moduleOf(this.url()) : null);
  protected readonly status = inject(ServerStatus);
  protected readonly updates = inject(Updates);
  /** Se crea al arrancar para no perder el evento «beforeinstallprompt». */
  private readonly install = inject(Install);
  /** Se crea al arrancar para aplicar el tema guardado. */
  private readonly theme = inject(Theme);
  protected readonly modes: { value: Mode; label: string }[] = [
    { value: 'SIMPLE', label: 'Sencillo' },
    { value: 'BALANCED', label: 'Equilibrado' },
    { value: 'ADVANCED', label: 'Avanzado' },
  ];

  constructor() {
    this.router.events.subscribe((e) => { if (e instanceof NavigationEnd) this.url.set(e.urlAfterRedirects); });
  }

  protected setMode(event: Event): void {
    this.prefs.set((event.target as HTMLSelectElement).value as Mode);
  }
}
