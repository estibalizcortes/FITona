import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, retry, throwError, timer } from 'rxjs';
import { apiBase } from './config';

/** Una petición que tarda más de esto mientras hay conexión = el servidor gratuito está despertando. */
export const WAKING_AFTER_MS = 4000;
const RETRY_STATUSES = [0, 502, 503, 504];
const WAKE_EVERY_MS = 10 * 60 * 1000;

/**
 * Estado de la conexión y del servidor. El alojamiento gratuito de Render duerme el backend tras 15 min sin uso y despertarlo
 * tarda ~25-60 s: se avisa con un mensaje amable y se «despierta» en cuanto se abre la app (sin esperar a que la persona pulse algo).
 * No guarda nada: solo señales en memoria.
 */
@Injectable({ providedIn: 'root' })
export class ServerStatus {
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly waking = signal(false);
  /** 'offline' | 'waking' | null: lo que debe mostrar el aviso global. */
  readonly notice = computed<'offline' | 'waking' | null>(() => (!this.online() ? 'offline' : this.waking() ? 'waking' : null));
  private pending = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastWake = 0;

  constructor() {
    window.addEventListener('online', () => {
      this.online.set(true);
      this.wake();
      if (this.pending > 0) this.startTimer(); // sigue habiendo una petición en curso: si tarda, volver a avisar
    });
    window.addEventListener('offline', () => { this.online.set(false); this.waking.set(false); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - this.lastWake > WAKE_EVERY_MS) this.wake();
    });
    this.wake();
  }

  begin(): void {
    if (this.pending++ === 0) this.startTimer();
  }

  private startTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { if (this.online()) this.waking.set(true); }, WAKING_AFTER_MS);
  }

  end(): void {
    if (--this.pending > 0) return;
    this.pending = 0;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.waking.set(false);
  }

  /** Petición «a ciegas» (sin leer la respuesta ni enviar datos) para que Render arranque el backend mientras la persona teclea. */
  wake(): void {
    const base = apiBase();
    if (!base || !navigator.onLine) return;
    this.lastWake = Date.now();
    fetch(`${base}/q/health/live`, { mode: 'no-cors', cache: 'no-store', credentials: 'omit' }).catch(() => { /* sin conexión: no pasa nada */ });
  }
}

/** Cuenta las peticiones a la API y reintenta las lecturas (GET) si el servidor aún está arrancando. */
export const statusInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
  const status = inject(ServerStatus);
  status.begin();
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: unknown, attempt: number) =>
        req.method === 'GET' && navigator.onLine && error instanceof HttpErrorResponse && RETRY_STATUSES.includes(error.status)
          ? timer(attempt * 3000)
          : throwError(() => error),
    }),
    finalize(() => status.end()),
  );
};
