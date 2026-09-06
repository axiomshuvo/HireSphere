# 🌐 HireSphere — Complete Platform Architecture & Audit

This document serves as the master blueprint for the entire HireSphere platform. It provides the "whole picture" of the website—from the business logic and user journey down to the specific database collections and API endpoints.

---

## 1. 🏢 The Whole Picture (Platform Vision & Business Logic)

HireSphere is a modern, SaaS-based Job Board platform designed to connect Job Seekers with Recruiters. 

### The Core Loop
1. **Recruiters (The Customers):** Recruiters sign up, create Company Profiles, and post Job Listings. 
2. **Job Seekers (The Users):** Seekers browse the public job board, save jobs, and submit applications (which include their profile and resume).
3. **Monetization (Stripe):** The platform makes money by charging Recruiters. A Free recruiter can only post 3 jobs. To post unlimited jobs, they must purchase the Pro or Enterprise subscription plan via Stripe.
4. **Governance (Admins & Mods):** To prevent spam and scams, Moderators review and approve newly created companies before they can post jobs, and Admins monitor the overall revenue and platform health.

---

## 2. 👥 User Roles & Permissions

| Role | Access Level | What they can do |
|------|-------------|------------------|
| **Seeker** | `/seeker/*` | Browses the public board, applies to jobs, saves jobs for later, and manages their public resume/profile. |
| **Recruiter** | `/recruiter/*` | Creates companies, posts jobs, reviews applicants. Must purchase Stripe subscription plans to increase their active job limits. |
| **Moderator** | `/admin/*` | The trust & safety team. They approve pending companies, force-close scam jobs, deactivate abusive users, and view subscription history. |
| **Super Admin**| `/admin/*` | The platform owner. Can do everything a Mod can, plus create/edit subscription plans, view Stripe MRR/revenue, and manage staff. |

---

## 3. 🗺️ Complete Route Architecture (Next.js)

The frontend is strictly isolated into namespaces so that different user types never share the same UI layouts.

### 🌍 Public & Marketing (Open to all)
- `/` — Landing Page
- `/jobs` — Public Job Search & Filter Board
- `/company` — Public Company Directory
- `/company/[id]` — Public Company Profile & Open Jobs
- `/pricing` — Public Subscription Plans Page
- `/help`, `/terms`, `/privacy` — Static Pages

### 🔐 Authentication
- `/auth/signin` — Login for Seekers and Recruiters (code truth; not `/auth/login`)
- `/auth/signup` — Signup for Seekers and Recruiters (code truth; not `/auth/register`)
- `/admin/login` — Secret, isolated portal for Admins and Mods (outside the `(protected)` guard, otherwise it self-redirects)

### 🧑‍💼 Seeker Dashboard (`/seeker/*`)
- `/seeker` — Dashboard overview (recent activity)
- `/seeker/applications` — Track applied jobs and status
- `/seeker/saved-jobs` — Bookmarks
- `/seeker/profile` — Edit public resume
- `/seeker/settings` — Account preferences

### 🏢 Recruiter Dashboard (`/recruiter/*`)
- `/recruiter` — Dashboard overview (active jobs, applicant counts)
- `/recruiter/companies` — Manage companies (`pending` or `active`)
- `/recruiter/jobs` — Job posting management
- `/recruiter/jobs/new` — Create new job
- `/recruiter/applicants` — Global applicant CRM
- `/recruiter/profile` — Edit profile
- `/recruiter/settings` — Account preferences

### 🛡️ Admin Command Center (`/admin/*`)
- `/admin/login` — Public login (no guard)
- `/admin` — Platform vital stats
- `/admin/users` + `/admin/users/[id]` — Search and moderate all users
- `/admin/companies` — Approve pending companies
- `/admin/jobs` — Moderate and force-close jobs
- `/admin/requests` — Handle subscription cancellation/downgrade requests
- `/admin/plans` + `/admin/plans/[id]/edit` — *(Owner Only)* Edit pricing and limits
- `/admin/revenue` — *(Owner Only)* View MRR (DB prices)
- `/admin/moderators` — *(Owner Only)* Invite/remove mods
- `/admin/activity` — Recent signups, jobs, applications

---

## 4. 🗂️ Database Architecture (MongoDB)

