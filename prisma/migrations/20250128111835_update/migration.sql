/*
  Warnings:

  - You are about to drop the column `deliveryDate` on the `delivery` table. All the data in the column will be lost.
  - Added the required column `deliveredDate` to the `delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryStartDate` to the `delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "delivery" DROP COLUMN "deliveryDate",
ADD COLUMN     "deliveredDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deliveryStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT DEFAULT 'PENDING';
