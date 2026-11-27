import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { per100, reliability } from '../core/format';
import { Food, FoodCategory } from '../core/models';
import { Prefs } from '../core/prefs';

@Component({
  selector: 'app-foods-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <div class="between">
        <h1>Alimentos</h1>
        <a class="btn primary" routerLink="/alimentos/nuevo">Crear alimento</a>
      </div>
      <label class="field">
        <span>Buscar</span>
        <input type="search" [value]="query()" (input)="onInput($event)" placeholder="Nombre del alimento" autocomplete="off" />
      </label>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

      @if (!query() && !category()) {
        <h2>Categorías</h2>
        <ul class="tiles">
          @for (c of categories(); track c.code) {
            <li>
              <button type="button" class="tile" (click)="pick(c.code)">
                <span class="icon" aria-hidden="true">{{ c.icon }}</span>
                <strong>{{ c.name }}</strong>
                <span class="muted small">{{ c.count }}</span>
              </button>
            </li>
          }
        </ul>
        <p class="muted small">Si un alimento poco habitual no está, <a routerLink="/alimentos/nuevo">añádelo tú</a>.</p>
      } @else {
        <div class="between">
          <button type="button" class="link" (click)="back()">‹ Categorías</button>
          @if (category()) { <strong>{{ categoryLabel() }}</strong> }
        </div>
        @if (loaded() && foods().length === 0) {
          <div class="empty">
            <p>@if (query()) { Ningún alimento coincide con «{{ query() }}». } @else { No hay alimentos en esta categoría. }</p>
            <p class="muted">Puedes crear tu propio alimento con los valores de la etiqueta.</p>
          </div>
        }
        <ul class="results">
          @for (f of foods(); track f.variantId) {
            <li>
              <a class="result with-icon" [routerLink]="['/alimentos', f.variantId]">
                <span class="icon" aria-hidden="true">{{ f.icon || '🍽️' }}</span>
                <span class="grow">
                  <strong>{{ f.displayName }}</strong>
                  <span class="muted small block">
                    @if (!f.hasNutrients) { Sin datos nutricionales · pon tus valores }
                    @else {
                      @if (prefs.mode() !== 'SIMPLE') { {{ kcal(f) }} por 100 g · }
                      <span aria-hidden="true">{{ rel(f).symbol }}</span> {{ rel(f).label }}
                    }
                    @if (f.overridesCatalog) { · tus valores }
                    @if (!f.editable && f.hasNutrients) { · sin verificar }
                  </span>
                </span>
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class FoodsPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  protected readonly query = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly categories = signal<FoodCategory[]>([]);
  protected readonly foods = signal<Food[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    try { this.categories.set(await this.api.foodCategories()); } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected categoryLabel(): string {
    const c = this.categories().find((x) => x.code === this.category());
    return c ? `${c.icon} ${c.name}` : '';
  }

  protected onInput(ev: Event): void {
    this.query.set((ev.target as HTMLInputElement).value);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.load(), 200);
  }

  protected pick(code: string): void { this.category.set(code); void this.load(); }

  protected back(): void { this.category.set(null); this.query.set(''); this.foods.set([]); this.loaded.set(false); }

  private async load(): Promise<void> {
    if (!this.query() && !this.category()) { this.foods.set([]); this.loaded.set(false); return; }
    try {
      this.foods.set(await this.api.searchFoods(this.query(), this.category(), 200));
      this.loaded.set(true);
      this.error.set('');
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected kcal(f: Food): string { return per100(f.per100, 'energyKcal', 'kcal'); }
  protected rel(f: Food) { return reliability(f.quality); }
}
