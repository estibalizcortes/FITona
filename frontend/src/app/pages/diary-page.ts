import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { SLOT_NAMES, shiftDate, todayIso, unitLabel } from '../core/format';
import { Diary, DiaryEntry, NutritionProfileResponse, Unit } from '../core/models';
import { Prefs } from '../core/prefs';
import { TotalsView } from '../shared/totals-view';

@Component({
  selector: 'app-diary-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TotalsView],
  template: `
    <section>
      <div class="datebar">
        <button type="button" class="ghost" (click)="go(-1)" aria-label="Día anterior">‹</button>
        <div class="date">
          <h1>{{ title() }}</h1>
          <input type="date" [value]="date()" (change)="pick($event)" aria-label="Elegir fecha" />
        </div>
        <button type="button" class="ghost" (click)="go(1)" aria-label="Día siguiente">›</button>
      </div>

      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

      @if (prefs.mode() !== 'SIMPLE' && goalLoaded()) {
        @if (goal(); as g) {
          <article class="card goal" aria-label="Objetivo del día">
            <div class="between"><h2>Hoy ≈ {{ eaten() }} kcal</h2><span class="muted">objetivo ≈ {{ g.target.target }} kcal</span></div>
            <div class="bar" role="progressbar" aria-valuemin="0" [attr.aria-valuemax]="g.target.target" [attr.aria-valuenow]="eaten()"><i [style.width.%]="pct(g.target.target)"></i></div>
            <p class="muted small">{{ remainingText(g.target.target) }}</p>
          </article>
        } @else {
          <article class="card goal"><p>Para ver tu objetivo diario, completa tu <a routerLink="/yo/perfil">perfil nutricional</a>.</p></article>
        }
      }

      @if (diary(); as d) {
        @if (d.entries.length === 0) {
          <div class="empty">
            <p>Aún no hay nada registrado este día.</p>
            <p class="muted">Registrar una comida es opcional: puedes dejarlo vacío sin que pase nada.</p>
            <a class="btn primary" [routerLink]="['/registrar']" [queryParams]="{ date: date() }">Registrar una comida</a>
          </div>
        } @else {
          @for (e of d.entries; track e.id) {
            <article class="card">
              <header class="card-head">
                <h2>{{ slotName(e) }}</h2>
                <button type="button" class="link danger" (click)="remove(e)" [attr.aria-label]="'Borrar ' + slotName(e)">Borrar</button>
              </header>
              <ul class="items">
                @for (i of e.items; track i.id) {
                  <li>
                    <div>
                      <strong>{{ i.displayName }}</strong>
                      @if (i.quantity !== null) { <span class="muted"> · {{ i.quantity }} {{ unitName(i.unitCode, i.quantity) }}@if (i.grams !== null) { ({{ i.grams }} g) }</span> }
                      @if (i.servings !== null) { <span class="muted"> · {{ i.servings }} ración(es)</span> }
                      <app-totals [totals]="i.totals" />
                    </div>
                  </li>
                }
              </ul>
              @if (e.items.length > 1) { <div class="subtotal"><span>Total de la comida</span><app-totals [totals]="e.totals" /></div> }
            </article>
          }
          @if (prefs.mode() !== 'SIMPLE') {
            <article class="card day">
              <h2>Total del día</h2>
              <app-totals [totals]="d.totals" />
              <p class="muted small">Es solo información: no hay objetivos que cumplir ni nada que compensar.</p>
            </article>
          }
          <a class="btn" [routerLink]="['/registrar']" [queryParams]="{ date: date() }">Añadir otra comida</a>
        }
      } @else if (!error()) {
        <p class="muted" aria-live="polite">Cargando…</p>
      }
    </section>
  `,
})
export class DiaryPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  readonly dateParam = input<string | undefined>(undefined, { alias: 'date' });
  readonly date = signal(todayIso());
  readonly diary = signal<Diary | null>(null);
  protected readonly goal = signal<NutritionProfileResponse | null>(null);
  protected readonly goalLoaded = signal(false);
  readonly error = signal('');
  private units: Unit[] = [];

  ngOnInit(): void {
    if (this.dateParam()) this.date.set(this.dateParam()!);
    void this.api.reference().then((r) => { this.units = r.units; this.diary.update((d) => (d ? { ...d } : d)); }).catch(() => undefined);
    void this.load();
    this.api.nutritionProfile().then((g) => this.goal.set(g)).catch(() => undefined).finally(() => this.goalLoaded.set(true));
  }

  /** kcal del día (si hay algo desconocido es un mínimo; el total completo se ve más abajo). */
  protected eaten(): number {
    const e = this.diary()?.totals.nutrients['energyKcal'];
    return Math.round(e?.value ?? 0);
  }
  protected pct(target: number): number { return Math.min(100, Math.round((this.eaten() / target) * 100)); }
  /** Texto neutro: ni «te has pasado» ni colores de alarma; es solo una referencia. */
  protected remainingText(target: number): string {
    const left = target - this.eaten();
    return left >= 0 ? `Te quedan ≈ ${left} kcal como referencia.` : `Has superado la referencia en ≈ ${-left} kcal: es solo orientativa, sin nada que compensar.`;
  }

  protected unitName(code: string | null, qty: number | null): string { return unitLabel(this.units, code, qty); }

  protected title(): string {
    const [y, m, d] = this.date().split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const cap = label.charAt(0).toUpperCase() + label.slice(1);
    return this.date() === todayIso() ? `Hoy, ${label}` : cap;
  }

  protected slotName(e: DiaryEntry): string { return SLOT_NAMES[e.mealSlot] ?? e.mealSlot; }

  protected go(days: number): void { this.date.set(shiftDate(this.date(), days)); void this.load(); }

  protected pick(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    if (v) { this.date.set(v); void this.load(); }
  }

  private async load(): Promise<void> {
    this.error.set('');
    this.diary.set(null);
    try { this.diary.set(await this.api.diary(this.date())); } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected async remove(e: DiaryEntry): Promise<void> {
    if (!confirm(`¿Borrar «${this.slotName(e)}» de este día?`)) return;
    try { await this.api.deleteEntry(e.id); await this.load(); } catch (err) { this.error.set(errorMessage(err)); }
  }
}
