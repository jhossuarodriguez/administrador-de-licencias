import path from "node:path"
import { defineConfig, env } from "prisma/config"
import "dotenv/config" // Asegura que las variables de entorno se carguen

export default defineConfig({
    schema: path.join('prisma', "schema.prisma"),
    // migrations: {
    //     seed: 'tsx prisma/seed.ts'
    // },

    datasource: {
        url: env("DATABASE_URL")
    }
});