"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { REVIEWS_TAG } from "@/lib/reviews";

// The owner can only show or hide a review, never edit its words: rewriting
// a customer's review would make it a fake one.
export async function setReviewStatus(
  reviewId: string,
  status: "APPROVED" | "HIDDEN"
): Promise<void> {
  await requireAdmin();

  await prisma.review.updateMany({
    where: { id: reviewId },
    data: { status },
  });

  updateTag(REVIEWS_TAG);
  revalidatePath("/");
  revalidatePath("/customer");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}
