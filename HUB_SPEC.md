# HUB — Product & Technical Specification

**Version:** 1.0  
**Product:** HUB  
**Audience:** Claude AI / implementation team  
**Phase:** Platform foundation only

## 1. Vision

HUB is a private, single-user web platform that launches and organizes independent personal applications from a unified, iPad-like home screen. Example future apps include Finance, Wardrobe, Food, Properties, and Health. Each app has its own domain, workflows, and UX, while sharing authentication, design tokens, UI primitives, hosting, and infrastructure.

**Core principle:** One platform, many applications, one consistent experience.

HUB is not a commercial SaaS product. Optimize for simplicity, privacy, ease of maintenance, and future extensibility.

## 2. Scope

### Phase 1 — Build
- Next.js platform foundation and responsive HUB launcher
- Shared design system, tokens, themes, and core components
- Central typed app registry and route conventions
- Supabase authentication, database configuration, and security foundation
- Settings (theme, account, logout)
- Testing, documentation, deployment setup
- Guide for adding future applications

### Phase 1 — Do not build
- Finance, Wardrobe, Food, Properties, Health, or other domain apps
- Domain-specific tables, integrations, or upload flows
- Multi-user features, public sign-up, payments, AI features
- Microservices, separate app deployments, dynamic plugin marketplace

Future apps may appear as clearly labeled **Coming soon** tiles, not fake functional pages.

## 3. Product Principles

1. Personal-first, optimized for a single user.
2. Modular architecture with clear ownership boundaries.
3. Consistent visual language without forcing identical app layouts.
4. Responsive desktop, tablet, and mobile experiences.
5. Accessible by default (target WCAG 2.2 AA).
6. Secure by default, with server-side authorization.
7. Fast, calm, and uncluttered interface.
8. Prefer maintainability over speculative abstractions.

## 4. Architecture

Use a **modular monolith**: one Next.js repository and deployment, with independently organized application modules. Do not create separate microservices or independent Next.js projects for each personal app.

Use path-based URLs:

- `/` — HUB home
- `/apps/finance` — future Finance app
- `/apps/wardrobe` — future Wardrobe app
- `/apps/food` — future Food app
- `/apps/properties` — future Properties app
- `/settings` — HUB settings
- `/login` — private login

App modules must not import another app's private implementation. Cross-cutting logic belongs in platform/shared layers. An app can have a unique layout and its own navigation; the common app shell is optional and composable.

## 5. Technology Stack

| Concern | Technology |
| --- | --- |
| Web framework | Next.js, App Router |
| UI | React |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS and CSS variables |
| UI primitives | shadcn/ui and Radix |
| Icons | Lucide React |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage (future use) |
| Validation | Zod |
| Hosting | Vercel |
| Unit/component tests | Vitest and React Testing Library |
| E2E tests | Playwright |
| Package manager | pnpm |

Choose stable, mutually compatible versions at implementation time. Prefer Server Components where appropriate and Client Components for browser interactions. Avoid Redux, GraphQL, or infrastructure with no concrete need.

## 6. Suggested Structure

```text
hub/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (platform)/
│   │   │   ├── page.tsx
│   │   │   ├── apps/[appId]/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── features/hub/
│   ├── modules/
│   │   └── README.md
│   ├── platform/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── registry/
│   │   ├── storage/
│   │   └── config/
│   ├── design-system/
│   │   ├── tokens/
│   │   └── patterns/
│   ├── lib/
│   └── types/
├── supabase/migrations/
├── public/
├── tests/
└── docs/
```

Avoid duplicate component libraries: `components/ui` can hold the concrete shadcn implementations, while `design-system` holds tokens and guidance. Treat this tree as a starting point rather than an inflexible requirement.

Future module example:

```text
src/modules/finance/
  components/
  features/
  data/
  types/
  lib/
```

## 7. HUB Home Screen UX

Design a polished, minimal application launcher inspired by the home screen of an operating system rather than an enterprise analytics dashboard.

