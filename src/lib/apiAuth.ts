import { NextResponse } from 'next/server';
import { getSession } from './session';

export function validateSameOriginRequest(request: Request) {
    const origin = request.headers.get('origin');
    const expectedOrigin = new URL(process.env.APP_URL || request.url).origin;

    if (origin && origin !== expectedOrigin) {
        return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 });
    }

    return null;
}

export async function requireApiSession() {
    const session = await getSession();

    if (!session) {
        return {
            session: null,
            response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
        };
    }

    return { session, response: null };
}

export async function requireAdminRequest(request?: Request) {
    if (request) {
        const response = validateSameOriginRequest(request);

        if (response) {
            return { session: null, response };
        }
    }

    const { session, response } = await requireApiSession();

    if (response) {
        return { session: null, response };
    }

    if (!session) {
        return {
            session: null,
            response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
        };
    }

    if (session.user.role !== 'ADMIN') {
        return {
            session: null,
            response: NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 }),
        };
    }

    return { session, response: null };
}
