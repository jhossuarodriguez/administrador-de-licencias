import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, registerSchema } from './auth';

const validSignup = {
    name: 'Juan Perez',
    username: 'juan.perez',
    email: 'juan@example.com',
    password: 'Abcdef12',
    confirmPassword: 'Abcdef12',
} as const;

describe('loginSchema', () => {
    it('normaliza emails a minúsculas', () => {
        const result = loginSchema.parse({
            identifier: 'User@Example.COM',
            password: 'secret123',
        });
        expect(result.identifier).toBe('user@example.com');
    });

    it('mantiene username sin modificar (sin @)', () => {
        const result = loginSchema.parse({
            identifier: 'John_Doe.1',
            password: 'secret123',
        });
        expect(result.identifier).toBe('John_Doe.1');
    });

    it('rechaza identificadores inválidos', () => {
        expect(
            loginSchema.safeParse({ identifier: 'no spaces!', password: 'x' }).success,
        ).toBe(false);
        expect(loginSchema.safeParse({ identifier: '', password: 'x' }).success).toBe(false);
    });

    it('requiere contraseña', () => {
        expect(
            loginSchema.safeParse({ identifier: 'user@example.com', password: '' }).success,
        ).toBe(false);
    });
});

describe('signupSchema', () => {
    it('acepta un signup válido', () => {
        expect(signupSchema.safeParse(validSignup).success).toBe(true);
    });

    it('rechaza contraseñas que no coinciden (error en confirmPassword)', () => {
        const result = signupSchema.safeParse({ ...validSignup, confirmPassword: 'Different1' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path.join('.'));
            expect(paths).toContain('confirmPassword');
        }
    });

    it('rechaza contraseña débil (sin mayúscula)', () => {
        expect(
            signupSchema.safeParse({ ...validSignup, password: 'abcdef12', confirmPassword: 'abcdef12' }).success,
        ).toBe(false);
    });

    it('rechaza contraseña muy corta (<8)', () => {
        expect(
            signupSchema.safeParse({ ...validSignup, password: 'Ab1', confirmPassword: 'Ab1' }).success,
        ).toBe(false);
    });
});

describe('registerSchema', () => {
    it('es el base sin confirmPassword', () => {
        expect(
            registerSchema.safeParse({
                name: validSignup.name,
                username: validSignup.username,
                email: validSignup.email,
                password: validSignup.password,
            }).success,
        ).toBe(true);
    });
});
