import { Injectable } from '@angular/core';

/**
 * Tema visual. Por ahora FITona es solo luminosa (el modo oscuro, también el automático según el sistema, está desactivado a propósito).
 * Se conserva el punto de entrada para futuras personalizaciones («Mi Fiona»): añadir un tema = definir sus variables en styles.scss
 * bajo [data-theme='nombre'] y ofrecerlo aquí.
 */
@Injectable({ providedIn: 'root' })
export class Theme {
  constructor() { document.documentElement.setAttribute('data-theme', 'light'); }
}
