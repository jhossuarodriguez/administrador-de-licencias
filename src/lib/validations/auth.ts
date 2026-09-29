import { z } from "zod";

// Schema para registro
export const authRegisterBaseSchema = z.object({
    name: z.string().trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[\p{L}\s'-]+$/u, "El nombre solo puede contener letras, espacios, guiones y apóstrofes"),
    username: z.string().trim()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(20, "El nombre de usuario no puede exceder 20 caracteres")
        .regex(/^[a-zA-Z0-9_.]+$/, "El nombre de usuario solo puede contener letras, números, guiones bajos y puntos"),
    email: z.string().trim().toLowerCase()
        .email("Debe ser un email válido").trim().toLowerCase()
        .min(1, "El email es requerido")
        .max(100, "El email no puede exceder 100 caracteres"),
    password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(64, "La contraseña no puede exceder 64 caracteres")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
})

export const registerSchema = authRegisterBaseSchema
export const signupSchema = authRegisterBaseSchema.extend({
    confirmPassword: z.string()
        .min(1, "Confirmar contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
})

// Schema para login
export const loginSchema = z.object({
    identifier: z.string().trim()
        .min(1, "El usuario/email es requerido")
        .refine((val) => {
            // Validar si es email o username
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const isUsername = /^[a-zA-Z0-9_.]{3,20}$/.test(val);
            return isEmail || isUsername;
        }, "Debe ser un email válido o un nombre de usuario")
        .transform((val) => val.includes("@") ? val.toLowerCase() : val),
        password: z.string()
            .min(1, "La contraseña es requerida"),
});

// Tipos inferidos de los schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