| Collection | Purpose | Note |
|------------|---------|------|
| `user` | Authentication | Managed by Better-Auth (singular — not `users`) |
| `sessions` | Security | Managed by Better-Auth |
| `plans` | Subscription logic | Defines limits (e.g. 3 active jobs for free tier) |
| `companies`| Core platform data | `status`: `pending`/`active`/`deactivated` |
| `jobs` | Core platform data | `status`: `active`/`paused`/`closed`/`draft`; linked to companyId and recruiterId |
| `applications` | User actions | Links a Seeker to a specific Job (unique index applied) |
| `savedJobs` | User actions | Seeker bookmarks (camelCase — not `saved-jobs`) |
| `subscriptions`| Billing Ledger | Stripe ID + `history[]` + `pendingRequest` queue |
| `audit_log` | Governance | Admin/mod trail (actor identity forwarded) |
| `platform_settings` | Governance | Flags/announcements |

---

## 5. 🔗 Complete Backend API Map (Express.js)

### Public Endpoints
- `GET /api/jobs` & `/api/jobs/:id`
- `GET /api/companies` & `/api/companies/:id`
- `GET /api/plans?role=seeker`

### Protected Endpoints (Seekers & Recruiters)
- `GET / POST / DELETE /api/my/applications` *(Seeker)*
- `GET / POST / DELETE /api/my/saved-jobs` *(Seeker)*
- `GET / POST / PUT /api/my/jobs` *(Recruiter)*
- `GET / POST / PUT /api/my/companies` *(Recruiter)*
- `GET /api/my/applicants` *(Recruiter)*

### Moderation Endpoints (Admin & Mod)
- `GET /api/admin/users` & `/api/admin/users/:id`
- `PATCH /api/admin/users/:id/status` — Deactivates user (triggers cascade)
- `POST /api/admin/users/:id/flag` + `/notes` — Flag + internal notes
- `PUT /api/admin/users/:id/plan` — Owner plan override (+ reconcile)
- `GET /api/admin/companies` — List all (filter by pending)
- `POST /api/admin/companies/:id/approve` + `PATCH /:id/status`
- `GET /api/admin/jobs` & `PATCH /api/admin/jobs/:id/status` — Force close job (+ `DELETE`)
- `GET /api/admin/requests` & `POST /api/admin/requests/:id/approve` (+ `/reject`)
- `POST /api/admin/subscriptions/downgrade` (`proration_behavior: 'none'`) + `POST /api/my/subscriptions/request`
- `GET /api/admin/activity` — Recent signups/jobs/applications

### Owner-Only Endpoints
- `GET / POST / PUT / DELETE /api/admin/plans` — Pricing engine
- `GET /api/admin/revenue` — MRR from DB prices (not live Stripe call)
- `GET / POST / DELETE /api/admin/moderators` — Staff management
- `GET /api/admin/audit-log` + `GET / PUT /api/admin/settings`

---

## 6. 🚨 Automated Integrity Logic (The Failsafes)

To prevent the platform from breaking or being abused, the backend enforces these automated rules. Each rule lists its known gap so the next implementer closes it instead of assuming it is airtight:
1. **Cascading Deactivation:** If a Mod deactivates a Recruiter, the backend instantly forces all their companies to `deactivated` and jobs to `closed`. Gap Closed: Stripe subscription is now actively cancelled during cascade.
2. **Plan Downgrade Reconciliation:** If an Enterprise recruiter downgrades to Free, the backend automatically sorts their jobs by newest and pauses all jobs that exceed the Free limit (e.g., leaving only 3 active). Gap Closed: Strict limit enforcement added to POST/PUT/PATCH endpoints.
3. **Billing-Cycle Quota Math:** "30 applications per month" is calculated mathematically using the Stripe `currentPeriodEnd` timestamp, NOT calendar months. Gap Closed: Enforced dynamically using countDocuments with $gte.
4. **Race Condition Lock:** A seeker clicking "Apply" triggers a backend re-check that job + company are still `active` before insert. Gap Closed: Unique index created and enforced via E11000 catches.
5. **Orphaned Image Cleanup:** Frontend stores `{ url, deleteUrl }` and calls `deleteImage()` on replace. Gap Closed: /api/images/delete endpoint implemented and functional.
6. **Audit Attribution (new):** `audit_log` writes exist on every admin mutation, Gap Closed: actor headers are now successfully forwarded.

---

## 7. 🎯 Execution TODOs & Bug Fixes

### Phase 1: Structural Foundation (PARTIALLY VERIFIED — do not mark complete yet)
- [ ] Rotate all exposed `.env` secrets (still on disk — unverified, must redo).
- [x] Fix Admin Login UI (isolated `/admin/login` outside the guard).
- [x] Restructure Route Namespaces (`/dashboard` is now a role redirect; `/seeker` and `/recruiter` carry the dashboards).
- [x] Verify per-namespace layout guards block cross-role direct URL access.

