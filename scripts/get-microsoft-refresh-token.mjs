// One-off helper: signs in to the business Outlook.com account and prints a
// refresh token that lets the website send email as that account.
//
// Usage:  node scripts/get-microsoft-refresh-token.mjs <application-client-id>
//
// It uses Microsoft's "device code" flow: you open a web page, type in a
// short code and sign in as the business account. No password or secret is
// ever handled by this script. Put the printed value in .env as
// MS_REFRESH_TOKEN (never commit it).

const AUTHORITY = "https://login.microsoftonline.com/consumers/oauth2/v2.0";
const SCOPE = "https://graph.microsoft.com/Mail.Send offline_access";

const clientId = process.argv[2] ?? process.env.MS_CLIENT_ID;
if (!clientId) {
  console.error(
    "Usage: node scripts/get-microsoft-refresh-token.mjs <application-client-id>"
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postForm(url, fields) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  });
  return { ok: response.ok, body: await response.json() };
}

const start = await postForm(`${AUTHORITY}/devicecode`, {
  client_id: clientId,
  scope: SCOPE,
});

if (!start.ok) {
  console.error("Could not start sign-in:", start.body.error_description ?? start.body);
  process.exit(1);
}

const { device_code, user_code, verification_uri, expires_in, interval } =
  start.body;

console.log("\n1. Open:  " + verification_uri);
console.log("2. Enter the code:  " + user_code);
console.log("3. Sign in as the business Outlook account and approve.\n");
console.log("Waiting for you to finish (the code expires in " + Math.round(expires_in / 60) + " minutes)...");

let waitSeconds = interval ?? 5;
const deadline = Date.now() + expires_in * 1000;

while (Date.now() < deadline) {
  await sleep(waitSeconds * 1000);

  const result = await postForm(`${AUTHORITY}/token`, {
    client_id: clientId,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    device_code,
  });

  if (result.ok) {
    if (!result.body.refresh_token) {
      console.error("Signed in, but no refresh token was returned.");
      process.exit(1);
    }
    console.log("\nSuccess. Add these to your .env file:\n");
    console.log(`MS_CLIENT_ID="${clientId}"`);
    console.log(`MS_REFRESH_TOKEN="${result.body.refresh_token}"\n`);
    console.log("Treat the refresh token like a password: don't commit or share it.");
    process.exit(0);
  }

  const error = result.body.error;
  if (error === "authorization_pending") continue;
  if (error === "slow_down") {
    waitSeconds += 5;
    continue;
  }

  console.error("\nSign-in failed:", result.body.error_description ?? error);
  process.exit(1);
}

console.error("\nThe code expired before sign-in finished. Run the script again.");
process.exit(1);
