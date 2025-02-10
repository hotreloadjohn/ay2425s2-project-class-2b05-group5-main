/*
  Warnings:

  - Added the required column `minAmount` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "minAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "lastKnownPrice" DECIMAL NOT NULL DEFAULT 0;
