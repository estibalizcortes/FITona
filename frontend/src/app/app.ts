import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  protected readonly status = inject(ServerStatus);
  protected readonly updates = inject(Updates);
  /** Se crea al arrancar para no perder el evento «beforeinstallprompt». */
  private readonly install = inject(Install);
  protected readonly modes: { value: Mode; label: string }[] = [
    { value: 'SIMPLE', label: 'Sencillo' },
    { value: 'BALANCED', label: 'Equilibrado' },
    { value: 'ADVANCED', label: 'Avanzado' },
  ];

  protected setMode(event: Event): void {
    this.prefs.set((event.target as HTMLSelectElement).value as Mode);
  }
}
