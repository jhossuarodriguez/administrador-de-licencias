import { z } from "zod"
import { emptyStringToNull, idSchema, requiredStringSchema } from "./common"

export const savedReportCreateSchema = z.object({
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
    ),
    config: z.record(z.string(), z.unknown())
})

export const savedReportUpdateSchema = savedReportCreateSchema.partial().extend({
    id: idSchema
})

export type SavedReportCreateInput = z.infer<typeof savedReportCreateSchema>
export type SavedReportUpdateInput = z.infer<typeof savedReportUpdateSchema>
