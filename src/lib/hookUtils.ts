/**
 * Utilidades Compartidas para Hooks
 * 
 * Funciones y utilidades reutilizables para todos los hooks del proyecto.
 * Sigue el patrón de arquitectura establecido en el proyecto.
 */

// ==================== ERROR HANDLING ====================

/**
 * Manejador de errores estándar
 */
export const handleError = (error: unknown, context: string = 'operación'): string => {
    console.error(`Error en ${context}:`, error);

    if (error instanceof Error) {
        return error.message;
    }

    return `Error desconocido en ${context}`;
};

/**
 * Verifica si un error es de red
 */
export const isNetworkError = (error: unknown): boolean => {
    return error instanceof TypeError && error.message.includes('fetch');
};

// ==================== LOADING STATES ====================

/**
 * Estados de carga combinados
 */
export interface LoadingStates {
    isLoading: boolean;
    isValidating: boolean;
    isError: boolean;
}

/**
 * Combina múltiples estados de carga
 */
export const combineLoadingStates = (...states: boolean[]): boolean => {
    return states.some(state => state === true);
};

// ==================== RETRY LOGIC ====================

/**
 * Opciones de retry
 */
export interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    backoff?: boolean;
}

/**
 * Ejecuta una función con reintentos automáticos
 */
export const withRetry = async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> => {
    const { maxRetries = 3, retryDelay = 1000, backoff = true } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            if (attempt < maxRetries) {
                const delay = backoff ? retryDelay * Math.pow(2, attempt) : retryDelay;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

// ==================== CACHE HELPERS ====================

/**
 * Construye query string desde filtros (compatible con buildQueryString de useReportTypes)
 */
export const buildQueryString = (params?: Record<string, unknown>): string => {
    if (!params || Object.keys(params).length === 0) return '';

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

/**
 * Genera una key de cache consistente
 */
export const generateCacheKey = (
    endpoint: string,
    params?: Record<string, unknown>
): string => {
    return `${endpoint}${buildQueryString(params)}`;
};

/**
 * Invalida múltiples cache keys
 */
export const invalidateCacheKeys = async (
    mutate: (key: string) => Promise<unknown>,
    keys: string[]
): Promise<void> => {
    await Promise.all(keys.map(key => mutate(key)));
};

// ==================== DEBOUNCE & THROTTLE ====================

/**
 * Debounce para hooks
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Throttle para hooks
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// ==================== DATA TRANSFORMATION ====================

/**
 * Transforma datos de API a formato del cliente
 */
export const transformApiData = <T, R>(
    data: T,
    transformer: (data: T) => R
): R => {
    try {
        return transformer(data);
    } catch (error) {
        console.error('Error transforming data:', error);
        throw new Error('Data transformation failed');
    }
};

/**
 * Filtra datos nulos o undefined
 */
export const filterNullish = <T>(array: (T | null | undefined)[]): T[] => {
    return array.filter((item): item is T => item !== null && item !== undefined);
};

// ==================== VALIDATION ====================

/**
 * Valida que los datos requeridos estén presentes
 */
export const validateRequiredFields = <T extends Record<string, unknown>>(
    data: T,
    requiredFields: (keyof T)[]
): boolean => {
    return requiredFields.every(field => {
        const value = data[field];
        return value !== null && value !== undefined && value !== '';
    });
};

/**
 * Sanitiza parámetros de filtro
 */
export const sanitizeFilters = (filters: Record<string, unknown>): Record<string, unknown> => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, unknown>);
};

// ==================== SWR CONFIG ====================

/**
 * Configuración estándar de SWR para el proyecto
 */
export const DEFAULT_SWR_CONFIG = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    dedupingInterval: 2000,
};

/**
 * Configuración de SWR con auto-refresh
 */
export const createSWRConfig = (autoRefresh: boolean = false, interval: number = 30000) => ({
    ...DEFAULT_SWR_CONFIG,
    refreshInterval: autoRefresh ? interval : 0,
});

// ==================== FORMATO DE DATOS ====================

/**
 * Formatea fecha para API
 */
export const formatDateForAPI = (date: Date | string): string => {
    const dateHelper = typeof date === 'string' ? new Date(date) : date;
    return dateHelper.toISOString().split('T')[0];
};

/**
 * Parsea fecha desde API
 */
export const parseDateFromAPI = (dateString: string): Date => {
    return new Date(dateString);
};

// ==================== TIPOS ÚTILES ====================

/**
 * Tipo para respuestas de API paginadas
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

/**
 * Tipo para respuestas de API estándar
 */
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Tipo para estados de hooks
 */
export interface HookState<T> {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    isValidating?: boolean;
}
