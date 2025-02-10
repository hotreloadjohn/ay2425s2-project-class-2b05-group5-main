/*
  Warnings:

  - You are about to drop the column `isUsed` on the `UserVoucher` table. All the data in the column will be lost.
  - You are about to drop the column `voucherId` on the `UserVoucher` table. All the data in the column will be lost.
  - You are about to drop the `Voucher` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `couponId` to the `UserVoucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserVoucher" DROP CONSTRAINT "UserVoucher_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserVoucher" DROP CONSTRAINT "UserVoucher_voucherId_fkey";

-- DropIndex
DROP INDEX "UserVoucher_userId_voucherId_key";

-- AlterTable
ALTER TABLE "UserVoucher" DROP COLUMN "isUsed",
DROP COLUMN "voucherId",
ADD COLUMN     "couponId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Voucher";

-- AddForeignKey
ALTER TABLE "UserVoucher" ADD CONSTRAINT "UserVoucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
