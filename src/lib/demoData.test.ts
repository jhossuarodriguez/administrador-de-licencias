import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { buildDemoData, resetDemoData } from './demoData';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date('2026-09-28T12:00:00Z');
const data = buildDemoData(now);

describe('buildDemoData', () => {
    it('solo referencia departamentos, sedes, usuarios y licencias que existen', () => {
        const departments = new Set(data.departments.map((department) => department.name));
        const sedes = new Set(data.sedes.map((sede) => sede.name));
        const usernames = new Set(data.users.map((user) => user.username));
        const models = new Set(data.licenses.map((license) => license.model));

        // Se usan como claves al cargar los datos
        expect(usernames.size).toBe(data.users.length);
        expect(models.size).toBe(data.licenses.length);

        for (const user of data.users) {
            expect(departments).toContain(user.department);
        }
        for (const license of data.licenses) {
            expect(departments).toContain(license.department);
            expect(sedes).toContain(license.sede);
        }
        for (const assignment of data.assignments) {
            expect(usernames).toContain(assignment.username);
            expect(models).toContain(assignment.model);
        }
    });

    it('respeta las reglas de licencias de la app', () => {
        for (const license of data.licenses) {
            expect(license.usedLicense).toBeLessThanOrEqual(license.totalLicense);

            // Solo las anuales tienen fecha de vencimiento
            if (license.billingCycle === 'MONTHLY') {
                expect(license.expiration).toBeNull();
            } else {
                expect(license.expiration?.getTime()).toBeGreaterThan(license.startDate.getTime());
            }
        }
    });

    it('incluye licencias por vencer, vencidas y subutilizadas para alertas y reportes', () => {
        const active = data.licenses.filter((license) => license.active);
        const in30Days = now.getTime() + 30 * DAY_MS;

        expect(active.some((l) => l.expiration && l.expiration > now && l.expiration.getTime() <= in30Days)).toBe(true);
        expect(active.some((l) => l.expiration && l.expiration < now)).toBe(true);
        expect(active.some((l) => l.usedLicense < l.totalLicense * 0.5)).toBe(true);
        expect(data.licenses.some((license) => !license.active)).toBe(true);
    });

    it('asigna una vez cada licencia, solo a usuarios activos y después de que ambos existieran', () => {
        const pairs = new Set(data.assignments.map(({ username, model }) => `${username}:${model}`));
        expect(pairs.size).toBe(data.assignments.length);

        const users = new Map(data.users.map((user) => [user.username, user]));
        const licenses = new Map(data.licenses.map((license) => [license.model, license]));

        for (const { username, model, assignedAt } of data.assignments) {
            expect(users.get(username)?.status).toBe('active');
            expect(assignedAt.getTime()).toBeLessThanOrEqual(now.getTime());
            expect(assignedAt.getTime()).toBeGreaterThanOrEqual(users.get(username)?.createdAt.getTime() ?? Infinity);
            expect(assignedAt.getTime()).toBeGreaterThanOrEqual(licenses.get(model)?.createdAt.getTime() ?? Infinity);
        }

        // El reporte de auditoría muestra la actividad de los últimos 30 días
        expect(data.assignments.some(({ assignedAt }) => now.getTime() - assignedAt.getTime() <= 30 * DAY_MS)).toBe(true);
    });
});

describe('resetDemoData', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('se niega a borrar datos fuera del modo demo', async () => {
        vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false');
        const prisma = { $transaction: vi.fn() };

        await expect(resetDemoData(prisma as unknown as PrismaClient, now)).rejects.toThrow('NEXT_PUBLIC_DEMO_MODE');
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });
});
