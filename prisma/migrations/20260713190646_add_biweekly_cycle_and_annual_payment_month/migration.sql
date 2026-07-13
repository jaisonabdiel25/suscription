-- AlterEnum
ALTER TYPE "BillingCycle" ADD VALUE 'BIWEEKLY';

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "paymentMonth" INTEGER;
