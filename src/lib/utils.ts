import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Prisma } from '@prisma/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda en Pesos Dominicanos (DOP)
 * @param amount - El monto a formatear
 * @param options - Opciones adicionales de formateo
 * @returns String formateado como moneda DOP
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    ...options
  }).format(amount)
}

/**
 * Formatea un número con separadores de miles según localización dominicana
 * @param value - El número a formatear
 * @returns String formateado con separadores de miles
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-DO').format(value)
}

/**
 * Convierte BigInt y Prisma Decimal a Number recursivamente
 * Útil para serializar datos de Prisma para JSON
 * @param obj - Objeto a convertir
 * @returns Objeto convertido con BigInt y Decimals como números
 */
export function convertBigIntToNumber(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // BigInt -> Number
  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  // Prisma Decimal -> Number
  try {
    if (obj instanceof Prisma.Decimal) {
      return obj.toNumber();
    }
  } catch { }

  // Date -> ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  // Objects
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }

  return obj;
}
