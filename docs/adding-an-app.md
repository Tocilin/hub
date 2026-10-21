# Adding an app

An app is a **registry entry**, a **module** and a **route**. The platform doesn't need restructuring. Read the contract in [`src/modules/README.md`](../src/modules/README.md) first.

The examples use a hypothetical `recipes` app.

## 1. Pick an id

Use kebab-case and keep it stable: it becomes the URL (`/apps/recipes`), the table prefix (`recipes_*`) and the storage bucket name. Don't rename it once data exists.

## 2. Register it

Add an entry to [`src/platform/registry/apps.ts`](../src/platform/registry/apps.ts). Array order is launcher order.

```ts
{
  id: "recipes",
  name: "Recipes",
  description: "Recipes and meal plans",
  icon: ChefHat,        // any lucide-react icon
  color: "amber",       // one of appColors in types.ts
  status: "coming-soon" // switch to "active" when it ships
},
```

`pnpm test` validates the registry (unique, kebab-case ids, non-empty names, known colors).

## 3. Create the module

```text
src/modules/recipes/
  components/   # UI specific to this app
  data/         # queries and server actions (call requireUser(), validate with Zod)
  lib/          # pure domain logic, unit-tested
```

Only create folders you use. Import from `@/platform`, `@/components` and `@/lib`, and never from another module.

## 4. Add the route

```text
src/app/(platform)/apps/recipes/
  layout.tsx    # shell + launch guard
  page.tsx      # thin: renders module components
  loading.tsx   # skeletons shaped like the page
  error.tsx     # ErrorState with retry
```

The layout guards the route, so an app is only reachable while it is `active`:

```tsx
import { notFound } from "next/navigation";

import { AppIcon } from "@/components/platform/app-icon";
import { AppShell } from "@/components/platform/app-shell";
import { getActiveApp } from "@/platform/registry";

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  const app = getActiveApp("recipes");
  if (!app) notFound();

  return (
    <AppShell title={app.name} identity={<AppIcon app={app} size="sm" />}>
      {children}
    </AppShell>
  );
}
```

`AppShell` is optional. An app may render its own layout and navigation, using the design tokens and primitives ([`design-system.md`](./design-system.md)). Routes under `(platform)` sit behind the platform auth gate automatically (from Milestone 4).

Because the route is a static folder, use `next/link` with typed routes (`href="/apps/recipes/new"`). `pnpm typecheck` catches broken links.

## 5. Add data (if needed)

Create a migration with `supabase migration new recipes_init`, following the conventions in [`architecture.md` §8](./architecture.md#8-data--storage-conventions-for-future-apps):

```sql
create table public.recipes_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.recipes_items enable row level security;

create policy "Owner can manage their recipes"
  on public.recipes_items for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

## 6. Test it

- Unit-test `lib/` logic and any Zod schemas.
- Component-test interactive pieces.
- Add an E2E spec in `tests/e2e/` that launches the app from the HUB home.

## 7. Ship it

Switch the registry entry to `status: "active"`, run `pnpm check`, and deploy. The tile becomes a link automatically.
