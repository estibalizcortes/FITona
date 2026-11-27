import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

      @if (templates().length > 0) {
        <h2>Recetas típicas</h2>
        <p class="muted small">Ejemplos con cantidades orientativas. Se copian a «Mis recetas» y puedes ajustarlas; los nutrientes los calcula FITona con el catálogo.</p>
        <ul class="results">
          @for (t of templates(); track t.key) {
            <li class="between card">
              <div><strong>{{ t.title }}</strong><br /><span class="muted small">{{ t.servings }} raciones · {{ t.ingredients }} ingredientes</span></div>
              <button type="button" class="btn" (click)="copy(t.key)" [disabled]="busy()">Añadir a mis recetas</button>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class RecipesPage implements OnInit {
  private readonly api = inject(Api);
  protected readonly prefs = inject(Prefs);
  protected readonly recipes = signal<RecipeSummary[]>([]);
  protected readonly loaded = signal(false);
  protected readonly templates = signal<{ key: string; title: string; servings: number; ingredients: number }[]>([]);
  protected readonly busy = signal(false);
  private readonly router = inject(Router);
  protected readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.recipes.set(await this.api.recipes());
      this.loaded.set(true);
      this.templates.set(await this.api.recipeTemplates());
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected async copy(key: string): Promise<void> {
    this.busy.set(true);
    try { const r = await this.api.copyRecipeTemplate(key); await this.router.navigate(['/recetas', r.id]); }
    catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
