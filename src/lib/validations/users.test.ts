import { describe, it, expect } from 'vitest';
import { userCreateSchema, userUpdateSchema, userStatusSchema, userFormSchema } from './users';

const validUser = {
    name: 'Juan Perez',
    username: 'juan.perez1',
    status: 'active',
} as const;

describe('userStatusSchema', () => {
    it('acepta active e inactive', () => {
        expect(userStatusSchema.parse('active')).toBe('active');
        expect(userStatusSchema.parse('inactive')).toBe('inactive');
    });

    it('rechaza otros valores', () => {
        expect(userStatusSchema.safeParse('activo').success).toBe(false);
        expect(userStatusSchema.safeParse('').success).toBe(false);
    });
});

describe('userCreateSchema', () => {
    it('acepta un usuario válido y aplica default de status', () => {
        const result = userCreateSchema.parse({ name: 'Juan Perez', username: 'juan.perez1' });
        expect(result.status).toBe('active');
    });

    it('acepta un usuario válido completo', () => {
        expect(userCreateSchema.safeParse(validUser).success).toBe(true);
    });

    it('rechaza nombre muy corto o muy largo', () => {
        expect(userCreateSchema.safeParse({ ...validUser, name: 'A' }).success).toBe(false);
        expect(userCreateSchema.safeParse({ ...validUser, name: 'x'.repeat(101) }).success).toBe(false);
        expect(userCreateSchema.safeParse({ ...validUser, name: '' }).success).toBe(false);
    });

    it('rechaza username muy corto o muy largo', () => {
        expect(userCreateSchema.safeParse({ ...validUser, username: 'ab' }).success).toBe(false);
        expect(userCreateSchema.safeParse({ ...validUser, username: 'x'.repeat(51) }).success).toBe(false);
    });

    it('rechaza username con caracteres no permitidos', () => {
        expect(userCreateSchema.safeParse({ ...validUser, username: 'ju an' }).success).toBe(false); // espacio
        expect(userCreateSchema.safeParse({ ...validUser, username: 'ju@n' }).success).toBe(false); // @
        expect(userCreateSchema.safeParse({ ...validUser, username: 'ju-n' }).success).toBe(false); // guion
    });

    it('acepta username con letras, números, guion bajo y punto', () => {
        expect(userCreateSchema.safeParse({ ...validUser, username: 'juan_perez.1' }).success).toBe(true);
    });
});

describe('userUpdateSchema (partial)', () => {
    it('acepta objeto vacío', () => {
        expect(userUpdateSchema.safeParse({}).success).toBe(true);
    });

    it('acepta actualización parcial', () => {
        expect(userUpdateSchema.safeParse({ name: 'Nuevo Nombre' }).success).toBe(true);
    });
});

describe('userFormSchema', () => {
    const validForm = {
        name: 'Juan Perez',
        username: 'juan.perez1',
        status: 'active',
        role: 'user',
        departmentId: '3',
        plan: 'E3',
    };

    it('acepta un formulario válido', () => {
        expect(userFormSchema.safeParse(validForm).success).toBe(true);
    });

    it('rechaza name vacío o muy corto', () => {
        expect(userFormSchema.safeParse({ ...validForm, name: '' }).success).toBe(false);
        expect(userFormSchema.safeParse({ ...validForm, name: 'A' }).success).toBe(false);
    });

    it('rechaza username muy corto o con caracteres no permitidos', () => {
        expect(userFormSchema.safeParse({ ...validForm, username: 'ab' }).success).toBe(false);
        expect(userFormSchema.safeParse({ ...validForm, username: 'ju@n' }).success).toBe(false);
    });

    it('rechaza status o role vacíos', () => {
        expect(userFormSchema.safeParse({ ...validForm, status: '' }).success).toBe(false);
        expect(userFormSchema.safeParse({ ...validForm, role: '' }).success).toBe(false);
    });

    it('departmentId y plan aceptan string vacío (opcionales)', () => {
        const result = userFormSchema.parse({ ...validForm, departmentId: '', plan: '' });
        expect(result.departmentId).toBe('');
        expect(result.plan).toBe('');
    });

    it('mantiene todos los valores como strings', () => {
        const result = userFormSchema.parse(validForm);
        expect(result.departmentId).toBe('3');
        expect(result.status).toBe('active');
    });
});
