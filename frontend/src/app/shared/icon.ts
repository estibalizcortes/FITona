import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Icono lineal SVG (24×24) que hereda el color del texto. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="d()" /></svg>`,
  styles: [':host { display: inline-block; width: 1.5em; height: 1.5em; }'],
})
export class Icon { readonly d = input.required<string>(); }
