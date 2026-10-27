import "dotenv/config";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Creates an admin account, or promotes an existing account to admin.
//
// Two ways to run it:
//
// 1. Guided, for the live (hosted) database. It asks for the database
//    address and the password, hiding what you type:
//
//      npm run make-admin:live
//
// 2. Non-interactive, against whichever database DATABASE_URL points at:
//
//      ADMIN_PASSWORD='a-strong-password' npm run make-admin -- someone@example.com "Their Name"
//
// - New email: the account is created already email-verified, since whoever
//   runs this controls the account.
// - Existing email: promoted to admin (and the password reset if one is given).
//
// Passwords are never stored in the repo or printed.

const DEFAULT_EMAIL = "bubblesandbarks30@outlook.com";
const DEFAULT_NAME = "Karen";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function passwordProblem(password: string): string | undefined {
  if (
    password.length < 8 ||
    !/[a-zA-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return "The password must be at least 8 characters and include a letter and a number.";
  }
  return undefined;
}

// --- Prompting (a small line queue so pasted/piped input is never lost) ---

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const queuedLines: string[] = [];
let waiting: ((line: string) => void) | undefined;
let muted = false;

rl.on("line", (line) => {
  if (waiting) {
    const resolve = waiting;
    waiting = undefined;
    resolve(line);
  } else {
    queuedLines.push(line);
  }
});

// While muted, the terminal's echo of what you type is dropped.
const originalWrite = (
  rl as unknown as { _writeToOutput: (text: string) => void }
)._writeToOutput.bind(rl);
(rl as unknown as { _writeToOutput: (text: string) => void })._writeToOutput = (
  text: string
) => {
  if (!muted) {
    originalWrite(text);
  }
};

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    muted = hidden;

    const deliver = (line: string) => {
      muted = false;
      if (hidden) {
        process.stdout.write("\n");
      }
      resolve(line.trim());
    };

    const queued = queuedLines.shift();
    if (queued !== undefined) {
      deliver(queued);
    } else {
      waiting = deliver;
    }
  });
}

// Pulls the address out of whatever was pasted: the bare address, a
// DATABASE_URL="..." line, or a `psql '...'` command.
function extractDatabaseUrl(pasted: string): string | undefined {
  return pasted.match(/postgres(?:ql)?:\/\/[^\s'"]+/)?.[0];
}

// --- The actual work ---

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

async function upsertAdmin(
  prisma: PrismaClient,
  email: string,
  name: string | undefined,
  password: string | undefined
) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (password) {
      const problem = passwordProblem(password);
      if (problem) {
        fail(problem);
      }
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
    fail("No account with that email yet: a password is needed to create one.");
  }
  const problem = passwordProblem(password);
  if (problem) {
    fail(problem);
  }

  if (!name || name.length < 2) {
    fail("No account with that email yet: a name (2+ characters) is needed too.");
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

async function guided(): Promise<void> {
  console.log("Create an admin account on the live database.\n");
  console.log(
    "In Neon, open the project's Connect panel, turn off connection pooling,"
  );
  console.log("and copy the connection string. Paste it below (it stays hidden).\n");

  const pasted = await ask("Database address: ", true);
  const databaseUrl = extractDatabaseUrl(pasted);

  if (!databaseUrl) {
    fail(
      "That doesn't look like a database address. It should start with postgresql://"
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    fail("That database address isn't valid. Copy the whole string from Neon.");
  }

  if (!parsed.username || !parsed.password) {
    fail(
      "The address is missing the user or password. Tick 'Show password' in Neon before copying."
    );
  }

  console.log(
    `\nConnecting to ${parsed.hostname} as ${parsed.username} (database ${parsed.pathname.slice(1)}).`
  );

  const email = (await ask(`Admin email [${DEFAULT_EMAIL}]: `)) || DEFAULT_EMAIL;
  const name = (await ask(`Name [${DEFAULT_NAME}]: `)) || DEFAULT_NAME;

  const password = await ask("Choose a password: ", true);
  const problem = passwordProblem(password);
  if (problem) {
    fail(problem);
  }

  const again = await ask("Type the password again: ", true);
  if (again !== password) {
    fail("The two passwords didn't match. Nothing was created.");
  }

  const confirm = await ask(
    `\nCreate admin ${email} on ${parsed.hostname}? Type yes to continue: `
  );
  if (confirm.toLowerCase() !== "yes") {
    fail("Cancelled. Nothing was created.");
  }

  process.env.DATABASE_URL = databaseUrl;
  const prisma = createClient();

  try {
    await upsertAdmin(prisma, email.trim().toLowerCase(), name, password);
  } finally {
    await prisma.$disconnect();
  }
}

async function nonInteractive(): Promise<void> {
  const [emailArg, nameArg] = process.argv.slice(2);

  if (!emailArg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailArg)) {
    fail(
      "Usage: ADMIN_PASSWORD='...' npm run make-admin -- <email> [\"Full Name\"]  (or: npm run make-admin:live)"
    );
  }

  const prisma = createClient();

  try {
    await upsertAdmin(
      prisma,
      emailArg.trim().toLowerCase(),
      nameArg?.trim(),
      process.env.ADMIN_PASSWORD
    );
  } finally {
    await prisma.$disconnect();
  }
}

function explain(error: unknown): string | undefined {
  const code = (error as { code?: string })?.code;

  if (code === "P1000") {
    return "The database rejected the user name or password. In Neon, reset the password if you haven't, then copy the WHOLE connection string again (tick 'Show password' first) and paste it here.";
  }
  if (
    code === "P1001" ||
    code === "P1002" ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND"
  ) {
    return "Couldn't reach the database. Check the address, and that you copied the full string from Neon.";
  }
  return undefined;
}

const run = process.argv.includes("--live") ? guided : nonInteractive;

run()
  .catch((error) => {
    const friendly = explain(error);
    if (friendly) {
      console.error(`\n${friendly}`);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
