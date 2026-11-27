import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { todayIso } from '../core/format';
import { WorkEntry } from '../core/models';
import { longDate } from '../core/work';
import { WorkEntryList } from '../shared/work-entry-list';

const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-work-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WorkEntryList],
  template: `
    <section>
      <h1>Calendario</h1>
      <div class="datebar">
        <button type="button" class="ghost" (click)="move(-1)" aria-label="Mes anterior">‹</button>
        <div class="date"><h2 class="month">{{ monthLabel() }}</h2></div>
        <button type="button" class="ghost" (click)="move(1)" aria-label="Mes siguiente">›</button>
      </div>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <div class="cal" role="grid" aria-label="Días del mes">
        @for (w of weekdays; track w) { <span class="cal-head" role="columnheader">{{ w }}</span> }
        @for (c of cells(); track $index) {
          @if (c.day === 0) { <span class="cal-blank"></span> }
          @else {
            <button type="button" class="cal-day" role="gridcell" [class.has]="c.count > 0" [class.sel]="c.iso === selected()" [class.today]="c.iso === today"
              [attr.aria-label]="c.day + ' del mes, ' + c.count + ' registro(s)'" (click)="select(c.iso)">{{ c.day }}@if (c.count > 0) { <i aria-hidden="true">{{ c.count }}</i> }</button>
          }
        }
      </div>

      <h2>{{ longDate(selected()) }}</h2>
      @if (dayEntries().length === 0) { <p class="muted">No hay registros este día.</p> }
      @else { <app-work-entry-list [entries]="dayEntries()" /> }
      <a class="btn primary" routerLink="/trabajo/registrar" [queryParams]="{ date: selected() }">Añadir un registro este día</a>
    </section>
  `,
})
export class WorkCalendarPage implements OnInit {
  private readonly api = inject(Api);
  /** ?date=AAAA-MM-DD abre el calendario en ese día. */
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });
  protected readonly weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  protected readonly today = todayIso();
  protected readonly selected = linkedSignal(() => { const d = this.dateParam(); return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : todayIso(); });
  protected readonly month = linkedSignal(() => this.selected().slice(0, 7));
  protected readonly counts = signal<Record<string, number>>({});
  protected readonly dayEntries = signal<WorkEntry[]>([]);
  protected readonly error = signal('');
  protected readonly longDate = longDate;

  protected readonly monthLabel = computed(() => {
    const [y, m] = this.month().split('-').map(Number);
    const l = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return l.charAt(0).toUpperCase() + l.slice(1);
  });

  /** Semana de lunes a domingo: huecos al principio y los días del mes con su nº de registros. */
  protected readonly cells = computed(() => {
    const [y, m] = this.month().split('-').map(Number);
    const first = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const days = new Date(y, m, 0).getDate();
    const out: { day: number; iso: string; count: number }[] = Array.from({ length: first }, () => ({ day: 0, iso: '', count: 0 }));
    for (let d = 1; d <= days; d++) { const iso = `${y}-${pad(m)}-${pad(d)}`; out.push({ day: d, iso, count: this.counts()[iso] ?? 0 }); }
    return out;
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadMonth(), this.loadDay()]);
  }

  protected async move(delta: number): Promise<void> {
    const [y, m] = this.month().split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    this.month.set(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
    await this.loadMonth();
  }

  protected async select(iso: string): Promise<void> { this.selected.set(iso); await this.loadDay(); }

  private async loadMonth(): Promise<void> {
    try {
      const days = await this.api.workCalendar(this.month());
      this.counts.set(Object.fromEntries(days.map((d) => [d.date, d.count])));
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  private async loadDay(): Promise<void> {
    try { this.dayEntries.set(await this.api.workDay(this.selected())); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
