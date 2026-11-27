import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { Food, Reference } from '../core/models';
import { FoodPicker } from '../shared/food-picker';

interface Row { food: Food | null; freeText: string; qty: string; unit: string }

@Component({
  selector: 'app-recipe-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FoodPicker],
  template: `
    <section>
      <h1>Nueva receta</h1>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <form (submit)="submit($event)">
        <label class="field">
          <span>Nombre</span>
          <input type="text" required maxlength="200" [value]="title()" (input)="title.set($any($event.target).value)" placeholder="p. ej. Potaje de garbanzos de mi madre" />
        </label>
        <label class="field">
          <span>Raciones que salen</span>
          <input type="number" required min="0.5" step="any" [value]="servings()" (input)="servings.set($any($event.target).value)" />
        </label>

        <h2>Ingredientes</h2>
        @for (r of rows(); track $index) {
          <article class="card">
            @if (r.food) {
              <strong>{{ r.food.displayName }}</strong>
              <div class="row">
                <label class="field">
                  <span>Cantidad</span>
                  <input type="number" min="0" step="any" [value]="r.qty" (input)="setRow($index, 'qty', $any($event.target).value)" />
                </label>
                <label class="field">
                  <span>Unidad</span>
                  <select aria-label="Unidad" [value]="r.unit" (change)="setRow($index, 'unit', $any($event.target).value)">
                    @for (u of unitsFor(r.food); track u.code) { <option [value]="u.code" [selected]="u.code === r.unit">{{ u.label }}</option> }
                  </select>
                </label>
              </div>
            } @else if (r.freeText) {
              <strong>{{ r.freeText }}</strong> <span class="muted small">(sin resolver: la nutrición quedará incompleta)</span>
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
          <textarea rows="4" [value]="steps()" (input)="steps.set($any($event.target).value)"></textarea>
          <small class="muted">Las temperaturas y tiempos son los que tú escribas: FITona no los inventa.</small>
        </label>

        <div class="actions">
          <button type="submit" class="btn primary big" [disabled]="saving() || rows().length === 0">
            {{ saving() ? 'Guardando…' : 'Guardar receta' }}
          </button>
        </div>
      </form>
    </section>
  `,
})
export class RecipeFormPage implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly title = signal('');
  protected readonly servings = signal('4');
  protected readonly rows = signal<Row[]>([]);
  protected readonly freeText = signal('');
  protected readonly steps = signal('');
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  private reference: Reference | null = null;

  async ngOnInit(): Promise<void> {
    try { this.reference = await this.api.reference(); } catch (e) { this.error.set(errorMessage(e)); }
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
    this.rows.update((r) => [...r, { food: f, freeText: '', qty: first ? '1' : '100', unit: first ? first.unitCode : 'G' }]);
  }
  protected addFree(): void {
    this.rows.update((r) => [...r, { food: null, freeText: this.freeText().trim(), qty: '', unit: 'G' }]);
    this.freeText.set('');
  }
  protected removeRow(i: number): void { this.rows.update((r) => r.filter((_, idx) => idx !== i)); }
  protected setRow(i: number, f: 'qty' | 'unit', v: string): void {
    this.rows.update((r) => r.map((x, idx) => (idx === i ? { ...x, [f]: v } : x)));
  }

  protected async submit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.saving.set(true); this.error.set('');
    try {
      const r = await this.api.createRecipe({
        title: this.title().trim(),
        servings: Number(this.servings()),
        ingredients: this.rows().map((x) => x.food
          ? { variantId: x.food.variantId, quantity: Number(x.qty), unitCode: x.unit }
          : { freeText: x.freeText }),
        steps: this.steps().split('\n').map((s) => s.trim()).filter(Boolean).map((instruction) => ({ instruction })),
      });
      await this.router.navigate(['/recetas', r.id]);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }
}
