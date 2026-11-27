import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Api, errorMessage } from '../core/api';
import { WorkEntry } from '../core/models';
import { KIND_NAMES } from '../core/work';
import { WorkEntryList } from '../shared/work-entry-list';

const PAGE = 30;

@Component({
  selector: 'app-work-history-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkEntryList],
  template: `
    <section>
      <h1>Historial</h1>
      <div class="row">
        <label class="field grow"><span class="sr-only">Buscar</span>
          <input type="search" aria-label="Buscar en el historial" placeholder="Buscar en títulos y textos…" [value]="q()" (input)="onQuery($any($event.target).value)" /></label>
        <label class="field"><span class="sr-only">Tipo</span>
          <select aria-label="Filtrar por tipo" [value]="kind()" (change)="onKind($any($event.target).value)">
            <option value="" [selected]="kind() === ''">Todos</option>
            @for (k of kinds; track k[0]) { <option [value]="k[0]" [selected]="kind() === k[0]">{{ k[1] }}</option> }
          </select></label>
      </div>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (loaded() && entries().length === 0) {
        <div class="empty"><p>{{ q() || kind() ? 'Ningún registro coincide con la búsqueda.' : 'Aún no hay registros.' }}</p></div>
      }
      <app-work-entry-list [entries]="entries()" [showDate]="true" />
      @if (more()) { <button type="button" class="btn" (click)="loadMore()" [disabled]="busy()">Cargar más</button> }
    </section>
  `,
})
export class WorkHistoryPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly kinds = Object.entries(KIND_NAMES);
  protected readonly q = signal('');
  protected readonly kind = signal('');
  protected readonly entries = signal<WorkEntry[]>([]);
  protected readonly more = signal(false);
  protected readonly loaded = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** Evita que una respuesta lenta de una búsqueda anterior pise a la actual. */
  private seq = 0;

  ngOnInit(): void { void this.reload(); }

  protected onQuery(v: string): void {
    this.q.set(v);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.reload(), 300);
  }
  protected onKind(v: string): void { this.kind.set(v); void this.reload(); }

  private async reload(): Promise<void> {
    const my = ++this.seq;
    this.busy.set(true); this.error.set('');
    try {
      const r = await this.api.workSearch(this.q(), this.kind(), 0, PAGE);
      if (my !== this.seq) return;
      this.entries.set(r); this.more.set(r.length === PAGE); this.loaded.set(true);
    } catch (e) { if (my === this.seq) this.error.set(errorMessage(e)); } finally { if (my === this.seq) this.busy.set(false); }
  }

  protected async loadMore(): Promise<void> {
    const my = this.seq;
    this.busy.set(true);
    try {
      const r = await this.api.workSearch(this.q(), this.kind(), this.entries().length, PAGE);
      if (my !== this.seq) return;
      this.entries.update((x) => [...x, ...r]); this.more.set(r.length === PAGE);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
