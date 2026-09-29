import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DEMO_ACCOUNT, isDemoMode } from './demo';
import { hashPassword } from './password';

const DAY_MS = 24 * 60 * 60 * 1000;

const DEPARTMENTS = [
    { name: 'Tecnología', description: 'Infraestructura, desarrollo y soporte' },
    { name: 'Finanzas', description: 'Contabilidad y tesorería' },
    { name: 'Recursos Humanos', description: 'Talento y nómina' },
    { name: 'Marketing', description: 'Marca, contenido y campañas' },
    { name: 'Ventas', description: 'Equipo comercial' },
    { name: 'Operaciones', description: 'Logística y atención al cliente' },
];

const SEDES = [
    { name: 'Sede Central', description: 'Oficina principal' },
    { name: 'Sucursal Norte', description: 'Oficina regional' },
    { name: 'Remoto', description: 'Personal que trabaja a distancia' },
];

type DemoUser = { name: string; username: string; department: string; createdDaysAgo: number; inactive?: boolean };

const USERS: DemoUser[] = [
    { name: 'Carlos Méndez', username: 'cmendez', department: 'Tecnología', createdDaysAgo: 400 },
    { name: 'Laura Gómez', username: 'lgomez', department: 'Tecnología', createdDaysAgo: 380 },
    { name: 'Diego Ramírez', username: 'dramirez', department: 'Tecnología', createdDaysAgo: 200 },
    { name: 'Sofía Herrera', username: 'sherrera', department: 'Tecnología', createdDaysAgo: 45 },
    { name: 'Andrés Castillo', username: 'acastillo', department: 'Tecnología', createdDaysAgo: 4 },
    { name: 'María Fernández', username: 'mfernandez', department: 'Finanzas', createdDaysAgo: 390 },
    { name: 'Jorge Peña', username: 'jpena', department: 'Finanzas', createdDaysAgo: 300 },
    { name: 'Valeria Ortiz', username: 'vortiz', department: 'Finanzas', createdDaysAgo: 20 },
    { name: 'Patricia Rojas', username: 'projas', department: 'Recursos Humanos', createdDaysAgo: 360 },
    { name: 'Luis Navarro', username: 'lnavarro', department: 'Recursos Humanos', createdDaysAgo: 150 },
    { name: 'Camila Vargas', username: 'cvargas', department: 'Marketing', createdDaysAgo: 280 },
    { name: 'Daniel Ruiz', username: 'druiz', department: 'Marketing', createdDaysAgo: 35 },
    { name: 'Isabel Morales', username: 'imorales', department: 'Marketing', createdDaysAgo: 120 },
    { name: 'Tomás Guzmán', username: 'tguzman', department: 'Marketing', createdDaysAgo: 2 },
    { name: 'Ricardo Silva', username: 'rsilva', department: 'Ventas', createdDaysAgo: 330 },
    { name: 'Natalia Reyes', username: 'nreyes', department: 'Ventas', createdDaysAgo: 90 },
    { name: 'Fernando Cruz', username: 'fcruz', department: 'Ventas', createdDaysAgo: 60 },
    { name: 'Gabriela Soto', username: 'gsoto', department: 'Ventas', createdDaysAgo: 25 },
    { name: 'Pablo Medina', username: 'pmedina', department: 'Ventas', createdDaysAgo: 240, inactive: true },
    { name: 'Elena Castro', username: 'ecastro', department: 'Operaciones', createdDaysAgo: 310 },
    { name: 'Miguel Torres', username: 'mtorres', department: 'Operaciones', createdDaysAgo: 270 },
    { name: 'Lucía Paredes', username: 'lparedes', department: 'Operaciones', createdDaysAgo: 180 },
    { name: 'Héctor Lozano', username: 'hlozano', department: 'Operaciones', createdDaysAgo: 220, inactive: true },
    { name: 'Paula Jiménez', username: 'pjimenez', department: 'Operaciones', createdDaysAgo: 10 },
];

