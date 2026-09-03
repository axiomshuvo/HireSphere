# HireSphere Codebase Audit Report

> Frontend: 121 files in `src/`, Server: 2 source files (`index.js` 283 lines, `routes.js` 883 lines). No code changed — report only. All findings verified with grep/read.
> Date: 2026-09-03

## Executive Summary

**Overall quality:** Good working product, middling maintainability. Auth + role split + pagination patterns are sound. Debt is from fast iteration: copy-pasted fetchers, dual recruiter namespaces, god-utils, N+1 hydration, no validation lib.

**Biggest problems:**
1. `x-recruiter-id` trusted by backend with no session proof — spoofable (`hiresphere-server/routes.js:21-32`).
2. No body validation anywhere — `...rest` spread into Mongo on POST/PUT (`routes.js:232-251,254-311,520-575`).
3. Stripe upgrades plan on query-param with no webhook (`pricing/success/page.jsx:35`).
4. Duplicated `request()/normalizeList()` x4 in `lib/actions/`, N+1 `enrichJobs` on dashboard.

**Biggest opportunities:** shared `lib/api/client.js`, `zod` both apps, unify `/dashboard/mycompany` + `/dashboard/recruiter` → `/dashboard/companies|jobs`, split `PlanUpgradeModal.jsx:590` + `dashboard/page.jsx:515`, remove `framer-motion` + `@stripe/stripe-js`.

**Most important risks:** live secrets on disk (rotate Mongo/Stripe/BetterAuth), open CORS, `error.message` leakage x28 sites.

## Project Structure Findings

| Path | Issue | Evidence | Recommendation | Risk |
| ---- | ----- | -------- | -------------- | ---- |
| `frontend/src/pages/api/` | Empty legacy Pages Router, App Router is canonical | `ls` 0 files, routes live in `src/app/api/` | REMOVE dir | Low |
| `frontend/src/lib/api/jobstruture.js` | Typo (`jobstruture`), god-util (plans+forms+ids+dates) | Imported 12x | RENAME to `job-structure.js` then SPLIT to `lib/plans.js`, `lib/jobs/model.js` | Low rename risk, needs codemod |
| `frontend/src/proxy.js` | Non-standard name, old `config.matcher` style | `proxy.js:4` prefixes `mycompany,recruiter` | VERIFY vs Next 16 docs, document role lists | Med |
| `frontend/src/app/dashboard/mycompany/[id]/edit/` | Legacy shim, real form in `update/` | `edit/page.jsx:15 lines router.replace→update` | REMOVE `edit/`, keep `update/` | Low |
| `frontend/src/app/api/checkout_sessions/` | snake_case, convention is kebab | Caller `PlanUpgradeModal.jsx:233` | RENAME to `checkout-sessions` + shim | Low |
| `frontend/src/components/jobs/JobBadge.jsx` | Singleton dir | Only file in `jobs/` | MERGE to `shared/` | Low |
| `frontend/src/components/*.jsx` root | `JobBoard,JobStats,Hero,Feature` flat, actually home | Used only by `(public)/page.js` | MOVE to `components/home/` | Low |
| `frontend/src/lib/api/` vs `actions/` vs `core/` | Inverted: `api/` has zero fetch, `actions/` does fetch | `companies.js,jobstruture.js,imgbb.js` pure sync | RENAME to `lib/utils/` + `lib/server/` | Med |
| `frontend/src/components/dashboard/DashBoardSideBar.jsx` | Casing (`Board` capital) vs `DashboardTopBar` | `layout.js:1` matches today, breaks Linux on typo | RENAME to `DashboardSidebar.jsx` | Low |
| `frontend/public/globe.png` | Only asset 1.4MB, unreferenced CRA leftover | No import found | REMOVE/replace with logo | Low |
| `server/package.json:2` | `name:"yes"` placeholder, `dev===start`, fake `test` | Read file | RENAME to `hiresphere-server`, add lint/test | Low |
| `server/vercel.json` | Legacy `builds/routes` syntax | File 1-16 | REPLACE with `rewrites` | Med |
| Missing `.env.example` both apps | `!.env.example` allowlisted but file absent | Glob ∅ | ADD empty-keys example | Low |

