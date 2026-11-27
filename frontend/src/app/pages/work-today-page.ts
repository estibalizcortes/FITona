import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { todayIso } from '../core/format';
import { WorkEntry } from '../core/models';
import { longDate } from '../core/work';
import { WorkEntryList } from '../shared/work-entry-list';

@Component({
  selector: 'app-work-today-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WorkEntryList],
  template: `
    <section>
      <h1>Hoy</h1>
      <p class="muted">{{ today }}</p>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (loaded()) {
        <article class="card day" aria-label="Resumen del día">
          <h2>Resumen del día</h2>
          <p><strong>{{ summary().notes }}</strong> nota(s) · <strong>{{ summary().summaries }}</strong> resumen(es) · <strong>{{ summary().prompts }}</strong> texto(s)/prompt(s)</p>
        </article>
        @if (entries().length === 0) {
          <div class="empty">
            <p>Aún no has registrado nada hoy.</p>
            <a class="btn primary" routerLink="/trabajo/registrar">Registrar una nota</a>
          </div>
        } @else {
          <app-work-entry-list [entries]="entries()" />
          <a class="btn" routerLink="/trabajo/registrar">Añadir otro registro</a>
        }
      } @else if (!error()) { <p class="muted" aria-live="polite">Cargando…</p> }
    </section>
  `,
})
export class WorkTodayPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly today = longDate(todayIso());
  protected readonly entries = signal<WorkEntry[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  protected readonly summary = computed(() => ({
    notes: this.entries().filter((e) => e.kind === 'NOTE').length,
    summaries: this.entries().filter((e) => e.kind === 'SUMMARY').length,
    prompts: this.entries().filter((e) => e.kind === 'PROMPT').length,
  }));

  async ngOnInit(): Promise<void> {
    try { this.entries.set(await this.api.workDay(todayIso())); this.loaded.set(true); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
