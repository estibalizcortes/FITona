import { HttpInterceptorFn } from '@angular/common/http';

const KEY = 'fitona.devUser';

/**
 * Identidad de DESARROLLO: un UUID aleatorio por navegador. No es autenticación real (ver ADR-004):
 * el backend la acepta solo si FITONA_AUTH_DEV_ENABLED=true. Cada navegador/perfil ve únicamente sus datos.
 */
export function devUserId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return '00000000-0000-4000-8000-000000000000';
  }
}

export const devUserInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.url.startsWith('/api') ? req.clone({ setHeaders: { 'X-Dev-User': devUserId() } }) : req);
