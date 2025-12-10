FROM node:25-alpine

WORKDIR /app

# Habilitar Corepack para usar pnpm
RUN corepack enable

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm usando lockfile
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Generar cliente Prisma dentro de la imagen
RUN pnpm prisma generate

CMD ["pnpm", "run", "dev"]