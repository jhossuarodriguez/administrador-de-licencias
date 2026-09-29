// Modo demo público. Es NEXT_PUBLIC_ porque el login necesita saberlo para mostrar
// el botón "Probar demo"; Next.js fija su valor al hacer el build.
export function isDemoMode() {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

// Cuenta compartida del demo. La contraseña es pública a propósito: la usa el botón
// "Probar demo". Los datos (y esta cuenta) se reinician cada día.
export const DEMO_ACCOUNT = {
    username: 'demo',
    password: 'demo-licencias',
    name: 'Cuenta Demo',
    email: 'demo@example.com',
} as const;

// Rutas de Better Auth que la cuenta demo puede usar. Todo lo demás (cambiar la
// contraseña, editar el perfil, vincular cuentas, ver o cerrar sesiones ajenas) queda
// bloqueado para que ningún visitante pueda dejar fuera a los demás.
const DEMO_ACCOUNT_PATHS = new Set(['/get-session', '/sign-out', '/is-username-available', '/ok', '/error']);
const DEMO_ACCOUNT_PATH_PREFIXES = ['/sign-in/', '/sign-up/', '/callback/'];

export function isAllowedForDemoAccount(path: string) {
    return DEMO_ACCOUNT_PATHS.has(path) || DEMO_ACCOUNT_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}
