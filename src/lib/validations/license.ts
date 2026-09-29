import { z } from "zod"
import {
    optionalDateSchema,
    optionalIdSchema,
    optionalNullableTrimmedStringSchema,
    requiredStringSchema,
} from "./common"

export const billingCycleSchema = z.enum(["MONTHLY", "YEARLY"], {
    message: "Ciclo de facturacion invalido"
})

export const currencySchema = z.enum(["USD", "DOP"], {
    message: "Moneda invalida"
})

const nonNegativeMoneySchema = z.coerce
    .number("El valor debe ser un numero")
    .nonnegative("El valor no puede ser negativo")

const nonNegativeIntegerSchema = z.coerce
    .number("El valor debe ser un numero")
    .int("El valor debe ser un numero entero")
    .nonnegative("El valor no puede ser negativo")

const licenseBaseShape = {
    sede: optionalNullableTrimmedStringSchema,
    provider: requiredStringSchema.max(100),
    startDate: optionalDateSchema,
    expiration: optionalDateSchema,
    assigned: optionalNullableTrimmedStringSchema,
    departmentId: optionalIdSchema,
    model: optionalNullableTrimmedStringSchema,
    plan: optionalNullableTrimmedStringSchema,
    unitCost: nonNegativeMoneySchema,
    installmentCost: nonNegativeMoneySchema,
    penaltyCost: nonNegativeMoneySchema,
    totalLicense: nonNegativeIntegerSchema,
    usedLicense: nonNegativeIntegerSchema,
    currency: currencySchema,
    billingCycle: billingCycleSchema,
    active: z.boolean()
}

const validateLicenseConsistency = (
    data: Partial<z.infer<z.ZodObject<typeof licenseBaseShape>>>,
    ctx: z.RefinementCtx
) => {
    if (data.startDate && data.expiration && data.startDate > data.expiration) {
        ctx.addIssue({
            code: "custom",
            message: "La fecha de vencimiento no puede ser anterior a la fecha de inicio",
            path: ["expiration"],
        })
    }

    if (
        data.totalLicense !== undefined &&
        data.usedLicense !== undefined &&
        data.usedLicense > data.totalLicense
    ) {
        ctx.addIssue({
            code: "custom",
            message: "Las licencias usadas no pueden exceder el total de licencias",
            path: ["usedLicense"],
        })
    }
}

export const licenseCreateSchema = z.object({
    ...licenseBaseShape,
    unitCost: nonNegativeMoneySchema.default(0),
    installmentCost: nonNegativeMoneySchema.default(0),
    penaltyCost: nonNegativeMoneySchema.default(0),
    totalLicense: nonNegativeIntegerSchema.default(0),
    usedLicense: nonNegativeIntegerSchema.default(0),
    currency: currencySchema.default("USD"),
    billingCycle: billingCycleSchema.default("MONTHLY"),
    active: z.boolean().default(true)
}).superRefine(validateLicenseConsistency)

export const licenseUpdateSchema = z.object(licenseBaseShape)
    .partial()
    .superRefine(validateLicenseConsistency)

export type LicenseCreateInput = z.infer<typeof licenseCreateSchema>
export type LicenseUpdateInput = z.infer<typeof licenseUpdateSchema>

// ============================================================================
// Formulario de edición (frontera cliente)
// ============================================================================
// Todos los campos son strings (lo que holds un input/select). La conversión
// string→number/Date la hace el API (licenseUpdateSchema → coerce), no el form.
// Así z.input === z.output y zodResolver tipa sin fricción con RHF.

const nonNegNumberString = z.string().refine(
    (v) => v === '' || /^\d+(\.\d+)?$/.test(v),
    'Debe ser un número no negativo',
);

const nonNegIntString = z.string().refine(
    (v) => v === '' || /^\d+$/.test(v),
    'Debe ser un entero no negativo',
);

export const licenseFormSchema = z.object({
    provider: z.string().min(1, 'Proveedor requerido').max(100, 'Máximo 100 caracteres'),
    sede: z.string().optional(),
    model: z.string().min(1, 'Modelo requerido').max(100, 'Máximo 100 caracteres'),
    currency: currencySchema,
    billingCycle: billingCycleSchema,
    startDate: z.string().optional(),
    expiration: z.string().optional(),
    assigned: z.string().optional(),
    departmentId: z.string().optional(),
    unitCost: nonNegNumberString,
    totalLicense: nonNegIntString,
    plan: z.string().max(100, 'Máximo 100 caracteres').optional(),
    installmentCost: nonNegNumberString,
    active: z.boolean(),
}).refine(
    (data) => !data.startDate || !data.expiration || data.startDate <= data.expiration,
    { message: 'La fecha de vencimiento no puede ser anterior a la fecha de inicio', path: ['expiration'] },
);

export type LicenseFormValues = z.infer<typeof licenseFormSchema>;
