import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { RecipeSummary } from '../core/models';
import { Prefs } from '../core/prefs';

@Component({
  selector: 'app-recipes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <div class="between">
        <h1>Recetas</h1>
        <a class="btn primary" routerLink="/recetas/nueva">Nueva receta</a>
      </div>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (loaded() && recipes().length === 0) {
        <div class="empty">
          <p>Aún no has guardado ninguna receta.</p>
          <p class="muted">Guarda p. ej. el potaje de tu madre una vez y registra «una ración» cuando lo comas.</p>
        </div>
      }
      <ul class="results">
        @for (r of recipes(); track r.id) {
          <li>
            <a class="result" [routerLink]="['/recetas', r.id]">
              <strong>{{ r.title }}</strong>
              <span class="muted small">
                {{ r.servings }} raciones
                @if (prefs.mode() !== 'SIMPLE' && r.energyKcalPerServing !== null) {
                  · {{ r.completeness === 'COMPLETE' ? '≈' : '≥' }} {{ r.energyKcalPerServing }} kcal por ración
                }
                @if (r.completeness !== 'COMPLETE') { · datos incompletos }
              </span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
})
export class RecipesPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  protected readonly recipes = signal<RecipeSummary[]>([]);
  protected readonly loaded = signal(false);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try { this.recipes.set(await this.api.recipes()); this.loaded.set(true); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
