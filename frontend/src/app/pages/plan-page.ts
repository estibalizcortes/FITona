import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { newUuid } from '../core/identity';
import { todayIso } from '../core/format';
import { NutritionProfileResponse, PlanCandidate, PlanChosen, PlanOption, PlanSlot } from '../core/models';

interface SlotState { option: PlanOption | null; origin: 'FIXED' | 'CHOSEN' | 'SUGGESTED' | null; alternatives: PlanOption[]; logged: boolean; logId: string }

const SLOT_NAMES: Record<PlanSlot, string> = { BREAKFAST: 'Desayuno', LUNCH: 'Comida', SNACK: 'Merienda', DINNER: 'Cena' };
const ORDER: PlanSlot[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
/** Los momentos del diario (6) se agrupan en los 4 del plan. */
const FROM_DIARY: Record<string, PlanSlot> = { BREAKFAST: 'BREAKFAST', MID_MORNING: 'SNACK', LUNCH: 'LUNCH', AFTERNOON_SNACK: 'SNACK', DINNER: 'DINNER', OTHER: 'SNACK' };
const empty = (): SlotState => ({ option: null, origin: null, alternatives: [], logged: false, logId: newUuid() });
const fresh = (): Record<PlanSlot, SlotState> => ({ BREAKFAST: empty(), LUNCH: empty(), SNACK: empty(), DINNER: empty() });

@Component({
  selector: 'app-plan-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>Plan del día</h1>
      <p class="muted">Elige las comidas que ya tienes claras y FITona sugiere el resto para acercarte a tu objetivo. Es solo una propuesta: nada se registra hasta que pulses «Añadir al diario».</p>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

      <label class="field"><span>Fecha</span>
        <input type="date" aria-label="Fecha del plan" [value]="date()" (change)="changeDate($any($event.target).value)" /></label>

      <article class="card goal">
        @if (profile(); as g) {
          <h2>Objetivo ≈ {{ g.target.target }} kcal</h2>
          <p class="muted small">Según tu <a routerLink="/yo/perfil">perfil nutricional</a>.</p>
        } @else if (loaded()) {
          <p>Sin perfil nutricional: indica las kcal del día o <a routerLink="/yo/perfil">calcula tu objetivo</a>.</p>
          <label class="field"><span>Kcal del día</span>
            <input type="number" inputmode="numeric" min="800" max="6000" aria-label="Kcal del día" [value]="manual()" (input)="manual.set($any($event.target).value)" /></label>
        }
      </article>

      @for (slot of order; track slot) {
        <article class="card slot" [attr.data-slot]="slot">
          <header class="card-head"><h2>{{ names[slot] }}</h2>
            @if (slots()[slot].origin === 'FIXED') { <span class="muted small">ya registrado en el diario</span> }
            @else if (slots()[slot].origin === 'SUGGESTED') { <span class="muted small">sugerido</span> }
            @else if (slots()[slot].origin === 'CHOSEN') { <span class="muted small">elegido por ti</span> }
          </header>
          @if (slots()[slot].option; as o) {
            <p><strong>{{ o.title }}</strong><br />
              <span class="muted">≈ {{ o.kcal }} kcal@if (o.kind !== 'FIXED') { · {{ o.servings }} ración(es) }</span></p>
            @if (slots()[slot].origin !== 'FIXED') {
              <div class="actions">
                <button type="button" class="btn" (click)="servings(slot, -0.25)" [attr.aria-label]="'Menos ración de ' + names[slot]">− ración</button>
                <button type="button" class="btn" (click)="servings(slot, 0.25)" [attr.aria-label]="'Más ración de ' + names[slot]">+ ración</button>
                @if (slots()[slot].origin === 'SUGGESTED' && slots()[slot].alternatives.length > 1) {
                  <button type="button" class="btn" (click)="another(slot)">Otra opción</button>
                }
                @if (slots()[slot].origin === 'CHOSEN') { <button type="button" class="btn" (click)="clear(slot)">Quitar</button> }
                @if (slots()[slot].logged) { <span class="ok" role="status">Añadido al diario ✓</span> }
                @else { <button type="button" class="btn primary" (click)="log(slot)" [disabled]="busy()">Añadir al diario</button> }
              </div>
            }
          }
          @if (slots()[slot].origin !== 'FIXED') {
            <label class="field"><span>{{ slots()[slot].option ? 'Cambiar por…' : 'Elegir receta' }}</span>
              <select [attr.aria-label]="'Elegir para ' + names[slot]" (change)="pick(slot, $any($event.target).value); $any($event.target).value = ''">
                <option value="" selected>{{ slots()[slot].option ? 'Cambiar por…' : 'Elegir receta…' }}</option>
                @for (c of candidatesFor(slot); track c.kind + (c.key ?? c.recipeId)) {
                  <option [value]="(c.kind === 'TEMPLATE' ? 'T:' + c.key : 'R:' + c.recipeId)">{{ c.title }} (≈ {{ c.kcalPerServing }} kcal)</option>
                }
              </select></label>
          }
        </article>
      }

      <div class="actions"><button type="button" class="btn primary big" (click)="suggest()" [disabled]="busy() || !target()">Sugerir el resto</button></div>
      @if (message()) { <p class="muted" role="status" aria-live="polite">{{ message() }}</p> }
      @if (target()) {
        <article class="card day"><div class="between"><span>Plan del día</span><strong>≈ {{ total() }} kcal</strong></div>
          <div class="between"><span class="muted">Objetivo</span><span class="muted">≈ {{ target() }} kcal</span></div></article>
      }
      <p><a routerLink="/hoy" [queryParams]="{ date: date() }">‹ Ver el día en «Hoy»</a></p>
    </section>
  `,
})
export class PlanPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly order = ORDER;
  protected readonly names = SLOT_NAMES;
  protected readonly date = signal(todayIso());
  protected readonly profile = signal<NutritionProfileResponse | null>(null);
  protected readonly manual = signal('');
  protected readonly candidates = signal<PlanCandidate[]>([]);
  protected readonly slots = signal<Record<PlanSlot, SlotState>>(fresh());
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected readonly loaded = signal(false);

  protected readonly target = computed(() => this.profile()?.target.target ?? (Number(this.manual()) >= 800 ? Number(this.manual()) : 0));
  protected readonly total = computed(() => ORDER.reduce((s, k) => s + (this.slots()[k].option?.kcal ?? 0), 0));

  async ngOnInit(): Promise<void> {
    try {
      const [profile, candidates] = await Promise.all([this.api.nutritionProfile(), this.api.planOptions()]);
      this.profile.set(profile); this.candidates.set(candidates);
      await this.loadDiary();
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.loaded.set(true); }
  }

  protected candidatesFor(slot: PlanSlot): PlanCandidate[] { return this.candidates().filter((c) => c.meals.includes(slot)); }

  protected async changeDate(d: string): Promise<void> {
    if (!d) return;
    this.date.set(d); this.message.set(''); this.slots.set(fresh());
    try { await this.loadDiary(); } catch (e) { this.error.set(errorMessage(e)); }
  }

  /** Lo que ya está registrado en el diario ese día cuenta como «elegido» (no se toca desde aquí). */
  private async loadDiary(): Promise<void> {
    const diary = await this.api.diary(this.date());
    const kcal: Partial<Record<PlanSlot, number>> = {};
    for (const e of diary.entries) {
      const slot = FROM_DIARY[e.mealSlot] ?? 'SNACK';
      kcal[slot] = (kcal[slot] ?? 0) + Math.round(e.totals.nutrients['energyKcal']?.value ?? 0);
    }
    const s = fresh();
    for (const slot of ORDER) {
      const k = kcal[slot];
      if (k !== undefined) s[slot] = { ...s[slot], origin: 'FIXED', option: { kind: 'FIXED', key: null, recipeId: null, title: 'Ya registrado', servings: 1, kcalPerServing: k, kcal: k } };
    }
    this.slots.set(s);
  }

  private put(slot: PlanSlot, patch: Partial<SlotState>): void { this.slots.update((s) => ({ ...s, [slot]: { ...s[slot], ...patch } })); }

  private optionOf(c: PlanCandidate, servings: number): PlanOption {
    return { kind: c.kind, key: c.key, recipeId: c.recipeId, title: c.title, servings, kcalPerServing: c.kcalPerServing, kcal: Math.round(c.kcalPerServing * servings) };
  }

  protected pick(slot: PlanSlot, value: string): void {
    const c = this.candidates().find((x) => (value.startsWith('T:') ? x.key === value.slice(2) : x.recipeId === value.slice(2)));
    if (c) this.put(slot, { option: this.optionOf(c, 1), origin: 'CHOSEN', alternatives: [], logged: false });
  }

  protected servings(slot: PlanSlot, delta: number): void {
    const st = this.slots()[slot];
    if (!st.option) return;
    const servings = Math.min(6, Math.max(0.25, Math.round((st.option.servings + delta) * 100) / 100));
    this.put(slot, { option: { ...st.option, servings, kcal: Math.round(st.option.kcalPerServing * servings) }, origin: 'CHOSEN', logged: false });
  }

  protected another(slot: PlanSlot): void {
    const st = this.slots()[slot];
    if (!st.option || st.alternatives.length < 2) return;
    const idx = st.alternatives.findIndex((a) => a.title === st.option!.title);
    this.put(slot, { option: st.alternatives[(idx + 1) % st.alternatives.length], logged: false });
  }

  protected clear(slot: PlanSlot): void { this.put(slot, { option: null, origin: null, alternatives: [], logged: false }); }

  protected async suggest(): Promise<void> {
    this.busy.set(true); this.error.set('');
    const chosen: PlanChosen[] = [];
    for (const slot of ORDER) {
      const st = this.slots()[slot];
      if (st.origin === 'FIXED' && st.option) chosen.push({ slot, kind: 'FIXED', kcal: st.option.kcal, label: 'Ya registrado' });
      else if (st.origin === 'CHOSEN' && st.option) chosen.push({ slot, kind: st.option.kind as 'TEMPLATE' | 'RECIPE', key: st.option.key, recipeId: st.option.recipeId, servings: st.option.servings });
    }
    try {
      const plan = await this.api.planSuggest({ targetKcal: this.profile() ? null : this.target(), date: this.date(), chosen });
      for (const m of plan.meals) {
        const st = this.slots()[m.slot];
        if (st.origin === 'FIXED' || st.origin === 'CHOSEN') continue;
        this.put(m.slot, m.option ? { option: m.option, origin: 'SUGGESTED', alternatives: m.alternatives, logged: false } : { option: null, origin: null, alternatives: [] });
      }
      this.message.set(plan.message);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }

  /** Solo aquí se escribe en el diario, y lo decide la persona. */
  protected async log(slot: PlanSlot): Promise<void> {
    const st = this.slots()[slot];
    const o = st.option;
    if (!o || o.kind === 'FIXED') return;
    this.busy.set(true); this.error.set('');
    try {
      await this.api.planLog({ id: st.logId, date: this.date(), slot, kind: o.kind as 'TEMPLATE' | 'RECIPE', key: o.key, recipeId: o.recipeId, servings: o.servings });
      this.put(slot, { logged: true });
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
