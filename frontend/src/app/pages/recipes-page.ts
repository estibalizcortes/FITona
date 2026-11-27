import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { RecipeSummary, TemplateSummary } from '../core/models';
import { Prefs } from '../core/prefs';

/** Minúsculas y sin tildes, para buscar «platano» y encontrar «Plátano». */
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

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
      <div class="tabs" role="tablist">
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'mine'" (click)="tab.set('mine')">Mis recetas ({{ recipes().length }})</button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'typical'" (click)="tab.set('typical')">Recetas típicas ({{ templates().length }})</button>
      </div>
      <label class="field">
        <span class="sr-only">Buscar</span>
        <input type="search" aria-label="Buscar receta" placeholder="Buscar por nombre o ingrediente (p. ej. garbanzos)" [value]="query()" (input)="query.set($any($event.target).value)" />
      </label>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }

      @if (tab() === 'mine') {
        @if (loaded() && recipes().length === 0) {
          <div class="empty">
            <p>Aún no tienes recetas propias.</p>
            <p class="muted">Mira las <button type="button" class="link" (click)="tab.set('typical')">recetas típicas</button>, adáptalas a tu forma de cocinar (cambia el nombre, quita ingredientes…) y se guardan aquí.</p>
          </div>
        } @else if (loaded() && myList().length === 0) { <p class="muted">Ninguna de tus recetas coincide con «{{ query() }}».</p> }
        <ul class="results">
          @for (r of myList(); track r.id) {
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
      } @else {
        <p class="muted small">Ejemplos con medidas naturales. Ábrelas, adáptalas a tu forma de hacerlas y se guardan en «Mis recetas»; los nutrientes los calcula FITona con el catálogo.</p>
        @if (typicalList().length === 0) { <p class="muted">Ninguna receta típica coincide con «{{ query() }}».</p> }
        <ul class="results">
          @for (t of typicalList(); track t.key) {
            <li class="between card">
              <a class="grow" [routerLink]="['/recetas/tipicas', t.key]">
                <strong>{{ t.title }}</strong><br />
                <span class="muted small">{{ t.servings }} raciones · {{ t.ingredientNames.join(', ') }}</span>
              </a>
              <button type="button" class="btn" (click)="copy(t.key)" [disabled]="busy()">Adaptar</button>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class RecipesPage implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly prefs = inject(Prefs);
  protected readonly recipes = signal<RecipeSummary[]>([]);
  protected readonly templates = signal<TemplateSummary[]>([]);
  protected readonly loaded = signal(false);
  protected readonly tab = signal<'mine' | 'typical'>('mine');
  protected readonly query = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly myList = computed(() => {
    const q = norm(this.query().trim());
    return this.recipes().filter((r) => !q || norm(r.title).includes(q));
  });
  protected readonly typicalList = computed(() => {
    const q = norm(this.query().trim());
    return this.templates().filter((t) => !q || norm(t.title).includes(q) || t.ingredientNames.some((n) => norm(n).includes(q)));
  });

  async ngOnInit(): Promise<void> {
    try {
      this.recipes.set(await this.api.recipes());
      this.templates.set(await this.api.recipeTemplates());
      this.loaded.set(true);
      if (this.recipes().length === 0) this.tab.set('typical');
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  /** Copia la receta típica a «Mis recetas» y abre el editor para adaptarla (nombre, ingredientes, cantidades). */
  protected async copy(key: string): Promise<void> {
    this.busy.set(true);
    try { const r = await this.api.copyRecipeTemplate(key); await this.router.navigate(['/recetas', r.id, 'editar']); }
    catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
