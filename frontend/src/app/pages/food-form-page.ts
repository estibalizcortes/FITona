import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { Food, FoodRequest, NutrientKey, Portion, Reference } from '../core/models';

const FIELDS: { key: NutrientKey; label: string; unit: string; hint?: string }[] = [
  { key: 'energyKcal', label: 'Energía', unit: 'kcal', hint: 'Si lo dejas vacío se calcula con los factores de la UE a partir de los macros.' },
  { key: 'proteinG', label: 'Proteínas', unit: 'g' },
  { key: 'carbsG', label: 'Hidratos de carbono', unit: 'g', hint: 'Disponibles (sin fibra), como en la etiqueta.' },
  { key: 'sugarsG', label: 'de los cuales azúcares', unit: 'g' },
  { key: 'fatG', label: 'Grasas', unit: 'g' },
  { key: 'satFatG', label: 'de las cuales saturadas', unit: 'g' },
  { key: 'fiberG', label: 'Fibra', unit: 'g' },
  { key: 'saltG', label: 'Sal', unit: 'g' },
  { key: 'alcoholG', label: 'Alcohol', unit: 'g' },
];

@Component({
  selector: 'app-food-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>{{ editing() ? 'Editar alimento' : 'Crear alimento' }}</h1>
      <p class="muted">Valores <strong>por 100 g</strong>. Deja vacío lo que no sepas: «sin dato» no es lo mismo que 0.</p>

      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @for (w of warnings(); track w) { <p class="warn" role="status">{{ w }}</p> }
      @if (saved()) {
        <div class="ok" role="status">
          Alimento guardado. <a routerLink="/registrar">Registrarlo en una comida</a> ·
          <a routerLink="/alimentos">Ver alimentos</a>
        </div>
      }

      <form (submit)="submit($event)">
        <label class="field">
          <span>Nombre</span>
          <input type="text" required maxlength="150" [value]="name()" (input)="name.set($any($event.target).value)" />
        </label>

        <fieldset>
          <legend>Nutrientes por 100 g</legend>
          @for (f of fields; track f.key) {
            <label class="field">
              <span>{{ f.label }} ({{ f.unit }})</span>
              <input type="number" inputmode="decimal" min="0" step="any" [value]="values()[f.key] ?? ''"
                     (input)="setValue(f.key, $any($event.target).value)" />
              @if (f.hint) { <small class="muted">{{ f.hint }}</small> }
            </label>
          }
        </fieldset>

        <label class="field">
          <span>Densidad (g/ml), solo para líquidos</span>
          <input type="number" inputmode="decimal" min="0.1" max="3" step="any" [value]="density()" (input)="density.set($any($event.target).value)" />
          <small class="muted">Permite usar mililitros y litros. Si no la sabes, déjala vacía.</small>
        </label>

        <fieldset>
          <legend>Medidas caseras (opcional)</legend>
          @for (p of portions(); track $index) {
            <div class="row">
              <label class="field">
                <span>Unidad</span>
                <select aria-label="Unidad de la medida" [value]="p.unitCode" (change)="setPortion($index, 'unitCode', $any($event.target).value)">
                  @for (u of householdUnits(); track u.code) { <option [value]="u.code" [selected]="u.code === p.unitCode">{{ u.singular }}</option> }
                </select>
              </label>
              <label class="field">
                <span>Gramos de 1 unidad</span>
                <input type="number" min="0" step="any" [value]="p.grams" (input)="setPortion($index, 'grams', $any($event.target).value)" />
              </label>
              <button type="button" class="link danger" (click)="removePortion($index)">Quitar</button>
            </div>
          }
          <button type="button" class="btn" (click)="addPortion()">Añadir medida (1 huevo = 60 g…)</button>
        </fieldset>

        <div class="actions">
          <button type="submit" class="btn primary big" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Guardar alimento' }}</button>
          @if (editing()) { <button type="button" class="btn danger" (click)="remove()">Borrar alimento</button> }
        </div>
      </form>
    </section>
  `,
})
export class FoodFormPage implements OnInit {
  readonly id = input<string | undefined>();
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  protected readonly fields = FIELDS;
  protected readonly name = signal('');
  protected readonly values = signal<Partial<Record<NutrientKey, string>>>({});
  protected readonly density = signal('');
  protected readonly portions = signal<{ unitCode: string; grams: string }[]>([]);
  protected readonly householdUnits = signal<{ code: string; singular: string }[]>([]);
  protected readonly warnings = signal<string[]>([]);
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly editing = signal(false);
  private variantId: number | null = null;

  async ngOnInit(): Promise<void> {
    try {
      const ref: Reference = await this.api.reference();
      this.householdUnits.set(ref.units.filter((u) => u.kind === 'HOUSEHOLD'));
      if (this.id()) {
        this.variantId = Number(this.id());
        this.editing.set(true);
        this.fill(await this.api.getFood(this.variantId));
      }
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  private fill(f: Food): void {
    if (!f.editable) { this.error.set('Este alimento es del catálogo y no se puede editar.'); }
    this.name.set(f.name);
    const v: Partial<Record<NutrientKey, string>> = {};
    for (const k of FIELDS) { const x = f.per100[k.key]; if (x !== null && x !== undefined) v[k.key] = String(x); }
    this.values.set(v);
    this.density.set(f.densityGPerMl ? String(f.densityGPerMl) : '');
    this.portions.set(f.portions.map((p: Portion) => ({ unitCode: p.unitCode, grams: String(p.grams) })));
  }

  protected setValue(key: NutrientKey, raw: string): void { this.values.update((v) => ({ ...v, [key]: raw })); }

  protected addPortion(): void {
    const first = this.householdUnits()[0]?.code ?? 'UNIT';
    this.portions.update((p) => [...p, { unitCode: first, grams: '' }]);
  }
  protected removePortion(i: number): void { this.portions.update((p) => p.filter((_, idx) => idx !== i)); }
  protected setPortion(i: number, field: 'unitCode' | 'grams', raw: string): void {
    this.portions.update((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: raw } : x)));
  }

  private num(s: string | undefined): number | null {
    if (s === undefined || s.trim() === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  private request(): FoodRequest {
    const per100: FoodRequest['per100'] = {};
    for (const f of FIELDS) per100[f.key] = this.num(this.values()[f.key]);
    return {
      name: this.name().trim(),
      per100,
      densityGPerMl: this.num(this.density()),
      portions: this.portions().filter((p) => this.num(p.grams) !== null)
        .map((p) => ({ unitCode: p.unitCode, grams: this.num(p.grams)!, precision: 'APPROXIMATE' })),
    };
  }

  protected async submit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.saving.set(true); this.error.set(''); this.warnings.set([]); this.saved.set(false);
    try {
      const r = this.variantId ? await this.api.updateFood(this.variantId, this.request()) : await this.api.createFood(this.request());
      this.variantId = r.food.variantId;
      this.editing.set(true);
      this.warnings.set(r.warnings);
      this.saved.set(true);
      this.fill(r.food);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }

  protected async remove(): Promise<void> {
    if (!this.variantId || !confirm('¿Borrar este alimento? Los registros del diario ya guardados no cambian.')) return;
    try { await this.api.deleteFood(this.variantId); await this.router.navigate(['/alimentos']); }
    catch (e) { this.error.set(errorMessage(e)); }
  }
}
