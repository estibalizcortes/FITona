import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { per100, reliability } from '../core/format';
import { Food, FoodCategory } from '../core/models';
import { Prefs } from '../core/prefs';

/** Buscador de alimentos (propios + catálogo) con filtro por categoría. Los más usados salen primero. */
@Component({
  selector: 'app-food-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="row">
      <label class="field">
        <span>Buscar alimento</span>
        <input type="search" [value]="query()" (input)="onInput($event)" placeholder="p. ej. manzana, arroz…" autocomplete="off" />
      </label>
      <label class="field">
        <span>Categoría</span>
        <select aria-label="Categoría" [value]="category()" (change)="onCategory($event)">
          <option value="">Todas</option>
          @for (c of categories(); track c.code) { <option [value]="c.code" [selected]="c.code === category()">{{ c.icon }} {{ c.name }} ({{ c.count }})</option> }
        </select>
      </label>
    </div>
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    @if (loaded() && results().length === 0) {
      <p class="muted">
        No hay alimentos@if (query()) { que coincidan con «{{ query() }}» }.
        <a routerLink="/alimentos/nuevo">Crear alimento propio</a>
      </p>
    }
    <ul class="results" aria-live="polite">
      @for (f of results(); track f.variantId) {
        <li>
          <button type="button" class="result with-icon" (click)="picked.emit(f)">
            <span class="icon" aria-hidden="true">{{ f.icon || '🍽️' }}</span>
            <span class="grow">
              <strong>{{ f.displayName }}</strong>
              <span class="muted small block">
                @if (!f.hasNutrients) { Sin datos nutricionales }
                @else {
                  @if (prefs.mode() !== 'SIMPLE') { {{ kcal(f) }} por 100 g · }
                  <span [title]="rel(f).label"><span aria-hidden="true">{{ rel(f).symbol }}</span> {{ rel(f).label }}</span>
                }
                @if (f.overridesCatalog) { · tus valores }
              </span>
            </span>
          </button>
        </li>
      }
    </ul>
  `,
})
export class FoodPicker implements OnInit {
  readonly picked = output<Food>();
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  protected readonly query = signal('');
  protected readonly category = signal('');
  protected readonly categories = signal<FoodCategory[]>([]);
  protected readonly results = signal<Food[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;
  private seq = 0;

  ngOnInit(): void {
    void this.search();
    this.api.foodCategories().then((c) => this.categories.set(c)).catch((e) => this.error.set(errorMessage(e)));
  }

  protected onInput(ev: Event): void {
    this.query.set((ev.target as HTMLInputElement).value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.search(), 200);
  }

  protected onCategory(ev: Event): void {
    this.category.set((ev.target as HTMLSelectElement).value);
    void this.search();
  }

  private async search(): Promise<void> {
    const mine = ++this.seq;
    try {
      const r = await this.api.searchFoods(this.query(), this.category() || null, this.category() ? 80 : 25);
      if (mine === this.seq) { this.results.set(r); this.loaded.set(true); this.error.set(''); }
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected kcal(f: Food): string { return per100(f.per100, 'energyKcal', 'kcal'); }
  protected rel(f: Food) { return reliability(f.quality); }
}