## Unused / Dead Code

| File | Code | Status | Evidence | Recommendation |
| ---- | ---- | ------ | -------- | -------------- |
| `lib/actions/company.js:57 getRecruiterCompany` | export | 0 importers | SAFE TO REMOVE | Delete, use list+find |
| `lib/actions/applications.js:177 fetchJobApplicants` | export, superseded by `fetchAllApplicants` | 0 importers | SAFE TO REMOVE | Delete |
| `lib/actions/profile.js:21 updateProfileEmail` | export | 0 importers, UI only uses Name | SAFE TO REMOVE | Delete or wire to settings |
| `components/dashboard/CompanyNotRegistered.jsx` | empty-state | 0 importers | SAFE TO REMOVE | Delete |
| `lib/stripe.js:1-5` | commented old init | 0 refs | SAFE TO REMOVE | Delete lines |
| `components/shared/Navbar.jsx:141-213` | ~70 lines commented `mobileAuth` | 0 refs | SAFE TO REMOVE | Delete block |
| `JobForm.jsx:112`, `mycompany/[id]/page.jsx:82`, `update/page.jsx:96,112`, `new/page.jsx:58,62` | `console.log Payload/...` debug | 6 hits, no user value | SAFE TO REMOVE | Delete logs, keep warn/error |
| `JobsTable.jsx:86`, `recruiter/jobs/[id]/edit/page.jsx:24` | `getJobId(x) ?? x.id ?? x._id` | Helper already does `id ?? _id` | SAFE TO REMOVE | Simplify to `getJobId(x)` |
| `lib/core/session.js:10 requireCurrentUser` | export, 0 external | 1 internal use | NEEDS VERIFICATION | Keep as public API or inline |
| `components/dashboard/jobs/JobsTableSkeleton.jsx` default export | `RecruiterJobsSkeleton` used, bare not | 0 direct for bare | NEEDS VERIFICATION | Remove unused export |
| `auth/[...all]/route.js`, `checkout_sessions`, `Toast.jsx`, `dashboard/loading.jsx` | tiny stubs | Used by convention | KEEP | — |

## Duplicate / Reusable Code

| Location | Duplication | Suggested Reuse | Benefit |
| -------- | ----------- | --------------- | ------- |
| `lib/actions/jobs.js:10-44` == `company.js:10-44` `request()+buildQuery()` | byte-identical | Extract `lib/api/client.js` | 1 place to fix cache/auth |
| `applications.js:10-39` == `saved-jobs.js:13-42` `normalizeList()+request()` | near-identical | Same client | Same |
| `lib/api/imgbb.js:15-36` vs `38-64` | `FormData+fetch+res.json` intra-file | Extract `uploadOne(file)` | -30 lines |
| `SignInForm:42-50`, `SignUpForm:54-68`, `mycompany/new:34-48`, `update:69-112` validation | `newErrors={}; if(!trim)...` x4 | `lib/validation.js` or add `zod` | Consistent errors |
| `profile.js:22-68` 3x `trim+regex+revalidatePath` | prelude fork | `requireTrimmed()` helper | DRY |
| `Navbar.jsx:100-136,224-301` raw `<Link><Button>` | Only place not using `ButtonLink` (12 importers elsewhere) | Migrate to `ButtonLink` | Consistent nav |
| `server: paginate()` x5, `buildJobLookup` x3, `attachStatsPublic` wrapper | `routes.js:54-61` + clones `412,740,806`, `index.js:100` | Single helper, delete wrapper | Fix pageSize 20 vs 12 drift |

## Complexity Findings

