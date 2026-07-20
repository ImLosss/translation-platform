/*
  Warnings:

  - You are about to drop the column `fileId` on the `translation_rows` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `translation_rows` table. All the data in the column will be lost.
  - You are about to drop the `translation_files` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sourceText` to the `translation_rows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationId` to the `translation_rows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "translation_rows" DROP CONSTRAINT "translation_rows_fileId_fkey";

-- AlterTable
ALTER TABLE "translation_rows" DROP COLUMN "fileId",
DROP COLUMN "text",
ADD COLUMN     "sourceText" TEXT NOT NULL,
ADD COLUMN     "targetText" TEXT,
ADD COLUMN     "translationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "translation_files";

-- CreateTable
CREATE TABLE "translations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_rows_translationId_idx" ON "translation_rows"("translationId");

-- AddForeignKey
ALTER TABLE "translations" ADD CONSTRAINT "translations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_rows" ADD CONSTRAINT "translation_rows_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
