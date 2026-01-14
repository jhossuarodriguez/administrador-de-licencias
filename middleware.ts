import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Permitir rutas públicas
    if (pathname === '/' ||
        pathname === '/signup' ||
        pathname === '/forgot-password' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }

    // Proteger rutas del dashboard
    if (pathname.startsWith('/dashboard')) {
        // Usar getSessionCookie de Better Auth para verificar la existencia de la cookie
        // NOTA: Esta verificación solo comprueba la existencia de la cookie, no su validez
        // La validación completa debe hacerse en cada página/ruta protegida
        const sessionCookie = getSessionCookie(req);

        if (!sessionCookie) {
            // No hay cookie de sesión, redirigir a login
            return NextResponse.redirect(new URL('/', req.url));
        }

        // La cookie existe, permitir el acceso
        // La validación completa de la sesión se hace en los componentes del servidor
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};