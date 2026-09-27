/*
  Warnings:

  - You are about to drop the `MovieBoxEmailVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MovieBoxEmailVerification" DROP CONSTRAINT "MovieBoxEmailVerification_userId_fkey";

-- DropTable
DROP TABLE "MovieBoxEmailVerification";

-- CreateTable
CREATE TABLE "MovieBoxEmailOTP" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MovieBoxEmailOTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MovieBoxEmailOTP_userId_idx" ON "MovieBoxEmailOTP"("userId");

-- CreateIndex
CREATE INDEX "MovieBoxEmailOTP_expiresAt_idx" ON "MovieBoxEmailOTP"("expiresAt");

-- AddForeignKey
ALTER TABLE "MovieBoxEmailOTP" ADD CONSTRAINT "MovieBoxEmailOTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
