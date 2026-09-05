# HireSphere Codebase Audit Report

> Frontend: `src/` (App Router), Server: 2 source files (`index.js`, `routes.js`). All findings verified with grep/read.
> Original audit: 2026-09-03. Updated: 2026-09-05 — after Batch 1+2+3 cleanup (see "Fixed since last audit").

## Executive Summary

**Overall quality:** Good working product, middling maintainability. Auth + role split + pagination patterns are sound. Debt is from fast iteration: copy-pasted fetchers, dual recruiter namespaces, god-utils, N+1 hydration, no validation lib.

**Biggest problems (still open):**
1. `x-recruiter-id` trusted by backend with no session proof — spoofable (`hiresphere-server/routes.js:21-32`).
2. No body validation anywhere — `...rest` spread into Mongo on POST/PUT (`routes.js` companies/jobs POST+PUT).
3. Stripe checkout uses `origin||referer` + leaks `err.message`, no origin allowlist (`api/checkout_sessions/route.js`).
4. Duplicated `request()/normalizeList()` x4 in `lib/actions/`, N+1 `enrichJobs` on dashboard.

**Biggest opportunities:** shared `lib/api/client.js`, `zod` both apps, unify `/dashboard/mycompany` + `/dashboard/recruiter` → `/dashboard/companies|jobs`, split `PlanUpgradeModal.jsx` + `dashboard/page.jsx`, remove `framer-motion` + `@stripe/stripe-js`.

**Most important risks:** live secrets on disk (rotate Mongo/Stripe/BetterAuth — seed/fix scripts that embedded the URI were deleted but the secret is still live), open CORS, `error.message` leakage x28 sites.

## Fixed since last audit (2026-09-05, verified)

| Item | Action | Verification |
| ---- | ------ | ------------ |
| 11 root one-off scripts | DELETED: `fix-dashboard.js`, `fix-plan.js`, `fix-remote-jobs.js`, `fix-ui.js`, `fix_signin.sh`, `seed-plans.js`, `seed-pro-data.js`, `seed-enterprise-data.js`, `test-db-count.js`, `test-stats.js` (broken `require` of server action), `test-user.js` | `ls` root clean, `rg` no refs, not in `package.json` scripts |
| 3x `.DS_Store` (`/`, `frontend/`, `server/`) | DELETED | `ls` clean |
| `lib/actions/company.js:57 getRecruiterCompany` | DELETED (0 importers; plural + stats are the used ones) | `grep getRecruiterCompany[^s]` = definition only before delete, 0 after |
| `lib/actions/applications.js:177 fetchJobApplicants` | DELETED (superseded by `fetchAllApplicants`, used in `recruiter/applications/page.jsx:1`) | `grep fetchJobApplicants` = 0 after |
| `lib/actions/profile.js:22 updateProfileEmail` | DELETED (0 importers) | `grep updateProfileEmail` = 0 after |
| `components/dashboard/CompanyNotRegistered.jsx` | DELETED (0 importers) | `grep CompanyNotRegistered` = 0 after |
| `lib/stripe.js:1-5` commented init | DELETED, kept `server-only` + live init | Read file |
| `components/shared/Navbar.jsx:145-220` commented `mobileAuth` | DELETED + removed now-unused `isProfileOpen` / `isPending` state | Read file, `grep mobileAuth` = 0 |
| `console.log` payload/debug (6 sites) | DELETED: `mycompany/new:58,62`, `mycompany/[id]/update:96,112`, `mycompany/[id]/page:109`, `JobForm:147`. Kept `warn/error` + `auth.js:11` build log | `grep console.log` = only `auth.js:11` |
| `dashboard/mycompany/[id]/edit/` shim | DELETED (`router.replace→update`). Redirect in `next.config` was added then removed per owner (dev project, no old bookmarks) | `ls mycompany/[id]/` = `page.jsx` + `update/` only |
| `server/package.json:2 name:"yes"` | RENAMED to `hiresphere-server` + description | Read file |
| `server/vercel.json` legacy `builds/routes` | REPLACED with `rewrites` | Read file |
| Lint after cleanup | `npm run lint`: 1 pre-existing error (`ThemeProvider:33` set-state-in-effect) + 6 `<img>` warnings, 0 new errors from cleanup | `npm run lint` 2026-09-05 |

## Corrections to previous audit (was wrong, KEEP — do not delete)

