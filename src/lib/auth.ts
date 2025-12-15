import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    appName: "Administrador-de-Licencias",

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        autoSignIn: true, // Necesario para crear el registro en Account
        minPasswordLength: 8,
        maxPasswordLength: 64,
        requireEmailVerification: false, // Cambiar a true cuando configures email
    },

    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 días
        updateAge: 60 * 60 * 24, // actualizar cada 24 horas
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutos
        },
    },

    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
            enabled: false,
        },
        database: {
            generateId: "serial", // Usar IDs numéricos auto-incrementales
        },
    },

    user: {
        additionalFields: {
            username: {
                type: "string",
                required: false, // Cambiar a false para que no sea obligatorio en el registro
                unique: true,
                input: true, // Permitir que se envíe desde el cliente
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "active",
            },
            departmentId: {
                type: "number",
                required: false,
            },
            startDate: {
                type: "date",
                required: false,
            },
        },
    },

    trustedOrigins: [
        process.env.NEXT_PUBLIC || "http://localhost:3000",
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ].filter(Boolean),

    plugins: [
        nextCookies(),
    ],

    // Configuración para futuros proveedores sociales (Google, Microsoft, etc.)
    // socialProviders: {
    //     google: {
    //         clientId: process.env.GOOGLE_CLIENT_ID || "",
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //     },
    // },
});