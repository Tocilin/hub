# HUB Architecture

Status: **Approved** (2026-10-21) · Source spec: [`HUB_SPEC.md`](../HUB_SPEC.md)

HUB is a private, single-user web platform: a calm, OS-style launcher for independent personal applications (Finance, Wardrobe, Food, Properties, Health, …) that share authentication, design tokens, UI primitives, hosting and infrastructure.

This document records the architecture and the decisions that deviate from or refine the spec. Changes to anything here should be recorded as a short ADR in [`docs/decisions/`](./decisions/).

## 1. Shape: a modular monolith

- One Next.js repository, one Vercel deployment, one Supabase project.
- Each personal app is a **module** (`src/modules/<appId>`) with a thin route folder (`src/app/(platform)/apps/<appId>`).
- Shared code lives in `platform/` (auth, Supabase, registry, env), `components/` (UI primitives and platform components) and `lib/`.
- No microservices, no per-app deployments, no runtime plugin loading.

## 2. Stack

| Concern     | Choice                                                              |
| ----------- | ------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, `proxy.ts`), React 19                       |
| Language    | TypeScript, `strict` + `noUncheckedIndexedAccess`                   |
| Styling     | Tailwind CSS v4 (CSS-first `@theme`) + CSS variables                |
| Primitives  | shadcn/ui + Radix, Lucide icons                                     |
| Theme       | `next-themes` (Light / Dark / System, persisted per device)         |
| Data / Auth | Supabase Postgres + Auth via `@supabase/ssr`                        |
| Validation  | Zod                                                                 |
| Tests       | Vitest + React Testing Library; Playwright + `@axe-core/playwright` |
| Tooling     | pnpm, ESLint (flat config), Prettier                                |
| Runtime     | Node 22 LTS (≥ 22.12)                                               |
| Hosting     | Vercel                                                              |

## 3. Decisions that refine the spec

