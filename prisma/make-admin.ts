import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Creates an admin account, or promotes an existing account to admin.
//
//   ADMIN_PASSWORD='a-strong-password' npm run make-admin -- someone@example.com "Their Name"
//
// - New email: needs ADMIN_PASSWORD (and a name); the account is created
//   already email-verified, since whoever runs this controls the account.
// - Existing email: promoted to admin. ADMIN_PASSWORD, if given, also resets
//   the password.
//
// The password is read from the environment so it never ends up in the repo.
// This talks to whichever database DATABASE_URL points at.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function checkPassword(password: string) {
  if (
    password.length < 8 ||
    !/[a-zA-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    fail(
      "ADMIN_PASSWORD must be at least 8 characters and include a letter and a number."
    );
  }
}

async function main() {
  const [emailArg, nameArg] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;

  if (!emailArg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailArg)) {
    fail(
      "Usage: ADMIN_PASSWORD='...' npm run make-admin -- <email> [\"Full Name\"]"
    );
  }

  const email = emailArg.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (password) {
      checkPassword(password);
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        ...(password && { passwordHash: await bcrypt.hash(password, 10) }),
      },
    });

    console.log(
      `${email} is now an admin${password ? " (password updated)" : ""}.`
    );
    return;
  }

  if (!password) {
    fail("No account with that email yet: set ADMIN_PASSWORD to create one.");
  }
  checkPassword(password);

  const name = nameArg?.trim();
  if (!name || name.length < 2) {
    fail("No account with that email yet: pass a name (2+ characters) too.");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Created admin account for ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
