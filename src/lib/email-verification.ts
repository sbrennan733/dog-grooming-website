import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/mailer";
import { buildVerificationEmail } from "@/lib/email/verification-email";
import { getSiteUrl } from "@/lib/site-url";

const TOKEN_LIFETIME_HOURS = 24;
const TOKEN_LIFETIME_MS = TOKEN_LIFETIME_HOURS * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Creates a fresh token (replacing any earlier one, so only the newest link
// works) and emails the link. If sending fails the token is removed again so
// the user can retry straight away instead of waiting out the cooldown.
async function createAndSendToken(user: {
  id: string;
  name: string;
  email: string;
}): Promise<void> {
  const rawToken = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS),
      },
    }),
  ]);

  try {
    const verifyUrl = `${await getSiteUrl()}/verify-email/confirm?token=${rawToken}`;

    await sendEmail(
      buildVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl,
        validForHours: TOKEN_LIFETIME_HOURS,
      })
    );
  } catch (error) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });
    throw error;
  }
}

// Used right after registration. Never throws: a mail problem must not stop
// someone creating an account; they can request another email from their
// account page.
export async function sendVerificationEmailSafely(user: {
  id: string;
  name: string;
  email: string;
}): Promise<boolean> {
  try {
    await createAndSendToken(user);
    return true;
  } catch (error) {
    console.error("Could not send verification email:", error);
    return false;
  }
}

export type ResendResult =
  | { status: "sent" }
  | { status: "already-verified" }
  | { status: "too-soon"; retryAfterSeconds: number }
  | { status: "failed" };

export async function requestVerificationEmail(
  userId: string
): Promise<ResendResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, emailVerified: true },
  });

  if (!user) {
    return { status: "failed" };
  }

  if (user.emailVerified) {
    return { status: "already-verified" };
  }

  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      return {
        status: "too-soon",
        retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
      };
    }
  }

  try {
    await createAndSendToken(user);
    return { status: "sent" };
  } catch (error) {
    console.error("Could not send verification email:", error);
    return { status: "failed" };
  }
}

export type VerifyResult = "verified" | "invalid" | "expired";

export async function verifyEmailToken(
  rawToken: string | null
): Promise<VerifyResult> {
  if (!rawToken) {
    return "invalid";
  }

  const token = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!token) {
    return "invalid";
  }

  if (token.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: token.id } });
    return "expired";
  }

  // Verify and burn every outstanding token for this user in one step, so a
  // link can't be reused.
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: token.userId, emailVerified: null },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: token.userId },
    }),
  ]);

  return "verified";
}
