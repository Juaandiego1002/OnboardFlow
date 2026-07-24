# OnboardFlow — AGENTS.md

## Stack

**Next.js 16** (App Router, `output: "standalone"`), **Tailwind CSS 4**, **shadcn/ui** (new-york style), **TypeScript**, **Prisma** (SQLite), **Zustand**, **npm**.

`serverExternalPackages: ["@prisma/client", "prisma"]` in `next.config.ts`. `reactStrictMode: false`. `typescript.ignoreBuildErrors: true`, `noImplicitAny: false` — TS/ESLint provide no safety guardrails.

## Commands

| Action | Command |
|---|---|
| Dev (port 3000) | `npm run dev` |
| Build | `npm run build` — runs `prisma generate && next build` |
| Production start | `npm run start` |
| Lint | `npm run lint` — `eslint .` |
| DB push (destructive) | `npm run db:push` — `--accept-data-loss`, silently drops columns/constraints |
| DB generate | `npm run db:generate` |
| DB migrate (safe) | `npm run db:migrate` |
| DB reset | `npm run db:reset` |
| DB seed | `npm run db:seed` — reads `ADMIN_EMAIL` from `.env`, creates Admin if missing |
| Playwright tests | `npx playwright test` (auto-starts dev server, single spec: `tests/session-expiration.spec.ts`) |
| Set initial password | `npx tsx scripts/set-password.ts` — hardcodes `admin@startup.com` / `Admin123` |

## Architecture

- **Single-page app**: All views render from `src/app/page.tsx` via `useAppStore.currentView`. No Next.js router navigation. URL param `?token=xxx` detected on mount, triggers `employee-access` view.
- **State**: Zustand + `persist` middleware (`onboardflow-storage`). Persisted views: `landing`, `admin-login`, `admin-panel`, `employee-access`. Others reset on reload (fallback: `admin-panel` if admin logged in, else `landing`).
- **Session**: `<SessionManager />` in `layout.tsx` calls `useSessionManager` hook. On `beforeunload`, `sendBeacon('/api/auth/tab-closed')` sets `pendingExpireAt = now + 5s`. On F5 reload, detects `navigation.type === 'reload'` and calls `/api/auth/cancel-close` (clears `pendingExpireAt`). `/api/auth/verify` enforces both `expiresAt` and `pendingExpireAt` checks.
- **API routes** under `src/app/api/` — all dynamic routes use `{ params }: { params: Promise<{...}> }` and **must `await params`**. Responses use `apiSuccess(data, status?)` / `apiError(message, status?)` from `src/lib/api-utils.ts`. Input validation uses Zod `safeParse` with schemas in `src/lib/validations.ts`.
- **Prisma**: SQLite at `file:./prisma/dev.db` (dev) or `file:./db/custom.db` (prod). Exported as `db` (not `prisma`) from `src/lib/db.ts` — standard singleton with query logging enabled.
- **Password hashing**: Node `crypto.scryptSync`, stored as `salt:hash` in `Admin.passwordHash`. Verify with `timingSafeEqual`. All in `src/lib/password.ts`.
- **Email**: Resend via `src/lib/email.ts`. Failures are logged but **silent** (non-blocking, returns `{ success: false }`).
- **UI**: Spanish. shadcn/ui components in `src/components/ui/`. Config in `components.json` (style: `new-york`, icon lib: `lucide`, aliases: `@/` → `./src/*`). Dark mode via `class` strategy.
- **Auth**: Password + token-based login in `/api/auth/login`. Magic-link fallback generates a session token but does **not** send an email.

## Notables

- `next-intl` and `next-auth` in `package.json` deps but **not configured/used**.
- `prisma/seed.ts` creates Admin by `ADMIN_EMAIL` env var (no password set). Passwords set via `set-password.ts` script or forgot/change flows.
- `invite/[token]/route.ts`: `GET` queries by `token` field; `DELETE` queries by `id` field (folder named `[token]` but reads param as `id`).
- `db:push` is destructive — prefer `db:migrate` for safe schema changes.
- Notification auto-dismiss: 3s close animation + 4s removal (in `page.tsx`).
- `.env` is gitignored. Contains `DATABASE_URL`, `ADMIN_EMAIL`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`.
- `emailSchema` in `src/lib/validations.ts` performs real SMTP verification (DNS MX lookup + socket to port 25). Will hang/fail in environments blocking outbound port 25.
- `worklog.md` at root is a manual log, not part of the app.
