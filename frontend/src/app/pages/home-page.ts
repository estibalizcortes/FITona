import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Pantalla principal de FITona: selector de módulos. */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="home">
      <img class="home-logo" src="icons/icon-96.png" alt="" width="72" height="72" />
      <h1>FITona</h1>
      <p class="muted">¿Qué quieres hacer?</p>
      <nav class="modules" aria-label="Módulos">
        <a class="module" routerLink="/hoy">
          <span class="module-icon" aria-hidden="true">🍽</span>
          <strong>Comida</strong>
          <span class="muted">Registro, recetas y plan del día</span>
        </a>
        <a class="module" routerLink="/trabajo">
          <span class="module-icon" aria-hidden="true">🗂</span>
          <strong>Trabajo</strong>
          <span class="muted">Notas, resúmenes y calendario</span>
        </a>
      </nav>
    </section>
  `,
})
export class HomePage {}
