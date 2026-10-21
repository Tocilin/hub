# 0001 — Tooling versions

Date: 2026-10-21 · Status: Accepted

**Context.** Newer majors exist for several tools, but the Next.js lint chain lags behind them.

**Decision.**

- **TypeScript 5.9**, not 7.x. TypeScript 7 (the native port) is recent, and typescript-eslint and Next.js type checking are proven on 5.x.
- **ESLint 9**, not 10. `eslint-config-next` depends on `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-jsx-a11y`, which do not support ESLint 10 yet.
- **Node 22 LTS** (`.nvmrc`, `engines` ≥ 22.12). Vitest 5 and Vite 8 (Rolldown) require ≥ 22.12; Node 20 reached end-of-life in April 2026.
- **pnpm 10**, pinned via `packageManager`.

**Revisit** when `eslint-config-next` supports ESLint 10, and when Next.js documents TypeScript 7 support.

## Amendment — 2026-10-21: `cn` package

`shadcn add` (v4.22) generates components that import `cn` from the [`cn`](https://github.com/shadcn-ui/cn) package (maintained by shadcn; a compiled drop-in for `clsx` + `tailwind-merge`) and reinstalls it on every add. Rewriting those imports on each `add` would be ongoing friction, so HUB adopts `cn` and `@/lib/utils` re-exports it. `clsx` and `tailwind-merge` are removed. `cn` is young (0.5); if it misbehaves, `@/lib/utils` can go back to `twMerge(clsx(...))` and generated imports can be pointed there.
