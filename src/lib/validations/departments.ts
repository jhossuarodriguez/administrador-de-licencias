import { z } from "zod"
import { emptyStringToNull, idSchema, requiredStringSchema } from "./common"

export const departmentQuerySchema = z.object({
    active: z.enum(["true", "false"]).optional()
})

export const departmentCreateSchema = z.object({
    name: requiredStringSchema
        .min(2, "El nombre no puede contener menos de 2 caracteres")
        .max(100, "El nombre no puede exceder mas de 100 caracteres"),
    description: z.preprocess(
        emptyStringToNull,
        z.string()
            .trim()
            .max(500, "La descripcion no puede exceder mas de 500 caracteres")
            .optional()
            .nullable()
    )
})

export const departmentUpdateSchema = departmentCreateSchema.partial().extend({
    id: idSchema,
    active: z.boolean().optional()
})

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>
