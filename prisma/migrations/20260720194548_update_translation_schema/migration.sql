-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('RUNNING', 'COMPLETED', 'ERROR');

-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "status" "TranslationStatus" NOT NULL DEFAULT 'RUNNING';
