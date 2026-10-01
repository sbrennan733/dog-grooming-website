"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function fetchAvailableSlots(
  date: string,
  serviceId: string
): Promise<string[]> {
  return getAvailableSlots(date, serviceId);
}

interface CreateBookingInput {
  dogId: string;
  serviceId: string;
  date: string;
  time: string;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<{ error: string } | void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const dog = await prisma.dog.findUnique({ where: { id: input.dogId } });
  if (!dog || dog.ownerId !== session.user.id) {
    return { error: "That dog could not be found on your account." };
  }

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
  });
  if (!service) {
    return { error: "That service could not be found." };
  }

  const needsAssessment = !dog.assessmentCompletedAt;
  if (needsAssessment && !service.isAssessment) {
    return {
      error: `${dog.name} needs an assessment visit before other services can be booked.`,
    };
  }
  if (!needsAssessment && service.isAssessment) {
    return { error: `${dog.name} has already completed their assessment.` };
  }

  // Re-check the slot is still free — closes the race window between the
  // customer viewing available slots and actually submitting the booking.
  const availableSlots = await getAvailableSlots(input.date, input.serviceId);
  if (!availableSlots.includes(input.time)) {
    return {
      error: "That time is no longer available. Please choose another.",
    };
  }

  const scheduledAt = new Date(`${input.date}T${input.time}:00.000Z`);

  await prisma.booking.create({
    data: {
      userId: session.user.id,
      dogId: dog.id,
      serviceId: service.id,
      scheduledAt,
      priceAtBooking: service.price,
      depositAtBooking: service.deposit,
    },
  });

  redirect("/booking/confirmation");
}
