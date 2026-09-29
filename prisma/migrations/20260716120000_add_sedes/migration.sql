-- CreateTable
CREATE TABLE "Sede" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sede_name_key" ON "Sede"("name");

-- Register any sede already used by a license.
INSERT INTO "Sede" ("name", "updatedAt")
SELECT DISTINCT TRIM("sede"), CURRENT_TIMESTAMP
FROM "License"
WHERE "sede" IS NOT NULL AND TRIM("sede") <> ''
ON CONFLICT ("name") DO NOTHING;
