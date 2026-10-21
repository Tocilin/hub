# Modules

Each personal app (Finance, Wardrobe, …) lives here as `src/modules/<appId>/`. Phase 1 ships none. Step-by-step guide: [`docs/adding-an-app.md`](../../docs/adding-an-app.md).

## Contract

1. **Identity:** a unique kebab-case `id`, used as the route namespace `/apps/<id>` and as the registry key.
2. **Layout:** `components/`, `data/` (Supabase queries and server actions), `lib/` (pure logic). Add folders only as needed.
3. **Route:** a thin folder `src/app/(platform)/apps/<id>/` that renders the module. Logic stays in the module.
4. **Registry:** switch the app's entry in `src/platform/registry` to `status: "active"`.
5. **Imports:** a module may import `@/platform`, `@/components` and `@/lib` — never another module.
6. **Security:** every server action calls `requireUser()` and validates input with Zod. Every table has RLS.
7. **Data:** tables are prefixed with the app id (`finance_accounts`); storage uses a private bucket named after the app id.
8. **Quality:** provide loading, empty and error states, and tests for the logic you add.

See [`docs/architecture.md`](../../docs/architecture.md) for the reasoning.
