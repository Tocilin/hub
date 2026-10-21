# HUB

A private, single-user launcher for personal apps. One platform, many applications, one consistent experience.

- **Architecture:** [`docs/architecture.md`](docs/architecture.md)
- **Spec:** [`HUB_SPEC.md`](HUB_SPEC.md)
- **Adding an app:** [`docs/adding-an-app.md`](docs/adding-an-app.md)
- **Design system:** [`docs/design-system.md`](docs/design-system.md)
- **App contract:** [`src/modules/README.md`](src/modules/README.md)
- **Decisions:** [`docs/decisions/`](docs/decisions/)

## Requirements

- Node 22 LTS, ≥ 22.12 (see `.nvmrc`)
- pnpm 10 (`corepack enable`, or `npm i -g pnpm@10`)
- Docker (Docker Desktop or OrbStack), for local Supabase. The Supabase CLI is installed as a dev dependency.

## Local setup

```bash
pnpm install
pnpm db:start                # local Supabase in Docker; prints URLs and keys
cp .env.example .env.local   # then fill in values (see below)
pnpm dev                     # http://localhost:3000
```

Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: the **Project URL** from `pnpm db:status` (`http://127.0.0.1:54321`).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the **Publishable** key from `pnpm db:status`.
- `HUB_APPROVED_EMAIL`: the one email allowed to sign in.

Create that user once. Open Studio at <http://127.0.0.1:54323>, go to **Authentication → Add user → Create new user**, enter the approved email and tick **Auto Confirm User**. A password isn't needed: HUB signs in with emailed codes, and sign-up is disabled.

To sign in, enter the email at `/login`. Local emails aren't really sent; read the 6-digit code in Mailpit at <http://127.0.0.1:54324>.

## Database

- Migrations live in `supabase/migrations/` and are forward-only.
- `pnpm db:migration <name>` creates one, and `pnpm db:reset` rebuilds the local database from all migrations.
- Conventions for app tables, RLS and storage: [`docs/architecture.md` §8](docs/architecture.md#8-data--storage-conventions-for-future-apps).
- **Gotcha:** in `supabase/config.toml`, `[auth.email] enable_signup` turns the email login method itself on or off, so keep it `true`. Sign-ups are blocked by `[auth] enable_signup = false`. In the hosted dashboard, likewise keep the Email provider enabled and turn **Allow new users to sign up** off.

## Scripts

| Script                              | Purpose                               |
| ----------------------------------- | ------------------------------------- |
| `pnpm dev`                          | Start the dev server                  |
| `pnpm build` / `pnpm start`         | Production build / serve              |
| `pnpm typecheck`                    | TypeScript, no emit                   |
| `pnpm lint`                         | ESLint                                |
| `pnpm format` / `pnpm format:check` | Prettier                              |
| `pnpm test`                         | Unit and component tests (Vitest)     |
| `pnpm check`                        | Everything above, as CI would run it  |
| `pnpm db:start` / `pnpm db:stop`    | Start / stop local Supabase           |
| `pnpm db:status`                    | Local URLs and keys                   |
| `pnpm db:reset`                     | Recreate the local DB from migrations |
| `pnpm db:migration <name>`          | Create a new migration file           |
