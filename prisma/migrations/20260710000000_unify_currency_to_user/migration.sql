-- AlterTable: currency is now a user-level setting
ALTER TABLE "user" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'COP';

-- AlterTable: drop the per-subscription currency (unified under the user)
ALTER TABLE "subscription" DROP COLUMN "currency";
