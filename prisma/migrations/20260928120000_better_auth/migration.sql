-- Migración a Better Auth.
-- Conserva los usuarios existentes: sus contraseñas pasan a "auth_account" como
-- cuentas "credential" (mismo hash PBKDF2, que src/lib/password.ts sigue verificando).
-- Las sesiones anteriores se descartan porque Better Auth usa otra cookie.

-- Sesiones del sistema anterior
DELETE FROM "auth_session";

-- DropForeignKey
ALTER TABLE "auth_session" DROP CONSTRAINT "auth_session_userId_fkey";

-- AlterTable: Better Auth usa ids de texto
ALTER TABLE "auth_user" DROP CONSTRAINT "auth_user_pkey",
ADD COLUMN     "displayUsername" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "username" DROP NOT NULL,
ADD CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id");

DROP SEQUENCE IF EXISTS "auth_user_id_seq";

-- El plugin username busca por el nombre normalizado (minúsculas) y muestra displayUsername
UPDATE "auth_user" SET "displayUsername" = "username", "username" = LOWER("username");

-- AlterTable
ALTER TABLE "auth_session" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "auth_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_verification_pkey" PRIMARY KEY ("id")
);

-- Contraseñas existentes → cuentas "credential" (Better Auth usa el id del usuario como accountId)
INSERT INTO "auth_account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", 'credential', "id", "passwordHash", "createdAt", CURRENT_TIMESTAMP
FROM "auth_user";

-- AlterTable
ALTER TABLE "auth_user" DROP COLUMN "passwordHash";

-- CreateIndex
CREATE INDEX "auth_account_userId_idx" ON "auth_account"("userId");

-- CreateIndex
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification"("identifier");

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
