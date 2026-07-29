-- AlterTable
ALTER TABLE "Translation" ADD COLUMN     "videoSource" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pricing" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);
