import { spawnSync } from "node:child_process";
import {
  createPrompter,
  describeDatabaseUrl,
  extractDatabaseUrl,
} from "./prompt";

// Applies any new database changes (migrations) to the live database.
//
//   npm run db:deploy:live
//
// It asks for the database address, hiding what you paste, so nothing needs
// quoting and the address never ends up in your terminal history. Run it
// BEFORE merging code that needs a new table or column, so the live site
// never runs ahead of its database.

const prompter = createPrompter();

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main() {
  console.log("Apply database changes to the live database.\n");
  console.log(
    "In Neon, open the project's Connect panel, turn off connection pooling,"
  );
  console.log("and copy the connection string. Paste it below (it stays hidden).\n");

  const pasted = await prompter.ask("Database address: ", true);
  const databaseUrl = extractDatabaseUrl(pasted);

  if (!databaseUrl) {
    fail(
      "That doesn't look like a database address. It should start with postgresql://"
    );
  }

  const details = describeDatabaseUrl(databaseUrl);
  if (!details) {
    fail(
      "The address is missing the user or password. Tick 'Show password' in Neon before copying."
    );
  }

  console.log(
    `\nThis will update ${details.host} as ${details.user} (database ${details.database}).`
  );
  console.log("It only adds the changes that haven't been applied yet.");

  const confirm = await prompter.ask("Type yes to continue: ");
  prompter.close();

  if (confirm.toLowerCase() !== "yes") {
    fail("Cancelled. Nothing was changed.");
  }

  const result = spawnSync("npx prisma migrate deploy", {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  if (result.status !== 0) {
    fail(
      "\nThe update didn't finish. If it says the credentials are not valid, copy the WHOLE connection string again from Neon (tick 'Show password' first)."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
