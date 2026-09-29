import { z } from "zod"
import { optionalIdSchema, optionalDateSchema, requiredStringSchema } from "./common"

export const userStatusSchema = z.enum(["active", "inactive"], {
    message: "Estado de usuario inválido",
})

const userBaseShape = {
    name: requiredStringSchema
        .min(2, "El nombre no puede contener menos de 2 caracteres")
        .max(100, "El nombre no puede exceder mas de 100 caracteres"),
    username: requiredStringSchema
        .min(3, "El nombre de usuario no puede contener menos de 3 caracteres")
        .max(50, "El nombre de usuario no puede exceder mas de 50 caracteres")
        .regex(/^[a-zA-Z0-9_.]+$/, "El usuario solo puede contener letras, numeros, guiones bajos y puntos"),
    status: userStatusSchema,
    departmentId: optionalIdSchema,
    startDate: optionalDateSchema,
}

export const userCreateSchema = z.object({
    ...userBaseShape,
    status: userStatusSchema.default("active"),
})

export const userUpdateSchema = z.object(userBaseShape).partial()

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>

export const userFormSchema = z.object({
    name: z.string()
        .min(2, 'El nombre no puede contener menos de 2 caracteres')
        .max(100, 'El nombre no puede exceder mas de 100 caracteres'),
    username: z.string()
        .min(3, 'El nombre de usuario no puede contener menos de 3 caracteres')
        .max(50, 'El nombre de usuario no puede exceder mas de 50 caracteres')
        .regex(/^[a-zA-Z0-9_.]+$/, 'El usuario solo puede contener letras, numeros, guiones bajos y puntos'),
    status: z.string().min(1, 'Estado requerido'),
    role: z.string().min(1, 'Rol requerido'),
    departmentId: z.string(),
    plan: z.string(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
