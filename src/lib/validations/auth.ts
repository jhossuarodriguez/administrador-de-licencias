import { z } from "zod";

// Schema para login
export const loginSchema = z.object({
    identifier: z.string()
        .min(1, { error: "El usuario/email es requerido" })
        .refine((val) => {
            // Validar si es email o username
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(val);
            return isEmail || isUsername;
        }, { error: "Debe ser un email válido o un nombre de usuario" }),
    password: z.string()
        .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
        .max(64, { error: "La contraseña no puede exceder 64 caracteres" }),
});

// Schema para registro (sin confirmPassword para validación inicial)
const signupBaseSchema = z.object({
    name: z.string()
        .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
        .max(100, { error: "El nombre no puede exceder 100 caracteres" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { error: "El nombre solo puede contener letras y espacios" }),
    username: z.string()
        .min(3, { error: "El nombre de usuario debe tener al menos 3 caracteres" })
        .max(20, { error: "El nombre de usuario no puede exceder 20 caracteres" })
        .regex(/^[a-zA-Z0-9_]+$/, { error: "El nombre de usuario solo puede contener letras, números y guiones bajos" })
        .optional(),
    email: z.email({ error: "Debe ser un email válido" })
        .max(100, { error: "El email no puede exceder 100 caracteres" }),
    password: z.string()
        .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
        .max(64, { error: "La contraseña no puede exceder 64 caracteres" })
        .regex(/[a-z]/, { error: "La contraseña debe contener al menos una minúscula" })
        .regex(/[A-Z]/, { error: "La contraseña debe contener al menos una mayúscula" })
        .regex(/[0-9]/, { error: "La contraseña debe contener al menos un número" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { error: "La contraseña debe contener al menos un carácter especial" }),
    confirmPassword: z.string(),
});

// Schema completo con refinamiento para confirmar contraseña
export const signupSchema = signupBaseSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        error: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    }
);

// Schema para registro sin confirmPassword (para uso con Better Auth)
export const signupDataSchema = signupBaseSchema.omit({ confirmPassword: true });

// Tipos inferidos de los schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SignupData = z.infer<typeof signupDataSchema>;
