import path from "node:path"
import { defineConfig, env } from "prisma/config"
import "dotenv/config" // Asegura que las variables de entorno se carguen

export default defineConfig({
    schema: path.join('prisma', "schema.prisma"),
<<<<<<< HEAD
    // migrations: {
    //     seed: 'tsx prisma/seed.ts'
    // },
=======
    migrations: {
        seed: 'tsx prisma/seed.ts'
    },
>>>>>>> testing

    datasource: {
        url: env("DATABASE_URL")
    }
});