| Location | Problem | Complexity | Simplification |
| -------- | ------- | ---------- | -------------- |
| `PlanUpgradeModal.jsx:317-327,356-425` 590 lines | 5-deep nested ternary className + 4-level map | Untestable Tailwind strings | Split `lib/plans.js` + `PlanCard.jsx` + `ConfirmStep.jsx`, variant map |
| `dashboard/page.jsx:218-504` SeekerHome 286 lines | fetch+`safeCall`+`normalizePage`+200 lines JSX in RSC | Mixed layers | Thin RSC → `lib/services/dashboard.js` → presentational |
| `JobForm.jsx:74-135` 423 lines | validate+payload+create/update+push+toast in handler | 61-line function | `lib/validation/job.js` (zod), presentational form |
| `recruiter/jobs/page.jsx:48-301` | fetch+normalize+filter+mutate+stats in one client comp | No pagination, `pageSize:100` | RSC wrapper + `JobsManager` island, server `?status=&companyId=` |
| `dashboard/page.jsx:103` `companies.map→jobs.filter` | O(C*J) inline | Slow | Pre-index jobs by `companySlug` Map |
| `useMemo` trivial filters, `useEffect refreshKey`, `motion.create` in render | `recruiter/jobs:117-140`, `71-115`, `Navbar:55` | Memo cost > benefit, refetch anti-pattern | Remove memos, `router.refresh()/SWR`, move `motion.create` out or drop |
| `lib/api/jobstruture.js:1-106` god-util | plans+enums+forms+ids+dates | Split files | `plans.js`, `jobs/model.js`, `jobs/form.js` |

## Dependency Findings

| Dependency | Status | Reason | Recommendation |
| ---------- | ------ | ------ | -------------- |
| `@stripe/stripe-js` frontend | REMOVE | 0 imports, only node SDK used | Uninstall until Elements needed |
| `framer-motion@13` | REPLACE | 1 use: nav hover spin `Navbar:55-70` (~100kB) | CSS `transition-transform`, remove dep |
| `mongodb@7.5` frontend | KEEP | Required by better-auth adapter | Don't ad-hoc query outside `auth.js` |
| `stripe@22` node | KEEP | Live checkout | Add `apiVersion`, presence check |
| `better-auth`, `@heroui/*`, `gravity-icons`, `tailwind4`, `next16/react19` | KEEP | Core | — |
| Missing `zod` both apps | REPLACE (ADD) | 0 hits, all bodies unvalidated | `npm i zod` |
| Missing `helmet`, `express-rate-limit` server | REPLACE (ADD) | Open CORS, no headers/limit | Add both |
| `cors`, `dotenv`, `express`, `mongodb` server | KEEP | All used | — |

## Architecture Findings

1. **Dual recruiter namespaces:** `proxy.js:4` `mycompany` + `recruiter` for one role, cross-links in `page.jsx:147`, `JobForm:177`, `Sidebar:26,32`. Unify to `/dashboard/companies` + `/dashboard/jobs`, keep old as redirects. Single guard in `dashboard/layout.js`.
2. **`actions` vs `api` inverted:** `actions/*.js` are data-access fetchers, `api/*` pure helpers. Rename to `lib/server/*` vs `lib/utils/*` or make `api` real fetcher.
3. **ID duality:** server `$or:[jobId,slug,_id]` + `companySlug`, frontend `getJobId=id??_id` (ignores `jobId/slug`), `getCompanySlug=slug??id??_id`. Canonicalize: URL slug = `companySlug/slug`, fix `getJobId` to check `jobId??slug??id??_id`.
4. **Auth triplication:** `lib/auth.js` + `auth-client.js` + `core/session.js`. Keep DAG `actions→core/session→auth`, add `import/no-cycle`.

## Performance Findings

Only meaningful ones: **N+1 dashboard** `enrichJobs` does up to 6x `GET /api/jobs/:id` after list fetch (`dashboard/page.jsx:204-216,246-247`) — batch `?ids=` or embed job. **100-item overfetch** `pageSize:100` x6 sites + full refetch on toggle/delete (`recruiter/jobs:171,193`) — use `getRecruiterCompany(id)` + optimistic patch. **No pagination** on `recruiter/jobs` (breaks >100). `framer-motion` for hover. Rest (parallel `Promise.all`, 30s SWR tags) is good.

## Security / Reliability Findings

