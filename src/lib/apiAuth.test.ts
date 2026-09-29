import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateSameOriginRequest } from './apiAuth';

vi.mock('./session', () => ({ getSession: vi.fn() }));

describe('validateSameOriginRequest', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('acepta el origen publico cuando el proxy conecta internamente por HTTP', () => {
        vi.stubEnv('APP_URL', 'https://licencias.example.com/');
        const request = new Request('http://license-administrator:3000/api/licenses', {
            method: 'POST',
            headers: { origin: 'https://licencias.example.com' },
        });

        expect(validateSameOriginRequest(request)).toBeNull();
    });

    it('rechaza un origen diferente al dominio configurado', () => {
        vi.stubEnv('APP_URL', 'https://licencias.example.com');
        const request = new Request('http://license-administrator:3000/api/licenses', {
            method: 'POST',
            headers: { origin: 'https://otro-dominio.example' },
        });

        const response = validateSameOriginRequest(request);

        expect(response?.status).toBe(403);
    });
});
