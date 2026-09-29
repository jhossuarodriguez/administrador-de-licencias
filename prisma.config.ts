import path from "node:path"
import { defineConfig, env } from "prisma/config"
import "dotenv/config"

export default defineConfig({
    schema: path.join('prisma', "schema.prisma"),
    migrations: {
        path: "prisma/migrations",
        seed: 'tsx prisma/seed.ts'
    },
    datasource: {
        // Opcional: solo lo usa `prisma migrate dev`
        shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
        // Neon (Vercel) crea DATABASE_URL_UNPOOLED: las migraciones necesitan la conexión
        // directa, no la del pooler que usa la app.
        url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL")
    }
});
