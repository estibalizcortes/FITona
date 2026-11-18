import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Api, errorMessage } from '../core/api';
import { devUserId } from '../core/identity';

@Component({
  selector: 'app-me-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h1>Yo</h1>

      <article class="card">
        <h2>Modo de uso</h2>
        <p>Arriba a la derecha puedes cambiar entre <strong>Sencillo</strong> (sin cifras), <strong>Equilibrado</strong>
          (energía aproximada) y <strong>Avanzado</strong> (energía y macros). Cambiar de modo no borra ni oculta datos guardados.</p>
      </article>

      <article class="card">
        <h2>Tus datos</h2>
        <p class="muted">Son tuyos: puedes descargarlos o borrar tu cuenta cuando quieras.</p>
        <div class="actions">
          <button type="button" class="btn" (click)="download()">Descargar mis datos (JSON)</button>
          <button type="button" class="btn danger" (click)="deleteAll()">Borrar mi cuenta y todos mis datos</button>
        </div>
        @if (message()) { <p class="ok" role="status">{{ message() }}</p> }
        @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      </article>

      <article class="card">
        <h2>Estado de esta versión</h2>
        <p class="warn">Esta es una versión de <strong>desarrollo</strong>: no hay cuenta con correo ni contraseña todavía.
          Tu identificador en este navegador es <code>{{ id }}</code>; quien lo conozca podría ver tus datos y,
          si borras los datos del navegador, pierdes el acceso. No introduzcas datos que no quieras perder.</p>
        <p class="muted">Aún no existen: plan semanal, despensa, lista de la compra, asistente de IA ni actividad física.</p>
      </article>
    </section>
  `,
})
export class MePage {
  private readonly api = inject(Api);
  protected readonly id = devUserId();
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected async download(): Promise<void> {
    this.error.set(''); this.message.set('');
    try {
      const data = await this.api.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'fitona-mis-datos.json'; a.click();
      URL.revokeObjectURL(url);
      this.message.set('Descarga iniciada.');
    } catch (e) { this.error.set(errorMessage(e)); }
  }

  protected async deleteAll(): Promise<void> {
    if (!confirm('Se borrarán TODOS tus alimentos, recetas y registros. No se puede deshacer. ¿Continuar?')) return;
    this.error.set(''); this.message.set('');
    try { await this.api.deleteAccount(); this.message.set('Tus datos se han borrado.'); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
