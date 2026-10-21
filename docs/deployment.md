# Deployment & operations

HUB runs as **one Vercel project** (the Next.js app) and **one Supabase project** (Postgres + Auth). Pushing to `main` deploys to production. Database changes go out separately as migrations.

```text
git push main ──► GitHub Actions (check + e2e)
              └─► Vercel production build ──► https://<your-domain>
supabase db push ──► Supabase production database
```

## 1. One-time setup

### 1.1 Supabase production project

1. Create a project at [supabase.com](https://supabase.com). Choose the region closest to you and save the database password in your password manager.
2. **Auth settings** (dashboard → Authentication):
   - Turn **off** "Allow new users to sign up".
   - Keep the **Email** provider **enabled**: sign-in codes need it. Don't turn on "Confirm email" flows for sign-up; there is no sign-up.
   - Email OTP: length **6**, expiry **600** seconds, matching [`supabase/config.toml`](../supabase/config.toml).
   - **URL configuration:** set the Site URL to your production URL.
   - **Email template "Magic Link":** subject `Your HUB sign-in code`, body copied from [`supabase/templates/sign-in-code.html`](../supabase/templates/sign-in-code.html). It must contain `{{ .Token }}`.
3. **Email delivery.** Supabase's built-in email service is meant for testing: it has a low hourly limit and may only deliver to your project team's addresses. That's fine for one user. For reliable delivery, configure custom SMTP (e.g. Resend or Postmark) under Authentication → SMTP.
4. **Create your user:** Authentication → Users → Add user → Create new user. Enter the email you'll put in `HUB_APPROVED_EMAIL` and auto-confirm it. No password is needed.
5. **Apply migrations** from your machine:

   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <project-ref>
   pnpm exec supabase db push
   ```

   `<project-ref>` is the ID in your project's dashboard URL.

### 1.2 Vercel project

1. In [vercel.com](https://vercel.com), **Add New → Project** and import `Tocilin/hub`. Vercel detects Next.js and pnpm (from `pnpm-lock.yaml` and `packageManager`).
2. Set **Node.js 22.x** in the project's build settings, matching `.nvmrc`.
3. Add **Production** environment variables:

   | Name                                   | Value                                           |
   | -------------------------------------- | ----------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API keys → **Publishable** key       |
   | `HUB_APPROVED_EMAIL`                   | The email of the user you created               |

   Never add the Supabase **secret** key. HUB doesn't need it.

4. **Preview deployments** would run against the production database and its single user. Pick one:
   - **Build only `main` (recommended).** In Settings → Git → Ignored Build Step, use a custom command:
     ```bash
     if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi
     ```
     (Exit code 0 tells Vercel to skip the build.)
   - Or keep previews but leave **Deployment Protection** on, so only your Vercel account can open them.
5. Deploy. Then open the production URL, sign in with your email, and check Settings → Account.
6. Optional: add your own domain under Settings → Domains. Update Supabase's Site URL to match.

## 2. Everyday workflow

1. Work locally (`pnpm db:start`, `pnpm dev`).
2. Before pushing, run `pnpm check`. If auth or launcher flows changed, also run `pnpm test:e2e`.
3. Push to `main`. GitHub Actions runs the checks and E2E tests while Vercel builds and deploys.
4. Watch the deployment in Vercel. A failed build never replaces the live version.

### Shipping a database change

1. `pnpm db:migration <name>`, then write the SQL. Follow the conventions in [`architecture.md` §8](./architecture.md#8-data--storage-conventions-for-future-apps): RLS on every table, owned by `user_id`.
2. `pnpm db:reset` to rebuild locally from all migrations, then test.
3. **Make migrations backwards compatible** with the code currently in production: add columns and tables first, and remove old ones in a later release.
4. Apply to production **before** deploying code that depends on it: `pnpm exec supabase db push`.
5. Push the code.

Migrations are **forward-only**. Never edit a migration that has already run anywhere; add a new one.

## 3. Rollback

| What broke              | How to roll back                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App code                | Vercel → Deployments → pick the last good deployment → **Instant Rollback** (or "Promote to Production"). Takes seconds; no rebuild. Then fix forward with a new commit.           |
| A migration             | Write a new migration that undoes it and `supabase db push` it. Before a risky change, take a backup: `pnpm exec supabase db dump --data-only -f backup.sql` (keep it out of git). |
| A bad config or env var | Fix it in Vercel and redeploy the current deployment. Env changes only apply to new deployments.                                                                                   |

The Supabase free plan has daily backups only on paid plans and no point-in-time recovery. Take your own dump before migrations that touch data.

## 4. Monitoring & errors

- **App logs:** Vercel → project → Logs (runtime and build). HUB logs only error codes, never emails or tokens.
- **Auth:** Supabase → Authentication → Logs, for sign-in attempts and rate limiting.
- **Database:** Supabase → Logs → Postgres, plus the Security and Performance Advisors (they flag tables without RLS).
- **Uptime (optional):** a free external monitor pinging `/login`, which returns 200 when the app is up.
- Users see generic error screens (`error.tsx`, `not-found.tsx`); details stay in the logs.

## 5. Production checklist

- [ ] Sign-ups disabled; Email provider enabled; OTP 6 digits, 10 minutes
- [ ] Your user exists and matches `HUB_APPROVED_EMAIL`
- [ ] Migrations applied (`supabase migration list` shows local and remote in sync)
- [ ] Only the three env vars above are set; no secret key in Vercel
- [ ] Preview deployments disabled or protected
- [ ] Signed-out visit to `/` redirects to `/login`; an unknown email gets no email
- [ ] Response headers include `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`

## 6. Performance & accessibility audits

Automated accessibility checks (axe, WCAG 2.2 AA) run in the E2E suite. For Lighthouse, run it against a production build:

```bash
pnpm build && pnpm start
npx lighthouse http://localhost:3000/login --preset=desktop --view
```

Target 90+ for Performance, Accessibility and Best Practices. Pages behind login can be audited from Chrome DevTools → Lighthouse while signed in.
