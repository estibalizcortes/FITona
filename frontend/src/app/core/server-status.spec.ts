import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerStatus, WAKING_AFTER_MS } from './server-status';

/** Respuesta de /api/v1/status simulada. */
function statusFetch(
  body: { db: 'ok' | 'slow' | 'down'; uptimeSeconds: number } | 'hang' | 'fail',
) {
  return vi.fn((_u: string, init?: { signal?: AbortSignal }) => {
    if (body === 'fail') return Promise.reject(new TypeError('network'));
    if (body === 'hang')
      return new Promise<Response>((_, rej) =>
        init?.signal?.addEventListener('abort', () => rej(new DOMException('t', 'AbortError'))),
      );
    return Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response);
  });
}

describe('ServerStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('si el servidor responde enseguida no hay aviso y se registra cuánto lleva encendido', async () => {
    vi.stubGlobal('fetch', statusFetch({ db: 'ok', uptimeSeconds: 7 }));
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(WAKING_AFTER_MS * 2);
    expect(s.notice()).toBeNull();
    expect(s.uptime()).toBe(7);
  });

  it('si la consulta de estado tarda, avisa de que el servidor está despertando y el aviso se quita al responder', async () => {
    let answer!: (r: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((res) => {
            answer = res;
          }),
      ),
    );
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(WAKING_AFTER_MS + 100);
    expect(s.notice()).toBe('waking');
    answer({ ok: true, json: () => Promise.resolve({ db: 'ok', uptimeSeconds: 3 }) } as Response);
    await vi.advanceTimersByTimeAsync(10);
    expect(s.notice()).toBeNull();
  });

  it('distingue la base de datos despertando del servidor despertando', async () => {
    vi.stubGlobal('fetch', statusFetch({ db: 'slow', uptimeSeconds: 40 }));
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(10);
    expect(s.notice()).toBe('db');
    s.reached(); // llega una respuesta normal: ya no hace falta el aviso
    expect(s.notice()).toBeNull();
  });

  it('sin respuesta tras el tiempo máximo es «tiempo agotado»; un fallo de red inmediato es «inalcanzable»', async () => {
    vi.stubGlobal('fetch', statusFetch('hang'));
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(121_000);
    expect(s.notice()).toBe('timeout');
    vi.stubGlobal('fetch', statusFetch('fail'));
    const t = new ServerStatus();
    await vi.advanceTimersByTimeAsync(10);
    expect(t.notice()).toBe('unreachable');
  });

  it('una petición lenta avisa pasados 10 s y el aviso dura hasta que termina la última', async () => {
    vi.stubGlobal('fetch', statusFetch({ db: 'ok', uptimeSeconds: 100 }));
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(10);
    s.begin();
    s.begin();
    await vi.advanceTimersByTimeAsync(10_100);
    expect(s.notice()).toBe('slow');
    s.end();
    expect(s.notice()).toBe('slow');
    s.end();
    expect(s.notice()).toBeNull();
  });

  it('sin conexión el aviso es «offline» y tiene prioridad; al volver la red se quita', async () => {
    vi.stubGlobal('fetch', statusFetch({ db: 'ok', uptimeSeconds: 1 }));
    const s = new ServerStatus();
    await vi.advanceTimersByTimeAsync(10);
    window.dispatchEvent(new Event('offline'));
    expect(s.notice()).toBe('offline');
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(10);
    expect(s.notice()).toBeNull();
  });

  it('no hace consultas periódicas: solo una al abrir', async () => {
    const f = statusFetch({ db: 'ok', uptimeSeconds: 1 });
    vi.stubGlobal('fetch', f);
    new ServerStatus();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(f).toHaveBeenCalledTimes(1);
  });
});
