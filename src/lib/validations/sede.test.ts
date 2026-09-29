import { describe, expect, it } from 'vitest';
import { sedeCreateSchema, sedeQuerySchema, sedeUpdateSchema } from './sede';

describe('sedeCreateSchema', () => {
    it('normaliza el nombre y convierte una descripcion vacia en null', () => {
        expect(sedeCreateSchema.parse({ name: '  Sede Central  ', description: '   ' })).toEqual({
            name: 'Sede Central',
            description: null,
        });
    });

    it('rechaza nombres vacios o demasiado largos', () => {
        expect(sedeCreateSchema.safeParse({ name: ' ' }).success).toBe(false);
        expect(sedeCreateSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false);
    });
});

describe('sedeUpdateSchema', () => {
    it('acepta cambios parciales', () => {
        expect(sedeUpdateSchema.safeParse({ id: 1, active: false }).success).toBe(true);
    });

    it('requiere al menos un campo ademas del id', () => {
        expect(sedeUpdateSchema.safeParse({ id: 1 }).success).toBe(false);
    });
});

describe('sedeQuerySchema', () => {
    it('solo acepta true o false para el filtro active', () => {
        expect(sedeQuerySchema.safeParse({ active: 'true' }).success).toBe(true);
        expect(sedeQuerySchema.safeParse({ active: 'yes' }).success).toBe(false);
    });
});
