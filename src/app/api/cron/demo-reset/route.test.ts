import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const resetDemoData = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/demoData', () => ({ resetDemoData }));

import { GET } from './route';

function callCron(authorization?: string) {
    return GET(new Request('http://localhost/api/cron/demo-reset', {
        headers: authorization ? { authorization } : {},
    }));
}

describe('GET /api/cron/demo-reset', () => {
    beforeEach(() => {
        resetDemoData.mockReset();
        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
        vi.stubEnv('CRON_SECRET', 'secreto-de-prueba');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('no existe fuera del modo demo', async () => {
        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');

        expect((await callCron('Bearer secreto-de-prueba')).status).toBe(404);
        expect(resetDemoData).not.toHaveBeenCalled();
    });

    it('rechaza llamadas sin el secreto del cron', async () => {
        expect((await callCron()).status).toBe(401);
        expect((await callCron('Bearer otro-secreto')).status).toBe(401);
        expect(resetDemoData).not.toHaveBeenCalled();
    });

    it('no acepta llamadas si CRON_SECRET no está configurado', async () => {
        vi.stubEnv('CRON_SECRET', '');

        expect((await callCron('Bearer ')).status).toBe(401);
        expect(resetDemoData).not.toHaveBeenCalled();
    });

    it('reinicia los datos con el secreto correcto', async () => {
        const response = await callCron('Bearer secreto-de-prueba');

        expect(response.status).toBe(200);
        expect(resetDemoData).toHaveBeenCalledTimes(1);
    });
});
