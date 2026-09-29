import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { username } from 'better-auth/plugins';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './password';
import { registerSchema } from './validations/auth';
import { DEMO_ACCOUNT, isAllowedForDemoAccount, isDemoMode } from './demo';

// Un proveedor sin credenciales queda deshabilitado: su botón responde "no disponible".
const oauthCredentials = (clientId?: string, clientSecret?: string) => ({
    clientId: clientId ?? '',
    clientSecret: clientSecret ?? '',
    enabled: Boolean(clientId && clientSecret),
});

export const auth = betterAuth({
    appName: 'Administrador de Licencias',
    // URL pública: de ella salen las URLs de callback de GitHub y Google.
    baseURL: process.env.APP_URL,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    // El modelo "User" es de negocio, así que las tablas de auth usan los modelos Auth*.
    user: {
        modelName: 'authUser',
        additionalFields: {
            role: {
                type: ['ADMIN', 'USER'],
                required: false,
                defaultValue: 'USER',
                input: false,
            },
        },
    },
    session: { modelName: 'authSession' },
    account: { modelName: 'authAccount' },
    verification: { modelName: 'authVerification' },
    emailAndPassword: {
        enabled: true,
        password: { hash: hashPassword, verify: verifyPassword },
    },
    socialProviders: {
        github: oauthCredentials(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET),
        google: {
            ...oauthCredentials(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET),
            prompt: 'select_account',
        },
    },
    rateLimit: {
        // En Vercel cada invocación puede caer en otra instancia: los contadores van a Postgres.
        storage: process.env.VERCEL ? 'database' : 'memory',
        modelName: 'authRateLimit',
        customRules: {
            '/sign-up/email': { window: 60 * 60, max: 5 },
        },
    },
    advanced: {
        // IP del cliente que envía Nginx. Sin ella, el rate limit de login usaría
        // un único contador para todos los usuarios.
        ipAddress: { ipAddressHeaders: ['x-real-ip', 'x-forwarded-for'] },
    },
    databaseHooks: {
        user: {
            create: {
                // El primer usuario registrado (con cualquier método) administra el sistema.
                before: async (user) => {
                    const userCount = await prisma.authUser.count();
                    return { data: { ...user, role: userCount === 0 ? 'ADMIN' : 'USER' } };
                },
            },
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            // Mantiene en el servidor las reglas del formulario de registro (contraseña fuerte, nombre, usuario).
            if (ctx.path === '/sign-up/email') {
                const validation = registerSchema.safeParse(ctx.body);
                if (!validation.success) {
                    throw new APIError('BAD_REQUEST', {
                        message: validation.error.issues[0]?.message ?? 'Datos inválidos',
                    });
                }
                return;
            }

            // La cuenta demo es compartida: nadie puede cambiarle la contraseña, el perfil ni las sesiones.
            if (isDemoMode() && !isAllowedForDemoAccount(ctx.path)) {
                const session = await getSessionFromCtx(ctx);
                const sessionUser = session?.user as { username?: string | null } | undefined;
                if (sessionUser?.username === DEMO_ACCOUNT.username) {
                    throw new APIError('FORBIDDEN', { message: 'La cuenta demo no se puede modificar' });
                }
            }
        }),
    },
    plugins: [username({ maxUsernameLength: 20 }), nextCookies()],
});