Include:
- Minimal HUB identity/header
- Responsive grid of app tiles
- App icon, name, and optional short description/status
- Accessible navigation links for available apps
- Clearly disabled/coming-soon treatment for unavailable apps
- Subtle hover/press/focus feedback
- Settings access
- Search only when the number of apps justifies it

**Visual direction:** clean typography, generous whitespace, restrained color, rounded corners, subtle motion, no excessive glassmorphism or gradients. Desktop is spacious; tablet is touch-friendly; mobile is compact with adequate touch targets.

## 8. Design System

Use CSS variables and semantic tokens for:

- Colors: background, surface, elevated surface, text, muted text, borders, interactive, accent, success, warning, error
- Typography: family, sizes, weights, line height, letter spacing
- Spacing and layout gutters
- Radius, border widths, shadows
- Motion durations and easing

Support **Light / Dark / System** themes, persisting the preference. Respect reduced-motion settings.

Create a lean set of reusable primitives as needed: Button, IconButton, Input, Select, Checkbox, Radio, Switch, Card, Badge, Tooltip, Dialog, Dropdown, Tabs, Toast, Skeleton, EmptyState, ErrorState, AppTile, PageHeader, Navigation, and optional AppShell.

Use shadcn/ui and Radix where useful rather than recreating accessible behaviors. Apps may define domain-specific components and unique page layouts; consistency comes from primitives and tokens, not identical templates. Do not build a large unused component catalog upfront.

## 9. Navigation

Distinguish:

1. **Platform navigation**: HUB home, app launching, account/settings.
2. **Application navigation**: unique to each app, such as Finance Overview/Accounts or Wardrobe Items/Outfits.

Provide an optional shared shell with a back-to-HUB affordance, app identity, navigation slot, content area, and contextual actions. Do not require sidebars in all apps.

## 10. Application Registry

Use a typed, static application registry in Phase 1. It is the source of truth for the launcher.

```ts
type HubApp = {
  id: string;
  name: string;
  description?: string;
  path: string;
  icon: string;
  color?: string;
  status: "active" | "coming-soon" | "hidden";
  order: number;
};
```

Require stable IDs, unique paths, display ordering, visibility, and launch status. Add an app later by creating its module, route, and registry entry. Never dynamically execute untrusted plugin code. A static registry does not imply that a route is implemented; unavailable apps should remain unlaunchable.

## 11. Authentication & Security

- Supabase Auth with email-based login.
- No public sign-up or self-service account creation.
- Exactly one explicitly approved user identity, enforced **server-side**.
- Secure session handling, logout, and protected routes.
- Validate and authorize every server operation; do not rely only on hiding pages.
- Enable Row Level Security on all user-data tables; use ownership policies.
- Keep service-role credentials and other secrets server-only.
- Private storage buckets and access policies by default.
- HTTPS in production, secure cookies, safe errors, no private data in public metadata or logs.
- Validate server inputs with Zod or equivalent.

## 12. Database and Storage

Use one Supabase PostgreSQL instance. Create only the platform tables genuinely needed in Phase 1 (for example, persisted user preferences). Track schema changes through migrations.

Each future app owns its domain schema and data-access layer. Do not create Finance accounts, Wardrobe items, Food recipes, or similar tables now.

Use Supabase Storage for future private files (photos, documents, recipe images). Establish naming/access conventions, but do not implement upload flows until a real app needs them.

## 13. Settings

Phase 1 settings should support:
- Light / Dark / System theme
- Account information
- Logout

Keep the screen simple and extensible.

## 14. Performance & Accessibility

- Minimize client-side JavaScript; use server rendering appropriately.
- Avoid unnecessary requests, large dependencies, and layout shifts.
- Lazy-load heavy future app features.
- Optimize icons and imagery.
- Target 90+ Lighthouse scores in Performance, Accessibility, and Best Practices under representative production conditions.
- Target WCAG 2.2 AA: keyboard access, visible focus, semantic HTML, contrast, accessible labels, touch targets, reduced motion, and screen-reader-friendly states.

