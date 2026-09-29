import { describe, it, expect } from 'vitest';
import { licenseCreateSchema, licenseUpdateSchema, billingCycleSchema, licenseFormSchema } from './license';

const validCreate = { provider: 'Microsoft' } as const;

describe('billingCycleSchema', () => {
    it('acepta MONTHLY y YEARLY', () => {
        expect(billingCycleSchema.parse('MONTHLY')).toBe('MONTHLY');
        expect(billingCycleSchema.parse('YEARLY')).toBe('YEARLY');
    });

    it('rechaza valores fuera del enum', () => {
        expect(billingCycleSchema.safeParse('Mensual').success).toBe(false);
        expect(billingCycleSchema.safeParse('Trimestral').success).toBe(false);
        expect(billingCycleSchema.safeParse('').success).toBe(false);
    });
});

describe('licenseCreateSchema', () => {
    it('acepta un input mínimo y aplica defaults', () => {
        const result = licenseCreateSchema.parse(validCreate);
        expect(result.provider).toBe('Microsoft');
        expect(result.unitCost).toBe(0);
        expect(result.installmentCost).toBe(0);
        expect(result.penaltyCost).toBe(0);
        expect(result.totalLicense).toBe(0);
        expect(result.usedLicense).toBe(0);
        expect(result.billingCycle).toBe('MONTHLY');
        expect(result.active).toBe(true);
    });

    it('coersiona strings numéricos a number', () => {
        const result = licenseCreateSchema.parse({
            ...validCreate,
            unitCost: '12.50',
            totalLicense: '5',
            usedLicense: '2',
        });
        expect(result.unitCost).toBe(12.5);
        expect(result.totalLicense).toBe(5);
        expect(result.usedLicense).toBe(2);
    });

    it('rechaza costos negativos', () => {
        expect(licenseCreateSchema.safeParse({ ...validCreate, unitCost: -1 }).success).toBe(false);
        expect(licenseCreateSchema.safeParse({ ...validCreate, installmentCost: '-5' }).success).toBe(false);
    });

    it('rechaza totalLicense decimal o negativo (entero no negativo)', () => {
        expect(licenseCreateSchema.safeParse({ ...validCreate, totalLicense: 1.5 }).success).toBe(false);
        expect(licenseCreateSchema.safeParse({ ...validCreate, totalLicense: -3 }).success).toBe(false);
    });

    it('rechaza provider vacío o mayor a 100 caracteres', () => {
        expect(licenseCreateSchema.safeParse({ provider: '' }).success).toBe(false);
        expect(licenseCreateSchema.safeParse({ provider: '   ' }).success).toBe(false);
        expect(licenseCreateSchema.safeParse({ provider: 'x'.repeat(101) }).success).toBe(false);
    });

    describe('validación de consistencia (superRefine)', () => {
        it('rechaza usedLicense > totalLicense con error en usedLicense', () => {
            const result = licenseCreateSchema.safeParse({
                ...validCreate,
                usedLicense: 5,
                totalLicense: 3,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const paths = result.error.issues.map((i) => i.path.join('.'));
                expect(paths).toContain('usedLicense');
            }
        });

        it('acepta usedLicense <= totalLicense', () => {
            expect(
                licenseCreateSchema.safeParse({ ...validCreate, usedLicense: 2, totalLicense: 5 }).success,
            ).toBe(true);
            expect(
                licenseCreateSchema.safeParse({ ...validCreate, usedLicense: 5, totalLicense: 5 }).success,
            ).toBe(true);
        });

        it('rechaza vencimiento anterior a la fecha de inicio con error en expiration', () => {
            const result = licenseCreateSchema.safeParse({
                ...validCreate,
                startDate: '2024-12-01',
                expiration: '2024-01-01',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                const paths = result.error.issues.map((i) => i.path.join('.'));
                expect(paths).toContain('expiration');
            }
        });

        it('acepta vencimiento posterior a la fecha de inicio', () => {
            expect(
                licenseCreateSchema.safeParse({
                    ...validCreate,
                    startDate: '2024-01-01',
                    expiration: '2024-12-01',
                }).success,
            ).toBe(true);
        });
    });
});

describe('licenseUpdateSchema (partial)', () => {
    it('acepta objeto vacío (todos opcionales)', () => {
        expect(licenseUpdateSchema.safeParse({}).success).toBe(true);
    });

    it('acepta actualización parcial', () => {
        expect(licenseUpdateSchema.safeParse({ provider: 'Nuevo' }).success).toBe(true);
    });

    it('sigue aplicando consistencia cuando ambos campos están presentes', () => {
        expect(
            licenseUpdateSchema.safeParse({ usedLicense: 10, totalLicense: 5 }).success,
        ).toBe(false);
    });

    it('no aplica consistencia si falta uno de los campos', () => {
        expect(licenseUpdateSchema.safeParse({ usedLicense: 99 }).success).toBe(true);
        expect(licenseUpdateSchema.safeParse({ totalLicense: 1 }).success).toBe(true);
    });
});

describe('licenseFormSchema', () => {
    const validForm = {
        provider: 'Microsoft',
        sede: 'Sede Central',
        model: 'Office',
        currency: 'USD',
        billingCycle: 'MONTHLY',
        startDate: '2024-01-01',
        expiration: '2024-12-01',
        assigned: 'TI',
        departmentId: '3',
        unitCost: '12.50',
        totalLicense: '5',
        plan: 'E3',
        installmentCost: '10.00',
        active: true,
    };

    it('mantiene los valores como strings (la coerción la hace el API)', () => {
        const result = licenseFormSchema.parse(validForm);
        expect(result.unitCost).toBe('12.50');
        expect(result.totalLicense).toBe('5');
        expect(result.installmentCost).toBe('10.00');
        expect(result.departmentId).toBe('3');
    });

    it('rechaza provider o model vacíos', () => {
        expect(licenseFormSchema.safeParse({ ...validForm, provider: '' }).success).toBe(false);
        expect(licenseFormSchema.safeParse({ ...validForm, model: '' }).success).toBe(false);
    });

    it('acepta plan vacío u omitido', () => {
        expect(licenseFormSchema.safeParse({ ...validForm, plan: '' }).success).toBe(true);
        expect(licenseFormSchema.safeParse({ ...validForm, plan: undefined }).success).toBe(true);
    });

    it('campos opcionales aceptan string vacío', () => {
        const result = licenseFormSchema.parse({
            ...validForm,
            sede: '',
            startDate: '',
            expiration: '',
            assigned: '',
            departmentId: '',
        });
        expect(result.sede).toBe('');
        expect(result.startDate).toBe('');
        expect(result.departmentId).toBe('');
    });

    it('rechaza costos no numéricos o negativos', () => {
        expect(licenseFormSchema.safeParse({ ...validForm, unitCost: 'abc' }).success).toBe(false);
        expect(licenseFormSchema.safeParse({ ...validForm, unitCost: '-5' }).success).toBe(false);
    });

    it('rechaza totalLicense decimal (debe ser entero)', () => {
        expect(licenseFormSchema.safeParse({ ...validForm, totalLicense: '1.5' }).success).toBe(false);
    });

    it('rechaza vencimiento anterior a inicio (refine)', () => {
        const result = licenseFormSchema.safeParse({
            ...validForm,
            startDate: '2024-12-01',
            expiration: '2024-01-01',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path.join('.'));
            expect(paths).toContain('expiration');
        }
    });

    it('acepta cuando faltan fechas (no aplica refine)', () => {
        expect(licenseFormSchema.safeParse({ ...validForm, startDate: '', expiration: '' }).success).toBe(true);
    });
});
