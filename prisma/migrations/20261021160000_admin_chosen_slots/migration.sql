-- DropTable: date overrides are replaced by explicit available slots.
DROP TABLE "AvailabilityOverride";

-- CreateTable
CREATE TABLE "AvailableSlot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailableSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvailableSlot_date_startTime_key" ON "AvailableSlot"("date", "startTime");
