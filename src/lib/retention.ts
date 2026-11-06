import type { Prisma } from "@/generated/prisma/client";

// How long a customer's records are kept after their last appointment. This
// is the promise made in the Privacy Notice (src/app/privacy/page.tsx), so
// change the two together.
export const RETENTION_YEARS = 2;

export function retentionCutoff(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS);
  return cutoff;
}

// Customers whose records are due to be deleted: an account older than the
// retention period, with no appointment inside it (or still to come). Any
// booking counts, whatever its status, so this errs on the side of keeping.
export function dueForDeletion(cutoff: Date): Prisma.UserWhereInput {
  return {
    role: "CUSTOMER",
    createdAt: { lt: cutoff },
    bookings: { none: { scheduledAt: { gte: cutoff } } },
  };
}
