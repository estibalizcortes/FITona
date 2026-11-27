import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, retry, tap, throwError, timeout, timer, catchError, TimeoutError } from 'rxjs';
import { apiBase } from './config';

/** Una petición que lleva más de esto con conexión = el servidor gratuito está despertando (se confirma con una sola consulta de estado). */
export const WAKING_AFTER_MS = 2500;
/** Pasado esto, una petición sigue en curso pero se avisa de que tarda más de lo normal. */
const SLOW_AFTER_MS = 10_000;
/** Tiempos de espera: una lectura espera como mucho 40 s por intento (arranque en frío ≈ 20-60 s); las escrituras 90 s (el hash de contraseña tarda). */
const GET_TIMEOUT_MS = 40_000;
const WRITE_TIMEOUT_MS = 90_000;
const RETRY_STATUSES = [0, 502, 503, 504];
const WAKE_EVERY_MS = 10 * 60 * 1000;

/** Lo que debe contar el aviso de conexión (null = todo bien). */
export type Notice = 'offline' | 'waking' | 'db' | 'slow' | 'timeout' | 'unreachable' | null;

/**
 * Estado de la conexión con el servidor, SIN datos de nadie. Distingue: sin conexión, servidor despertando, base de datos despertando,
 * petición lenta, tiempo agotado y servidor inalcanzable. Solo hace UNA consulta de estado al abrir la app (y otra si vuelves tras
 * más de 10 min): despierta a la vez el servidor y la base de datos y dice cuál de los dos tardaba. No hay sondeos periódicos.
 */
@Injectable({ providedIn: 'root' })
export class ServerStatus {
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  /** Peticiones a la API en curso (para decir «hay N cosas esperando al servidor»). */
  readonly pending = signal(0);
  private readonly probeWaiting = signal(false);   // la consulta de estado lleva > WAKING_AFTER_MS sin respuesta
  private readonly dbState = signal<'ok' | 'slow' | 'down'>('ok');
  private readonly slowPending = signal(false);
  private readonly failure = signal<'timeout' | 'unreachable' | null>(null);
  /** Segundos que lleva encendido el servidor (de la última consulta de estado): bajo = acaba de despertar. */
  readonly uptime = signal<number | null>(null);
  /** Última consulta de estado (para la tarjeta «Estado del servidor» de Yo): tiempos reales medidos desde este dispositivo. */
  readonly info = signal<{ db: 'ok' | 'slow' | 'down'; dbMs: number; uptimeSeconds: number; rttMs: number; at: number } | null>(null);

  readonly notice = computed<Notice>(() => {
    if (!this.online()) return 'offline';
    if (this.failure()) return this.failure();
    if (this.probeWaiting()) return 'waking';
    if (this.dbState() !== 'ok') return 'db';
    return this.slowPending() ? 'slow' : null;
  });

  private slowTimer: ReturnType<typeof setTimeout> | null = null;
  private lastWake = 0;

  constructor() {
    window.addEventListener('online', () => { this.online.set(true); this.wake(); });
    window.addEventListener('offline', () => { this.online.set(false); this.probeWaiting.set(false); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - this.lastWake > WAKE_EVERY_MS) this.wake();
    });
    this.wake();
  }

  begin(): void {
    this.pending.update((n) => n + 1);
    if (!this.slowTimer) this.slowTimer = setTimeout(() => { if (this.pending() > 0 && this.online()) this.slowPending.set(true); }, SLOW_AFTER_MS);
  }

  end(): void {
    this.pending.update((n) => Math.max(0, n - 1));
    if (this.pending() === 0) {
      if (this.slowTimer) clearTimeout(this.slowTimer);
      this.slowTimer = null;
      this.slowPending.set(false);
    }
  }

  /** Una respuesta del servidor (aunque sea un error 4xx) prueba que está despierto y alcanzable. */
  reached(): void { this.failure.set(null); this.probeWaiting.set(false); if (this.dbState() !== 'ok') this.dbState.set('ok'); }
  failed(kind: 'timeout' | 'unreachable'): void { if (this.online()) this.failure.set(kind); }

  /** Consulta de estado única: despierta servidor y base de datos y averigua cuál tardaba. */
  wake(): void {
    if (!navigator.onLine) return;
    this.lastWake = Date.now();
    const waitingTimer = setTimeout(() => this.probeWaiting.set(true), WAKING_AFTER_MS);
    const t0 = performance.now();
    const abort = new AbortController();
    const giveUp = setTimeout(() => abort.abort(), 120_000);
    fetch(`${apiBase()}/api/v1/status`, { cache: 'no-store', credentials: 'omit', signal: abort.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: { db: 'ok' | 'slow' | 'down'; dbMs: number; uptimeSeconds: number }) => {
        this.info.set({ db: s.db, dbMs: s.dbMs, uptimeSeconds: s.uptimeSeconds, rttMs: Math.round(performance.now() - t0), at: Date.now() });
        this.failure.set(null);
        this.uptime.set(s.uptimeSeconds);
        this.dbState.set(s.db);
      })
      .catch((e: unknown) => this.failed(e instanceof DOMException && e.name === 'AbortError' ? 'timeout' : 'unreachable'))
      .finally(() => { clearTimeout(waitingTimer); clearTimeout(giveUp); this.probeWaiting.set(false); });
  }

  /** «Reintentar»: limpia el aviso y vuelve a despertar (la pantalla se recarga desde el banner). */
  retry(): void { this.failure.set(null); this.dbState.set('ok'); this.wake(); }
}

/** Cuenta las peticiones a la API, les pone tiempo máximo y reintenta las lecturas (GET) si el servidor aún está arrancando. */
export const statusInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
  const status = inject(ServerStatus);
  const isGet = req.method === 'GET';
  status.begin();
  return next(req).pipe(
    timeout({ first: isGet ? GET_TIMEOUT_MS : WRITE_TIMEOUT_MS }),
    catchError((e: unknown) => throwError(() => (e instanceof TimeoutError ? new HttpErrorResponse({ status: 0, statusText: 'timeout', url: req.url }) : e))),
    retry({
      count: 2,
      delay: (error: unknown, attempt: number) =>
        isGet && navigator.onLine && error instanceof HttpErrorResponse && RETRY_STATUSES.includes(error.status)
          ? timer(attempt * 2000)
          : throwError(() => error),
    }),
    tap({
      next: () => status.reached(),
      error: (e: unknown) => {
        if (e instanceof HttpErrorResponse && (e.status === 0 || RETRY_STATUSES.includes(e.status))) status.failed(e.statusText === 'timeout' ? 'timeout' : 'unreachable');
        else status.reached();
      },
    }),
    finalize(() => status.end()),
  );
};
