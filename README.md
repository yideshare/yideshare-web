This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dev server and DB setup

First, run the development server with following commands in coding IDE or local terminal:

(first-time to install package dependencies)

```bash
npm install
```

Ensure your `.env` file includes the following variables for local dev:
- `NODE_ENV=development`
- `JWT_SECRET="test_jwt_secret"`
- `POSTGRES_DB=come_up_with_your_db_name` 
- `POSTGRES_PASSWORD=come_up_with_pwd`
- `DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public`
- `DIRECT_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public`
- `CAS_BASE_URL="https://secure-tst.its.yale.edu/cas"`
- `YALIES_API_KEY` ask backend team

Build and start the Docker container:

```bash
docker compose up -d
```

Sync with latest db changes or create if no db:

```bash
npx prisma db push
```

Runs dev server on port 3000

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To stop all running containers:

```bash
docker compose down
```

## Helpful DB Commands:

Seed local DB:

```bash
npx prisma db seed
```

Inspect local DB:

```bash
npx prisma studio
```

Stop the containers AND delete all database data (useful for a clean restart):

```bash
docker-compose down -v
```

## Using Playwright:

First, install Playwright browsers (only needed once after installing Playwright):

```bash
npx playwright install
```

Then navigate to testing folder:

```bash
cd playwright-tests
```

Run tests:

UI mode (recommended)

```bash
npx playwright test --ui
```

No UI

```bash
npx playwright test
```

For detailed Playwright testing instructions, see [playwright-tests/README.md](./playwright-tests/README.md)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) - Next.js deployment how-to.
