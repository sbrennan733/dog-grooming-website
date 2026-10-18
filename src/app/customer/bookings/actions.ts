"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function cancelBooking(
  bookingId: string
): Promise<{ error: string } | void> {
  const user = await requireUser();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.userId !== user.id) {
    return { error: "That booking could not be found." };
  }

  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
    return { error: "This booking can no longer be cancelled." };
  }

  if (booking.scheduledAt <= new Date()) {
    return { error: "This appointment has already passed." };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/customer");
  revalidatePath("/admin");
}
