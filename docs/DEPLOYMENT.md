# Deploying Bubbles and Barks (Vercel + Neon)

The site runs on **Vercel** (hosting) with a **Neon** Postgres database. Do the
steps in this order: the database must exist and be set up *before* the first
Vercel deploy, because the build reads the opening hours from it.

Never paste passwords, database URLs or tokens into the repo or into chat.

## 1. Create the database (Neon)

1. Sign up at <https://neon.tech> and create a project. Pick the **Europe
   (London)** region if offered, so it is near the site's visitors.
2. Open the project's **Connect** panel. You need two connection strings:
   - **Pooled** (the host contains `-pooler`): used by the live site.
   - **Direct** (no `-pooler`): used for one-off setup commands from your
     computer.
   Both end in `?sslmode=require`; keep that.

## 2. Set up the database from your computer

In a PowerShell terminal in the project folder. The shell variable only lasts
for this terminal window and overrides `.env`, so your local database is not
touched.

```powershell
$env:DATABASE_URL = 'PASTE-THE-DIRECT-URL-HERE'   # single quotes!

npm run db:deploy      # creates all the tables
npm run db:seed        # adds the services and placeholder opening hours

Remove-Item Env:DATABASE_URL
```

Then create the owner's admin login with the guided command. It asks for the
database address and a password and hides what you type, so nothing needs
quoting and nothing is left in your terminal history:

```powershell
npm run make-admin:live
```

The admin account is created already verified. Use a fresh password (not one
that has been shared in chat).

## 3. Deploy on Vercel

1. Vercel dashboard → **Add New… → Project** → import the GitHub repo
   `dog-grooming-website` (allow Vercel to access it when asked).
2. Framework preset: **Next.js** (detected automatically). Leave build
   settings alone.
3. Before pressing Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the **pooled** Neon URL |
   | `AUTH_SECRET` | a new random value (below) |
   | `MS_CLIENT_ID` | the Microsoft app's client ID |
   | `MS_REFRESH_TOKEN` | the current token from your local `.env` |

   Generate `AUTH_SECRET` with:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   (do not reuse the local one).

4. Press **Deploy**. The first build takes a couple of minutes.

`AUTH_URL` is optional on Vercel: emailed links use the project's production
address automatically. Set `AUTH_URL` (to the full `https://…` address) once
you add a custom domain.

## 4. Check it works

1. Open the Vercel address. Browse the home page, services and gallery.
2. Log in as the admin → **Appointment Times** → open a few real times.
3. Register a test customer, confirm the email arrives, and make a booking.
4. In Admin, confirm the booking and check the customer email.

Keep test emails few: Microsoft suspended the sending account once already.

## 5. Later

- **Custom domain:** Vercel project → Settings → Domains. Then set `AUTH_URL`.
- **Microsoft token:** it expires after 90 days without use. If emails stop,
  run `node scripts/get-microsoft-refresh-token.mjs <client-id>` and update
  `MS_REFRESH_TOKEN` in Vercel, then redeploy.
- **Database changes:** after a schema change, run `npm run db:deploy` against
  the Neon direct URL (as in step 2) before deploying the code.
- **Plans:** Vercel's free Hobby plan is for personal, non-commercial use. A
  site that takes real bookings for a business should be on a paid plan
  (check the current terms on Vercel's pricing page).
