// Better Auth responde en inglés; estos mensajes son los que ve el usuario.

const API_ERROR_MESSAGES: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: 'Credenciales inválidas',
    INVALID_USERNAME_OR_PASSWORD: 'Credenciales inválidas',
    INVALID_EMAIL: 'Debe ser un email válido',
    USER_ALREADY_EXISTS: 'Ya existe una cuenta con ese email',
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Ya existe una cuenta con ese email',
    USERNAME_IS_ALREADY_TAKEN: 'El nombre de usuario ya está en uso',
    USERNAME_TOO_SHORT: 'El nombre de usuario debe tener al menos 3 caracteres',
    USERNAME_TOO_LONG: 'El nombre de usuario no puede exceder 20 caracteres',
    INVALID_USERNAME: 'El nombre de usuario solo puede contener letras, números, guiones bajos y puntos',
    PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORD_TOO_LONG: 'La contraseña es demasiado larga',
    PROVIDER_NOT_FOUND: 'Este método de inicio de sesión no está disponible',
};

// Códigos que Better Auth agrega como ?error= al volver de GitHub o Google.
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
    access_denied: 'Cancelaste el inicio de sesión con el proveedor.',
    account_not_linked: 'Ya existe una cuenta con ese email. Inicia sesión con tu usuario y contraseña.',
    email_not_found: 'El proveedor no compartió tu email. En GitHub, revisa que tu email principal esté verificado.',
    email_not_verified: 'Tu email no está verificado en el proveedor.',
    signup_disabled: 'El registro de nuevas cuentas está deshabilitado.',
};

export function getAuthErrorMessage(error: { code?: string; message?: string; status?: number }): string {
    if (error.status === 429) return 'Demasiados intentos. Intenta más tarde.';
    return (error.code && API_ERROR_MESSAGES[error.code]) || error.message || 'No se pudo completar la solicitud';
}

export function getOAuthErrorMessage(code: string): string {
    return OAUTH_ERROR_MESSAGES[code] ?? 'No se pudo iniciar sesión con el proveedor. Intenta de nuevo.';
}
