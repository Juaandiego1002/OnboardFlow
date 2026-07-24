# OnboardFlow — AGENTS.md

## Stack
- **Next.js 16** (App Router, output `standalone`), **Tailwind CSS 4**, **shadcn/ui** (new-york style), **TypeScript**, **Prisma** (SQLite), **Zustand**, **Bun**

## Commands

| Command | Script |
|---|---|
| Dev server (port 3000) | `bun run dev` |
| Build (standalone) | `bun run build` |
| Production start | `bun run start` |
| Lint | `bun run lint` |
| DB push | `bun run db:push` |
| DB migrate | `bun run db:migrate` |

Lint has zero useful rules — nearly all ESLint rules are disabled. `typescript.ignoreBuildErrors: true` and `noImplicitAny: false`. Don't rely on these for quality checks.

## Architecture

- **Single-page app**: All views render conditionally from `src/app/page.tsx` via `useAppStore.currentView`. No Next.js router navigation between pages.
- **State**: Zustand with `persist` middleware (`onboardflow-storage`). Only `landing`, `admin-login`, `admin-panel`, `employee-access` views are persisted; transient views redirect on reload.
- **API routes** under `src/app/api/` — all use `params: Promise<{...>}` pattern (Next.js 15+), must `await params`.
- **Prisma**: SQLite at `file:./prisma/dev.db` (dev) or `file:./db/custom.db` (prod). Singleton client in `src/lib/db.ts` with query logging enabled.
- **UI**: Spanish. shadcn/ui components live in `src/components/ui/`. Path alias `@/` → `./src/*`.

## Deployment
- Build script in `.zscripts/build.sh` — collects `.next/standalone`, `public/`, `Caddyfile`, `db/custom.db` into a tarball for deployment.
- Production stack: Next.js standalone server + optional mini-services + Caddy reverse proxy (port 81 → 3000).
- `mini-services/` directory holds additional backend services, auto-started by the dev/build scripts.

## Tests
- Only shell-based tests exist in `tests/`, verifying the Python runtime build and container integration. No JS/TS test runner configured.

## Notables
- `reactStrictMode: false` in `next.config.ts`.
- `next-intl` and `next-auth` are in `package.json` deps but not actively configured/used.
- Dark mode via `class` strategy with Tailwind 4 `tw-animate-css`.
- Beware: `db:push` uses `--accept-data-loss` — will silently drop columns/constraints.
