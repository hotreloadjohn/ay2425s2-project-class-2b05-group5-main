-- DropForeignKey
ALTER TABLE "UserVoucher" DROP CONSTRAINT "UserVoucher_userId_fkey";

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "name" TEXT,
    "duration" TEXT NOT NULL,
    "durationMonths" INTEGER,
    "percentOff" DOUBLE PRECISION,
    "amountOff" INTEGER,
    "currency" TEXT DEFAULT 'SGD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemBy" TIMESTAMP(3),
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_stripeId_key" ON "Coupon"("stripeId");

-- CreateIndex
CREATE INDEX "Coupon_stripeId_idx" ON "Coupon"("stripeId");
