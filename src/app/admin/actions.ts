"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

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
