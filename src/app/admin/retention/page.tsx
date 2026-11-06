import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  RETENTION_YEARS,
  dueForDeletion,
  retentionCutoff,
} from "@/lib/retention";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";
import ButtonLink from "@/components/ui/ButtonLink";
import DeleteCustomerButton from "@/components/admin/DeleteCustomerButton";

export const metadata: Metadata = {
  title: "Old records",
  description: "Customers whose records are due to be deleted.",
  robots: { index: false, follow: false },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  });
}

export default async function AdminRetentionPage() {
  await requireAdmin();

  const cutoff = retentionCutoff();

  const customers = await prisma.user.findMany({
    where: dueForDeletion(cutoff),
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { dogs: true, bookings: true } },
      bookings: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { scheduledAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-ink">Old records</h1>

          <ButtonLink href="/admin" variant="secondary">
            Back to Bookings
          </ButtonLink>
        </div>

        <div className="mb-8 space-y-3 text-muted">
          <p>
            The Privacy Notice promises to keep customer records for{" "}
            {RETENTION_YEARS} years after their last appointment. Anyone below
            has had no appointment since {formatDate(cutoff)}, so their
            records are due to be deleted. Nothing is deleted automatically,
            so please check this page every few months.
          </p>
          <p>
            Deleting removes the customer&apos;s account, dogs, bookings and
            signed consent forms from the website for good. It does not touch
            the consent form emails in your Outlook inbox, so delete those
            too.
          </p>
        </div>

        {customers.length === 0 ? (
          <p role="status" className="text-muted">
            Nothing is due for deletion right now.
          </p>
        ) : (
          <div
            role="region"
            aria-label="Customers due for deletion"
            tabIndex={0}
            className="relative overflow-x-auto rounded-3xl bg-surface p-6 shadow-soft"
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Account created</th>
                  <th className="py-3 pr-4 font-medium">Last appointment</th>
                  <th className="py-3 pr-4 font-medium">Dogs</th>
                  <th className="py-3 pr-4 font-medium">Bookings</th>
                  <th className="py-3 pr-4 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-line align-top last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-ink [overflow-wrap:anywhere]">
                      {customer.name}
                      <span className="block text-muted">{customer.email}</span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-ink">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-ink">
                      {customer.bookings[0]
                        ? formatDate(customer.bookings[0].scheduledAt)
                        : "Never booked"}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {customer._count.dogs}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      {customer._count.bookings}
                    </td>
                    <td className="py-3 pr-4">
                      <DeleteCustomerButton
                        userId={customer.id}
                        customerName={customer.name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
