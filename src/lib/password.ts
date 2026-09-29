import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

// Formato "salt:hash" (hex) del sistema anterior. Better Auth lo usa en lugar de su
// scrypt por defecto para que las contraseñas ya guardadas sigan siendo válidas.
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword({ hash: stored, password }: { hash: string; password: string }): Promise<boolean> {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;

    const expected = Buffer.from(hash, 'hex');
    const actual = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
