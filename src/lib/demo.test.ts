import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAllowedForDemoAccount, isDemoMode } from './demo';

describe('isDemoMode', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('solo se activa con NEXT_PUBLIC_DEMO_MODE=true', () => {
        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
        expect(isDemoMode()).toBe(true);

        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
        expect(isDemoMode()).toBe(false);

        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '');
        expect(isDemoMode()).toBe(false);
    });
});

describe('isAllowedForDemoAccount', () => {
    it('permite iniciar y cerrar sesión', () => {
        for (const path of ['/get-session', '/sign-out', '/sign-in/username', '/sign-in/social', '/sign-up/email', '/callback/:id']) {
            expect(isAllowedForDemoAccount(path)).toBe(true);
        }
    });

    it('bloquea lo que dejaría fuera a otros visitantes', () => {
        for (const path of ['/change-password', '/update-user', '/delete-user', '/change-email', '/link-social', '/unlink-account', '/list-sessions', '/revoke-sessions', '/revoke-other-sessions']) {
            expect(isAllowedForDemoAccount(path)).toBe(false);
        }
    });
});