type DemoLicense = {
    provider: string;
    model: string;
    plan: string;
    billingCycle: 'MONTHLY' | 'YEARLY';
    unitCost: number;
    installmentCost?: number;
    totalLicense: number;
    usedLicense: number;
    department: string;
    sede: string;
    assigned: string;
    // Las anuales vencen 365 días después del inicio
    startedDaysAgo: number;
    createdDaysAgo: number;
    updatedDaysAgo?: number;
    inactive?: boolean;
};

// Precios de referencia en USD. Incluye a propósito licencias por vencer, una vencida
// y algunas subutilizadas para que los reportes y alertas tengan contenido.
const LICENSES: DemoLicense[] = [
    { provider: 'Microsoft', model: 'Microsoft 365 Business Standard', plan: 'Business Standard', billingCycle: 'YEARLY', unitCost: 150, totalLicense: 30, usedLicense: 26, department: 'Tecnología', sede: 'Sede Central', assigned: 'Carlos Méndez', startedDaysAgo: 200, createdDaysAgo: 198 },
    { provider: 'Microsoft', model: 'Power BI Pro', plan: 'Pro', billingCycle: 'MONTHLY', unitCost: 14, totalLicense: 10, usedLicense: 7, department: 'Finanzas', sede: 'Sede Central', assigned: 'María Fernández', startedDaysAgo: 120, createdDaysAgo: 118 },
    { provider: 'Microsoft', model: 'Visual Studio Professional', plan: 'Professional', billingCycle: 'YEARLY', unitCost: 499, totalLicense: 5, usedLicense: 4, department: 'Tecnología', sede: 'Sede Central', assigned: 'Laura Gómez', startedDaysAgo: 356, createdDaysAgo: 356, updatedDaysAgo: 6 },
    { provider: 'Adobe', model: 'Creative Cloud', plan: 'Todas las apps', billingCycle: 'YEARLY', unitCost: 1079, totalLicense: 6, usedLicense: 5, department: 'Marketing', sede: 'Sede Central', assigned: 'Camila Vargas', startedDaysAgo: 250, createdDaysAgo: 248 },
    { provider: 'Adobe', model: 'Acrobat Pro', plan: 'Pro', billingCycle: 'MONTHLY', unitCost: 22.99, totalLicense: 12, usedLicense: 5, department: 'Operaciones', sede: 'Sucursal Norte', assigned: 'Elena Castro', startedDaysAgo: 90, createdDaysAgo: 88 },
    { provider: 'Google', model: 'Google Workspace', plan: 'Business Starter', billingCycle: 'MONTHLY', unitCost: 7.2, totalLicense: 20, usedLicense: 18, department: 'Ventas', sede: 'Remoto', assigned: 'Ricardo Silva', startedDaysAgo: 300, createdDaysAgo: 299 },
    { provider: 'Atlassian', model: 'Jira Software', plan: 'Standard', billingCycle: 'MONTHLY', unitCost: 8.6, totalLicense: 15, usedLicense: 11, department: 'Tecnología', sede: 'Remoto', assigned: 'Diego Ramírez', startedDaysAgo: 60, createdDaysAgo: 60, updatedDaysAgo: 10 },
    { provider: 'Atlassian', model: 'Confluence', plan: 'Standard', billingCycle: 'MONTHLY', unitCost: 6.4, totalLicense: 15, usedLicense: 6, department: 'Tecnología', sede: 'Remoto', assigned: 'Sofía Herrera', startedDaysAgo: 60, createdDaysAgo: 58 },
    { provider: 'Slack', model: 'Slack', plan: 'Pro', billingCycle: 'MONTHLY', unitCost: 8.75, totalLicense: 40, usedLicense: 34, department: 'Operaciones', sede: 'Sede Central', assigned: 'Miguel Torres', startedDaysAgo: 280, createdDaysAgo: 279 },
    { provider: 'Zoom', model: 'Zoom Workplace', plan: 'Business', billingCycle: 'YEARLY', unitCost: 219.9, totalLicense: 10, usedLicense: 8, department: 'Recursos Humanos', sede: 'Sede Central', assigned: 'Patricia Rojas', startedDaysAgo: 345, createdDaysAgo: 344 },
    { provider: 'Autodesk', model: 'AutoCAD', plan: 'Suscripción anual', billingCycle: 'YEARLY', unitCost: 2030, installmentCost: 150, totalLicense: 3, usedLicense: 3, department: 'Operaciones', sede: 'Sucursal Norte', assigned: 'Lucía Paredes', startedDaysAgo: 160, createdDaysAgo: 158 },
    { provider: 'Salesforce', model: 'Sales Cloud', plan: 'Enterprise', billingCycle: 'MONTHLY', unitCost: 165, installmentCost: 500, totalLicense: 8, usedLicense: 7, department: 'Ventas', sede: 'Sucursal Norte', assigned: 'Natalia Reyes', startedDaysAgo: 40, createdDaysAgo: 2 },
    { provider: 'Figma', model: 'Figma', plan: 'Professional', billingCycle: 'YEARLY', unitCost: 180, totalLicense: 4, usedLicense: 4, department: 'Marketing', sede: 'Remoto', assigned: 'Daniel Ruiz', startedDaysAgo: 20, createdDaysAgo: 18 },
    { provider: 'GitHub', model: 'GitHub Team', plan: 'Team', billingCycle: 'MONTHLY', unitCost: 4, totalLicense: 12, usedLicense: 9, department: 'Tecnología', sede: 'Remoto', assigned: 'Andrés Castillo', startedDaysAgo: 15, createdDaysAgo: 5 },
    { provider: 'ESET', model: 'ESET PROTECT', plan: 'Entry', billingCycle: 'YEARLY', unitCost: 39, totalLicense: 50, usedLicense: 43, department: 'Tecnología', sede: 'Sede Central', assigned: 'Carlos Méndez', startedDaysAgo: 380, createdDaysAgo: 380, updatedDaysAgo: 12 },
    { provider: 'Canva', model: 'Canva para Equipos', plan: 'Teams', billingCycle: 'YEARLY', unitCost: 100, totalLicense: 5, usedLicense: 1, department: 'Marketing', sede: 'Remoto', assigned: 'Isabel Morales', startedDaysAgo: 210, createdDaysAgo: 209, inactive: true },
    { provider: 'Intuit', model: 'QuickBooks Online', plan: 'Plus', billingCycle: 'MONTHLY', unitCost: 99, totalLicense: 3, usedLicense: 3, department: 'Finanzas', sede: 'Sede Central', assigned: 'Jorge Peña', startedDaysAgo: 330, createdDaysAgo: 329 },
];

