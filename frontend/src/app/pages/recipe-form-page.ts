import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { parseQty, showQty } from '../core/format';
import { Food, Reference, RecipeRequest } from '../core/models';
import { FoodPicker } from '../shared/food-picker';

interface Row { food: Food | null; freeText: string; qty: string; unit: string; note: string }

const QUICK = ['¼', '½', '1', '2', '3'];

@Component({
  selector: 'app-recipe-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FoodPicker, RouterLink],
  template: `
    <section>
      <h1>{{ heading() }}</h1>
      @if (mode() === 'copy') {
        <p class="muted">Es una copia: cámbiale el nombre y lo que quieras (quitar un ingrediente, otras cantidades…). La receta original no se toca.</p>
      }
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <form (submit)="submit($event, false)">
        <label class="field">
          <span>Nombre</span>
          <input type="text" required maxlength="200" [value]="title()" (input)="title.set($any($event.target).value)" placeholder="p. ej. Tortilla de patatas sin cebolla" />
        </label>
        <label class="field">
          <span>Raciones que salen</span>
          <input type="text" inputmode="decimal" required [value]="servings()" (input)="servings.set($any($event.target).value)" />
        </label>

        <h2>Ingredientes</h2>
        <p class="muted small">Usa las medidas que quieras: «2 unidades grandes», «½ unidad», «1 chorrito»… FITona calcula los gramos aproximados (siempre puedes usar gramos).</p>
        @for (r of rows(); track $index) {
          <article class="card">
            @if (r.food) {
              <strong>{{ r.food.icon || '' }} {{ r.food.displayName }}</strong>
              <div class="row">
                <label class="field">
                  <span>Cantidad</span>
                  <input type="text" inputmode="decimal" aria-label="Cantidad" [value]="r.qty" (input)="setRow($index, 'qty', $any($event.target).value)" />
                </label>
                <label class="field">
                  <span>Unidad</span>
                  <select aria-label="Unidad" [value]="r.unit" (change)="setRow($index, 'unit', $any($event.target).value)">
                    @for (u of unitsFor(r.food); track u.code) { <option [value]="u.code" [selected]="u.code === r.unit">{{ u.label }}</option> }
                  </select>
                </label>
              </div>
              @if (r.unit !== 'G' && r.unit !== 'KG' && r.unit !== 'ML' && r.unit !== 'L') {
                <div class="chips" role="group" aria-label="Fracciones habituales">
                  @for (q of quick; track q) { <button type="button" class="chip" (click)="setRow($index, 'qty', q)">{{ q }}</button> }
                </div>
              }
              @if (r.note) { <p class="muted small">{{ r.note }}</p> }
            } @else if (r.freeText) {
              <strong>{{ r.freeText }}</strong> <span class="muted small">(sin cifras: la nutrición quedará incompleta)</span>
            }
            <button type="button" class="link danger" (click)="removeRow($index)">Quitar</button>
          </article>
        }

        <details class="card" [open]="rows().length === 0">
          <summary>Añadir ingrediente</summary>
          <app-food-picker (picked)="addFood($event)" />
          <label class="field">
            <span>…o texto libre (sin cifras)</span>
            <input type="text" maxlength="200" [value]="freeText()" (input)="freeText.set($any($event.target).value)" placeholder="p. ej. sal, pimentón" />
          </label>
          <button type="button" class="btn" (click)="addFree()" [disabled]="!freeText().trim()">Añadir texto libre</button>
        </details>

        <label class="field">
          <span>Pasos (uno por línea, opcional)</span>
          <textarea rows="8" [value]="steps()" (input)="steps.set($any($event.target).value)"></textarea>
          <small class="muted">Las temperaturas y tiempos son los que tú escribas: FITona no los inventa.</small>
        </label>

        <div class="actions">
          <button type="submit" class="btn primary big" [disabled]="saving() || rows().length === 0">
            {{ saving() ? 'Guardando…' : (mode() === 'edit' ? 'Guardar cambios' : (mode() === 'copy' ? 'Guardar como mi receta' : 'Guardar receta')) }}
          </button>
          @if (mode() === 'edit') {
            <button type="button" class="btn" (click)="submit($event, true)" [disabled]="saving() || rows().length === 0">Guardar como receta nueva</button>
          }
          @if (id()) { <a class="btn" [routerLink]="['/recetas', id()]">Cancelar</a> }
        </div>
      </form>
    </section>
  `,
})
export class RecipeFormPage implements OnInit {
  /** Receta que se edita (/recetas/:id/editar). Sin id = receta nueva. */
  readonly id = input<string | undefined>();
  /** ?copiar=1: abre la receta como copia que se guardará como nueva. */
  readonly copiar = input<string | undefined>();
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly quick = QUICK;
  protected readonly title = signal('');
  protected readonly servings = signal('4');
  protected readonly rows = signal<Row[]>([]);
  protected readonly freeText = signal('');
  protected readonly steps = signal('');
  protected readonly description = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly mode = signal<'new' | 'edit' | 'copy'>('new');
  protected readonly heading = computed(() => this.mode() === 'edit' ? 'Editar receta' : this.mode() === 'copy' ? 'Mi versión de la receta' : 'Nueva receta');
  private reference: Reference | null = null;

