import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Mode } from './core/models';
import { Prefs } from './core/prefs';
import { Install } from './core/install';
import { ServerStatus } from './core/server-status';
import { Session } from './core/session';
import { Updates } from './core/updates';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly prefs = inject(Prefs);
  protected readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);
  /** Módulo en el que está la persona: define el menú inferior (null = selector de módulos o pantallas sin menú). */
  protected readonly module = computed<'food' | 'work' | null>(() => {
    const u = this.url().split('?')[0];
    if (!this.session.token() || u === '/' || u === '/inicio' || u === '/entrar' || u === '/privacidad') return null;
    return u.startsWith('/trabajo') ? 'work' : 'food';
  });
  protected readonly status = inject(ServerStatus);
  protected readonly updates = inject(Updates);
  /** Se crea al arrancar para no perder el evento «beforeinstallprompt». */
  private readonly install = inject(Install);
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
