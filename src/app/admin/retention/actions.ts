"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { dueForDeletion, retentionCutoff } from "@/lib/retention";

export interface DeleteCustomerResult {
  ok: boolean;
  message: string;
}

// Permanently removes a customer, their dogs, bookings and signed consent
// records. It re-checks that the customer is really past the retention
// period, because Server Actions can be called with any id.
export async function deleteExpiredCustomer(
  userId: string
): Promise<DeleteCustomerResult> {
  await requireAdmin();

  const customer = await prisma.user.findFirst({
    where: { AND: [{ id: userId }, dueForDeletion(retentionCutoff())] },
    select: { id: true, name: true },
  });

  if (!customer) {
    return {
      ok: false,
      message:
        "That customer can't be deleted: they were not found, or they have a recent appointment.",
    };
  }

  // Payment records may have to be kept for accounting, so they are never
  // removed here. (Payments are cash for now, so none exist yet.)
  const payments = await prisma.payment.count({
    where: { booking: { userId: customer.id } },
  });
  if (payments > 0) {
    return {
      ok: false,
      message:
        "This customer has payment records, which may need to be kept. They were not deleted.",
    };
  }

  // Bookings go first (their consent records are removed with them), then
  // the dogs they reference, then the account.
  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { userId: customer.id } }),
    prisma.dog.deleteMany({ where: { ownerId: customer.id } }),
    prisma.user.delete({ where: { id: customer.id } }),
  ]);

  revalidatePath("/admin/retention");
  revalidatePath("/admin");

  return { ok: true, message: `${customer.name}'s records were deleted.` };
}
