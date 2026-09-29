/**
 * Fetcher centralizado para todas las peticiones HTTP del proyecto
 * Usado por SWR y otras llamadas a la API
 */

export async function fetcher<T = unknown>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetcher con opciones personalizadas
 */
export async function fetcherWithOptions<T = unknown>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}
