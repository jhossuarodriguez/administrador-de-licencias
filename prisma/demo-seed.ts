import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { DEMO_ACCOUNT, isDemoMode } from '../src/lib/demo';
import { resetDemoData } from '../src/lib/demoData';

// Carga los datos del modo demo. Corre en cada build de Vercel y solo actúa si la base
// todavía no los tiene; `pnpm demo:reset` (--force) los reinicia a mano.
async function main() {
    if (!isDemoMode()) {
        console.log('Modo demo desactivado (NEXT_PUBLIC_DEMO_MODE != true): no se cargan datos.');
        return;
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

    try {
        const alreadySeeded = await prisma.authUser.count({ where: { username: DEMO_ACCOUNT.username } });
        if (alreadySeeded && !process.argv.includes('--force')) {
            console.log('La base ya tiene los datos del demo.');
            return;
        }

        await resetDemoData(prisma);
        console.log('✅ Datos del demo cargados.');
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error('❌ Error al cargar el demo:', error);
    process.exit(1);
});
