-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('DIRECT', 'COLLECTION');

-- CreateTable
CREATE TABLE "delivery" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "unit" TEXT,
    "postalCode" TEXT,
    "phoneNumber" TEXT,
    "notes" TEXT,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL,
    "collectionPointId" INTEGER,

    CONSTRAINT "delivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "collectionPoint_Locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
