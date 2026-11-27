import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerStatus, WAKING_AFTER_MS } from './server-status';

describe('ServerStatus', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true); });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('una petición rápida no muestra aviso', () => {
    const s = new ServerStatus();
    s.begin(); vi.advanceTimersByTime(WAKING_AFTER_MS - 100); s.end();
    vi.advanceTimersByTime(WAKING_AFTER_MS * 2);
    expect(s.notice()).toBeNull();
  });

  it('una petición que tarda más de 4 s avisa de que el servidor está despertando y el aviso se quita al responder', () => {
    const s = new ServerStatus();
    s.begin(); vi.advanceTimersByTime(WAKING_AFTER_MS + 100);
    expect(s.notice()).toBe('waking');
    s.end();
    expect(s.notice()).toBeNull();
  });

  it('con varias peticiones a la vez el aviso dura hasta que termina la última', () => {
    const s = new ServerStatus();
    s.begin(); s.begin(); vi.advanceTimersByTime(WAKING_AFTER_MS + 100);
    s.end(); expect(s.notice()).toBe('waking');
    s.end(); expect(s.notice()).toBeNull();
  });

  it('sin conexión el aviso es «offline» y tiene prioridad; al volver la red se quita', () => {
    const s = new ServerStatus();
    s.begin(); vi.advanceTimersByTime(WAKING_AFTER_MS + 100);
    window.dispatchEvent(new Event('offline'));
    expect(s.notice()).toBe('offline');
    window.dispatchEvent(new Event('online'));
    expect(s.notice()).toBeNull(); // acaba de volver la red: se vuelve a contar
    vi.advanceTimersByTime(WAKING_AFTER_MS + 100);
    expect(s.notice()).toBe('waking');
    s.end();
  });
});
