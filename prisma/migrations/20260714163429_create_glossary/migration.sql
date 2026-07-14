-- CreateTable
CREATE TABLE "Glossary" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Glossary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlossaryEntry" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "detail" TEXT,
    "glossaryId" INTEGER NOT NULL,

    CONSTRAINT "GlossaryEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Glossary" ADD CONSTRAINT "Glossary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlossaryEntry" ADD CONSTRAINT "GlossaryEntry_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "Glossary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
