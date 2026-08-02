-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "glossaryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "Glossary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
