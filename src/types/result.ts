/**
 * Tipo Result discriminado para manejo explícito de errores.
 *
 * Regla: quien captura un error debe poder hacer algo útil con él.
 * Si solo puedes loguearlo, no lo captures — déjalo subir hasta quien sí
 * pueda (el componente que muestra el toast).
 */
export type Result<T = void> =
    | { ok: true; data: T }
    | { ok: false; error: string };
