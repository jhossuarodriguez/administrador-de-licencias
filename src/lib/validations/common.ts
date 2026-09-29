import { z } from "zod"

//Schemas Common

export const emptyStringToUndefined = (value: unknown) => {
    if (value === null) return undefined
    if (typeof value === "string" && value.trim() === "") return undefined
    return value
}

export const emptyStringToNull = (value: unknown) => {
    if (typeof value === "string" && value.trim() === "") return null
    return value
}

export const idSchema = z.coerce
    .number("El ID debe ser un numero")
    .int("El ID debe ser un numero entero")
    .positive("El ID debe ser un numero positivo")

export const idQuerySchema = z.object({
    id: idSchema,
})

export const optionalIdSchema = z.preprocess(
    emptyStringToUndefined,
    idSchema.optional()
)

export const optionalDateSchema = z.preprocess(
    emptyStringToUndefined,
    z.coerce.date("Fecha invalida").optional()
)

export const requiredStringSchema = z.string()
    .trim()
    .min(1, "Este campo es requerido")

export const optionalTrimmedStringSchema = z.preprocess(
    emptyStringToUndefined,
    z.string().trim().optional()
)

export const optionalNullableTrimmedStringSchema = z.preprocess(
    emptyStringToNull,
    z.string().trim().optional().nullable()
)
