import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter })

async function main() {

    const deptIT = await prisma.department.upsert({
        where: { name: "Tecnología de la Información" },
        update: {},
        create: { name: "Tecnología de la Información", description: "Departamento de TI", active: true }
    });

    const deptMarketing = await prisma.department.upsert({
        where: { name: "Marketing" },
        update: {},
        create: { name: "Marketing", description: "Marketing y comunicaciones", active: true }
    });

    const deptEngineering = await prisma.department.upsert({
        where: { name: "Desarrollo" },
        update: {},
        create: { name: "Desarrollo", description: "Desarrollo de software", active: true }
    });

    const deptSales = await prisma.department.upsert({
        where: { name: "Ventas" },
        update: {},
        create: { name: "Ventas", description: "Equipo comercial", active: true }
    });

    const deptFinance = await prisma.department.upsert({
        where: { name: "Finanzas" },
        update: {},
        create: { name: "Finanzas", description: "Control financiero", active: true }
    });


    // ========================================
    // 2. LICENCIAS
    // ========================================

    await prisma.license.upsert({
        where: { id: 1 },
        update: {},
        create: {
            sede: "Madrid Office",
            provider: "Microsoft",
            startDate: new Date("2025-01-01"),
            expiration: new Date("2026-01-01"),
            assigned: "IT Department",
            departmentId: deptIT.id,
            model: "Office 365",
            plan: "Business Premium",
            unitCost: 22.00,
            installmentCost: 0.00,
            penaltyCost: 0.00,
            billingCycle: "MONTHLY",
            totalLicense: 50,
            usedLicense: 45,
            active: true,
            createdAt: new Date("2025-01-05"),
            updatedAt: new Date(),
        }
    });

    await prisma.license.upsert({
        where: { id: 2 },
        update: {},
        create: {
            sede: "Barcelona Office",
            provider: "Adobe",
            startDate: new Date("2025-02-15"),
            expiration: new Date("2026-02-15"),
            assigned: "Design Team",
            departmentId: deptMarketing.id,
            model: "Creative Cloud",
            plan: "Teams",
            unitCost: 79.49,
            installmentCost: 150.00,
            penaltyCost: 25.00,
            billingCycle: "YEARLY",
            totalLicense: 10,
            usedLicense: 8,
            active: true,
            createdAt: new Date("2025-02-10"),
            updatedAt: new Date(),
        }
    });

    await prisma.license.upsert({
        where: { id: 3 },
        update: {},
        create: {
            sede: "Valencia Office",
            provider: "Atlassian",
            startDate: new Date("2025-03-01"),
            expiration: new Date("2025-10-01"),
            assigned: "Development Team",
            departmentId: deptEngineering.id,
            model: "Jira",
            plan: "Standard",
            unitCost: 7.75,
            installmentCost: 0.00,
            penaltyCost: 0.00,
            billingCycle: "MONTHLY",
            totalLicense: 25,
            usedLicense: 20,
            active: true,
            createdAt: new Date("2025-03-15"),
            updatedAt: new Date(),
        }
    });

    await prisma.license.upsert({
        where: { id: 4 },
        update: {},
        create: {
            sede: "Madrid Office",
            provider: "Slack",
            startDate: new Date("2025-01-20"),
            expiration: new Date("2026-01-20"),
            assigned: "All Teams",
            departmentId: deptIT.id,
            model: "Business+",
            plan: "Pro",
            unitCost: 8.00,
            installmentCost: 0.00,
            penaltyCost: 0.00,
            billingCycle: "MONTHLY",
            totalLicense: 100,
            usedLicense: 87,
            active: true,
            createdAt: new Date("2025-04-01"),
            updatedAt: new Date(),
        }
    });

    await prisma.license.upsert({
        where: { id: 5 },
        update: {},
        create: {
            sede: "Barcelona Office",
            provider: "Salesforce",
            startDate: new Date("2025-02-01"),
            expiration: new Date("2026-02-01"),
            assigned: "Sales Team",
            departmentId: deptSales.id,
            model: "Sales Cloud",
            plan: "Professional",
            unitCost: 75.00,
            installmentCost: 0.00,
            penaltyCost: 50.00,
            billingCycle: "MONTHLY",
            totalLicense: 20,
            usedLicense: 18,
            active: true,
            createdAt: new Date("2025-05-01"),
            updatedAt: new Date(),
        }
    });

    await prisma.user.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "Jhossua Rodriguez",
            username: "jhossuarodriguezz",
            email: "jhossua.rodriguez@example.do",
            status: "active",
            departmentId: deptIT.id,
            startDate: new Date("2023-08-05"),
            createdAt: new Date("2025-08-05"),
            updatedAt: new Date(),
        }
    });

    await prisma.user.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: "María García",
            username: "maria.garcia",
            email: "maria.garcia@example.do",
            status: "active",
            departmentId: deptMarketing.id,
            startDate: new Date("2024-01-15"),
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date(),
        }
    });

    await prisma.user.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: "Carlos Mendoza",
            username: "carlos.mendoza",
            email: "carlos.mendoza@example.do",
            status: "active",
            departmentId: deptEngineering.id,
            createdAt: new Date("2024-02-20"),
            updatedAt: new Date(),
        }
    });

    await prisma.user.upsert({
        where: { id: 4 },
        update: {},
        create: {
            name: "Ana Martínez",
            username: "ana.martinez",
            email: "ana.martinez@example.do",
            status: "active",
            departmentId: deptSales.id,
            createdAt: new Date("2024-03-10"),
            updatedAt: new Date(),
        }
    });

    await prisma.user.upsert({
        where: { id: 5 },
        update: {},
        create: {
            name: "Luis Fernández",
            username: "luis.fernandez",
            email: "luis.fernandez@example.do",
            status: "active",
            departmentId: deptFinance.id,
            createdAt: new Date("2024-04-05"),
            updatedAt: new Date(),
        }
    });


    await prisma.assignment.upsert({
        where: { id: 1 },
        update: {},
        create: {
            userId: 1,
            licenseId: 1,
            assignedAt: new Date("2025-01-10"),
        }
    });

    await prisma.assignment.upsert({
        where: { id: 2 },
        update: {},
        create: {
            userId: 1,
            licenseId: 4,
            assignedAt: new Date("2025-01-15"),
        }
    });

    await prisma.assignment.upsert({
        where: { id: 3 },
        update: {},
        create: {
            userId: 2,
            licenseId: 2,
            assignedAt: new Date("2025-02-20"),
        }
    });

    await prisma.assignment.upsert({
        where: { id: 4 },
        update: {},
        create: {
            userId: 3,
            licenseId: 3,
            assignedAt: new Date("2025-03-05"),
        }
    });

    await prisma.assignment.upsert({
        where: { id: 5 },
        update: {},
        create: {
            userId: 4,
            licenseId: 5,
            assignedAt: new Date("2025-02-10"),
        }
    });
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
