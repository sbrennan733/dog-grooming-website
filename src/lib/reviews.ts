import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const REVIEWS_TAG = "reviews";

// Reviews are shown as "Sarah M." so a stranger can't identify the customer
// from the public site. Keep this in step with the Privacy Notice.
export function reviewerName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "A customer";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export interface PublicReview {
  id: string;
  reviewer: string;
  dogName: string;
  rating: number;
  comment: string;
}

export interface PublicReviews {
  reviews: PublicReview[];
  count: number;
  average: number;
}

// Cached so the home page isn't rebuilt from the database on every visit; the
// admin's approve and hide actions expire this tag.
export const getPublicReviews = unstable_cache(
  async (): Promise<PublicReviews> => {
    const [rows, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          rating: true,
          comment: true,
          user: { select: { name: true } },
          booking: { select: { dog: { select: { name: true } } } },
        },
      }),
      prisma.review.aggregate({
        where: { status: "APPROVED" },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    return {
      reviews: rows.map((row) => ({
        id: row.id,
        reviewer: reviewerName(row.user.name),
        dogName: row.booking.dog.name,
        rating: row.rating,
        comment: row.comment,
      })),
      count: aggregate._count,
      average: aggregate._avg.rating ?? 0,
    };
  },
  ["public-reviews"],
  { tags: [REVIEWS_TAG] }
);
