-- CreateTable: catálogo único (todas las opciones de los selects viven aquí)
CREATE TABLE "catalog" (
    "id" TEXT NOT NULL,
    "catalogName" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "catalogDescription" TEXT NOT NULL,
    "ln" TEXT NOT NULL DEFAULT 'es',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_catalogName_catalogId_ln_key" ON "catalog" ("catalogName", "catalogId", "ln");
CREATE INDEX "catalog_catalogName_ln_idx" ON "catalog" ("catalogName", "ln");

-- Los datos del catálogo NO se insertan aquí: los siembra `prisma db seed`
-- (prisma/seed.ts + lib/catalog/seed-data.ts) con ids fijos, iguales en todos
-- los ambientes. El deploy debe correr `prisma migrate deploy && prisma db seed`.

-- AlterTable: nuevo flag de admin
ALTER TABLE "user" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: convertir columnas enum -> text (los códigos string se conservan)
ALTER TABLE "user" ALTER COLUMN "currency" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "currency" TYPE TEXT USING "currency"::text;
ALTER TABLE "user" ALTER COLUMN "currency" SET DEFAULT 'COP';

ALTER TABLE "subscription" ALTER COLUMN "category" TYPE TEXT USING "category"::text;

ALTER TABLE "subscription" ALTER COLUMN "importance" DROP DEFAULT;
ALTER TABLE "subscription" ALTER COLUMN "importance" TYPE TEXT USING "importance"::text;
ALTER TABLE "subscription" ALTER COLUMN "importance" SET DEFAULT 'MEDIA';

ALTER TABLE "subscription" ALTER COLUMN "billingCycle" DROP DEFAULT;
ALTER TABLE "subscription" ALTER COLUMN "billingCycle" TYPE TEXT USING "billingCycle"::text;
ALTER TABLE "subscription" ALTER COLUMN "billingCycle" SET DEFAULT 'MONTHLY';

ALTER TABLE "subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscription" ALTER COLUMN "status" TYPE TEXT USING "status"::text;
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- DropEnum: ya no se usan (reemplazados por la tabla catalog)
DROP TYPE "Category";
DROP TYPE "Importance";
DROP TYPE "BillingCycle";
DROP TYPE "SubscriptionStatus";
DROP TYPE "Currency";
