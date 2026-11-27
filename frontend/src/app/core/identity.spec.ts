import { afterEach, describe, expect, it, vi } from 'vitest';
import { devUserId, newUuid } from './identity';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('identity', () => {
  afterEach(() => vi.restoreAllMocks());

  it('genera UUID v4 válidos y distintos', () => {
    const a = newUuid(), b = newUuid();
    expect(a).toMatch(V4);
    expect(a).not.toBe(b);
  });

  it('funciona sin crypto.randomUUID (contexto no seguro, p. ej. http://192.168.x.x en el móvil)', () => {
    const real = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array<ArrayBuffer>) => real.getRandomValues(a) });
    try {
      expect(newUuid()).toMatch(V4);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('sin almacenamiento usa un id aleatorio de sesión, nunca un id fijo compartido', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado'); });
    const id = devUserId();
    expect(id).toMatch(V4);
    expect(id).not.toBe('00000000-0000-4000-8000-000000000000');
    expect(devUserId()).toBe(id);
  });
});