| Issue | Severity | Evidence |
| ----- | -------- | -------- |
| Secrets on disk both `.env` (Mongo+St QoL+Stripe+imgbb+BetterAuth) — not git-tracked but live, shared user | CRITICAL | `frontend/.env:1,7,16,26`, `server/.env:2` — rotate NOW, split Atlas users, Vercel envs |
| `x-recruiter-id` spoofable direct-to-backend, only non-empty check | CRITICAL | `routes.js:21-32` vs frontend stamps `user.id` — must verify session/JWT server-side |
| No body validation, `...rest` into Mongo, can set `status/applicants/isPublicVisible` | HIGH | `routes.js:232,254,520,554,578`, `index.js:143` — add zod allowlist |
| Stripe anon checkout, `origin\|\|referer` open redirect, `err.message` leak, no webhook, plan from query | HIGH | `checkout_sessions:44-47,48,99-102,115-119`, `success:35` — require session, allowlist origin, generic errors, webhook verify |
| Public reads leak `recruiterId/email/phone` | HIGH | `mountPublicEnhancements:738,776,804,866` — project out PII |
| CORS `app.use(cors())` any-origin | MED | `index.js:9` — allowlist app URL |
| `error.message` leakage x28 handlers | MED | `routes.js` x23, `index.js` x5 — generic envelope + server log |
| `STRIPE_SECRET_KEY` no guard, no apiVersion; `NEXT_PUBLIC_API_URL` no fallback; lowercase `port` | LOW/MED | `stripe.js:11`, `actions/*.js:6`, `index.js:15` |

# Refactoring Priority

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
- Unify `mycompany+recruiter` → `companies+jobs`; delete `edit/` shim, `recruiter/page` redirect, `src/pages/`.
- CORS allowlist, error envelope, `vercel.json` rewrites, eslint `import/no-cycle` + `unused-imports`, `lint --max-warnings 0`.
- Remove `@stripe/stripe-js` / `framer-motion` (or justify).

### P3 — Low
- Renames: `DashBoardSideBar→DashboardSidebar`, `jobstruture→job-structure`, `checkout_sessions→checkout-sessions`, `Recruiter_*→RECRUITER_*`, `port→PORT`, `mycompany→companies`, `[id]→[slug]` for companies.
- `jsconfig baseUrl`, `next.config images.remotePatterns`, remove `globe.png`, `GOOGLE_/CLOUDINARY_` dead env, `Navbar→ButtonLink`, `getJobId` fallback cleanup, `README LICENSE` link fix.

# Recommended Cleanup Plan

**REMOVE:** `src/pages/` · `mycompany/[id]/edit/` · `recruiter/page.jsx` redirect · `stripe.js:1-5` comments · `Navbar:141-213` comment · 6x `console.log` · `getRecruiterCompany`, `fetchJobApplicants`, `updateProfileEmail` (or wire) · `CompanyNotRegistered.jsx` · `public/globe.png` · `@stripe/stripe-js`, `framer-motion` · `CLOUDINARY_*`, `GOOGLE_*` placeholders, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (until Elements) · `attachStatsPublic` wrapper.

**MERGE:** `request()+buildQuery()+normalizeList()` x4 → `lib/api/client.js` · validation x4 → `lib/validation.js` (+zod) · `profile.js` preludes → helper · `imgbb uploadImage(s)` → `uploadOne` · `JobBadge` → `shared/` · home sections → `components/home/`.

**REFACTOR:** N+1 → batch/embed + parallel `Promise.all` · `pageSize:100` → paginated + `getRecruiterCompany(id)` · `PlanUpgradeModal/dashboard/page/JobForm/recruiter/jobs` splits · CORS allowlist · error envelope · `vercel.json` · eslint strict · Stripe hardening · `requireRole` on all `/api/my/*` + PII projection.

**REUSE:** Standardize on `ButtonLink` (migrate Navbar) · `getJobId/getCompanySlug/normalize*` canonical + fix `jobId/slug` gap · `normalizePage()` for `Array??items` triple · `PageStrip`, `CompanyFormFields/FieldError`, `safeCall` everywhere.

**KEEP:** Both Stripe routes (fix, don't delete) · auth handler · all used actions/helpers/components · `mongodb`, `stripe(node)`, `better-auth`, `heroui`, `tailwind` · `no-store` for `/api/my/*` + 30s SWR tags (fix dead tags) · `server-only` Stripe boundary · no-barrel direct imports.
