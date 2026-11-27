import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorMessage } from './api';

const http = (status: number, detail?: string) => ({ status, error: detail ? { detail } : null });

describe('errorMessage', () => {
  afterEach(() => vi.restoreAllMocks());
  const online = (v: boolean) => vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(v);

  it('prioriza el mensaje del servidor', () => {
    online(true);
    expect(errorMessage(http(400, 'La cantidad no es válida'))).toBe('La cantidad no es válida');
  });
  it('sin conexión (0 o 504 del service worker) explica que no se ha guardado nada', () => {
    online(false);
    for (const s of [0, 504]) expect(errorMessage(http(s))).toMatch(/Sin conexión a Internet.*no se ha guardado nada/);
  });
  it('con conexión, 0 y 502/503/504 hablan de un servidor que puede estar despertando', () => {
    online(true);
    expect(errorMessage(http(0))).toMatch(/despertando/);
    for (const s of [502, 503, 504]) expect(errorMessage(http(s))).toMatch(/despertando/);
  });
  it('401 = sesión caducada; el resto, mensaje genérico', () => {
    online(true);
    expect(errorMessage(http(401))).toMatch(/sesión ha caducado/);
    expect(errorMessage(http(500))).toBe('Ha ocurrido un error inesperado.');
  });
});
