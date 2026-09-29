import { z } from 'zod';
import { emptyStringToNull, idSchema, requiredStringSchema } from './common';

export const sedeQuerySchema = z.object({
    active: z.enum(['true', 'false']).optional(),
});

export const sedeCreateSchema = z.object({
    name: requiredStringSchema
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: z.preprocess(
        emptyStringToNull,
        z.string()
            .trim()
            .max(500, 'La descripcion no puede exceder 500 caracteres')
            .optional()
            .nullable(),
    ),
});

export const sedeUpdateSchema = sedeCreateSchema.partial().extend({
    id: idSchema,
    active: z.boolean().optional(),
}).refine(
    ({ name, description, active }) =>
        name !== undefined || description !== undefined || active !== undefined,
    { message: 'Debes indicar al menos un campo para actualizar' },
);
