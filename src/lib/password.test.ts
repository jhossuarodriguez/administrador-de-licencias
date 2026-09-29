import { describe, expect, it } from 'vitest';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { hashPassword, verifyPassword } from './password';

// Hash tal como lo guardaba el login anterior (y como lo genera prisma/seed.ts).
function legacyHash(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

describe('password', () => {
    it('verifica una contraseña recién hasheada', async () => {
        const hash = await hashPassword('Abcdef12');

        expect(await verifyPassword({ hash, password: 'Abcdef12' })).toBe(true);
        expect(await verifyPassword({ hash, password: 'Abcdef13' })).toBe(false);
    });

    it('acepta los hashes guardados antes de migrar a Better Auth', async () => {
        const hash = legacyHash('Admin2024!');

        expect(await verifyPassword({ hash, password: 'Admin2024!' })).toBe(true);
    });

    it('rechaza hashes con formato inválido', async () => {
        expect(await verifyPassword({ hash: 'sin-separador', password: 'x' })).toBe(false);
        expect(await verifyPassword({ hash: 'abcd:1234', password: 'x' })).toBe(false);
    });
});
