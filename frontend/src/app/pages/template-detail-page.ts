import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { showQty, unitLabel } from '../core/format';
import { TemplateDetail, Unit } from '../core/models';

@Component({
  selector: 'app-template-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      @if (t(); as r) {
        <h1>{{ r.title }}</h1>
        <p class="muted">Receta típica · {{ r.servings }} raciones</p>
        @if (r.description) { <p>{{ r.description }}</p> }
        <h2>Ingredientes</h2>
        <ul class="items">
          @for (i of r.ingredients; track $index) {
            <li>{{ i.food }} <span class="muted">· {{ qty(i.quantity) }} {{ unit(i.unit, i.quantity) }}@if (i.note) { · {{ i.note }} }</span></li>
          }
        </ul>
        <h2>Pasos</h2>
        <ol class="steps">@for (s of r.steps; track $index) { <li>{{ s }}</li> }</ol>
        <p class="muted small">Los tiempos y temperaturas son orientativos: ajústalos a tu aparato y comprueba siempre que los alimentos estén bien hechos por dentro.</p>
        <div class="actions">
          <button type="button" class="btn primary big" (click)="copy()" [disabled]="busy()">Adaptar y guardar en mis recetas</button>
        </div>
      }
      <p><a routerLink="/recetas">‹ Todas las recetas</a></p>
    </section>
  `,
})
export class TemplateDetailPage implements OnInit {
  readonly key = input.required<string>();
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  protected readonly t = signal<TemplateDetail | null>(null);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  private units = signal<Unit[]>([]);

  async ngOnInit(): Promise<void> {
    try { this.units.set((await this.api.reference()).units); this.t.set(await this.api.recipeTemplate(this.key())); } catch (e) { this.error.set(errorMessage(e)); }
  }
  protected qty(q: number): string { return showQty(q); }
  protected unit(code: string, q: number): string { return unitLabel(this.units(), code, q); }

  protected async copy(): Promise<void> {
    this.busy.set(true);
    try { const r = await this.api.copyRecipeTemplate(this.key()); await this.router.navigate(['/recetas', r.id, 'editar']); }
    catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
