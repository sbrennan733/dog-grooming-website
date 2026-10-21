-- CreateEnum
CREATE TYPE "DogSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "Dog" ADD COLUMN     "size" "DogSize" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable: replace the single price with one price per dog size. Existing
-- services keep their old price for every size.
ALTER TABLE "Service" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFromPrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceLarge" INTEGER,
ADD COLUMN     "priceMedium" INTEGER,
ADD COLUMN     "priceNote" TEXT,
ADD COLUMN     "priceSmall" INTEGER;

UPDATE "Service" SET "priceSmall" = "price", "priceMedium" = "price", "priceLarge" = "price";

ALTER TABLE "Service" ALTER COLUMN "priceLarge" SET NOT NULL,
ALTER COLUMN "priceMedium" SET NOT NULL,
ALTER COLUMN "priceSmall" SET NOT NULL,
DROP COLUMN "price";