// Todos los usuarios activos tienen Microsoft 365; además, las licencias de su departamento.
const ORGANIZATION_LICENSE = 'Microsoft 365 Business Standard';
const DEPARTMENT_LICENSES: Record<string, string[]> = {
    'Tecnología': ['Jira Software', 'GitHub Team'],
    'Finanzas': ['Power BI Pro', 'QuickBooks Online'],
    'Recursos Humanos': ['Zoom Workplace'],
    'Marketing': ['Creative Cloud', 'Figma'],
    'Ventas': ['Sales Cloud'],
    'Operaciones': ['Acrobat Pro'],
};

// Antigüedad de las asignaciones: varias en los últimos 30 días para el reporte de auditoría.
const ASSIGNMENT_AGES_IN_DAYS = [2, 5, 9, 14, 19, 24, 29, 38, 47, 58, 66, 75, 84, 110, 140, 170, 200];

function lookup<K, V>(map: Map<K, V>, key: K): V {
    const value = map.get(key);
    if (value === undefined) throw new Error(`Dato de demo sin referencia: ${String(key)}`);
    return value;
}

export function buildDemoData(now: Date) {
    const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS);

    const users = USERS.map(({ createdDaysAgo, inactive, ...user }) => ({
        ...user,
        status: inactive ? 'inactive' : 'active',
        startDate: daysAgo(createdDaysAgo),
        createdAt: daysAgo(createdDaysAgo),
    }));

    const licenses = LICENSES.map(({ startedDaysAgo, createdDaysAgo, updatedDaysAgo, installmentCost = 0, inactive, ...license }) => ({
        ...license,
        currency: 'USD' as const,
        installmentCost,
        penaltyCost: 0,
        active: !inactive,
        startDate: daysAgo(startedDaysAgo),
        expiration: license.billingCycle === 'YEARLY' ? daysAgo(startedDaysAgo - 365) : null,
        createdAt: daysAgo(createdDaysAgo),
        updatedAt: daysAgo(updatedDaysAgo ?? createdDaysAgo),
    }));

    const userCreatedAt = new Map(users.map((user) => [user.username, user.createdAt]));
    const licenseCreatedAt = new Map(licenses.map((license) => [license.model, license.createdAt]));

    // La licencia del departamento va primero: es la que muestra la tabla de usuarios.
    const assignments = users
        .filter((user) => user.status === 'active')
        .flatMap((user) => [...(DEPARTMENT_LICENSES[user.department] ?? []), ORGANIZATION_LICENSE]
            .map((model) => ({ username: user.username, model })))
        .map((assignment, index) => {
            // Nunca antes de que existieran el usuario y la licencia
            const assignedAt = Math.max(
                lookup(userCreatedAt, assignment.username).getTime(),
                lookup(licenseCreatedAt, assignment.model).getTime(),
                now.getTime() - ASSIGNMENT_AGES_IN_DAYS[index % ASSIGNMENT_AGES_IN_DAYS.length] * DAY_MS,
            );
            return { ...assignment, assignedAt: new Date(assignedAt) };
        });

    return { departments: DEPARTMENTS, sedes: SEDES, users, licenses, assignments };
}

