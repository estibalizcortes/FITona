import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Api, errorMessage } from '../core/api';
import { Router, RouterLink } from '@angular/router';
import { Install } from '../core/install';
import { Session } from '../core/session';
import { ServerStatus } from '../core/server-status';

@Component({
  selector: 'app-me-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>Yo</h1>

      @if (!module() || module() === 'food') {
      <article class="card">
        <h2>Perfil nutricional</h2>
        <p class="muted">Tus datos (altura, peso, actividad…) para calcular tu objetivo calórico orientativo.</p>
        <div class="actions"><a class="btn primary" routerLink="/yo/perfil">Abrir mi perfil nutricional</a> <a class="btn" routerLink="/alimentos">Mis alimentos</a></div>
      </article>

      <article class="card">
        <h2>Modo de uso</h2>
        <p>Arriba a la derecha puedes cambiar entre <strong>Sencillo</strong> (sin cifras), <strong>Equilibrado</strong>
          (energía aproximada) y <strong>Avanzado</strong> (energía y macros). Cambiar de modo no borra ni oculta datos guardados.</p>
      </article>
      }

      <article class="card">
        <h2>Mi Fiona</h2>
        <p class="muted">Conoce a Fiona, la mascota de FITona. Pronto podrás personalizarla.</p>
        <div class="actions"><a class="btn" routerLink="/mi-fiona">Ver a Fiona</a></div>
      </article>

      <article class="card">
        <h2>Estado del servidor</h2>
        @if (status.info(); as i) {
          <ul class="items">
            <li>Respuesta del servidor: <strong>{{ i.rttMs }} ms</strong> (desde este dispositivo)</li>
            <li>Servidor encendido desde hace: <strong>{{ uptimeText(i.uptimeSeconds) }}</strong>{{ i.uptimeSeconds < 120 ? ' (acaba de despertar)' : '' }}</li>
            <li>Base de datos: <strong>{{ i.db === 'ok' ? 'responde' : i.db === 'slow' ? 'lenta (despertando)' : 'no responde' }}</strong> ({{ i.dbMs }} ms)</li>
          </ul>
        } @else { <p class="muted">Aún no hay datos de esta sesión.</p> }
        <div class="actions"><button type="button" class="btn" (click)="status.wake()">Comprobar ahora</button></div>
        <p class="muted small">Es una única consulta que no lleva datos tuyos. Sirve para saber si el servidor gratuito estaba dormido.</p>
      </article>

      <article class="card">
        <h2>Módulos</h2>
        <div class="actions"><a class="btn" routerLink="/inicio">Cambiar de módulo</a></div>
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
  /** 'work' desde /trabajo/yo (route data): oculta lo que es solo del módulo Comida. */
  readonly module = input<string | undefined>();
  protected readonly status = inject(ServerStatus);
  protected uptimeText(s: number): string { return s < 90 ? `${s} s` : s < 5400 ? `${Math.round(s / 60)} min` : `${Math.round(s / 3600)} h`; }
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
