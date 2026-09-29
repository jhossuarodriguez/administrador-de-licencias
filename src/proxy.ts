import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Endpoints de Better Auth (login, registro, callbacks de GitHub/Google y sesión) y
    // tareas programadas, que se autentican con CRON_SECRET.
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/cron/')) {
        return NextResponse.next();
    }

    // Chequeo optimista: solo revisa la cookie. Cada página y endpoint valida la sesión real.
    if (getSessionCookie(request)) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/:path*'],
};
