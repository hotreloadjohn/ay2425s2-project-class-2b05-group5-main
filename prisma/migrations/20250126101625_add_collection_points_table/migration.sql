-- CreateTable
CREATE TABLE "collectionPoint_Locations" (
    "id" SERIAL NOT NULL,
    "postal_code" INTEGER NOT NULL,

    CONSTRAINT "collectionPoint_Locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collectionPoint_Locations_id_key" ON "collectionPoint_Locations"("id");
