import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { SLOT_NAMES, slotForNow, todayIso, unitLabel } from '../core/format';
import { Recipe, Unit } from '../core/models';
import { TotalsView } from '../shared/totals-view';

@Component({
  selector: 'app-recipe-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TotalsView],
  template: `
    <section>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (recipe(); as r) {
        <h1>{{ r.title }}</h1>
        <p class="muted">{{ r.servings }} raciones · versión {{ r.version }}</p>
        @if (r.completeness !== 'COMPLETE') {
          <p class="warn" role="status">Hay ingredientes sin datos nutricionales: los valores son un mínimo, no el total real.</p>
        }
        <h2>Por ración</h2>
        <app-totals [totals]="r.perServing" />

        <h2>Ingredientes</h2>
        <ul class="items">
          @for (i of r.ingredients; track $index) {
            <li>{{ i.name }}@if (i.quantity !== null) { <span class="muted"> · {{ i.quantity }} {{ unitName(i.unitCode, i.quantity) }}@if (i.grams !== null) { (≈ {{ i.grams }} g) }</span> }</li>
          }
        </ul>
        @if (r.steps.length > 0) {
          <h2>Pasos</h2>
          <ol class="steps">@for (s of r.steps; track s.number) { <li>{{ s.instruction }}</li> }</ol>
        }

        <article class="card">
          <h2>Registrar en el diario</h2>
          <div class="row">
            <label class="field">
              <span>Raciones</span>
              <input type="number" min="0" step="any" [value]="servings()" (input)="servings.set($any($event.target).value)" />
            </label>
            <label class="field">
              <span>Comida</span>
              <select aria-label="Comida" [value]="slot()" (change)="slot.set($any($event.target).value)">
                @for (s of slots; track s[0]) { <option [value]="s[0]" [selected]="s[0] === slot()">{{ s[1] }}</option> }
              </select>
            </label>
          </div>
          <button type="button" class="btn primary" (click)="log()" [disabled]="saving()">Registrar</button>
        </article>

        <div class="actions"><button type="button" class="btn danger" (click)="remove()">Borrar receta</button></div>
      } @else if (!error()) { <p class="muted">Cargando…</p> }
      <p><a routerLink="/recetas">‹ Todas las recetas</a></p>
    </section>
  `,
})
export class RecipeDetailPage implements OnInit {
  readonly id = input.required<string>();
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly recipe = signal<Recipe | null>(null);
  protected readonly error = signal('');
  protected readonly servings = signal('1');
  protected readonly slot = signal(slotForNow());
  protected readonly slots = Object.entries(SLOT_NAMES);
  protected readonly saving = signal(false);
  private units = signal<Unit[]>([]);

  async ngOnInit(): Promise<void> {
    try { this.units.set((await this.api.reference()).units); this.recipe.set(await this.api.recipe(this.id())); } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected unitName(code: string | null, qty: number | null): string { return unitLabel(this.units(), code, qty); }

  protected async log(): Promise<void> {
    const s = Number(this.servings());
    if (!Number.isFinite(s) || s <= 0) { this.error.set('Indica las raciones (mayor que 0).'); return; }
    this.saving.set(true); this.error.set('');
    try {
      await this.api.createEntry({ date: todayIso(), mealSlot: this.slot(), items: [{ recipeId: this.id(), servings: s }] });
      await this.router.navigate(['/hoy']);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }

  protected async remove(): Promise<void> {
    if (!confirm('¿Borrar esta receta? Los registros del diario ya guardados no cambian.')) return;
    try { await this.api.deleteRecipe(this.id()); await this.router.navigate(['/recetas']); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
