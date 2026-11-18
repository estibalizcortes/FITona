import { ChangeDetectionStrategy, Component, OnInit, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { per100, reliability } from '../core/format';
import { Food } from '../core/models';
import { Prefs } from '../core/prefs';

/** Buscador de alimentos (propios + catálogo). Los más usados salen primero. */
@Component({
  selector: 'app-food-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <label class="field">
      <span>Buscar alimento</span>
      <input type="search" [value]="query()" (input)="onInput($event)" placeholder="p. ej. manzana, arroz…" autocomplete="off" />
    </label>
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
          <button type="button" class="result" (click)="picked.emit(f)">
            <strong>{{ f.displayName }}</strong>
            <span class="muted small">
              @if (prefs.mode() !== 'SIMPLE') { {{ kcal(f) }} por 100 g · }
              <span [title]="rel(f).label"><span aria-hidden="true">{{ rel(f).symbol }}</span> {{ rel(f).label }}</span>
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
  protected readonly results = signal<Food[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;
  private seq = 0;

  ngOnInit(): void { void this.search(''); }

  protected onInput(ev: Event): void {
    const q = (ev.target as HTMLInputElement).value;
    this.query.set(q);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.search(q), 200);
  }

  private async search(q: string): Promise<void> {
    const mine = ++this.seq;
    try {
      const r = await this.api.searchFoods(q);
      if (mine === this.seq) { this.results.set(r); this.loaded.set(true); this.error.set(''); }
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected kcal(f: Food): string { return per100(f.per100, 'energyKcal', 'kcal'); }
  protected rel(f: Food) { return reliability(f.quality); }
}