| Spec item                                                             | Decision                                                                                                                                           | Reason                                                                                                                                                  |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/[appId]/` dynamic route                                         | **No dynamic route.** Each real app adds a static folder `app/(platform)/apps/<appId>/` when it is built.                                          | Real apps need their own layouts, loading/error boundaries and nested routes. Coming-soon tiles are not links, so they need no route; unbuilt URLs 404. |
| Registry `path`, `order`, `icon: string`, `color?: string`            | `path` derived from `id`; order = array order; `icon` is a `LucideIcon`; `color` is a token name from a fixed union.                               | Less to keep in sync; no string→icon map bundling every icon; colors stay theme- and contrast-safe.                                                     |
| Wide `src/` tree (`features`, `design-system`, `types`, `storage`, …) | Four areas: `app`, `components`, `platform`, `modules` (+ `lib/utils.ts`).                                                                         | Phase 1 features are a handful of files; tokens live in CSS, guidance in `docs/`. Empty folders are overhead.                                           |
| ~20 primitives upfront                                                | Only what Phase 1 uses: Button, Input, Label, Card, Badge, ToggleGroup, Skeleton + AppTile, PageHeader, EmptyState, ErrorState, optional AppShell. | Adding a shadcn component takes seconds when an app needs it.                                                                                           |
| Persisted preferences table                                           | **No tables in Phase 1.** Theme is persisted per device by `next-themes`.                                                                          | A single setting doesn't justify a DB round trip. Migration tooling is still set up and exercised.                                                      |
| Search, staging, monitoring                                           | None yet. Vercel logs + Instant Rollback, Supabase logs. Vercel preview deployments disabled or protected.                                         | Previews would hit the production Supabase project and need extra auth redirect URLs.                                                                   |
| Lighthouse 90+                                                        | Target kept; automated a11y via axe in E2E; Lighthouse run manually before release.                                                                | Lighthouse CI is disproportionate for one user.                                                                                                         |
| Login                                                                 | **Email one-time code (6 digits).**                                                                                                                | Magic links often open in the wrong browser context on iPad/mobile and home-screen web apps.                                                            |
| Dev database                                                          | **Local Supabase via the Supabase CLI (Docker).**                                                                                                  | Free, offline, safe migration testing, and a local inbox (Mailpit) for E2E login.                                                                       |

## 4. Directory structure

```text
hub/
├── src/
│   ├── app/
│   │   ├── (auth)/login/            # page + Zod-validated server actions
│   │   ├── (platform)/
│   │   │   ├── layout.tsx           # requireUser() — the authorization gate
│   │   │   ├── page.tsx             # launcher (Server Component)
│   │   │   ├── settings/page.tsx
│   │   │   └── apps/                # one folder per *built* app
│   │   ├── layout.tsx  globals.css  not-found.tsx  error.tsx
│   ├── proxy.ts                     # session refresh + redirect only
│   ├── components/
│   │   ├── ui/                      # shadcn-generated primitives
│   │   └── platform/                # AppTile, AppGrid, PageHeader, AppShell, ThemeControl, states
│   ├── platform/
│   │   ├── auth/                    # require-user, is-approved, sign-out
│   │   ├── supabase/                # server, browser and proxy clients
│   │   ├── registry/                # apps.ts (data), types.ts, tests
│   │   └── env.ts                   # Zod-parsed env, server/public split
│   ├── modules/README.md            # the app contract (empty in Phase 1)
│   └── lib/utils.ts                 # cn()
├── supabase/                        # config.toml, migrations/
├── tests/e2e/
├── docs/                            # architecture, design-system, adding-an-app, deployment, decisions/
├── .env.example  .nvmrc  README.md
```

Unit and component tests are colocated (`*.test.ts[x]`); E2E tests live in `tests/e2e/`.

## 5. Module boundaries

- A future app = `src/modules/<appId>/{components,data,lib}` + a thin route in `app/(platform)/apps/<appId>/` + a registry entry switched from `coming-soon` to `active`.
- The registry **never imports modules**, so the launcher never loads app code.
- Modules may import `platform/`, `components/` and `lib/` — **never another module**. Enforced with ESLint `no-restricted-imports` once a second module exists.
- Apps may have their own layout and navigation. The shared `AppShell` (back-to-HUB, app identity, nav slot, actions) is optional.

## 6. Application registry

```ts
type HubApp = {
  id: string; // stable, kebab-case, unique; path = `/apps/${id}`
  name: string;
  description?: string;
  icon: LucideIcon;
  color?: AppColor; // token name from a fixed union
  status: "active" | "coming-soon" | "hidden";
};
```

Static, typed, ordered by array position. Unit tests validate unique ids, id format, and allowed colors. A `coming-soon` or `hidden` app is never rendered as a link.

## 7. Authentication & security

1. **Sign-ups disabled** in Supabase. Login uses `signInWithOtp({ shouldCreateUser: false })`; the single user is created once in the dashboard.
2. **Approved user:** `HUB_APPROVED_EMAIL` (server-only) is checked by `requireUser()`, which uses `auth.getUser()` (never trusts `getSession()`). It runs in the `(platform)` layout and in every server action. Unapproved identities are signed out and redirected.
3. **`proxy.ts`** refreshes the session cookie and redirects anonymous users. It is a convenience, **not** the security boundary.
4. Login responses never reveal whether an email is approved.
5. The app runtime needs **no Supabase secret/service key** in Phase 1; it is used only by local E2E setup.
6. Security headers in `next.config` (HSTS, `frame-ancestors`, `Referrer-Policy`, `X-Content-Type-Options`). User-facing errors are generic; no private data in metadata or logs.
7. All server inputs validated with Zod.

## 8. Data & storage conventions (for future apps)

- Tables live in `public`, prefixed by app id: `finance_accounts`, `wardrobe_items`.
- Every user-data table: `user_id uuid not null default auth.uid() references auth.users`, RLS enabled, ownership policy `auth.uid() = user_id`.
- Schema changes only via `supabase/migrations/`; forward-only.
- Storage: one **private** bucket per app (named after the app id), object paths `{user_id}/…`, policies on `storage.objects` matching the first path segment to `auth.uid()`. No upload flows until an app needs them.

## 9. Design system

- Semantic tokens as CSS variables in `globals.css` (`:root` and `.dark`), exposed via Tailwind v4 `@theme`.
- Token names **follow shadcn conventions** (`background`, `card` = surface, `popover` = elevated surface, `muted`, `primary`, `border`, …) plus `success`, `warning`, app tile colors, gutter, shadow and motion tokens — avoiding a translation layer at the cost of slightly generic names. Full guide: [`design-system.md`](./design-system.md).
- Light / Dark / System via `next-themes`; motion respects `prefers-reduced-motion`.
- **Launcher:** OS-style grid — 3 columns on phone, 4 on tablet, 5–6 on desktop. Tile = rounded icon square + name. Coming-soon tiles are non-link elements with reduced emphasis, a "Soon" badge and `aria-disabled`. Settings in the top-right corner.

## 10. Milestones

Each milestone ends with typecheck, lint, tests and build passing.

0. **Repo hygiene** — git repo in `hub/`, Node 22, pnpm.
1. **Foundation** — Next.js scaffold, strict TS, ESLint + Prettier, Zod env validation, folder skeleton, `.env.example`.
2. **Design system** — tokens, themes, base primitives, ThemeControl, `docs/design-system.md`.
3. **Launcher** — typed registry + tests, AppTile/AppGrid, responsive home, component tests.
4. **Supabase** — local stack, clients, OTP login, `requireUser`, proxy, logout, settings, baseline migration.
5. **Quality & deploy** — Playwright E2E (login via Mailpit, protected routes, unapproved user, tiles, settings, logout, mobile viewport, axe), security headers, Vercel setup, README and docs.
