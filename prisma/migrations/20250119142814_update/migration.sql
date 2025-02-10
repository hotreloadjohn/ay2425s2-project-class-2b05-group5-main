-- DropForeignKey
ALTER TABLE "supplier" DROP CONSTRAINT "supplier_supplierAdminId_fkey";

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_supplierAdminId_fkey" FOREIGN KEY ("supplierAdminId") REFERENCES "supplierAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