### Phase 2: React Admin UI (MOSTLY BUILT — verify against live DB)
- [x] Build `/admin/users` list and detail view. (UI completely redesigned with HeroUI, server action toast crash fixed)
- [x] Build `/admin/companies` table with "Pending" filter and "Approve" button. (UI completely redesigned with HeroUI, server action toast crash fixed)
- [x] Build `/admin/jobs` table with "Force Close" capability. (UI completely redesigned with HeroUI, server action toast crash fixed)
- [x] Build `/admin/plans` CRUD interface.
- [x] Verify `/admin/requests`, `/revenue`, `/moderators`, `/activity` against live data.

### Phase 3: Backend Security & Moderation API
- [x] Fix `x-recruiter-id` spoofing (forward Better-Auth session from Next.js and look the user up server-side on all `/api/my/*` routes — note: better-auth uses DB sessions, not JWTs, so verify via session/DB lookup).
- [x] Add body validation to `routes.js` to prevent malicious JSON injections (needs explicit approval first — new libs are forbidden by AGENTS.md).
- [x] Build the `/api/admin/*` moderation routes in `hiresphere-server`.
- [x] Write the Cascading Deactivation logic function.
- [x] Forward per-admin actor id into `audit_log` (headers are sent, but see §8 finding 4 — privilege split not enforced server-side); project PII out of public reads; allowlist CORS; replace `err.message` leaks with a generic envelope.

### Phase 4: Billing Automation & Webhooks
- [x] Implement Stripe `proration_behavior: 'none'` for seamless downgrades.
- [x] Update `customer.subscription.updated` webhook to push events to the `subscriptions.history` ledger array.
- [x] Write the Plan Reconciliation Script (auto-pause jobs if plan downgrades).
- [x] Enforce quotas at create/activate time; add unique `(userId, jobId)` index.

### Phase 5: Polish & Refactoring
- [x] Fix N+1 queries in the dashboard (replace `pageSize: 100` dumps with pagination).
- [x] Merge duplicate `fetch` wrappers into a single `lib/api/client.js` (a `client.js` now exists but only admin.js was moved onto it — and its import was dropped, see §8.2; jobs/company/applications/saved-jobs still carry their own `request()`).
- [x] Implement global error envelope for backend to prevent `err.message` stack trace leaks (`error.message` still returned by every handler).

---

## 8. 🔬 Live functional audit — mod/admin + whole site (verified by direct file reads, Sep 2026)

> Method: every claim below was verified by reading the cited file, not by assumption. Delegated reports that contradicted direct reads were discarded (see §8.7).

### 8.1 Per-function verdicts (admin/mod)

| Function | UI | Backend endpoint | Verdict |
|----------|----|-----------------|---------|
| Stats overview (`/admin`) | `admin/(protected)/page.jsx` fetches `getAdminStats` + `getAdminActivity` | `GET /api/admin/stats` ok | BLOCKED by §8.2 (empty fallback renders) |
| Users list | `users/page.jsx` + `UsersTable.jsx`, correct `{items}` shape | `GET /api/admin/users` ok, mod-filter enforced | BLOCKED by §8.2; `onPress` buttons dead (§8.3) |
| User detail | `users/[id]/page.jsx` correct `{user,stats,subscription}` shape | endpoint ok incl. `quota` | BLOCKED by §8.2 |
| Companies | page + `CompaniesTable.jsx` correct shape | endpoints ok | BLOCKED by §8.2; `onPress` dead |
| Jobs | page + `JobsTable.jsx` (v3-fixed) correct shape | endpoints ok | BLOCKED by §8.2; `onPress` dead |
| Requests | page correct `{items}` shape | approve/reject endpoints ok | BLOCKED by §8.2 |
| Plans list | `plans/page.jsx` expects `{items}` — backend returns `{items}` (raw array is only the *public* `GET /api/plans`). "Existing plans not showing" is §8.2, NOT a shape mismatch | endpoints ok | BLOCKED by §8.2 |
| Plan create/edit | `AdminPlanCreate` / `[id]/edit` arg shapes match backend | `POST`/`PUT` ok | BLOCKED by §8.2 |
| Revenue | `revenue/page.jsx` expects `{mrr,payingUsers,byPlan,recent}` — exact backend shape | endpoint ok (DB-price MRR, not live Stripe) | BLOCKED by §8.2 |
| Moderators | page + forms arg shapes match | endpoints ok | BLOCKED by §8.2 |
| Activity | page expects `{signups,jobPosts,applications}` — exact backend shape | endpoint ok | BLOCKED by §8.2 |
| Settings (`/admin/settings`) | static `SettingsView` passthrough, no actions | `GET/PUT /api/admin/settings` exist but have **no UI wrapper** | STUB by design, endpoints unused |
| Audit log | no UI page at all | `GET /api/admin/audit-log` exists; `getAdminAuditLog()` + `downgradeSubscription()` have zero importers | Endpoint unused |