  async ngOnInit(): Promise<void> {
    try {
      this.reference = await this.api.reference();
      if (!this.id()) return;
      const r = await this.api.recipe(this.id()!);
      const copy = !!this.copiar();
      this.mode.set(copy ? 'copy' : 'edit');
      this.title.set(copy ? `${r.title} (mi versión)` : r.title);
      this.servings.set(showQty(r.servings));
      this.description.set(r.description);
      this.steps.set(r.steps.map((s) => s.instruction).join('\n'));
      const rows: Row[] = [];
      for (const i of r.ingredients) {
        if (i.variantId !== null) {
          try {
            const f = await this.api.getFood(i.variantId);
            rows.push({ food: f, freeText: '', qty: i.quantity === null ? '' : showQty(i.quantity), unit: i.unitCode ?? 'G', note: i.note ?? '' });
          } catch { this.error.set(`Se quitó «${i.name}» porque ya no existe en el catálogo.`); }
        } else if (i.freeText) rows.push({ food: null, freeText: i.freeText, qty: '', unit: 'G', note: i.note ?? '' });
      }
      this.rows.set(rows);
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected unitsFor(f: Food): { code: string; label: string }[] {
    const out = [{ code: 'G', label: 'gramos' }, { code: 'KG', label: 'kilos' }];
    if (f.densityGPerMl) out.push({ code: 'ML', label: 'mililitros' }, { code: 'L', label: 'litros' });
    for (const p of f.portions) {
      const u = this.reference?.units.find((x) => x.code === p.unitCode);
      out.push({ code: p.unitCode, label: `${u?.plural ?? p.unitCode} (≈ ${p.grams} g)` });
    }
    return out;
  }

  protected addFood(f: Food): void {
    if (!f.hasNutrients) {
      this.error.set(`«${f.name}» aún no tiene datos nutricionales: ponle tus valores en Alimentos antes de usarlo en una receta, o añádelo como texto libre.`);
      return;
    }
    this.error.set('');
    const first = f.portions[0];
    this.rows.update((r) => [...r, { food: f, freeText: '', qty: first ? '1' : '100', unit: first ? first.unitCode : 'G', note: '' }]);
  }
  protected addFree(): void {
    this.rows.update((r) => [...r, { food: null, freeText: this.freeText().trim(), qty: '', unit: 'G', note: '' }]);
    this.freeText.set('');
  }
  protected removeRow(i: number): void { this.rows.update((r) => r.filter((_, idx) => idx !== i)); }
  protected setRow(i: number, f: 'qty' | 'unit', v: string): void {
    this.rows.update((r) => r.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));
  }

  protected async submit(ev: Event, asNew: boolean): Promise<void> {
    ev.preventDefault();
    const servings = parseQty(this.servings());
    if (!Number.isFinite(servings) || servings <= 0) { this.error.set('Indica las raciones (un número mayor que 0, p. ej. 2 o 1/2).'); return; }
    const ingredients: RecipeRequest['ingredients'] = [];
    for (const x of this.rows()) {
      if (!x.food) { ingredients.push({ freeText: x.freeText, note: x.note || null }); continue; }
      const q = parseQty(x.qty);
      if (!Number.isFinite(q) || q <= 0) { this.error.set(`Indica una cantidad válida para «${x.food.displayName}» (p. ej. 2, 1/2 o 150).`); return; }
      ingredients.push({ variantId: x.food.variantId, quantity: q, unitCode: x.unit, note: x.note || null });
    }
    const body: RecipeRequest = {
      title: this.title().trim(), description: this.description(), servings, ingredients,
      steps: this.steps().split('\n').map((s) => s.trim()).filter(Boolean).map((instruction) => ({ instruction })),
    };
    this.saving.set(true); this.error.set('');
    try {
      const r = this.mode() === 'edit' && !asNew ? await this.api.updateRecipe(this.id()!, body) : await this.api.createRecipe(body);
      await this.router.navigate(['/recetas', r.id]);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }
}
