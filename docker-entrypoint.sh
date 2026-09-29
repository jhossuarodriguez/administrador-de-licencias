#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
(cd tools && ./node_modules/.bin/prisma migrate deploy)

# El seed solo corre si la tabla auth_user está vacía (primer despliegue)
USER_COUNT=$(./tools/node_modules/.bin/tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
prisma.authUser.count().then(n => { console.log(n); prisma.\$disconnect(); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "▶ Base de datos vacía, ejecutando seed..."
  ./tools/node_modules/.bin/tsx prisma/seed.ts
else
  echo "▶ Seed omitido (la BD ya tiene datos)."
fi

echo "▶ Iniciando aplicación..."
if [ -n "$APP_URL" ]; then
  echo "▶ Disponible en $APP_URL"
fi
exec node server.js