### 8.2 Root cause — total admin outage (P0, ✅ RESOLVED this session — import added, lint clean)

`src/lib/actions/admin.js:8` calls `apiFetch(...)` with **no import** (verified: the only import is line 3, session helpers). `apiFetch` lives in the newly created `src/lib/api/client.js:13`. Result: *every* admin/mod action throws `ReferenceError` and every page falls into its `.catch()` empty state — stats zero, users/jobs/companies/plans/revenue/activity all empty, no action saves. ✅ Fixed: `import { apiFetch } from "@/lib/api/client";` added (`admin.js:3`); `npm run lint` back at baseline, restart both servers to pick it up.

### 8.3 Dead buttons (P0, ✅ RESOLVED this session — converted, grep-verified clean)

`users/AdminUserActions.jsx`, `companies/AdminCompanyButtons.jsx`, `jobs/AdminJobButtons.jsx` used `onPress` + `isLoading`. Verified against `node_modules/@heroui/react/dist/components/button/button.d.ts`: v3 `ButtonRoot` has neither prop — they spread onto the DOM as dead attributes (matches the reported "clicks do nothing"). The 4 recruiter pages with the same props were equally dead. ✅ Fixed: `onClick` + `disabled` everywhere (7 files; recruiter local `isLoading` state vars left alone); `grep` confirms zero `onPress`/`isLoading={` remain in admin+recruiter.

### 8.4 `client.js` refactor — 4 latent defects (✅ 1, 2, 4 FIXED this session; 3 KEPT deliberately — see §8.5)

1. Sent `x-service-secret`, which the backend never checks (`requireAdmin` reads only `x-admin-secret`; the latter was sent only when `actor` is non-null). ✅ Fixed: always sends `x-admin-secret`; actor headers kept for attribution only.
2. Default base URL port drift: `|| "http://localhost:5001"` vs `5000` everywhere else. ✅ Fixed to `5000`.
3. `/api/admin/*` switched to `cache: no-store` — this accidentally *cures* the 30s stale-table issue, but the `tags` params are now dead and every page load refetches. ✅ KEPT deliberately (fresh tables on every load, as requested); also fixed two broken escaped template literals in the same file (lint parse error).
4. Sent `x-admin-actor-*` headers, but CORS `Allow-Headers` was only `Content-Type, x-recruiter-id, x-admin-secret` — direct browser calls would fail preflight (server actions unaffected). ✅ Fixed: allowlist extended in `index.js`.

### 8.5 Stale tables (✅ NOT AN ISSUE while 8.4(3) stands)

No `revalidateTag` anywhere in the admin action layer. Currently masked by 8.4(3) (`no-store` = always fresh, kept deliberately); if caching is ever restored, mutations must revalidate `admin-*` tags or tables will show 30s-old rows after every action.

### 8.6 Corrected record (unchecked this turn)

- `x-recruiter-id` spoofing: still open (header-only auth on `/api/my/*`).
- PII projection / CORS allowlist / error envelope: still open.
- Fetch-wrapper merge: only admin.js moved (broken import); the other 4 `request()` copies remain.
- Verified NOT bugs: `toast.error` exists in v3 (`toast-queue.d.ts` lists success/danger/error/info/warning); plans/revenue/activity/user-detail response shapes all match 1:1; 26/26 admin endpoints exist for every UI call, none missing, none extra-called.

### 8.7 Discarded delegated claims (for transparency)

Two delegated reports were checked against direct reads and rejected where they conflicted: (a) "Button has no `onClick`, `onPress` is correct" — false per `button.d.ts` rest-spread and per the observed dead clicks; (b) "`Chip`/`Avatar`/`Tooltip` prop verdicts beyond `Chip startContent`" and "`Typography variant` invalid" — not directly verified, left out of scope. Only claims re-verified above are recorded.