// Reemplaza todos los datos por los del demo y borra las cuentas de los visitantes.
export async function resetDemoData(prisma: PrismaClient, now = new Date()) {
    // Borra la base completa: nunca debe correr fuera del modo demo
    if (!isDemoMode()) {
        throw new Error('El reinicio del demo requiere NEXT_PUBLIC_DEMO_MODE=true');
    }

    const data = buildDemoData(now);
    const passwordHash = await hashPassword(DEMO_ACCOUNT.password);

    await prisma.$transaction(async (tx) => {
        await tx.assignment.deleteMany();
        await tx.license.deleteMany();
        await tx.user.deleteMany();
        await tx.department.deleteMany();
        await tx.sede.deleteMany();
        await tx.savedReport.deleteMany();
        // Sesiones y cuentas vinculadas se borran en cascada
        await tx.authUser.deleteMany();
        await tx.authVerification.deleteMany();

        const departments = await tx.department.createManyAndReturn({ data: data.departments });
        const departmentIds = new Map(departments.map((department) => [department.name, department.id]));

        await tx.sede.createMany({ data: data.sedes });

        const users = await tx.user.createManyAndReturn({
            data: data.users.map(({ department, ...user }) => ({ ...user, departmentId: lookup(departmentIds, department) })),
        });
        const userIds = new Map(users.map((user) => [user.username, user.id]));

        const licenses = await tx.license.createManyAndReturn({
            data: data.licenses.map(({ department, ...license }) => ({ ...license, departmentId: lookup(departmentIds, department) })),
        });
        const licenseIds = new Map(licenses.map((license) => [license.model, license.id]));

        await tx.assignment.createMany({
            data: data.assignments.map(({ username, model, assignedAt }) => ({
                userId: lookup(userIds, username),
                licenseId: lookup(licenseIds, model),
                assignedAt,
            })),
        });

        const demoUserId = randomUUID();
        await tx.authUser.create({
            data: {
                id: demoUserId,
                name: DEMO_ACCOUNT.name,
                email: DEMO_ACCOUNT.email,
                emailVerified: true,
                username: DEMO_ACCOUNT.username,
                displayUsername: DEMO_ACCOUNT.username,
                role: 'ADMIN',
                accounts: {
                    create: { id: randomUUID(), accountId: demoUserId, providerId: 'credential', password: passwordHash },
                },
            },
        });
    }, { timeout: 30_000 });
}