| Path | Previous claim | Reality (verified) |
| ---- | -------------- | ------------------ |
| `frontend/public/globe.png` | "Unreferenced CRA leftover, REMOVE" | **USED** — `src/app/(public)/page.js:21 <Image src="/globe.png">`. KEEP |
| `frontend/src/components/jobs/JobBadge.jsx` | "Singleton dir, MERGE to shared/" | **USED** x2 — `(public)/jobs/[id]/page.jsx:8`, `(public)/jobs/page.jsx:5`. KEEP as-is (merge is optional style, not cleanup) |
| `frontend/src/pages/api/` | "Empty legacy Pages Router, REMOVE" | Already gone — `ls src/pages` = No such file. No action |
| `components/dashboard/jobs/JobsTableSkeleton.jsx` default export | "0 direct for bare, remove" | **USED** internally by `RecruiterJobsSkeleton()` line 55, which is imported by `recruiter/jobs/page.jsx:6`. KEEP |
| `lib/core/session.js:10 requireCurrentUser` | "0 external, NEEDS VERIFICATION" | **USED** internally by `requireRecruiter()` line 17; public API for actions. KEEP |

## Project Structure Findings (remaining)

| Path | Issue | Evidence | Recommendation | Risk |
| ---- | ----- | -------- | -------------- | ---- |
| `frontend/src/lib/api/jobstruture.js` | Typo (`jobstruture`), god-util (plans+forms+ids+dates) | Imported 12x | RENAME to `job-structure.js` then SPLIT to `lib/plans.js`, `lib/jobs/model.js` | Low rename risk, needs codemod |
| `frontend/src/proxy.js` | Non-standard name, old `config.matcher` style | `proxy.js:4` prefixes `mycompany,recruiter` | VERIFY vs Next 16 docs, document role lists | Med |
| `frontend/src/app/api/checkout_sessions/` | snake_case, convention is kebab | Caller `PlanUpgradeModal.jsx:172` | RENAME to `checkout-sessions` + shim | Low |
| `frontend/src/components/*.jsx` root | `JobBoard,JobStats,Hero,Feature` flat, actually home | Used only by `(public)/page.js` | MOVE to `components/home/` | Low |
| `frontend/src/lib/api/` vs `actions/` vs `core/` | Inverted: `api/` has zero fetch, `actions/` does fetch | `companies.js,jobstruture.js,imgbb.js` pure sync | RENAME to `lib/utils/` + `lib/server/` | Med |
| `frontend/src/components/dashboard/DashBoardSideBar.jsx` | Casing (`Board` capital) vs `DashboardTopBar` | `layout.js:1` matches today, breaks Linux on typo | RENAME to `DashboardSidebar.jsx` | Low |
| Missing `.env.example` both apps | File absent | Glob ∅ | ADD empty-keys example | Low |

## Unused / Dead Code (remaining — re-check before deleting)

| File | Code | Status | Evidence | Recommendation |
| ---- | ---- | ------ | -------- | -------------- |
| `JobsTable.jsx:86`, `recruiter/jobs/[id]/edit/page.jsx:24` | `getJobId(x) ?? x.id ?? x._id` | Helper `getJobId=id??_id` ignores `jobId/slug` | NEEDS VERIFICATION | Fix helper to `jobId??slug??id??_id` first, then simplify call sites |
| `auth/[...all]/route.js`, `checkout_sessions`, `Toast.jsx`, `dashboard/loading.jsx` | tiny stubs | Used by convention | KEEP | — |

## Duplicate / Reusable Code (still open)

| Location | Duplication | Suggested Reuse | Benefit |
| -------- | ----------- | --------------- | ------- |
| `lib/actions/jobs.js:10-44` == `company.js:10-44` `request()+buildQuery()` | byte-identical | Extract `lib/api/client.js` | 1 place to fix cache/auth |
| `applications.js:10-39` == `saved-jobs.js:13-42` `normalizeList()+request()` | near-identical | Same client | Same |
| `lib/api/imgbb.js:15-36` vs `38-64` | `FormData+fetch+res.json` intra-file | Extract `uploadOne(file)` | -30 lines |
| `SignInForm:42-50`, `SignUpForm:54-68`, `mycompany/new:34-48`, `update:69-112` validation | `newErrors={}; if(!trim)...` x4 | `lib/validation.js` or add `zod` | Consistent errors |
| `Navbar.jsx` raw `<Link><Button>` | Only place not using `ButtonLink` (12 importers elsewhere) | Migrate to `ButtonLink` | Consistent nav |
| `server: paginate()` x5, `buildJobLookup` x3, `attachStatsPublic` wrapper | `routes.js` clones | Single helper, delete wrapper | Fix pageSize 20 vs 12 drift |

