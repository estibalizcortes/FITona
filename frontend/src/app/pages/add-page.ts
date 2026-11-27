import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { newUuid } from '../core/identity';
import { SLOT_NAMES, slotForNow, todayIso, unitLabel } from '../core/format';
import { CalcResponse, Food, ItemRequest, RecipeSummary, Reference } from '../core/models';
import { FoodPicker } from '../shared/food-picker';
import { TotalsView } from '../shared/totals-view';

interface DraftItem { label: string; req: ItemRequest }

@Component({
  selector: 'app-add-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FoodPicker, TotalsView],
  template: `
    <section>
      <h1>Registrar comida</h1>

      <div class="row">
        <label class="field">
          <span>Comida</span>
          <select aria-label="Comida" [value]="slot()" (change)="slot.set($any($event.target).value)">
            @for (s of slots; track s[0]) { <option [value]="s[0]" [selected]="s[0] === slot()">{{ s[1] }}</option> }
          </select>
        </label>
        <label class="field">
          <span>Fecha</span>
          <input type="date" [value]="dateValue()" (change)="dateValue.set($any($event.target).value)" />
        </label>
      </div>

      @if (selected(); as f) {
        <article class="card">
          <h2>{{ f.displayName }}</h2>
          <div class="row">
            <label class="field">
              <span>Cantidad</span>
              <input type="number" inputmode="decimal" min="0" step="any" [value]="qty()" (input)="qty.set($any($event.target).value)" />
            </label>
            <label class="field">
              <span>Unidad</span>
              <select aria-label="Unidad" [value]="unit()" (change)="unit.set($any($event.target).value)">
                @for (u of unitsFor(f); track u.code) { <option [value]="u.code" [selected]="u.code === unit()">{{ u.label }}</option> }
              </select>
            </label>
          </div>
          @if (f.portions.length === 0) {
            <p class="muted small">Este alimento no tiene medidas caseras (unidad, vaso…): usa gramos, o
              <a [routerLink]="['/alimentos', f.variantId]">añade una medida</a>.</p>
          }
          <div class="actions">
            <button type="button" class="btn primary" (click)="addSelected()">Añadir a la comida</button>
            <button type="button" class="btn" (click)="selected.set(null)">Cancelar</button>
          </div>
        </article>
      } @else {
        <app-food-picker (picked)="pick($event)" />

        <details class="card">
          <summary>Sin cifras: apuntar solo lo que he comido</summary>
          <label class="field">
            <span>Descripción</span>
            <input type="text" maxlength="200" [value]="freeText()" (input)="freeText.set($any($event.target).value)"
                   placeholder="p. ej. lentejas de mi madre" />
          </label>
          <button type="button" class="btn" (click)="addFree()" [disabled]="!freeText().trim()">Añadir sin cifras</button>
          <p class="muted small">No se inventa ninguna caloría: queda registrado como texto.</p>
        </details>

        @if (recipes().length > 0) {
          <details class="card">
            <summary>Una ración de una receta mía</summary>
            <label class="field">
              <span>Receta</span>
              <select aria-label="Receta" [value]="recipeId()" (change)="recipeId.set($any($event.target).value)">
                <option value="">Elige…</option>
                @for (r of recipes(); track r.id) { <option [value]="r.id" [selected]="r.id === recipeId()">{{ r.title }}</option> }
              </select>
            </label>
            <label class="field">
              <span>Raciones</span>
              <input type="number" min="0" step="any" [value]="servings()" (input)="servings.set($any($event.target).value)" />
            </label>
            <button type="button" class="btn" (click)="addRecipe()" [disabled]="!recipeId()">Añadir receta</button>
          </details>
        }
      }

      <h2>En esta comida</h2>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (draft().length === 0) {
        <p class="muted">Todavía no has añadido nada.</p>
      } @else {
        <ul class="items">
          @for (d of draft(); track $index) {
            <li class="between">
              <div>
                <strong>{{ d.label }}</strong>
                @if (preview()?.items?.[$index]; as it) { <app-totals [totals]="it.totals" /> }
              </div>
              <button type="button" class="link danger" (click)="remove($index)" [attr.aria-label]="'Quitar ' + d.label">Quitar</button>
            </li>
          }
        </ul>
        @if (preview(); as p) { <div class="subtotal"><span>Total</span><app-totals [totals]="p.total" /></div> }
        <div class="actions">
          <button type="button" class="btn primary big" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Guardando…' : 'Guardar en el diario' }}
          </button>
        </div>
      }
    </section>
  `,
})
export class AddPage implements OnInit {
  readonly date = input<string | undefined>();
  readonly slotParam = input<string | undefined>(undefined, { alias: 'slot' });

