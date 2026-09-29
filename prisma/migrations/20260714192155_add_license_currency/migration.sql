-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'DOP');

-- AlterTable
ALTER TABLE "License" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