## Complexity Findings (still open)

| Location | Problem | Complexity | Simplification |
| -------- | ------- | ---------- | -------------- |
| `PlanUpgradeModal.jsx` ~590 lines | 5-deep nested ternary className + 4-level map | Untestable Tailwind strings | Split `lib/plans.js` + `PlanCard.jsx` + `ConfirmStep.jsx`, variant map |
| `dashboard/page.jsx` SeekerHome ~286 lines | fetch+`safeCall`+`normalizePage`+200 lines JSX in RSC | Mixed layers | Thin RSC → `lib/services/dashboard.js` → presentational |
| `JobForm.jsx` ~423 lines | validate+payload+create/update+push+toast in handler | 61-line function | `lib/validation/job.js` (zod), presentational form |
| `recruiter/jobs/page.jsx` | fetch+normalize+filter+mutate+stats in one client comp | No pagination, `pageSize:100` | RSC wrapper + `JobsManager` island, server `?status=&companyId=` |
| `dashboard/page.jsx` `companies.map→jobs.filter` | O(C*J) inline | Slow | Pre-index jobs by `companySlug` Map |
| `useMemo` trivial filters, `useEffect refreshKey`, `motion.create` in render | `recruiter/jobs`, `Navbar` | Memo cost > benefit, refetch anti-pattern | Remove memos, `router.refresh()/SWR`, move `motion.create` out or drop |
| `lib/api/jobstruture.js` god-util | plans+enums+forms+ids+dates | Split files | `plans.js`, `jobs/model.js`, `jobs/form.js` |

## Dependency Findings (still open)

| Dependency | Status | Reason | Recommendation |
| ---------- | ------ | ------ | -------------- |
| `@stripe/stripe-js` frontend | REMOVE | 0 imports, only node SDK used | Uninstall until Elements needed |
| `framer-motion@13` | REPLACE | 1 use: nav hover spin `Navbar` (~100kB) | CSS `transition-transform`, remove dep |
| `mongodb@7.5` frontend | KEEP | Required by better-auth adapter | Don't ad-hoc query outside `auth.js` |
| `stripe@22` node | KEEP | Live checkout | Add `apiVersion`, presence check |
| `better-auth`, `@heroui/*`, `gravity-icons`, `tailwind4`, `next16/react19` | KEEP | Core | — |
| Missing `zod` both apps | REPLACE (ADD) | 0 hits, all bodies unvalidated | `npm i zod` |
| Missing `helmet`, `express-rate-limit` server | REPLACE (ADD) | Open CORS, no headers/limit | Add both |
| `cors`, `dotenv`, `express`, `mongodb` server | KEEP | All used | — |

## Architecture Findings (still open)

1. **Dual recruiter namespaces:** `proxy.js:4` `mycompany` + `recruiter` for one role, cross-links in `page.jsx`, `JobForm`, `Sidebar`. Unify to `/dashboard/companies` + `/dashboard/jobs`, keep old as redirects. Single guard in `dashboard/layout.js`.
2. **`actions` vs `api` inverted:** `actions/*.js` are data-access fetchers, `api/*` pure helpers. Rename to `lib/server/*` vs `lib/utils/*` or make `api` real fetcher.
3. **ID duality:** server `$or:[jobId,slug,_id]` + `companySlug`, frontend `getJobId=id??_id` (ignores `jobId/slug`), `getCompanySlug=slug??id??_id`. Canonicalize: URL slug = `companySlug/slug`, fix `getJobId` to check `jobId??slug??id??_id`.
4. **Auth triplication:** `lib/auth.js` + `auth-client.js` + `core/session.js`. Keep DAG `actions→core/session→auth`, add `import/no-cycle`.

## Performance Findings (still open)

Only meaningful ones: **N+1 dashboard** `enrichJobs` does up to 6x `GET /api/jobs/:id` after list fetch (`dashboard/page.jsx`) — batch `?ids=` or embed job. **100-item overfetch** `pageSize:100` x6 sites + full refetch on toggle/delete — use optimistic patch. **No pagination** on `recruiter/jobs` (breaks >100). `framer-motion` for hover. Rest (parallel `Promise.all`, 30s SWR tags) is good.

## Security / Reliability Findings (still open)

