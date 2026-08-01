# Yideshare

Ride sharing for the Yale community. Live at [yideshare.com](https://yideshare.com).

## What it does

- **Post you ride.** Set where you're leaving from, where you're headed, when, how many seats are free, and whether you have a car or plan to book an Uber/Lyft.
- **Search the feed for a match.** Filter by route and time to find people going your way.
- **Bookmark the rides you're weighing up.** They collect under Bookmarks so you can come back and decide later.
- **Message the owner without leaving the app.** Replies trigger an email notification so nothing sits unread.
- **Keep track of what you've posted.** Your Rides shows everything you own, and rides close themselves once their time has passed.


Sign-in is Yale CAS, so everyone on the board is a verified member of the Yale community.
The CAS ticket is validated server side, the account is enriched from the Yalies directory,
and the session is a JWT that middleware enforces on every protected page and API route.

## Stack

Next.js 15 (App Router) and TypeScript, Prisma on PostgreSQL, Tailwind with shadcn/ui and
Radix primitives, SWR for client data fetching, Resend for transactional email, Playwright
for end-to-end tests, deployed on Vercel.

## Running it locally

Install dependencies:

```bash
npm install
```

Create a `.env` with:

```
NODE_ENV=development
JWT_SECRET="test_jwt_secret"
POSTGRES_DB=<your db name>
POSTGRES_PASSWORD=<your password>
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5434/${POSTGRES_DB}?schema=public
DIRECT_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5434/${POSTGRES_DB}?schema=public
YALIES_API_KEY=<ask the admin team>
RESEND_API_KEY=<ask the admin team>
CRON_SECRET=<ask the admin team>
```

Start Postgres, set up the database, and run the dev server:

```bash
docker compose up -d      # Postgres on host port 5434
npx prisma generate       # regenerate the client after any schema edit
npx prisma db push        # sync schema to the db
npm run dev               # http://localhost:3000
```

Useful extras:

```bash
npx prisma db seed        # seed local data
npx prisma studio         # inspect the db
docker compose down       # stop containers
docker compose down -v    # stop AND wipe all database data
```

## Testing

Playwright specs live in `playwright-tests/`. Install browsers once, then run:

```bash
npx playwright install
cd playwright-tests
npx playwright test --ui   # UI mode, recommended
npx playwright test        # headless
```

See [playwright-tests/README.md](./playwright-tests/README.md) for details.

## Contributing

Refer to the [STYLE_GUIDE.md](./STYLE_GUIDE.md)
