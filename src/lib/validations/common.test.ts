import { describe, it, expect } from 'vitest';
import {
    emptyStringToUndefined,
    emptyStringToNull,
    idSchema,
    idQuerySchema,
    optionalIdSchema,
    optionalDateSchema,
    requiredStringSchema,
    optionalTrimmedStringSchema,
    optionalNullableTrimmedStringSchema,
} from './common';

describe('emptyStringToUndefined', () => {
    it('convierte null, "" y whitespace a undefined', () => {
        expect(emptyStringToUndefined(null)).toBeUndefined();
        expect(emptyStringToUndefined('')).toBeUndefined();
        expect(emptyStringToUndefined('   ')).toBeUndefined();
    });

    it('devuelve el valor tal cual cuando no es string vacío', () => {
        expect(emptyStringToUndefined('x')).toBe('x');
        expect(emptyStringToUndefined(5)).toBe(5);
        expect(emptyStringToUndefined(false)).toBe(false);
    });
});

describe('emptyStringToNull', () => {
    it('convierte "" y whitespace a null', () => {
        expect(emptyStringToNull('')).toBeNull();
        expect(emptyStringToNull('   ')).toBeNull();
    });

    it('devuelve no-strings sin tocar (null sigue null)', () => {
        expect(emptyStringToNull(null)).toBeNull();
        expect(emptyStringToNull(5)).toBe(5);
    });

    it('devuelve strings no vacíos tal cual', () => {
        expect(emptyStringToNull('x')).toBe('x');
    });
});

describe('idSchema', () => {
    it('convierte strings numéricos a number', () => {
        expect(idSchema.parse('5')).toBe(5);
        expect(idSchema.parse(5)).toBe(5);
    });

    it('rechaza cero y negativos (debe ser positivo)', () => {
        expect(idSchema.safeParse('0').success).toBe(false);
        expect(idSchema.safeParse(-1).success).toBe(false);
    });

    it('rechaza decimales y no-numéricos', () => {
        expect(idSchema.safeParse(1.5).success).toBe(false);
        expect(idSchema.safeParse('1.5').success).toBe(false);
        expect(idSchema.safeParse('abc').success).toBe(false);
    });
});

describe('idQuerySchema', () => {
    it('acepta id numérico y lo coersiona', () => {
        expect(idQuerySchema.parse({ id: '3' })).toEqual({ id: 3 });
    });

    it('rechaza id inválido', () => {
        expect(idQuerySchema.safeParse({ id: 0 }).success).toBe(false);
        expect(idQuerySchema.safeParse({ id: 'x' }).success).toBe(false);
    });
});

describe('requiredStringSchema', () => {
    it('recorta espacios y acepta texto no vacío', () => {
        expect(requiredStringSchema.parse('  ab  ')).toBe('ab');
    });

    it('rechaza vacío y solo-espacios', () => {
        expect(requiredStringSchema.safeParse('').success).toBe(false);
        expect(requiredStringSchema.safeParse('   ').success).toBe(false);
    });
});

describe('optionalIdSchema', () => {
    it('convierte vacío/null a undefined', () => {
        expect(optionalIdSchema.parse('')).toBeUndefined();
        expect(optionalIdSchema.parse(null)).toBeUndefined();
    });

    it('coersiona ids válidos', () => {
        expect(optionalIdSchema.parse('3')).toBe(3);
    });

    it('rechaza ids inválidos (0)', () => {
        expect(optionalIdSchema.safeParse('0').success).toBe(false);
    });
});

describe('optionalDateSchema', () => {
    it('convierte vacío/null a undefined', () => {
        expect(optionalDateSchema.parse('')).toBeUndefined();
        expect(optionalDateSchema.parse(null)).toBeUndefined();
    });

    it('convierte strings de fecha a Date', () => {
        const result = optionalDateSchema.parse('2024-01-15');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2024);
    });

    it('rechaza fechas inválidas', () => {
        expect(optionalDateSchema.safeParse('not-a-date').success).toBe(false);
    });
});

describe('optionalTrimmedStringSchema', () => {
    it('vacío → undefined, recorta válidos', () => {
        expect(optionalTrimmedStringSchema.parse('')).toBeUndefined();
        expect(optionalTrimmedStringSchema.parse('  x  ')).toBe('x');
        expect(optionalTrimmedStringSchema.parse(null)).toBeUndefined();
    });
});

describe('optionalNullableTrimmedStringSchema', () => {
    it('vacío → null, recorta válidos, null → null', () => {
        expect(optionalNullableTrimmedStringSchema.parse('')).toBeNull();
        expect(optionalNullableTrimmedStringSchema.parse('  x  ')).toBe('x');
        expect(optionalNullableTrimmedStringSchema.parse(null)).toBeNull();
    });
});
