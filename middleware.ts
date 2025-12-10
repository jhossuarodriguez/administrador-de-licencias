import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
        // Buscar cookie de sesión de Better Auth
        const sessionCookie = req.cookies.get('better-auth.session_token');

        if (!sessionCookie?.value) {
            // No hay sesión válida, redirigir a login
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Validar el token de sesión con Better Auth
        try {
            const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/api/auth/get-session`, {
                headers: {
                    'Cookie': `better-auth.session_token=${sessionCookie.value}`,
                },
            });

            if (!response.ok) {
                // Token inválido o expirado, redirigir a login
                return NextResponse.redirect(new URL('/', req.url));
            }

            const session = await response.json();

            if (!session?.user) {
                // No hay usuario en la sesión, redirigir a login
                return NextResponse.redirect(new URL('/', req.url));
            }

            // Sesión válida, continuar
        } catch (error) {
            // Error al validar sesión, redirigir a login por seguridad
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};