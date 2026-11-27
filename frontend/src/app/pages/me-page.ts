import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Api, errorMessage } from '../core/api';
import { Router } from '@angular/router';
import { Install } from '../core/install';
import { Session } from '../core/session';

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
        <h2>Instalar FITona en tu móvil</h2>
        @if (install.standalone()) {
          <p class="ok" role="status">Ya estás usando FITona como app.</p>
        } @else if (install.canPrompt()) {
          <p class="muted">Se abre a pantalla completa, con su icono, como cualquier otra app.</p>
          <div class="actions"><button type="button" class="btn primary" (click)="install.prompt()">Instalar FITona</button></div>
        } @else if (install.ios) {
          <p>En el iPhone: abre esta página en <strong>Safari</strong>, pulsa <strong>Compartir</strong> (el cuadrado con la flecha) y elige <strong>Añadir a pantalla de inicio</strong>.</p>
        } @else {
          <p class="muted">En Android: menú de Chrome (⋮) → <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</p>
        }
      </article>

      <article class="card">
        <h2>Tu cuenta</h2>
        <p>Has entrado como <strong>{{ session.email() }}</strong>.</p>
        <div class="actions"><button type="button" class="btn" (click)="signOut()">Cerrar sesión</button></div>
      </article>

      <article class="card">
        <h2>Estado de esta versión</h2>
        <p class="warn">Versión de pruebas. No se puede recuperar la contraseña si se olvida (aún no se envían correos): descarga tus datos de vez en cuando.</p>
        <p class="muted">Aún no existen: plan semanal, despensa, lista de la compra, asistente de IA ni actividad física.</p>
      </article>
    </section>
  `,
})
export class MePage {
  private readonly api = inject(Api);
  protected readonly session = inject(Session);
  protected readonly install = inject(Install);
  private readonly router = inject(Router);
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

  protected async signOut(): Promise<void> {
    try { await this.api.logout(); } catch { /* aunque falle la red, se cierra en este dispositivo */ }
    this.session.close();
    await this.router.navigate(['/entrar']);
  }

  protected async deleteAll(): Promise<void> {
    if (!confirm('Se borrarán TODOS tus alimentos, recetas y registros. No se puede deshacer. ¿Continuar?')) return;
    this.error.set(''); this.message.set('');
    try { await this.api.deleteAccount(); this.session.close(); await this.router.navigate(['/entrar']); } catch (e) { this.error.set(errorMessage(e)); }
  }
}
