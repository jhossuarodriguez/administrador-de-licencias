import { z } from "zod"
import { optionalDateSchema, optionalIdSchema, optionalTrimmedStringSchema } from "./common"

export const reportFormatSchema = z.enum(["json", "csv", "excel"])

export const reportExportQuerySchema = z.object({
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    format: reportFormatSchema.default("json"),
}).refine(
    (data) => {
        return (data.startDate && data.endDate) || (!data.startDate && !data.endDate)
    },
    {
        message: "Debes enviar startDate y endDate juntos",
        path: ["endDate"],
    }
).refine(
    (data) => {
        if (!data.startDate || !data.endDate) return true
        return data.startDate <= data.endDate
    },
    {
        message: "La fecha inicial no puede ser mayor que la fecha final",
        path: ["startDate"],
    }
)

export const reportStatusSchema = z.enum(["active", "inactive", "expiring"])
export const customReportChartTypeSchema = z.enum(["bar", "line", "pie", "area", "table"])

const dateRangePairSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => schema.refine(
    (data) => {
        const value = data as { startDate?: Date; endDate?: Date }
        return (value.startDate && value.endDate) || (!value.startDate && !value.endDate)
    },
    {
        message: "Debes enviar startDate y endDate juntos",
        path: ["endDate"],
    }
).refine(
    (data) => {
        const value = data as { startDate?: Date; endDate?: Date }
        if (!value.startDate || !value.endDate) return true
        return value.startDate <= value.endDate
    },
    {
        message: "La fecha inicial no puede ser mayor que la fecha final",
        path: ["startDate"],
    }
)

export const reportExportOptionsQuerySchema = dateRangePairSchema(z.object({
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    provider: optionalTrimmedStringSchema,
    department: optionalIdSchema,
    status: reportStatusSchema.optional(),
}))

export const reportSummaryQuerySchema = dateRangePairSchema(z.object({
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    provider: optionalTrimmedStringSchema,
    department: optionalIdSchema,
}))

export const reportTemporalQuerySchema = z.object({
    months: z.preprocess(
        (value) => value === "" || value === null ? undefined : value,
        z.coerce
            .number("Los meses deben ser un numero")
            .int("Los meses deben ser un numero entero")
            .min(1, "Debes analizar al menos 1 mes")
            .max(60, "No puedes analizar mas de 60 meses")
            .default(12)
    ),
    provider: optionalTrimmedStringSchema,
})

export const reportAuditQuerySchema = z.object({
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
}).refine(
    (data) => {
        if (!data.startDate || !data.endDate) return true
        return data.startDate <= data.endDate
    },
    {
        message: "La fecha inicial no puede ser mayor que la fecha final",
        path: ["startDate"],
    }
)

export const customReportMetricSchema = z.enum([
    "totalLicenses",
    "activeLicenses",
    "expiredLicenses",
    "totalCost",
    "monthlyCost",
    "utilizationRate",
    "availableSeats",
    "totalLicense",
    "usedLicense",
    "expiringSoon",
    "userCount",
])

export const customReportGroupBySchema = z.enum([
    "provider",
    "department",
    "billingCycle",
    "month",
    "status",
    "user",
])

export const customReportDateRangeSchema = z.enum(["7", "30", "90", "365", "all"])

export const customReportExportSchema = z.object({
    config: z.object({
        name: z.string().trim().max(100, "El nombre no puede exceder mas de 100 caracteres").optional(),
        description: z.string().trim().max(500, "La descripcion no puede exceder mas de 500 caracteres").optional(),
        metrics: z.array(customReportMetricSchema).min(1, "Debes seleccionar al menos una metrica"),
        filters: z.object({
            provider: optionalTrimmedStringSchema,
            department: optionalIdSchema,
            billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
        }).default({}),
        groupBy: z.preprocess(
            (value) => value === "" || value === null ? undefined : value,
            customReportGroupBySchema.optional()
        ),
        sortBy: optionalTrimmedStringSchema,
        chartType: z.preprocess(
            (value) => value === "" || value === null ? undefined : value,
            customReportChartTypeSchema.optional()
        ),
        dateRange: z.preprocess(
            (value) => value === "" || value === null ? undefined : value,
            customReportDateRangeSchema.default("30")
        ),
    }),
    format: z.preprocess(
        (value) => value === "" || value === null ? undefined : value,
        z.literal("csv").default("csv")
    ),
})

export type ReportExportQuery = z.infer<typeof reportExportQuerySchema>
export type ReportExportOptionsQuery = z.infer<typeof reportExportOptionsQuerySchema>
export type ReportSummaryQuery = z.infer<typeof reportSummaryQuerySchema>
export type ReportTemporalQuery = z.infer<typeof reportTemporalQuerySchema>
export type ReportAuditQuery = z.infer<typeof reportAuditQuerySchema>
export type CustomReportExportInput = z.infer<typeof customReportExportSchema>
