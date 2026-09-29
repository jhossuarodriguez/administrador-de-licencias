import { describe, it, expect } from 'vitest';
import {
    departmentCreateSchema,
    departmentUpdateSchema,
    departmentQuerySchema,
} from './departments';

describe('departmentCreateSchema', () => {
    it('acepta un departamento válido', () => {
        expect(departmentCreateSchema.safeParse({ name: 'TI' }).success).toBe(true);
    });

    it('convierte descripción vacía a null', () => {
        const result = departmentCreateSchema.parse({ name: 'TI', description: '' });
        expect(result.description).toBeNull();
    });

    it('rechaza nombre muy corto, vacío o muy largo', () => {
        expect(departmentCreateSchema.safeParse({ name: 'A' }).success).toBe(false);
        expect(departmentCreateSchema.safeParse({ name: '' }).success).toBe(false);
        expect(departmentCreateSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false);
    });

    it('rechaza descripción mayor a 500 caracteres', () => {
        expect(
            departmentCreateSchema.safeParse({ name: 'TI', description: 'x'.repeat(501) }).success,
        ).toBe(false);
    });
});

describe('departmentUpdateSchema', () => {
    it('requiere id válido', () => {
        expect(departmentUpdateSchema.safeParse({ name: 'X' }).success).toBe(false); // sin id
        expect(departmentUpdateSchema.safeParse({ id: '0' }).success).toBe(false); // id no positivo
    });

    it('acepta actualización con id coersionado', () => {
        const result = departmentUpdateSchema.parse({ id: '3', name: 'Nuevo' });
        expect(result.id).toBe(3);
    });

    it('acepta cambiar active', () => {
        expect(departmentUpdateSchema.safeParse({ id: 1, active: false }).success).toBe(true);
    });
});

describe('departmentQuerySchema', () => {
    it('acepta active "true"/"false" o ausente', () => {
        expect(departmentQuerySchema.safeParse({ active: 'true' }).success).toBe(true);
        expect(departmentQuerySchema.safeParse({ active: 'false' }).success).toBe(true);
        expect(departmentQuerySchema.safeParse({}).success).toBe(true);
    });

    it('rechaza valores distintos de true/false', () => {
        expect(departmentQuerySchema.safeParse({ active: 'yes' }).success).toBe(false);
    });
});
