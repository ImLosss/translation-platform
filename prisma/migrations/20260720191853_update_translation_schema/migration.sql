/*
  Warnings:

  - You are about to drop the `translation_rows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "translation_rows" DROP CONSTRAINT "translation_rows_translationId_fkey";

-- DropForeignKey
ALTER TABLE "translations" DROP CONSTRAINT "translations_userId_fkey";

-- DropTable
DROP TABLE "translation_rows";

-- DropTable
DROP TABLE "translations";

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "sourceLang" TEXT NOT NULL,
    "targetLang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationRow" (
    "id" SERIAL NOT NULL,
    "translationId" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "targetText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TranslationRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranslationRow_translationId_idx" ON "TranslationRow"("translationId");

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationRow" ADD CONSTRAINT "TranslationRow_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
