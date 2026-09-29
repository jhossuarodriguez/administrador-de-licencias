import { describe, it, expect } from 'vitest';
import {
    combineLoadingStates,
    buildQueryString,
    generateCacheKey,
    filterNullish,
    validateRequiredFields,
    sanitizeFilters,
    formatDateForAPI,
    parseDateFromAPI,
    isNetworkError,
} from './hookUtils';

describe('combineLoadingStates', () => {
    it('devuelve false si ninguno es true', () => {
        expect(combineLoadingStates(false, false)).toBe(false);
        expect(combineLoadingStates(false)).toBe(false);
        expect(combineLoadingStates()).toBe(false);
    });

    it('devuelve true si alguno es true', () => {
        expect(combineLoadingStates(true, false)).toBe(true);
        expect(combineLoadingStates(false, false, true)).toBe(true);
    });
});

describe('buildQueryString', () => {
    it('devuelve "" para vacío o sin params', () => {
        expect(buildQueryString()).toBe('');
        expect(buildQueryString({})).toBe('');
    });

    it('serializa params en orden de inserción', () => {
        expect(buildQueryString({ a: 1, b: 2 })).toBe('?a=1&b=2');
    });

    it('omite null, undefined y ""', () => {
        expect(buildQueryString({ a: 1, b: null, c: undefined, d: '', e: 3 })).toBe('?a=1&e=3');
    });
});

describe('generateCacheKey', () => {
    it('combina endpoint + query string', () => {
        expect(generateCacheKey('/api/x', { a: 1 })).toBe('/api/x?a=1');
        expect(generateCacheKey('/api/x')).toBe('/api/x');
        expect(generateCacheKey('/api/x', {})).toBe('/api/x');
    });
});

describe('filterNullish', () => {
    it('elimina null y undefined manteniendo el resto', () => {
        expect(filterNullish([1, null, 2, undefined, 3])).toEqual([1, 2, 3]);
        expect(filterNullish([null, undefined])).toEqual([]);
        expect(filterNullish([1, 2])).toEqual([1, 2]);
        expect(filterNullish([0, false])).toEqual([0, false]); // 0 y false se conservan
    });
});

describe('validateRequiredFields', () => {
    it('true cuando todos los campos están presentes y no vacíos', () => {
        expect(validateRequiredFields({ a: 'x', b: 'y' }, ['a', 'b'])).toBe(true);
    });

    it('false si algún campo es "", null o undefined', () => {
        expect(validateRequiredFields({ a: '', b: 'y' }, ['a', 'b'])).toBe(false);
        expect(validateRequiredFields({ a: null, b: 'y' }, ['a', 'b'])).toBe(false);
        expect(validateRequiredFields({ a: undefined }, ['a'])).toBe(false);
    });

    it('considera 0 y false como presentes', () => {
        expect(validateRequiredFields({ a: 0 }, ['a'])).toBe(true);
        expect(validateRequiredFields({ a: false }, ['a'])).toBe(true);
    });
});

describe('sanitizeFilters', () => {
    it('elimina null, undefined y "" conservando el resto', () => {
        expect(sanitizeFilters({ a: 1, b: null, c: undefined, d: '', e: 'x' })).toEqual({
            a: 1,
            e: 'x',
        });
    });

    it('devuelve objeto vacío si todo se filtra', () => {
        expect(sanitizeFilters({ a: null, b: '' })).toEqual({});
    });
});

describe('formatDateForAPI', () => {
    it('formatea Date a YYYY-MM-DD', () => {
        expect(formatDateForAPI(new Date('2024-06-15T10:00:00.000Z'))).toBe('2024-06-15');
    });

    it('acepta string de fecha', () => {
        expect(formatDateForAPI('2024-06-15T10:00:00.000Z')).toBe('2024-06-15');
    });
});

describe('parseDateFromAPI', () => {
    it('devuelve un Date válido', () => {
        const result = parseDateFromAPI('2024-06-15');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2024);
    });
});

describe('isNetworkError', () => {
    it('true para TypeError que menciona fetch', () => {
        expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    });

    it('false para otros errores o no-errores', () => {
        expect(isNetworkError(new Error('boom'))).toBe(false);
        expect(isNetworkError('string')).toBe(false);
    });
});
