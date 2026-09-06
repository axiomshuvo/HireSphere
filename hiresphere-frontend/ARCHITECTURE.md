# 🌐 HireSphere — Complete Website Architecture & Work Plan

> A full-stack job marketplace connecting **Job Seekers** and **Recruiters**, built with Next.js 16, MongoDB, better-auth, and Stripe.
> Now includes a **Super Admin / Owner Panel** for platform management.

---

## 📐 High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   BROWSER (User)                           │
└───────────────────┬────────────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼────────────────────────────────────────┐
│          NEXT.JS FRONTEND (Vercel / Node)                  │
│   - App Router (React Server Components + Client)          │
│   - better-auth (session management)                       │
│   - Stripe Checkout API route                              │
│   - Server Actions (data fetching via fetch)               │
│   - /admin  ← NEW: Super Admin Panel             │
└──────────┬────────────────────────┬───────────────────────-┘
           │ MongoDB (Auth only)    │ REST API calls
           │                       │ (NEXT_PUBLIC_API_URL)
┌──────────▼──────────┐ ┌──────────▼───────────────────────┐
│  MongoDB Database   │ │  Backend REST API Server          │
│  (better-auth only) │ │  (Express/Node — port 5000)       │
│  - users            │ │  - /api/jobs                      │
│  - sessions         │ │  - /api/companies                 │
│  - plans            │ │  - /api/my/jobs                   │
└─────────────────────┘ │  - /api/my/applications           │
                        │  - /api/my/saved-jobs             │
                        │  - /api/my/companies              │
                        │  - /api/plans                     │
                        │  - /api/admin/*  ← NEW            │
                        └──────────────────────────────────-┘
```

> **Key Distinction:** MongoDB is used in TWO ways:
> - **Directly** (via `auth.js`) → only for user accounts and sessions
> - **Via REST API** (via `NEXT_PUBLIC_API_URL`) → for all business data (jobs, companies, applications, plans)

---

## 👥 User Roles

| Role | Description | How Set |
|------|-------------|---------|
| `seeker` | Job seeker — applies to jobs, saves jobs | Chosen at signup |
| `recruiter` | Employer — posts jobs, manages companies | Chosen at signup |
| `mod` | Moderator — reviews users/companies/jobs, handles requests | Promoted via `set-admin.js <email> mod` (never from UI) |
| `admin` | Super Admin / Owner — full platform control | Set manually via DB script (never from UI) |

---

## 🛡️ Super Admin / Owner Panel

### What the Admin Can Do

| Category | Capabilities |
|----------|-------------|
| **Plans** | View, create, edit, delete plan tiers (name, price, limits, features, UI badges) |
| **Pricing** | Change `pricing.amount`, `pricing.cadence`, `pricing.stripePriceId` per plan |
| **Limits** | Edit `limits.activeJobPosts`, `limits.applicationsPerMonth`, `limits.savedJobs` |
| **Users** | Search users by email/name, view role & plan, manually override plan |
| **Recruiter Accounts** | Activate / deactivate recruiter accounts, view their active jobs |
| **Company Approval** | Newly created companies are `pending` and cannot post jobs until approved. |
| **Revenue Stats** | Monthly MRR, total paying users, plan breakdown, recent payments (via Stripe API) |
| **Sub Requests** | Approve or reject user requests to downgrade or cancel plans. |
| **Job Listings** | View all jobs on the platform, force-close / delete abusive listings |
| **Platform Stats** | Total users, total jobs, total applications, active companies |

### Admin Dashboard Pages (`/admin/*`)

```
/admin                    → Overview stats (MRR, users, jobs, applications)
/admin/plans              → Plan management table (CRUD)
/admin/plans/[id]/edit    → Edit individual plan (limits, pricing, features)
/admin/users              → User table with search + role/plan override
/admin/users/[id]         → User detail — history, override plan, deactivate
/admin/requests           → Sub downgrade/cancel requests queue
/admin/jobs               → All jobs on platform with status controls
/admin/revenue            → Revenue dashboard (Stripe MRR, plan distribution)
```

### How Admin Login Is Secured — 5 Layers

#### Layer 1 — Role flag in DB (set once manually)
The owner account gets `role: "admin"` set directly in MongoDB via a one-time script. This is never exposed to the signup UI.

```js
// set-admin.js — run ONCE in your local terminal
// NOTE: the auth collection is `user` (singular), not `users`.
db.collection("user").updateOne(
  { email: "owner@hiresphere.com" },
  { $set: { role: "admin" } }
)
```

#### Layer 2 — Server-side layout guard
`src/app/admin/(protected)/layout.js` is a **Server Component** — it runs only on the server and checks the session on every request before rendering any admin page. `/admin/login` lives **outside** this guard (in `src/app/admin/login/`) under a passthrough `src/app/admin/layout.js`, otherwise login would redirect to itself:

```js
// src/app/admin/(protected)/layout.js
export default async function ProtectedAdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "admin" && session.user.role !== "mod") redirect("/dashboard"); // block everyone else
  return <>{children}</>;
}
```

> Open gap: backend `audit_log` entries currently carry no per-admin actor identity (shared secret only) — forward the admin user id from Server Actions so actions are attributable.

#### Layer 3 — Backend API secret header
All `/api/admin/*` routes on the Express backend require a secret header that must match the env variable:

```js
// hiresphere-server/routes.js
function requireAdmin(req, res, next) {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
app.get("/api/admin/stats", requireAdmin, statsHandler);
app.put("/api/admin/plans/:id", requireAdmin, updatePlanHandler);
// etc.
```

#### Layer 4 — Server Actions inject secret automatically
Frontend Server Actions for admin calls inject the secret from server-side env — it never touches the browser:

```js
// src/lib/actions/admin.js
"use server";
const adminHeaders = {
  "Content-Type": "application/json",
  "x-admin-secret": process.env.ADMIN_SECRET_KEY, // never in client bundle
};
```

#### Layer 5 — Env isolation (no NEXT_PUBLIC_ prefix)
`ADMIN_SECRET_KEY` is **never** prefixed with `NEXT_PUBLIC_`. It lives only in Node.js server processes and is completely absent from the browser JavaScript bundle.

### Security Summary Table

| Layer | Protection |
|-------|-----------|
| UI access | `role === "admin"` checked in Server Component layout |
| Page rendering | Non-admin redirected to `/dashboard` before any admin HTML renders |
| Backend API | `x-admin-secret` header validated on every `/api/admin/*` endpoint |
| Secret transmission | Secret sent only from Server Actions (Node.js), never from the browser |
| Env isolation | `ADMIN_SECRET_KEY` has no `NEXT_PUBLIC_` prefix — not in client bundle |
| Session cookie | better-auth httpOnly cookie — cannot be read by JavaScript |
| Brute force | better-auth rate-limits login attempts automatically |

---

## 🚀 Admin Implementation Plan (Phased)

> Status as of this edit: Phase 1–2 built; Phase 3–5 endpoints + UI built, enforcement gaps listed under Edge Cases. Boxes stay unchecked until verified against a live DB.

### Phase 1 — Foundation (Core Auth & Admin Shell)
- [x] Create isolated `/admin/login` page (outside guard — see Layer 2)
- [x] Create `(protected)` layout with Mod/Admin role guards
- [x] Create Admin Sidebar & Topbar UI
- [x] Add `ADMIN_SECRET_KEY` and backend `requireAdmin` middleware
- [x] Write `set-admin.js` script for initial owner promotion
- [ ] Rotate `ADMIN_SECRET_KEY` + all `.env` secrets (still on disk — unverified)

### Phase 2 — User Management & Moderation
- [x] Create `/admin/users` list and detail pages
- [x] Implement Activate/Deactivate users
- [x] **Backend Logic:** Add Cascading Deactivation (deactivating a user auto-closes jobs/companies)
- [x] Add Mod capabilities (View individual payment history, flag users)
- [x] Add `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`

### Phase 3 — Subscriptions & Billing Flow
- [x] Implement Automated Stripe Downgrade (`proration_behavior: 'none'`) to replace the Mod Queue
- [x] **Backend Logic:** Implement Plan Reconciliation Script on webhook downgrade (auto-pause excess jobs)
- [x] **Backend Logic:** Billing-cycle Quota Math helper (`billingPeriodStart`) + `currentPeriodEnd` tracking
- [x] **Backend Logic:** Add Subscription History Ledger (push events to `subscriptions.history` array)
- [ ] Enforce quotas at create/activate time (currently reconcile-only)

### Phase 4 — Company & Job Moderation
- [x] Create `/admin/companies` & `/admin/jobs` moderation pages
- [x] Implement Company Approval Flow (`pending` status upon creation, jobs hidden until approved)
- [x] **Backend Logic:** Apply-Button Race Condition fix (verify active status at exact moment of apply)
- [x] **Backend Logic:** Orphaned Image ImgBB helpers (`uploadOne`, `toStoredImage`, `deleteImage`)
- [ ] Unique `(userId, jobId)` index + backend image-delete endpoint (still open)

### Phase 5 — Owner Features (Admin Only)
- [x] Create Plan Management CRUD (`/admin/plans`)
- [x] Create Revenue Dashboard (`/admin/revenue`, DB-price MRR + payments list)
- [x] Create Moderator Management (invite/remove mods via `/admin/moderators`)

---

## 📊 Admin Overview Page Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  HireSphere Admin                     [Admin Badge] [Logout] │
├──────────────┬───────────────┬──────────────┬────────────────┤
│  Total Users │ Active Jobs   │ Applications │  MRR           │
│  2,847       │ 413           │ 15,291       │  $4,820/mo     │
├──────────────┴───────────────┴──────────────┴────────────────┤
│  Plan Distribution                                           │
│  [Recruiter Free ██████ 68%] [Pro ████ 24%] [Enterprise █ 8%]│
├──────────────────────────────────────────────────────────────┤
│  Recent Payments                      [View All Revenue →]   │
│  John Doe → Pro Plan → $49  •  2 hrs ago                     │
│  Acme Corp → Enterprise → $199  •  5 hrs ago                 │
├──────────────────────────────────────────────────────────────┤
│  Quick Actions                                               │
│  [Manage Plans]  [View Users]  [Moderate Jobs]               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔑 Environment Variables

```env
# Backend REST API (your Express/Node server)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Frontend URL (used by better-auth)
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net
MONGODB_DB_NAME=hiresphere

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# ImgBB image upload
NEXT_PUBLIC_IMGBB_KEY=...

# Super Admin (server-side only — NO NEXT_PUBLIC_ prefix!)
ADMIN_SECRET_KEY=replace-this-with-a-long-random-string-minimum-32-chars
```

---

## 🗺️ Complete Route Map

### Public Routes (`/(public)`)
| Route | Description |
|-------|-------------|
| `/` | Homepage (hero, stats, job board, features) |
| `/jobs` | Filterable public job board |
| `/jobs/[id]` | Individual job detail + apply |
| `/company` | Company directory |
| `/company/[id]` | Company profile + their jobs |
| `/pricing` | Tabbed plan pricing (Recruiter / Seeker tabs) |
| `/help` | Help / contact page |

### Auth Routes (`/(auth)`)
| Route | Description |
|-------|-------------|
| `/auth/signin` | Email + password login |
| `/auth/signup` | Register (choose role: seeker/recruiter) |

### Shared Dashboard (`/dashboard`)
| Route | Roles |
|-------|-------|
| `/dashboard` | Role redirect (recruiter → `/recruiter`, seeker → `/seeker`, admin/mod → `/admin`) |

### Seeker Dashboard (`/seeker/*`)
| Route | Description |
|-------|-------------|
| `/seeker` | Seeker home |
| `/seeker/applications` | My job applications list |
| `/seeker/saved-jobs` | My saved/bookmarked jobs |
| `/seeker/profile` | View & edit own profile |
| `/seeker/settings` | Account settings |

### Recruiter Dashboard (`/recruiter/*`)
| Route | Description |
|-------|-------------|
| `/recruiter` | Recruiter home |
| `/recruiter/companies` | My companies list (+ new / `[id]`) |
| `/recruiter/jobs` | My posted jobs table (+ new / `[id]` / `[id]/edit`) |
| `/recruiter/applicants` | All applicants (+ `[id]`) |
| `/recruiter/profile` | View & edit own profile |
| `/recruiter/settings` | Account settings |

### Admin Dashboard (`/admin`)
| Route | Description |
|-------|-------------|
| `/admin/login` | Isolated login (public, outside the guard) |
| `/admin` | Platform stats + quick actions |
| `/admin/plans` | Plan management table (CRUD) |
| `/admin/plans/[id]/edit` | Edit plan limits, pricing, features |
| `/admin/users` | All users — search, filter, override plan |
| `/admin/users/[id]` | User detail + override plan + deactivate |
| `/admin/requests` | Sub downgrade/cancel requests queue |
| `/admin/companies` | All companies — approve / status |
| `/admin/jobs` | All platform jobs — moderate / delete |
| `/admin/revenue` | Stripe MRR + plan distribution + payments |
| `/admin/moderators` | Invite / remove moderators (admin only) |
| `/admin/activity` | Recent signups, jobs, applications |

---

## 📦 Plans & Limits System

### MongoDB `plans` Collection Schema

```json
{
  "_id": "ObjectId",
  "slug": "seeker_pro",
  "planId": "pro",
  "role": "seeker",
  "name": "Pro",
  "tagline": "Apply more and track every opportunity.",
  "tierOrder": 1,
  "pricing": {
    "amount": 19,
    "amountInCents": 1900,
    "currency": "USD",
    "cadence": "per month",
    "stripePriceId": null
  },
  "limits": {
    "applicationsPerMonth": 30,
    "savedJobs": -1,
    "activeJobPosts": 0
  },
  "features": [
    { "text": "Apply to up to 30 jobs per month", "included": true },
    { "text": "Unlimited saved jobs", "included": true }
  ],
  "ui": { "icon": "rocket", "highlight": true, "badgeText": "Most popular" },
  "isActive": true
}
```

### Current Plan Configuration

| planId | role | activeJobPosts | applicationsPerMonth | savedJobs |
|--------|------|---------------|---------------------|-----------|
| `free` | seeker | 0 | 5 | 10 |
| `pro` | seeker | 0 | 30 | unlimited |
| `premium` | seeker | 0 | unlimited | unlimited |
| `free` | recruiter | 3 | — | — |
| `pro` | recruiter | 20 | — | — |
| `enterprise` | recruiter | unlimited | — | — |

> `-1` in the limits object means **unlimited**.

---

## 💰 Stripe Payment Flow

```
1. User clicks "Upgrade" on /pricing or PlanUpgradeModal
   └─ POST /api/checkout_sessions { plan: "pro" }

2. /api/checkout_sessions/route.js
   └─ Fetches plan from DB → gets pricing.stripePriceId or pricing.amount
   └─ Creates Stripe Checkout Session
   └─ Returns { url: "https://checkout.stripe.com/..." }

3. User completes payment on Stripe hosted page

4. Stripe redirects to /pricing/success?session_id=...&plan=pro

5. /pricing/success → calls updateProfilePlan("pro")
   └─ Validates plan against DB
   └─ auth.api.updateUser({ plan: "pro" })
   └─ Revalidates dashboard caches
```

---

## 🧾 Subscription Ledger System

To maintain a perfect timeline of a user's billing history without creating scattered records, the `subscriptions` collection acts as an append-only ledger for each user.

### Key Workflows
- **Upgrades (Instant):** Processed instantly via Stripe checkout. A webhook updates the document and pushes an `upgraded` event to the history array.
- **Downgrades & Cancellations (Automated via Stripe):** Users manage their plan via billing. If they downgrade (e.g. Enterprise to Free), Stripe is told to apply it at the end of the current billing cycle (`proration_behavior: 'none'`). This completely bypasses the need for manual Mod approval, while keeping quotas mathematically safe.

### Schema Structure
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "stripeSubscriptionId": "string",
  
  // Current Active State
  "planId": "enterprise",
  "status": "active",
  
  // Master Timestamps
  "createdAt": "2026-09-05T...",
  "currentPeriodEnd": "2026-10-05T...", 
  "canceledAt": null,
  
  // The Timeline Ledger (populated via backend webhooks/actions)
  "history": [
    {
      "type": "created", // created, upgraded, downgraded, canceled, expired
      "planId": "pro",
      "timestamp": "2026-09-05T00:00:00Z",
      "expireTime": "2026-10-05T00:00:00Z"
    }
  ]
}
```

---

## 🔗 Backend API Endpoints

### Public
| Method | Endpoint |
|--------|----------|
| GET | `/api/jobs` |
| GET | `/api/jobs/:id` |
| GET | `/api/companies` |
| GET | `/api/companies/:id` |
| GET | `/api/plans?role=seeker` |

### Protected (x-recruiter-id / x-user-id header)
| Method | Endpoint | Role |
|--------|----------|------|
| GET/POST | `/api/my/jobs` | Recruiter |
| GET/PUT/DELETE | `/api/my/jobs/:id` | Recruiter |
| PATCH | `/api/my/jobs/:id/status` | Recruiter |
| GET/POST/DELETE | `/api/my/companies` | Recruiter |
| GET | `/api/my/applicants` | Recruiter |
| GET/POST/DELETE | `/api/my/applications` | Seeker |
| GET/POST/DELETE | `/api/my/saved-jobs` | Seeker |

### Admin (x-admin-secret header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform overview numbers |
| GET | `/api/admin/users` | All users (paginated + search) |
| GET | `/api/admin/users/:id` | Single user + activity + subscription |
| PATCH | `/api/admin/users/:id/status` | Activate / deactivate (+ cascade) |
| POST | `/api/admin/users/:id/flag` | Flag / unflag user |
| POST | `/api/admin/users/:id/notes` | Internal mod note |
| PUT | `/api/admin/users/:id/plan` | Owner plan override (+ reconcile) |
| GET | `/api/admin/requests` | View downgrade/cancel requests |
| POST | `/api/admin/requests/:id/approve` | Approve downgrade/cancel request |
| POST | `/api/admin/requests/:id/reject` | Reject request |
| POST | `/api/admin/subscriptions/downgrade` | Automated downgrade (`proration_behavior: 'none'` + reconcile) |
| POST | `/api/my/subscriptions/request` | User submits downgrade/cancel request |
| GET | `/api/admin/companies` | All companies (paginated + search) |
| POST | `/api/admin/companies/:id/approve` | Approve a pending company |
| PATCH | `/api/admin/companies/:id/status` | Activate / pending / deactivate |
| GET/POST | `/api/admin/plans` | All plans + create new |
| PUT/DELETE | `/api/admin/plans/:id` | Edit / deactivate plan |
| GET | `/api/admin/jobs` | All platform jobs |
| PATCH/DELETE | `/api/admin/jobs/:id` | Moderate / delete job (+ `/status`) |
| GET | `/api/admin/revenue` | MRR (DB prices) + payments |
| GET/POST/DELETE | `/api/admin/moderators` | List / invite / remove (+ `/invite`) |
| GET | `/api/admin/activity` | Recent signups, jobs, applications |
| GET | `/api/admin/audit-log` | Audit trail (admin only) |
| GET/PUT | `/api/admin/settings` | Platform settings (admin only) |

---

## 🛡️ Edge Case & Integrity Rules

To prevent data corruption and ensure a fair platform, the backend enforces these automated rules:

1. **Cascading Deactivation:** Deactivating a Recruiter automatically forces all their companies to `deactivated` and jobs to `closed`. One-way (reactivation does not restore prior states) and non-transactional; Stripe subscriptions keep billing unless cancelled separately.
2. **Plan Downgrade Reconciliation:** If an Enterprise user downgrades to Free, the backend keeps the oldest N `active` jobs and sets the excess to `paused`. Gap: create/reactivate endpoints do not re-check plan caps, so limits are advisory until enforced there.
3. **Billing-Cycle Math:** Quotas (like 30 applications/month) are calculated dynamically using the Stripe `currentPeriodEnd` timestamp, not calendar months. Gap: no appliedAt-window enforcement query exists yet.
4. **ImgBB Orphaned File Cleanup:** Images stored in MongoDB use `{ url, deleteUrl }` (`toStoredImage()`). Replacing an image should call `deleteImage(oldDeleteUrl)`. Gap: frontend-only, fire-and-forget — no backend delete endpoint or orphan GC.
5. **Race Condition Prevention:** Job application endpoints re-check job and company `status === 'active'` at submission time. Gap: check-then-insert without a unique `(userId, jobId)` index still allows duplicates under fast retry.


## 🗂️ MongoDB Collections

| Collection | Managed By | Contents |
|------------|-----------|----------|
| `user` | better-auth | User accounts (id, name, email, role, plan, status) — singular, not `users` |
| `sessions` | better-auth | Active login sessions |
| `accounts` | better-auth | OAuth accounts (if added later) |
| `plans` | Admin Panel / seed scripts | Plan definitions with limits, pricing, features |
| `jobs` | Backend API | All job postings (`active`/`paused`/`closed`/`draft`) |
| `companies` | Backend API | All company profiles (`pending`/`active`/`deactivated`) |
| `applications` | Backend API | All job applications |
| `savedJobs` | Backend API | Seeker bookmarks — camelCase, not `saved-jobs` |
| `subscriptions` | Backend API | Stripe subs + `history[]` ledger + `pendingRequest` queue |
| `audit_log` | Backend API | Admin/mod action trail |
| `platform_settings` | Owner settings page | Feature flags, announcements |

---

## ⚡ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Components | HeroUI v3 + Tailwind CSS |
| Icons | `@gravity-ui/icons` |
| Auth | better-auth (email + password) |
| Database | MongoDB (Atlas) |
| Payments | Stripe (Subscriptions) |
| Image Hosting | ImgBB |
| Deployment | Vercel (frontend) + separate backend host |