| Issue | Severity | Evidence |
| ----- | -------- | -------- |
| Secrets on disk both `.env` (Mongo+Stripe+imgbb+BetterAuth) — not git-tracked but live, shared user. Deleted seed/fix scripts still embedded the URI — secret is live until rotated | CRITICAL | `frontend/.env`, `server/.env` — rotate NOW, split Atlas users, Vercel envs |
| `x-recruiter-id` spoofable direct-to-backend, only non-empty check | CRITICAL | `routes.js:21-32` vs frontend stamps `user.id` — must verify session/JWT server-side |
| No body validation, `...rest` into Mongo, can set `status/applicants/isPublicVisible` | HIGH | `routes.js` companies/jobs POST+PUT — add zod allowlist |
| Stripe anon checkout, `origin\|\|referer` open redirect, `err.message` leak, no webhook, plan from query | HIGH | `checkout_sessions` route — require session, allowlist origin, generic errors, webhook verify |
| Public reads leak `recruiterId/email/phone` | HIGH | `mountPublicEnhancements` — project out PII |
| CORS `app.use(cors())` any-origin | MED | `index.js` — allowlist app URL |
| `error.message` leakage x28 handlers | MED | `routes.js` x23, `index.js` x5 — generic envelope + server log |
| `STRIPE_SECRET_KEY` no guard, no apiVersion; `NEXT_PUBLIC_API_URL` no fallback; lowercase `port` | LOW/MED | `stripe.js:11`, `actions/*.js`, `index.js` |

# Refactoring Priority (updated)

### P0 — Critical
- Rotate all `.env` secrets. Split Mongo users. Add `.env.example`.
- `x-recruiter-id` → session-verified (forward Better-Auth cookie/JWT, min: `ObjectId.isValid`+DB lookup on all `/api/my/*`).

### P1 — High
- Add `zod` both apps, allowlist POST/PUT/PATCH bodies + query.
- Stripe: require auth, allowlist origin, generic errors, `apiVersion`, webhook → `updateProfilePlan`.
- Kill dashboard N+1, add `recruiter/jobs` server pagination, replace `pageSize:100` dumps.
- Shared `lib/api/client.js` (dedupe 4x `request/normalizeList`).

### P2 — Medium
- Split `PlanUpgradeModal`, `dashboard/page`, `JobForm`; flatten ternaries; extract validation.
- Unify `mycompany+recruiter` → `companies+jobs`; `src/pages/` already gone (no action).
- CORS allowlist, error envelope, eslint `import/no-cycle` + `unused-imports`, `lint --max-warnings 0`.
- Remove `@stripe/stripe-js` / `framer-motion` (or justify).

### P3 — Low
- Renames: `DashBoardSideBar→DashboardSidebar`, `jobstruture→job-structure`, `checkout_sessions→checkout-sessions`, `Recruiter_*→RECRUITER_*`, `port→PORT`, `mycompany→companies`, `[id]→[slug]` for companies.
- `jsconfig baseUrl`, `Navbar→ButtonLink`, `getJobId` fallback cleanup, `README LICENSE` link fix.
- `next.config images.remotePatterns` already set — no action. `globe.png` KEEP (used).

# Recommended Cleanup Plan (remaining)

**MERGE:** `request()+buildQuery()+normalizeList()` x4 → `lib/api/client.js` · validation x4 → `lib/validation.js` (+zod) · `profile.js` preludes → helper · `imgbb uploadImage(s)` → `uploadOne` · home sections → `components/home/`.

**REFACTOR:** N+1 → batch/embed + parallel `Promise.all` · `pageSize:100` → paginated + optimistic patch · `PlanUpgradeModal/dashboard/page/JobForm/recruiter/jobs` splits · CORS allowlist · error envelope · eslint strict · Stripe hardening · `requireRole` on all `/api/my/*` + PII projection.

**REUSE:** Standardize on `ButtonLink` (migrate Navbar) · `getJobId/getCompanySlug/normalize*` canonical + fix `jobId/slug` gap · `normalizePage()` for `Array??items` triple · `PageStrip`, `CompanyFormFields/FieldError`, `safeCall` everywhere.

**KEEP:** Both Stripe routes (fix, don't delete) · auth handler · all used actions/helpers/components · `mongodb`, `stripe(node)`, `better-auth`, `heroui`, `tailwind` · `no-store` for `/api/my/*` + 30s SWR tags (fix dead tags) · `server-only` Stripe boundary · no-barrel direct imports · `globe.png`, `JobBadge`, `JobsTableSkeleton`, `requireCurrentUser`.
