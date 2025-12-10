// Sistema simple de rate limiting usando Map en memoria
// Para producción, considerar usar Redis o similar

interface RateLimitData {
    attempts: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

// Limpiar entradas antiguas cada 10 minutos
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
    /**
     * Número máximo de intentos permitidos
     * @default 5
     */
    maxAttempts?: number;

    /**
     * Ventana de tiempo en minutos
     * @default 15
     */
    windowMinutes?: number;
}

/**
 * Verifica si se ha excedido el límite de intentos
 * @param identifier - Identificador único (IP, username, etc.)
 * @param options - Opciones de configuración
 * @returns true si se excedió el límite, false en caso contrario
 */
export function isRateLimited(
    identifier: string,
    options: RateLimitOptions = {}
): boolean {
    const { maxAttempts = 5, windowMinutes = 15 } = options;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const data = rateLimitStore.get(identifier);

    if (!data) {
        // Primera vez, registrar intento
        rateLimitStore.set(identifier, {
            attempts: 1,
            resetTime: now + windowMs,
        });
        return false;
    }

    // Si el tiempo de reset ha pasado, reiniciar contador
    if (now > data.resetTime) {
        rateLimitStore.set(identifier, {
            attempts: 1,
            resetTime: now + windowMs,
        });
        return false;
    }

    // Incrementar intentos
    data.attempts++;

    // Verificar si se excedió el límite
    if (data.attempts > maxAttempts) {
        return true;
    }

    return false;
}

/**
 * Registra un intento fallido
 * @param identifier - Identificador único (IP, username, etc.)
 * @param options - Opciones de configuración
 */
export function recordFailedAttempt(
    identifier: string,
    options: RateLimitOptions = {}
): void {
    const { windowMinutes = 15 } = options;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    const data = rateLimitStore.get(identifier);

    if (!data || now > data.resetTime) {
        rateLimitStore.set(identifier, {
            attempts: 1,
            resetTime: now + windowMs,
        });
    } else {
        data.attempts++;
    }
}

/**
 * Reinicia el contador de intentos para un identificador
 * @param identifier - Identificador único (IP, username, etc.)
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier);
}

/**
 * Obtiene el tiempo restante (en segundos) hasta que se reinicie el límite
 * @param identifier - Identificador único
 * @returns segundos restantes o 0 si no hay límite activo
 */
export function getTimeUntilReset(identifier: string): number {
    const data = rateLimitStore.get(identifier);
    if (!data) return 0;

    const now = Date.now();
    const remaining = Math.max(0, data.resetTime - now);
    return Math.ceil(remaining / 1000);
}

/**
 * Obtiene el número de intentos restantes
 * @param identifier - Identificador único
 * @param options - Opciones de configuración
 * @returns número de intentos restantes
 */
export function getRemainingAttempts(
    identifier: string,
    options: RateLimitOptions = {}
): number {
    const { maxAttempts = 5 } = options;
    const data = rateLimitStore.get(identifier);

    if (!data) return maxAttempts;

    const now = Date.now();
    if (now > data.resetTime) return maxAttempts;

    return Math.max(0, maxAttempts - data.attempts);
}
