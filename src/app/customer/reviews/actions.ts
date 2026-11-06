"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  reviewSchema,
  type ReviewFormState,
} from "@/lib/validations/review";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Only the customer who had the groom can review it, only once it is marked
// COMPLETED, and only once. The review stays hidden until the owner approves.
export async function submitReview(
  bookingId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await requireUser();

  const values = {
    rating: text(formData, "rating"),
    comment: text(formData, "comment"),
  };

  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: { select: { id: true } } },
  });

  if (!booking || booking.userId !== user.id) {
    return { message: "That booking could not be found.", values };
  }

  if (booking.status !== "COMPLETED") {
    return {
      message: "You can review a groom once the appointment is complete.",
      values,
    };
  }

  if (booking.review) {
    return { message: "You have already reviewed this appointment.", values };
  }

  try {
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });
  } catch {
    // A double click can race past the check above; the unique booking id
    // stops a second review, so treat it as already reviewed.
    return { message: "You have already reviewed this appointment.", values };
  }

  revalidatePath("/customer");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");

  return { success: true };
}
