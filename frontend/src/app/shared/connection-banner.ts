import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Notice, ServerStatus } from '../core/server-status';
import { Fiona, FionaPose } from './fiona';

const TEXT: Record<Exclude<Notice, null>, { pose: FionaPose; title: string; body: string; retry: boolean }> = {
  offline: { pose: 'resting', title: 'Sin conexión a Internet', body: 'Puedes seguir viendo lo que ya está en pantalla. No se puede guardar ni consultar hasta que vuelva la conexión.', retry: false },
  waking: { pose: 'waking', title: 'Fiona está despertando al servidor', body: 'El servidor gratuito se duerme cuando no se usa y tarda entre 20 y 60 s en despertar. Puedes seguir por la app: los datos aparecerán solos.', retry: false },
  db: { pose: 'waking', title: 'Despertando la base de datos', body: 'El servidor ya responde. La base de datos gratuita tarda unos segundos en despertar tras un rato sin uso.', retry: false },
  slow: { pose: 'waiting', title: 'Esto tarda más de lo normal', body: 'El servidor responde pero la petición sigue en curso. Puedes esperar o reintentar.', retry: true },
  timeout: { pose: 'thinking', title: 'Tiempo de espera agotado', body: 'El servidor no ha respondido a tiempo. Reintenta; si se repite, puede haber un problema en el servidor.', retry: true },
  unreachable: { pose: 'thinking', title: 'No se puede conectar con el servidor', body: 'Hay conexión a Internet, pero el servidor no responde (puede estar parado o reiniciándose).', retry: true },
};

/** Aviso de conexión no bloqueante: dice qué pasa de verdad, ofrece reintentar y volver al inicio, y no tapa la app. */
@Component({
  selector: 'app-connection-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Fiona, RouterLink],
  template: `
    @if (info(); as i) {
      <aside class="conn" role="status" [attr.data-notice]="status.notice()">
        <app-fiona [pose]="i.pose" [size]="58" />
        <div class="grow">
          <strong>{{ i.title }}</strong>
          <p>{{ i.body }}</p>
          @if (status.pending() > 0) { <p class="small">Hay {{ status.pending() === 1 ? '1 cosa esperando' : status.pending() + ' cosas esperando' }} al servidor.</p> }
          <div class="conn-actions">
            @if (i.retry) { <button type="button" class="btn primary" (click)="retry()">Reintentar</button> }
            @if (!onHome()) { <a class="btn" routerLink="/inicio">Volver al inicio</a> }
          </div>
        </div>
      </aside>
    }
  `,
  styles: [`
    .conn { display: flex; gap: .6rem; align-items: center; padding: .6rem 1rem; padding-top: calc(.6rem + env(safe-area-inset-top)); background: var(--warn-bg); color: var(--warn-text); border-bottom: 2px solid var(--border); }
    .conn[data-notice='offline'], .conn[data-notice='timeout'], .conn[data-notice='unreachable'] { background: var(--err-bg); color: var(--err-text); }
    .conn p { margin: .15rem 0 0; font-size: .86rem; font-weight: 600; }
    .conn-actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .4rem; }
    .conn-actions .btn { min-height: 40px; padding: .2rem 1rem; font-size: .9rem; }
  `],
})
export class ConnectionBanner {
  protected readonly status = inject(ServerStatus);
  private readonly router = inject(Router);
  protected readonly info = computed(() => { const n = this.status.notice(); return n ? TEXT[n] : null; });
  protected onHome(): boolean { return this.router.url.split('?')[0] === '/inicio'; }

  /** Recarga la pantalla actual (vuelve a pedir sus datos) y vuelve a despertar el servidor. */
  protected retry(): void {
    this.status.retry();
    void this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
  }
}
