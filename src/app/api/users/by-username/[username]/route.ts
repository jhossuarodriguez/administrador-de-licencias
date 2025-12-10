import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
<<<<<<< HEAD
import { isRateLimited, recordFailedAttempt, getTimeUntilReset } from "@/lib/rateLimit"
=======
>>>>>>> testing

export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params

        if (!username) {
            return NextResponse.json(
                { error: "Username es requerido" },
                { status: 400 }
            )
        }

<<<<<<< HEAD
        // Obtener IP del cliente para rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const identifier = `login:${ip}:${username}`;

        // Verificar rate limit
        if (isRateLimited(identifier, { maxAttempts: 5, windowMinutes: 15 })) {
            const timeRemaining = getTimeUntilReset(identifier);
            return NextResponse.json(
                {
                    error: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(timeRemaining / 60)} minutos.`,
                    retryAfter: timeRemaining
                },
                { status: 429 }
            );
        }

=======
>>>>>>> testing
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                status: true,
            },
        })

        if (!user) {
<<<<<<< HEAD
            // Registrar intento fallido
            recordFailedAttempt(identifier, { windowMinutes: 15 });
=======
>>>>>>> testing
            return NextResponse.json(
                { error: "Usuario o contraseña incorrectos" },
                { status: 404 }
            )
        }

        if (user.status !== "active") {
            return NextResponse.json(
                { error: "Usuario inactivo" },
                { status: 403 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
<<<<<<< HEAD
=======
        console.error("Error al buscar usuario:", error)
>>>>>>> testing
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}
