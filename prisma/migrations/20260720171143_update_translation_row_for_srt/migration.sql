-- CreateTable
CREATE TABLE "translation_files" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_rows" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_rows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "translation_rows" ADD CONSTRAINT "translation_rows_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "translation_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
