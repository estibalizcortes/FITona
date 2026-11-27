import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { HomePrefs } from '../core/home-prefs';
import { todayIso } from '../core/format';
import { Fiona } from '../shared/fiona';

/** Pantalla principal de FITona: Fiona te saluda y los seis módulos. Se pinta al instante desde lo local; los datos llegan después. */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Fiona],
  template: `
    <section class="home">
      <header class="hello">
        <app-fiona pose="greeting" [size]="112" label="Fiona saluda" />
        <div class="bubble">
          <h1>{{ greeting() }}</h1>
          <p class="muted">{{ today() }} · ¿Qué hacemos hoy?</p>
        </div>
      </header>

      <nav class="modules" aria-label="Módulos">
        @for (m of prefs.visible(); track m.id) {
          <a class="module m-{{ m.id }}" [routerLink]="m.home">
            <span class="art"><app-fiona [pose]="m.pose" [size]="84" /></span>
            <strong>{{ m.name }}</strong>
            <span class="desc">{{ m.description }}</span>
            @if (prefs.indicators()) {
              @if (stats()[m.id]) { <span class="stat">{{ stats()[m.id] }}</span> }
              @else if (loading() && (m.id === 'food' || m.id === 'work')) { <span class="stat-skel skeleton" aria-hidden="true"></span> }
            }
          </a>
        }
        @for (m of prefs.soon(); track m.id) {
          <div class="module soon m-{{ m.id }}" aria-label="{{ m.name }}, próximamente">
            <span class="ribbon">Próximamente</span>
            <span class="art"><app-fiona [pose]="m.pose" [size]="84" /></span>
            <strong>{{ m.name }}</strong>
            <span class="desc">{{ m.description }}</span>
          </div>
        }
      </nav>

      <div class="actions">
        <button type="button" class="btn" [attr.aria-expanded]="editing()" (click)="editing.set(!editing())">{{ editing() ? 'Listo' : 'Personalizar' }}</button>
      </div>

      @if (editing()) {
        <article class="card customize" aria-label="Personalizar la pantalla principal">
          <h2>Orden y módulos visibles</h2>
          <ul class="items">
            @for (m of prefs.all(); track m.id; let first = $first; let last = $last) {
              <li>
                <span class="name" [class.off]="prefs.isHidden(m.id)">{{ m.name }}</span>
                <button type="button" class="icon-btn" [disabled]="first" (click)="prefs.move(m.id, -1)" [attr.aria-label]="'Subir ' + m.name">↑</button>
                <button type="button" class="icon-btn" [disabled]="last" (click)="prefs.move(m.id, 1)" [attr.aria-label]="'Bajar ' + m.name">↓</button>
                <button type="button" class="btn" (click)="prefs.toggle(m.id)" [attr.aria-pressed]="!prefs.isHidden(m.id)">{{ prefs.isHidden(m.id) ? 'Mostrar' : 'Ocultar' }}</button>
              </li>
            }
          </ul>
          <label class="check"><input type="checkbox" [checked]="prefs.indicators()" (change)="prefs.setIndicators($any($event.target).checked)" />
            <span>Mostrar en las tarjetas los datos de hoy (solo si ya hay registros).</span></label>
          <p class="muted small">Estas preferencias se guardan en tu cuenta: serán las mismas en tu iPhone y en el ordenador.</p>
        </article>
      }
    </section>
  `,
})
export class HomePage {
  protected readonly prefs = inject(HomePrefs);
  private readonly api = inject(Api);
  protected readonly editing = signal(false);
  protected readonly stats = signal<Record<string, string>>({});
  protected readonly loading = signal(false);

  constructor() {
    void this.load();
  }

  protected greeting(): string {
    const h = new Date().getHours();
    return h < 6 || h >= 21 ? '¡Buenas noches!' : h < 14 ? '¡Buenos días!' : '¡Buenas tardes!';
  }
  protected today(): string {
    const t = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /**
   * Una sola petición trae las preferencias de la cuenta y el resumen de hoy. La pantalla ya está pintada con la copia local:
   * esto solo la actualiza, y un fallo no molesta (el aviso de conexión ya lo explica).
   */
  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const h = await this.api.home(todayIso());
      this.prefs.adopt(h.preferences);
      const out: Record<string, string> = {};
      if (h.foodEntries > 0) out['food'] = h.foodKcal != null ? `Hoy ≈ ${Math.round(h.foodKcal)} kcal` : `${h.foodEntries} registros hoy`;
      if (h.workEntries > 0) out['work'] = h.workEntries === 1 ? '1 registro hoy' : `${h.workEntries} registros hoy`;
      this.stats.set(out);
    } catch { /* sin datos: las tarjetas quedan sin cifras */ }
    this.loading.set(false);
  }
}
