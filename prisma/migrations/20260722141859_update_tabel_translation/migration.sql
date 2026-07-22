/*
  Warnings:

  - The values [RUNNING] on the enum `TranslationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TranslationStatus_new" AS ENUM ('PROCESSING', 'COMPLETED', 'ERROR');
ALTER TABLE "public"."Translation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Translation" ALTER COLUMN "status" TYPE "TranslationStatus_new" USING ("status"::text::"TranslationStatus_new");
ALTER TYPE "TranslationStatus" RENAME TO "TranslationStatus_old";
ALTER TYPE "TranslationStatus_new" RENAME TO "TranslationStatus";
DROP TYPE "public"."TranslationStatus_old";
ALTER TABLE "Translation" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
COMMIT;

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "batchSize" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTokens" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'PROCESSING';
