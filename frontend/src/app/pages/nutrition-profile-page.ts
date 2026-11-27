import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { EnergyTargetResult, NutritionProfile } from '../core/models';

/** Mensajes (sin culpa) para los avisos que devuelve el motor de cálculo. */
const NOTES: Record<string, string> = {
  FLOOR_APPLIED: 'Para no quedarte corta/o de energía, el objetivo no baja del mínimo de seguridad (1.200 kcal en mujeres, 1.500 en hombres).',
  LOW_BMI_NO_DEFICIT: 'Con tu peso y altura actuales no se recomienda un déficit: el objetivo es de mantenimiento. Si te preocupa tu peso, habla con un profesional sanitario.',
  TARGET_NOT_BELOW: 'Tu peso objetivo no es menor que el actual, así que no se aplica déficit.',
  TARGET_BELOW_HEALTHY_BMI: 'Tu peso objetivo queda por debajo de un rango saludable (IMC < 18,5). Conviene hablarlo con un profesional sanitario.',
};

@Component({
  selector: 'app-nutrition-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>Perfil nutricional</h1>
      <p class="muted">Con estos datos FITona estima cuántas calorías te orientan cada día. Es una referencia, no una obligación.</p>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <form (submit)="save($event)">
        <div class="row">
          <label class="field"><span>Sexo</span>
            <select aria-label="Sexo" [value]="p().sex" (change)="set('sex', $any($event.target).value)">
              <option value="F" [selected]="p().sex === 'F'">Mujer</option><option value="M" [selected]="p().sex === 'M'">Hombre</option>
            </select></label>
          <label class="field"><span>Edad (años)</span>
            <input type="number" inputmode="numeric" min="18" max="100" required [value]="p().ageYears" (input)="setNum('ageYears', $event)" /></label>
        </div>
        <div class="row">
          <label class="field"><span>Altura (cm)</span>
            <input type="number" inputmode="decimal" step="any" min="120" max="230" required [value]="p().heightCm" (input)="setNum('heightCm', $event)" /></label>
          <label class="field"><span>Peso actual (kg)</span>
            <input type="number" inputmode="decimal" step="any" min="30" max="300" required [value]="p().weightKg" (input)="setNum('weightKg', $event)" /></label>
        </div>
        <label class="field"><span>Peso objetivo (kg)</span>
          <input type="number" inputmode="decimal" step="any" min="30" max="300" required [value]="p().targetWeightKg" (input)="setNum('targetWeightKg', $event)" /></label>
        <label class="field"><span>Actividad diaria (fuera del trabajo y el deporte)</span>
          <select aria-label="Actividad diaria" [value]="p().dailyActivity" (change)="set('dailyActivity', $any($event.target).value)">
            <option value="LOW" [selected]="p().dailyActivity === 'LOW'">Baja: pocos desplazamientos</option>
            <option value="MODERATE" [selected]="p().dailyActivity === 'MODERATE'">Moderada: camino y me muevo a diario</option>
            <option value="HIGH" [selected]="p().dailyActivity === 'HIGH'">Alta: casi siempre en movimiento</option>
          </select></label>
        <label class="field"><span>Tipo de trabajo</span>
          <select aria-label="Tipo de trabajo" [value]="p().jobType" (change)="set('jobType', $any($event.target).value)">
            <option value="DESK" [selected]="p().jobType === 'DESK'">De escritorio (sentada/o)</option>
            <option value="ON_FEET" [selected]="p().jobType === 'ON_FEET'">De pie o con movimiento ligero</option>
            <option value="PHYSICAL" [selected]="p().jobType === 'PHYSICAL'">Físico (esfuerzo)</option>
          </select></label>
        <label class="field"><span>Deporte semanal (horas)</span>
          <input type="number" inputmode="decimal" step="any" min="0" max="40" required [value]="p().sportHoursWeek" (input)="setNum('sportHoursWeek', $event)" /></label>
        <label class="field"><span>Modo</span>
          <select aria-label="Modo" [value]="p().mode" (change)="set('mode', $any($event.target).value)">
            <option value="MAINTAIN" [selected]="p().mode === 'MAINTAIN'">Mantenimiento</option>
            <option value="DEFICIT" [selected]="p().mode === 'DEFICIT'">Déficit moderado (≈ 15 % menos)</option>
          </select></label>
        <div class="actions"><button type="submit" class="btn primary big" [disabled]="saving()">{{ saving() ? 'Guardando…' : 'Guardar perfil' }}</button></div>
      </form>

      @if (result(); as r) {
        <article class="card" aria-live="polite">
          <h2>Tu objetivo orientativo</h2>
          <p class="big-number"><strong>≈ {{ r.target }} kcal</strong> al día</p>
          <ul class="items">
            <li class="between"><span>Metabolismo basal</span><span>≈ {{ r.bmr }} kcal</span></li>
            <li class="between"><span>Mantenimiento (con tu actividad)</span><span>≈ {{ r.maintenance }} kcal</span></li>
            @if (r.deficit > 0) { <li class="between"><span>Déficit aplicado</span><span>≈ {{ r.deficit }} kcal</span></li> }
            <li class="between"><span>IMC actual</span><span>{{ r.bmi }}</span></li>
          </ul>
          @for (n of r.notes; track n) { <p class="warn" role="note">{{ noteText(n) }}</p> }
          <p class="muted small">Estimación con la fórmula de Mifflin-St Jeor y tu actividad, el trabajo y el deporte como promedio semanal (no se «compensa» día a día). No es consejo médico ni dietético.</p>
          <a class="btn" routerLink="/hoy">Ver «Hoy»</a> <a class="btn" routerLink="/plan">Hacer el plan del día</a>
        </article>
      }
    </section>
  `,
})
export class NutritionProfilePage implements OnInit {
  private readonly api = inject(Api);
  protected readonly p = signal<NutritionProfile>({ sex: 'F', ageYears: 30, heightCm: 165, weightKg: 65, targetWeightKg: 62, dailyActivity: 'MODERATE', jobType: 'DESK', sportHoursWeek: 2, mode: 'MAINTAIN' });
  protected readonly result = signal<EnergyTargetResult | null>(null);
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const saved = await this.api.nutritionProfile();
      if (saved) { const { target, ...profile } = saved; this.p.set(profile); this.result.set(target); }
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected set<K extends keyof NutritionProfile>(k: K, v: NutritionProfile[K]): void { this.p.update((x) => ({ ...x, [k]: v })); }
  protected setNum(k: 'ageYears' | 'heightCm' | 'weightKg' | 'targetWeightKg' | 'sportHoursWeek', ev: Event): void {
    this.set(k, Number((ev.target as HTMLInputElement).value));
  }
  protected noteText(code: string): string { return NOTES[code] ?? code; }

  protected async save(ev: Event): Promise<void> {
    ev.preventDefault();
    this.saving.set(true); this.error.set('');
    try { this.result.set((await this.api.saveNutritionProfile(this.p())).target); } catch (e) { this.error.set(errorMessage(e)); } finally { this.saving.set(false); }
  }
}
