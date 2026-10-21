# HUB

A private, single-user launcher for personal apps. One platform, many applications, one consistent experience.

- **Architecture:** [`docs/architecture.md`](docs/architecture.md)
- **Spec:** [`HUB_SPEC.md`](HUB_SPEC.md)
- **App contract:** [`src/modules/README.md`](src/modules/README.md)
- **Decisions:** [`docs/decisions/`](docs/decisions/)

## Requirements

- Node 22 LTS, ≥ 22.12 (see `.nvmrc`)
- pnpm 10 (`corepack enable`, or `npm i -g pnpm@10`)

## Local setup

```bash
pnpm install
cp .env.example .env.local   # then fill in values
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script                              | Purpose                              |
| ----------------------------------- | ------------------------------------ |
| `pnpm dev`                          | Start the dev server                 |
| `pnpm build` / `pnpm start`         | Production build / serve             |
| `pnpm typecheck`                    | TypeScript, no emit                  |
| `pnpm lint`                         | ESLint                               |
| `pnpm format` / `pnpm format:check` | Prettier                             |
| `pnpm test`                         | Unit and component tests (Vitest)    |
| `pnpm check`                        | Everything above, as CI would run it |