  private readonly api = inject(Api);
  private readonly router = inject(Router);

  protected readonly slot = signal(slotForNow());
  protected readonly dateValue = signal(todayIso());
  protected readonly slots = Object.entries(SLOT_NAMES);
  protected readonly selected = signal<Food | null>(null);
  protected readonly qty = signal('100');
  protected readonly unit = signal('G');
  protected readonly draft = signal<DraftItem[]>([]);
  protected readonly preview = signal<CalcResponse | null>(null);
  protected readonly freeText = signal('');
  protected readonly recipes = signal<RecipeSummary[]>([]);
  protected readonly recipeId = signal('');
  protected readonly servings = signal('1');
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  private reference: Reference | null = null;
  /** Mismo id en los reintentos de guardado: el servidor no duplica el registro. */
  private readonly entryId = newUuid();

  protected readonly hasDraft = computed(() => this.draft().length > 0);

  async ngOnInit(): Promise<void> {
    if (this.date()) this.dateValue.set(this.date()!);
    if (this.slotParam()) this.slot.set(this.slotParam()!);
    try {
      this.reference = await this.api.reference();
      this.recipes.set(await this.api.recipes());
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected pick(f: Food): void {
    this.selected.set(f);
    const first = f.portions[0];
    this.unit.set(first ? first.unitCode : 'G');
    this.qty.set(first ? '1' : '100');
  }

  protected unitsFor(f: Food): { code: string; label: string }[] {
    const name = (c: string) => this.reference?.units.find((u) => u.code === c);
    const out: { code: string; label: string }[] = [{ code: 'G', label: 'gramos' }, { code: 'KG', label: 'kilos' }];
    if (f.densityGPerMl) out.push({ code: 'ML', label: 'mililitros' }, { code: 'L', label: 'litros' });
    for (const p of f.portions) {
      const u = name(p.unitCode);
      out.push({ code: p.unitCode, label: `${u?.plural ?? p.unitCode} (≈ ${p.grams} g)` });
    }
    return out;
  }

  protected async addSelected(): Promise<void> {
    const f = this.selected();
    const q = Number(this.qty());
    if (!f || !Number.isFinite(q) || q <= 0) { this.error.set('Indica una cantidad mayor que 0.'); return; }
    await this.push({ label: `${f.displayName} · ${q} ${unitLabel(this.reference?.units, this.unit(), q)}`, req: { variantId: f.variantId, quantity: q, unitCode: this.unit() } });
    this.selected.set(null);
  }

  protected async addFree(): Promise<void> {
    const t = this.freeText().trim();
    if (!t) return;
    await this.push({ label: `${t} (sin cifras)`, req: { freeText: t } });
    this.freeText.set('');
  }

  protected async addRecipe(): Promise<void> {
    const r = this.recipes().find((x) => x.id === this.recipeId());
    const s = Number(this.servings());
    if (!r || !Number.isFinite(s) || s <= 0) { this.error.set('Indica las raciones (mayor que 0).'); return; }
    await this.push({ label: `${r.title} · ${s} ración(es)`, req: { recipeId: r.id, servings: s } });
    this.recipeId.set('');
  }

  protected async remove(i: number): Promise<void> {
    this.draft.update((d) => d.filter((_, idx) => idx !== i));
    await this.recalc();
  }

  private async push(item: DraftItem): Promise<void> {
    this.draft.update((d) => [...d, item]);
    if (!(await this.recalc())) this.draft.update((d) => d.slice(0, -1));
  }

  /** Calcula con el motor del servidor. Si algún elemento no se puede calcular, se avisa y no se añade. */
  private async recalc(): Promise<boolean> {
    this.error.set('');
    if (this.draft().length === 0) { this.preview.set(null); return true; }
    try {
      this.preview.set(await this.api.calc(this.draft().map((d) => d.req)));
      return true;
    } catch (e) { this.error.set(errorMessage(e)); return false; }
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.createEntry({
        id: this.entryId, date: this.dateValue(), mealSlot: this.slot(), items: this.draft().map((d) => d.req),
      });
      await this.router.navigate(['/hoy'], { queryParams: { date: this.dateValue() } });
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }
}
