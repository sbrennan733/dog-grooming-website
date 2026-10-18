"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/generated/prisma/client";

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  await requireAdmin();

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  revalidatePath("/admin");
}

export async function markAssessmentComplete(dogId: string) {
  await requireAdmin();

  await prisma.dog.update({
    where: { id: dogId },
    data: { assessmentCompletedAt: new Date() },
  });

  revalidatePath("/admin");
}
