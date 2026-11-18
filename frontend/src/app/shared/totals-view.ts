import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { formatValue, hasFigures, reliability } from '../core/format';
import { Prefs } from '../core/prefs';
import { Totals } from '../core/models';

/**
 * Nutrientes de un elemento, comida o día, según el modo de uso:
 * SIMPLE no muestra cifras; EQUILIBRADO solo energía aproximada; AVANZADO energía y macros.
 * Siempre indica la fiabilidad con símbolo y texto, y marca los valores incompletos.
 */
@Component({
  selector: 'app-totals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mode() !== 'SIMPLE' && totals(); as t) {
      @if (figures()) {
        <p class="totals" [attr.aria-label]="ariaLabel()">
          <span class="kcal">{{ energy() }}</span>
          @if (mode() === 'ADVANCED') {
            <span>P {{ macro('proteinG') }}</span>
            <span>H {{ macro('carbsG') }}</span>
            <span>G {{ macro('fatG') }}</span>
            <span>Fibra {{ macro('fiberG') }}</span>
          }
          <span class="rel" [title]="rel().label"><span aria-hidden="true">{{ rel().symbol }}</span> {{ rel().label }}</span>
        </p>
      } @else {
        <p class="totals muted">Sin cifras</p>
      }
    }
  `,
})
export class TotalsView {
  readonly totals = input.required<Totals>();
  private readonly prefs = inject(Prefs);
  protected readonly mode = this.prefs.mode;
  protected readonly figures = computed(() => hasFigures(this.totals()));
  protected readonly rel = computed(() => reliability(this.totals().quality));
  protected readonly energy = computed(() => formatValue(this.totals(), 'energyKcal', 'kcal'));
  protected readonly ariaLabel = computed(() => `Energía ${this.energy()}. ${this.rel().label}.`);

  protected macro(key: 'proteinG' | 'carbsG' | 'fatG' | 'fiberG'): string {
    const t = this.totals();
    const v = t.nutrients[key];
    return v && v.value !== null && v.value !== undefined ? `${v.complete ? '' : '≥ '}${v.value} g` : 'sin dato';
  }
}
