import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>Política de privacidad</h1>
      <p class="warn" role="note"><strong>BORRADOR:</strong> este texto no ha sido revisado por una persona experta en protección de datos. Debe revisarse y completarse (responsable, contacto) antes de publicar la app.</p>
      <h2>Qué datos guardamos</h2>
      <p>Tu correo electrónico, una versión cifrada (no reversible) de tu contraseña, y lo que tú introduces: alimentos propios, recetas y registros de comidas. Los datos de alimentación son <strong>datos de salud</strong>; solo los tratamos con tu consentimiento.</p>
      <h2>Para qué</h2>
      <p>Solo para que la app funcione para ti (guardar y calcular tus registros). No hay publicidad, no vendemos datos y no los compartimos con terceros.</p>
      <h2>Tus derechos</h2>
      <p>Puedes descargar todos tus datos y borrar tu cuenta y todo lo que contiene desde «Yo». El borrado es inmediato e irreversible.</p>
      <h2>Responsable y contacto</h2>
      <p>[Nombre del responsable y correo de contacto: pendiente de completar]</p>
      <p><a routerLink="/entrar">‹ Volver</a></p>
    </section>
  `,
})
export class PrivacyPage {}
