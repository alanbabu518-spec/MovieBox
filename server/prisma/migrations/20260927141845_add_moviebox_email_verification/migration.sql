-- CreateTable
CREATE TABLE "MovieBoxEmailVerification" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieBoxEmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieBoxEmailVerification_tokenHash_key" ON "MovieBoxEmailVerification"("tokenHash");

-- CreateIndex
CREATE INDEX "MovieBoxEmailVerification_userId_idx" ON "MovieBoxEmailVerification"("userId");

-- CreateIndex
CREATE INDEX "MovieBoxEmailVerification_expiresAt_idx" ON "MovieBoxEmailVerification"("expiresAt");

-- AddForeignKey
ALTER TABLE "MovieBoxEmailVerification" ADD CONSTRAINT "MovieBoxEmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
