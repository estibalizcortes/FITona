import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api, errorMessage } from '../core/api';
import { Session } from '../core/session';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>{{ creating() ? 'Crear cuenta' : 'Entrar' }}</h1>
      <p class="muted">Tu cuenta guarda tus alimentos, recetas y registros para que no los pierdas si cambias de móvil.</p>
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
      <form (submit)="submit($event)">
        <label class="field">
          <span>Correo electrónico</span>
          <input type="email" required autocomplete="email" maxlength="254" [value]="email()" (input)="email.set($any($event.target).value)" />
        </label>
        <label class="field">
          <span>Contraseña</span>
          <input type="password" required [attr.autocomplete]="creating() ? 'new-password' : 'current-password'" maxlength="128" [value]="password()" (input)="password.set($any($event.target).value)" />
          @if (creating()) {
            <small class="muted">Mínimo 4 caracteres.</small>
            @if (password().length > 0 && password().length < 8) {
              <small class="warn" role="status">Contraseña muy débil: quien conozca tu correo podría adivinarla. Si puedes, usa 8 o más caracteres.</small>
            }
          }
        </label>
        @if (creating()) {
          <label class="check"><input type="checkbox" [checked]="adult()" (change)="adult.set($any($event.target).checked)" /> Soy mayor de edad.</label>
          <label class="check"><input type="checkbox" [checked]="consent()" (change)="consent.set($any($event.target).checked)" />
            Acepto que FITona guarde mis datos de alimentación (son datos de salud) para ofrecerme la app. Puedo descargarlos o borrarlos cuando quiera. <a routerLink="/privacidad">Ver política de privacidad</a>.</label>
        }
        <div class="actions">
          <button type="submit" class="btn primary big" [disabled]="busy()">{{ busy() ? 'Un momento…' : (creating() ? 'Crear cuenta' : 'Entrar') }}</button>
          <button type="button" class="btn" (click)="creating.set(!creating()); error.set('')">{{ creating() ? 'Ya tengo cuenta' : 'Crear una cuenta' }}</button>
        </div>
      </form>
      <p class="muted small">Si olvidas la contraseña no se puede recuperar todavía (aún no enviamos correos). Descarga tus datos desde «Yo» de vez en cuando.</p>
    </section>
  `,
})
export class LoginPage {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  protected readonly creating = signal(false);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly adult = signal(false);
  protected readonly consent = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected async submit(ev: Event): Promise<void> {
    ev.preventDefault();
    this.busy.set(true); this.error.set('');
    try {
      const s = this.creating()
        ? await this.api.register({ email: this.email(), password: this.password(), adult: this.adult(), healthConsent: this.consent() })
        : await this.api.login(this.email(), this.password());
      this.session.open(s.token, s.email);
      await this.router.navigate(['/inicio']);
    } catch (e) { this.error.set(errorMessage(e)); } finally { this.busy.set(false); }
  }
}