## 15. Deployment & Operations

Use Vercel + Supabase. Support local and production environments; add preview/staging when justified.

Provide `.env.example` with no secrets. Include Supabase URL, public key, approved-user configuration, and any required server-only settings. Document Git-based deployment, database migrations, basic monitoring, error handling, and rollback.

## 16. Engineering Standards

- Strict TypeScript; avoid `any` without justification.
- Small focused components and feature-oriented modules.
- Clear naming and module boundaries; no circular cross-app imports.
- Shared utilities only when actually reusable.
- Consistent loading, empty, error, unauthorized, and validation states.
- Server-side validation and authorization for data changes.
- Document architectural decisions and meaningful tradeoffs.

## 17. Testing

- Unit tests: registry validation, configuration helpers, utilities.
- Component tests: app tiles, navigation, theme control, key UI interactions.
- E2E tests: login, protected routes, HUB home, launch states, settings, logout, responsive navigation.
- Add only tests that correspond to implemented features.

## 18. Implementation Milestones

### Milestone 1 — Foundation
Initialize Next.js, strict TypeScript, Tailwind, pnpm, project structure, linting/formatting, and environment validation.

### Milestone 2 — Design System
Define tokens, typography, themes, accessible core components, and usage guidelines.

### Milestone 3 — HUB Launcher
Implement home screen, responsive app grid, typed registry, tile states, and platform navigation.

### Milestone 4 — Infrastructure
Configure Supabase, authentication, approved-user access, protected routes, preferences/settings, and migration strategy.

### Milestone 5 — Quality & Deployment
Add meaningful tests, review accessibility/security, configure Vercel, and document deployment and app creation.

## 19. Phase 1 Acceptance Criteria

Phase 1 is complete when:

- Local setup works from README instructions.
- Approved user can log in and log out securely.
- Unauthenticated or unapproved users cannot access private routes/data.
- Home screen renders tiles from the centralized registry.
- Coming-soon apps are visibly unavailable, not fake functional pages.
- Desktop, tablet, and mobile layouts work.
- Light/Dark/System themes work and preference persists.
- Settings page works.
- Shared tokens and components are documented.
- Supabase and migrations are configured securely.
- Vercel deployment is documented and operational.
- Critical tests pass.
- A new app can be added without restructuring the platform.
- No personal domain app has been built.

## 20. Future Application Contract

Every future application must:
1. Have a unique ID, route namespace, and registry entry.
2. Own its domain components, business logic, and data access.
3. Use platform authentication and security rules.
4. Use shared design tokens and primitives.
5. Supply relevant loading/error/empty states and tests.
6. Avoid imports from other apps' internal code.

Apps may have distinct layouts, navigation, visualizations, workflows, and database tables. They must not duplicate authentication or establish independent deployments without a deliberate architectural decision.

## 21. Instructions for Claude AI

Act as a senior software architect, staff-level frontend engineer, and product designer.

**First response — do not code yet:**
1. Review this entire specification.
2. Flag unclear or unnecessarily complex requirements.
3. Recommend sensible defaults and explain tradeoffs.
4. Propose a concrete architecture and final directory structure.
5. Provide an incremental implementation plan.
6. Ask only questions that materially affect implementation and cannot be reasonably inferred.
7. Wait for approval before implementing.

**After approval:**
- Build the foundation milestone by milestone.
- Use a modular monolith and maintain strict app boundaries.
- Keep the UI premium, minimal, responsive, and accessible.
- Avoid speculative abstractions and unnecessary infrastructure.
- Run checks after each milestone, fix errors, and summarize progress.
- Document local setup, Supabase, Vercel, design-system usage, app registration, and the workflow for creating future apps.
- Never build Finance, Wardrobe, Food, Properties, or Health during Phase 1.

**Final goal:** A secure, maintainable, beautiful personal app launcher and shared platform foundation that makes future app development straightforward.
