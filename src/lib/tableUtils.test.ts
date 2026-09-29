import { describe, it, expect } from 'vitest';
import {
    matchesTableFilter,
    getVisiblePageNumbers,
} from './tableUtils';

describe('matchesTableFilter', () => {
    it('devuelve true para cualquier valor cuando el filtro está vacío', () => {
        expect(matchesTableFilter(['Microsoft'], '')).toBe(true);
        expect(matchesTableFilter([], '   ')).toBe(true);
        expect(matchesTableFilter([null], ' \t ')).toBe(true);
    });

    it('ignora mayúsculas/minúsculas y recorta el filtro (es-DO)', () => {
        expect(matchesTableFilter(['Microsoft Office'], 'micro')).toBe(true);
        expect(matchesTableFilter(['Microsoft Office'], '  OFFICE  ')).toBe(true);
        expect(matchesTableFilter(['Microsoft'], 'google')).toBe(false);
    });

    it('coincide si alguno de los valores matchea', () => {
        expect(matchesTableFilter(['Microsoft', 'Office', 'TI'], 'office')).toBe(true);
        expect(matchesTableFilter(['Microsoft', 'Office', 'TI'], 'zzz')).toBe(false);
    });

    it('trata null y undefined como cadena vacía', () => {
        expect(matchesTableFilter([null, undefined], 'x')).toBe(false);
        // null no lanza ni matchea falsamente
        expect(matchesTableFilter([null, 'Microsoft'], 'micro')).toBe(true);
    });

    it('convierte números a string para comparar', () => {
        expect(matchesTableFilter([123], '12')).toBe(true);
        expect(matchesTableFilter([123], '99')).toBe(false);
    });

    it('convierte booleanos a string de forma insensible a mayúsculas', () => {
        expect(matchesTableFilter([true], 'true')).toBe(true);
        expect(matchesTableFilter([true], 'TRUE')).toBe(true);
        expect(matchesTableFilter([false], 'false')).toBe(true);
        // "false" no contiene la subcadena "true"
        expect(matchesTableFilter([false], 'TRUE')).toBe(false);
        expect(matchesTableFilter([true], 'false')).toBe(false);
    });

    it('normaliza fechas al formato local es-DO', () => {
        const date = new Date(2024, 5, 15); // 15 de junio de 2024
        expect(matchesTableFilter([date], '2024')).toBe(true);
        expect(matchesTableFilter([date], '1999')).toBe(false);
    });
});

describe('getVisiblePageNumbers', () => {
    it('centra la ventana cuando hay páginas a ambos lados', () => {
        expect(getVisiblePageNumbers(5, 10)).toEqual([3, 4, 5, 6, 7]);
    });

    it('clampa al inicio cuando current está cerca de la primera página', () => {
        expect(getVisiblePageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5]);
        expect(getVisiblePageNumbers(2, 10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('clampa al final cuando current está cerca de la última página', () => {
        expect(getVisiblePageNumbers(10, 10)).toEqual([6, 7, 8, 9, 10]);
        expect(getVisiblePageNumbers(9, 10)).toEqual([6, 7, 8, 9, 10]);
    });

    it('devuelve solo las páginas disponibles cuando totalPages < buttonLimit', () => {
        expect(getVisiblePageNumbers(2, 3)).toEqual([1, 2, 3]);
        expect(getVisiblePageNumbers(1, 1)).toEqual([1]);
    });

    it('clampa currentPage que excede totalPages', () => {
        expect(getVisiblePageNumbers(100, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('clampa currentPage inválidas (<= 0) a la primera página', () => {
        expect(getVisiblePageNumbers(0, 10)).toEqual([1, 2, 3, 4, 5]);
        expect(getVisiblePageNumbers(-5, 10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('respeta un pageButtonLimit personalizado', () => {
        expect(getVisiblePageNumbers(5, 10, 3)).toEqual([4, 5, 6]);
        expect(getVisiblePageNumbers(1, 10, 3)).toEqual([1, 2, 3]);
    });

    it('trata pageButtonLimit inválido (<= 0) como 1', () => {
        expect(getVisiblePageNumbers(5, 10, 0)).toEqual([5]);
        expect(getVisiblePageNumbers(5, 10, -2)).toEqual([5]);
    });
});
