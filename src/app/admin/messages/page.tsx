import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { markContactMessageRead } from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import { BUSINESS_TIME_ZONE } from "@/lib/timezone";

export const metadata: Metadata = {
  title: "Messages",
  description: "Messages sent through the contact form.",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="bg-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl text-ink">Messages</h1>

          <ButtonLink href="/admin" variant="secondary">
            Back to Bookings
          </ButtonLink>
        </div>

        {messages.length === 0 ? (
          <p className="text-muted">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-2xl p-6 shadow-soft ${
                  message.isRead ? "bg-surface" : "bg-surface-alt"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg text-ink [overflow-wrap:anywhere]">
                    {message.subject}
                  </h2>

                  <p className="text-sm text-muted">
                    {message.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: BUSINESS_TIME_ZONE,
                    })}{" "}
                    {message.createdAt.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: BUSINESS_TIME_ZONE,
                    })}
                    {!message.isRead && (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-on-brand">
                        New
                      </span>
                    )}
                  </p>
                </div>

                <p className="mb-3 text-sm text-muted [overflow-wrap:anywhere]">
                  From {message.name} &lt;
                  <a
                    href={`mailto:${message.email}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    {message.email}
                  </a>
                  &gt;
                </p>

                <p className="whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
                  {message.message}
                </p>

                {!message.isRead && (
                  <form
                    action={markContactMessageRead.bind(null, message.id)}
                    className="mt-4"
                  >
                    <Button type="submit" variant="secondary">
                      Mark as read
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
