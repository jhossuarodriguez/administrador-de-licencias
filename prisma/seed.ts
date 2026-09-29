import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes, pbkdf2Sync, randomUUID } from 'crypto';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

// Mismo formato que src/lib/password.ts, que Better Auth usa para verificar contraseñas.
function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

async function main() {


    const adminUsername = process.env.SEED_ADMIN_USERNAME;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminName = process.env.SEED_ADMIN_NAME;


    if (!adminUsername || !adminPassword || !adminEmail || !adminName) {
        throw new Error('Faltan variables de entorno SEED_ADMIN_*');
    }

    const userId = randomUUID();

    // Better Auth guarda el username y el email normalizados en minúsculas.
    await prisma.authUser.upsert({
        where: { username: adminUsername.toLowerCase() },
        update: {},
        create: {
            id: userId,
            name: adminName,
            email: adminEmail.toLowerCase(),
            username: adminUsername.toLowerCase(),
            displayUsername: adminUsername,
            role: 'ADMIN',
            accounts: {
                create: {
                    id: randomUUID(),
                    accountId: userId,
                    providerId: 'credential',
                    password: hashPassword(adminPassword),
                },
            },
        },
    });

    console.log('✅ Seed completado correctamente.');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
