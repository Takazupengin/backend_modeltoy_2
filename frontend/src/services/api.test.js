import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, setAccessToken } from './api';
afterEach(() => { setAccessToken(null); vi.unstubAllGlobals(); });
describe('Cliente HTTP', () => {
  it('envía el JWT en memoria y no lo persiste en el navegador', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    setAccessToken('token-de-prueba');
    await api.products();
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token-de-prueba');
    expect(JSON.stringify(localStorage)).not.toContain('token-de-prueba');
    expect(JSON.stringify(sessionStorage)).not.toContain('token-de-prueba');
    setAccessToken(null);
    await api.products();
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
  });
  it('muestra el error de negocio del servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Producto agotado' }), { status: 409 })));
    await expect(api.add('RX-78-2')).rejects.toThrow('Producto agotado');
  });
});
