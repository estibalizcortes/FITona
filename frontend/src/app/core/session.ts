import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const KEY = 'fitona.session';

/** Sesión de la persona: token del servidor y correo, guardados en este dispositivo. */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly token = signal<string | null>(null);
  readonly email = signal<string | null>(null);

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw) as { token: string; email: string }; this.token.set(s.token); this.email.set(s.email); }
    } catch { /* sin almacenamiento: la sesión dura solo mientras esté abierta la app */ }
  }

  open(token: string, email: string): void {
    this.token.set(token); this.email.set(email);
    try { localStorage.setItem(KEY, JSON.stringify({ token, email })); } catch { /* ver arriba */ }
  }

  close(): void {
    this.token.set(null); this.email.set(null);
    try { localStorage.removeItem(KEY); } catch { /* ver arriba */ }
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(Session);
  const router = inject(Router);
  if (!req.url.startsWith('/api')) return next(req);
  const token = session.token();
  const out = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(out).pipe(catchError((e: unknown) => {
    // Sesión caducada o cerrada en otro dispositivo: volver a la pantalla de entrar (no en el propio login).
    if (e instanceof HttpErrorResponse && e.status === 401 && token && !req.url.includes('/auth/login')) {
      session.close();
      void router.navigate(['/entrar']);
    }
    return throwError(() => e);
  }));
};

export const authGuard: CanActivateFn = () => inject(Session).token() ? true : inject(Router).createUrlTree(['/entrar']);
