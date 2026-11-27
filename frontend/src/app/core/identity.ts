import { HttpInterceptorFn } from '@angular/common/http';

const KEY = 'fitona.devUser';
let memoryId: string | null = null;

/** UUID v4. `crypto.randomUUID` solo existe en contextos seguros (HTTPS/localhost): fuera de ellos (p. ej. http://192.168.x.x desde el móvil) se usa getRandomValues. */
export function newUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * Identidad de DESARROLLO: un UUID aleatorio por navegador. No es autenticación real (ver ADR-004):
 * el backend la acepta solo si FITONA_AUTH_DEV_ENABLED=true. Cada navegador/perfil ve únicamente sus datos.
 * Si no hay almacenamiento, se usa un id aleatorio solo para esta sesión (nunca un id fijo compartido).
 */
export function devUserId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = newUuid();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    memoryId ??= newUuid();
    return memoryId;
  }
}

export const devUserInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.url.startsWith('/api') ? req.clone({ setHeaders: { 'X-Dev-User': devUserId() } }) : req);
