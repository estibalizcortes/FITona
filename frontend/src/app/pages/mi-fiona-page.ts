import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Fiona, FionaPose } from '../shared/fiona';

/** «Mi Fiona»: base de la sección de la mascota (hoy, galería de sus gestos; después, su personalización). */
@Component({
  selector: 'app-mi-fiona-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Fiona],
  template: `
    <section>
      <h1>Mi Fiona</h1>
      <p class="muted">Fiona es un Pionus senilis: cabeza azul con frente y garganta blancas, cuerpo verde y plumas rojas bajo la cola. Estos son sus gestos en FITona. Pronto podrás personalizarla.</p>
      <div class="poses">
        @for (p of poses; track p.pose) {
          <figure class="pose"><app-fiona [pose]="p.pose" [size]="104" [label]="'Fiona ' + p.label" /><figcaption>{{ p.label }}</figcaption></figure>
        }
      </div>
      <div class="actions"><a class="btn" routerLink="/inicio">Volver al inicio</a></div>
    </section>
  `,
  styles: [`
    .poses { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .8rem; margin: 1rem 0; }
    .pose { margin: 0; text-align: center; background: var(--surface); border: 2px solid var(--border); border-radius: 22px; box-shadow: 0 4px 0 var(--border); padding: .8rem .4rem .6rem; }
    figcaption { font-weight: 800; margin-top: .3rem; }
  `],
})
export class MiFionaPage {
  protected readonly poses: { pose: FionaPose; label: string }[] = [
    { pose: 'greeting', label: 'saludando' }, { pose: 'cooking', label: 'cocinando' }, { pose: 'working', label: 'trabajando' },
    { pose: 'sport', label: 'haciendo deporte' }, { pose: 'saving', label: 'ahorrando' }, { pose: 'care', label: 'cuidándose' },
    { pose: 'celebrating', label: 'celebrando' }, { pose: 'resting', label: 'descansando' }, { pose: 'thinking', label: 'pensando' },
    { pose: 'waiting', label: 'esperando' }, { pose: 'waking', label: 'despertándose' },
  ];
}
