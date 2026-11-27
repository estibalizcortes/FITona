import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { per100, reliability } from '../core/format';
import { Food } from '../core/models';
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
      @if (loaded() && foods().length === 0) {
        <div class="empty">
          <p>@if (query()) { Ningún alimento coincide con «{{ query() }}». } @else { Todavía no hay alimentos. }</p>
          <p class="muted">Puedes crear tu propio alimento con los valores de la etiqueta; se marca como «dato personalizado».</p>
        </div>
      }
      <ul class="results">
        @for (f of foods(); track f.variantId) {
          <li>
            <a class="result" [routerLink]="['/alimentos', f.variantId]">
              <strong>{{ f.displayName }}</strong>
              <span class="muted small">
                @if (prefs.mode() !== 'SIMPLE') { {{ kcal(f) }} por 100 g · }
                <span aria-hidden="true">{{ rel(f).symbol }}</span> {{ rel(f).label }}
                @if (!f.editable) { · {{ f.source }} }
              </span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
})
export class FoodsPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  protected readonly query = signal('');
  protected readonly foods = signal<Food[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');
  private timer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void { void this.load(''); }

  protected onInput(ev: Event): void {
    const q = (ev.target as HTMLInputElement).value;
    this.query.set(q);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.load(q), 200);
  }

  private async load(q: string): Promise<void> {
    try { this.foods.set(await this.api.searchFoods(q)); this.loaded.set(true); this.error.set(''); }
    catch (e) { this.error.set(errorMessage(e)); }
  }

  protected kcal(f: Food): string { return per100(f.per100, 'energyKcal', 'kcal'); }
  protected rel(f: Food) { return reliability(f.quality); }
}
