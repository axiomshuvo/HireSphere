# HireSphere Codebase Audit Report

---

## 🛡️ Admin & Moderator System Design

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👑 OWNER (admin)                                          │
│  ├── Full platform control                                  │
│  ├── Revenue & financial data                               │
│  ├── Plan CRUD (create, edit, delete, pricing)              │
│  ├── Manage moderators (invite, remove, view audit log)     │
│  ├── System settings (Stripe keys, feature flags)           │
│  └── Everything a Mod can do                                │
│                                                             │
│  🔧 MODERATOR (mod)                                        │
│  ├── View all signups (recruiters + seekers)                │
│  ├── View user details (plan, activity, profile)            │
│  ├── Activate / deactivate recruiter accounts               │
│  ├── Activate / deactivate companies & job listings         │
│  ├── View recruiter stats (jobs posted, applicants)         │
│  ├── View seeker stats (applications, saved jobs)           │
│  ├── Flag / unflag users                                    │
│  ├── View payments history & approve downgrade/cancels      │
│  ├── Approve pending companies (allow them to post jobs)    │
│  └── Cannot: change plan configurations, revenue, settings  │
│                                                             │
│  👤 RECRUITER                                               │
│  └── Post jobs, manage companies, view applicants           │
│                                                             │
│  👤 SEEKER                                                  │
│  └── Apply to jobs, save jobs, track applications           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### User Roles in MongoDB `users` Collection

| role        | Description                 | How Created                      |
| ----------- | --------------------------- | -------------------------------- |
| `seeker`    | Default. Job seeker.        | Signup form                      |
| `recruiter` | Employer. Posts jobs.       | Signup form                      |
| `mod`       | Moderator. Read + moderate. | Invited by Owner via admin panel |
| `admin`     | Owner. Full control.        | Set once manually via DB script  |

### Dedicated Login URLs

| Role          | Login URL      | Why Separate?                                             |
| ------------- | -------------- | --------------------------------------------------------- |
| Regular users | `/auth/signin` | Standard seeker/recruiter login                           |
| Admin / Mod   | `/admin/login` | Isolated route, no link from public site, separate layout |

**Why separate login pages?**

- Security through obscurity (bots/attackers scanning `/auth/signin` won't find `/admin/login`)
- Different UI: admin login shows a minimal branded form with no navbar/footer
- Can add 2FA / IP allowlisting / extra auth challenges exclusively for admin login
- Rate limiting can be much stricter on `/admin/login`

---

### Admin Login Security — 6 Layers

| Layer                       | Protection                                      | Details                                     |
| --------------------------- | ----------------------------------------------- | ------------------------------------------- |
| 1. Separate URL             | `/admin/login` — no public link                 | Not discoverable from main site navigation  |
| 2. Role flag                | `role: "admin"` or `role: "mod"` in DB          | Set via script (admin) or invitation (mod)  |
| 3. Server-side layout guard | `AdminLayout` checks `role` before rendering    | Non-admin/mod → redirect to `/` immediately |
| 4. Backend API secret       | `x-admin-secret` header on all `/api/admin/*`   | Even if someone bypasses UI, API rejects    |
| 5. Env isolation            | `ADMIN_SECRET_KEY` has no `NEXT_PUBLIC_` prefix | Never in browser bundle                     |
| 6. Session cookie           | `httpOnly` better-auth cookie                   | Cannot be read by client JS                 |

---

#### 📝 Subscription History & Requests (New Workflow)

- **User Profile/Settings:** Users can view their full subscription history (dates of upgrade, downgrade, expiration).
- **Upgrades (Instant):** Users upgrading their plan pay via Stripe; upon success, their plan is upgraded instantly automatically.
- **Downgrade/Cancel Requests (Manual):** Instead of immediate downgrades via Stripe (which can break active job/application limits instantly), users submit a "Downgrade Request" or "Cancel Request".
- **Admin/Mod Approval:** Both Mods and Admins have a "Subscription Requests" queue in the dashboard where they can review, approve, or reject these requests. Upon approval, the backend handles the Stripe cancellation/downgrade logic.

### Route Map — Admin Panel

#### Admin/Mod Shared Routes (`/admin/*`)

| Route                   | Access                   | Description                                            |
| ----------------------- | ------------------------ | ------------------------------------------------------ |
| `/admin/login`          | Public (unauthenticated) | Separate admin/mod login page                          |
| `/admin`                | admin, mod               | Dashboard overview with stats                          |
| `/admin/users`          | admin, mod               | All users table (seekers + recruiters)                 |
| `/admin/users/[id]`     | admin, mod               | Individual user detail + activity                      |
| `/admin/subcriptions`   | admin, mod               | Queue for subscription downgrade/cancellation requests |
| `/admin/seekers`        | admin, mod               | Seekers-only filtered view                             |
| `/admin/recruiters`     | admin, mod               | Recruiters-only filtered view                          |
| `/admin/companies`      | admin, mod               | All companies with status controls                     |
| `/admin/companies/[id]` | admin, mod               | Company detail + jobs list                             |
| `/admin/jobs`           | admin, mod               | All platform jobs with moderation                      |
| `/admin/jobs/[id]`      | admin, mod               | Individual job detail + controls                       |
| `/admin/activity`       | admin, mod               | Real-time activity feed                                |

#### Owner-Only Routes

| Route                    | Access     | Description                                  |
| ------------------------ | ---------- | -------------------------------------------- |
| `/admin/plans`           | admin only | Plan CRUD (create, edit, delete)             |
| `/admin/plans/[id]/edit` | admin only | Edit plan limits, pricing, features          |
| `/admin/revenue`         | admin only | Stripe MRR, revenue charts, payments         |
| `/admin/moderators`      | admin only | Invite/remove moderators, view their actions |
| `/admin/settings`        | admin only | Platform settings, feature flags             |
| `/admin/audit-log`       | admin only | Full audit trail of all admin/mod actions    |

---

### Moderator Capabilities — Detail

#### 👥 User Management (Read + Moderate)

```
┌──────────────────────────────────────────────────────────────┐
│  Users Overview                               [Search] [🔍] │
├──────────┬──────────┬──────────┬─────────┬──────────────────┤
│  Name    │  Email   │  Role    │  Plan   │  Status          │
├──────────┼──────────┼──────────┼─────────┼──────────────────┤
│  John D. │ j@x.com  │ Seeker   │ Pro     │ ● Active         │
│  Jane R. │ jr@y.com │ Recruiter│ Free    │ ● Active         │
│  Bob K.  │ bk@z.com │ Recruiter│ Enterprise │ ⊘ Deactivated │
├──────────┴──────────┴──────────┴─────────┴──────────────────┤
│  Filters: [All] [Seekers] [Recruiters] [Active] [Inactive]  │
│  Sort by: [Joined ↓] [Name] [Plan] [Activity]               │
└──────────────────────────────────────────────────────────────┘
```

**What mods can see per user:**

- Profile info (name, email, avatar, joined date)
- Current plan and plan history
- For Seekers: applications count, saved jobs count, last active date
- For Recruiters: companies owned, active/total jobs, applicants received
- Account status (active / deactivated / flagged)

**What mods can do:**

- ✅ Activate / deactivate any recruiter or seeker account
- ✅ Flag a user (adds a warning badge, admin gets notified)
- ✅ Add internal notes (visible only to admin/mod)
- ✅ View individual user payment/subscription history
- ✅ Approve/Reject user requests for plan downgrade or cancellation
- ❌ Cannot change plan definitions, delete accounts, or view global revenue

#### 🏢 Company Moderation

**What mods can see:**

- All registered companies with logo, name, field, location
- Active job count per company
- Company owner (recruiter name + email)
- Company creation date

**What mods can do:**

- ✅ Approve pending companies (newly created companies default to `pending` status and cannot post jobs until approved)
- ✅ Activate / deactivate a company (deactivating hides all its jobs from public)
- ✅ Flag a company for review
- ✅ View company detail page (same as public but with mod controls)
- ❌ Cannot delete a company or edit its content

#### 💼 Job Moderation

**What mods can see:**

- All jobs on the platform with title, company, status, posted date
- Applicant count per job
- Job poster (recruiter name + email)

**What mods can do:**

- ✅ Force-close a job (sets status to `closed`, removes from public board)
- ✅ Flag a job for admin review
- ✅ Add internal mod note to a job
- ❌ Cannot delete a job (only admin) or edit job content

---

### Owner Capabilities — Detail

Everything a Mod can do, PLUS:

#### 💰 Revenue Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Revenue Overview                    Sep 2026                │
├──────────────┬───────────────┬───────────────────────────────┤
│  MRR         │  This Month   │  Plan Distribution            │
│  $4,820      │  $5,120       │  ████████░░ Free (68%)        │
│  ↑ 12%       │  23 payments  │  ████░░░░░░ Pro  (24%)        │
│              │               │  █░░░░░░░░░ Ent  (8%)         │
├──────────────┴───────────────┴───────────────────────────────┤
│  Revenue Chart (6-month trend)                               │
│  $6k ┤                                          ╭───        │
│  $4k ┤                              ╭────────────╯           │
│  $2k ┤               ╭──────────────╯                        │
│   $0 ┤───────────────╯                                       │
│      Apr    May    Jun    Jul    Aug    Sep                   │
├──────────────────────────────────────────────────────────────┤
│  Recent Payments                                             │
│  ✓ John Doe → Pro ($49) • 2h ago                             │
│  ✓ Acme Corp → Enterprise ($199) • 5h ago                    │
│  ✓ Sarah K. → Pro Seeker ($19) • 1d ago                      │
│                                          [View All →]        │
└──────────────────────────────────────────────────────────────┘
```

#### 📋 Plan Management (CRUD)

- Create new plans with custom limits, pricing, features
- Edit existing plan pricing (amount, currency, cadence, stripePriceId)
- Edit limits (activeJobPosts, applicationsPerMonth, savedJobs)
- Toggle `isActive` to show/hide plans on pricing page
- Delete plans (soft-delete, moves users to free plan first)
- Preview how plan card looks before publishing

#### 👮 Moderator Management

- Invite new moderators by email (generates a one-time link)
- View list of all moderators with their last login
- Remove moderator access (reverts to seeker role)
- View mod action audit log (who did what, when)

#### ⚙️ Platform Settings

- Feature flags (enable/disable registration, maintenance mode)
- Default plan for new signups
- Stripe configuration status (connected / not connected)
- Platform-wide announcements (banner on all pages)

---

### Backend API Endpoints — Admin System

#### Shared (admin + mod)

| Method | Endpoint                           | Description                                                       |
| ------ | ---------------------------------- | ----------------------------------------------------------------- |
| POST   | `/api/admin/auth/login`            | Admin/mod login (validates role)                                  |
| GET    | `/api/admin/stats`                 | Platform overview (users, jobs, applications, companies)          |
| GET    | `/api/admin/users`                 | All users (paginated, searchable, filterable by role/plan/status) |
| GET    | `/api/admin/users/:id`             | User detail + activity summary                                    |
| PATCH  | `/api/admin/users/:id/status`      | Activate / deactivate user                                        |
| POST   | `/api/admin/users/:id/flag`        | Flag / unflag user                                                |
| POST   | `/api/admin/users/:id/notes`       | Add internal mod note                                             |
| GET    | `/api/admin/requests`              | Fetch downgrade/cancel requests                                   |
| POST   | `/api/admin/requests/:id/approve`  | Approve downgrade/cancel                                          |
| GET    | `/api/admin/companies`             | All companies (paginated, searchable)                             |
| GET    | `/api/admin/companies/:id`         | Company detail + jobs + owner info                                |
| POST   | `/api/admin/companies/:id/approve` | Approve a pending company                                         |
| PATCH  | `/api/admin/companies/:id/status`  | Activate / deactivate company                                     |
| GET    | `/api/admin/jobs`                  | All platform jobs (paginated, filterable)                         |
| GET    | `/api/admin/jobs/:id`              | Job detail + applicant count + poster info                        |
| PATCH  | `/api/admin/jobs/:id/status`       | Force-close job                                                   |
| POST   | `/api/admin/jobs/:id/flag`         | Flag job for review                                               |
| GET    | `/api/admin/activity`              | Real-time activity feed (signups, applications, job posts)        |

#### Owner Only

| Method | Endpoint                       | Description                               |
| ------ | ------------------------------ | ----------------------------------------- |
| GET    | `/api/admin/plans`             | All plans                                 |
| POST   | `/api/admin/plans`             | Create plan                               |
| PUT    | `/api/admin/plans/:id`         | Edit plan (limits, pricing, features, UI) |
| DELETE | `/api/admin/plans/:id`         | Delete plan (soft)                        |
| PUT    | `/api/admin/users/:id/plan`    | Override any user's plan                  |
| GET    | `/api/admin/revenue`           | Revenue data from Stripe                  |
| GET    | `/api/admin/revenue/chart`     | Monthly revenue trend (6 months)          |
| GET    | `/api/admin/moderators`        | List all moderators                       |
| POST   | `/api/admin/moderators/invite` | Invite moderator by email                 |
| DELETE | `/api/admin/moderators/:id`    | Remove moderator access                   |
| GET    | `/api/admin/audit-log`         | Full audit trail                          |
| GET    | `/api/admin/settings`          | Platform settings                         |
| PUT    | `/api/admin/settings`          | Update platform settings                  |

---

### MongoDB — Schema Modifications

#### New Fields on `companies` Collection

```json
{
  "status": "pending" // defaults to pending on creation. Can be "active", "pending", "deactivated"
}
```


#### Modifications to Existing `subscriptions` Collection
Instead of creating new collections, we will extend the existing `subscriptions` collection (which currently tracks Stripe webhooks).

```json
{
  // ... existing fields (stripeSubscriptionId, status, currentPeriodEnd)
  "pendingRequest": {
    "type": "cancel", // or "downgrade"
    "targetPlan": "free",
    "requestedAt": "2026-09-06T...",
    "status": "pending" // pending, approved, rejected
  },
  "history": [
    {
      "action": "upgrade",
      "planId": "pro",
      "timestamp": "2026-09-06T..."
    }
  ]
}
```
- **Downgrade/Cancel Requests:** Saves directly to the user's active subscription doc under `pendingRequest`. The Mod queue just queries `subscriptions.find({ "pendingRequest.status": "pending" })`.
- **History:** Automatically appended to the `history` array by Stripe Webhooks or Mod approval actions.


#### New Fields on `users` Collection

#### New Fields on `users` Collection

```json
{
  "role": "mod",
  "status": "active",
  "flagged": false,
  "flagReason": null,
  "flaggedBy": "admin-user-id",
  "flaggedAt": "2026-09-06T...",
  "internalNotes": [
    {
      "text": "Suspicious activity pattern",
      "author": "mod-user-id",
      "authorName": "Moderator Jane",
      "createdAt": "2026-09-06T..."
    }
  ],
  "lastActiveAt": "2026-09-06T...",
  "deactivatedAt": null,
  "deactivatedBy": null
}
```

#### New Collections

| Collection              | Purpose                                                           | Managed By                |
| ----------------------- | ----------------------------------------------------------------- | ------------------------- |
| `audit_log`             | Every admin/mod action with timestamp, actor, target, action type | Auto-logged by backend    |
| `subscriptions` (existing) | Modified to include `pendingRequest` object and `history` array for user upgrades/downgrades | Backend API |
| `platform_settings`     | Feature flags, default plan, maintenance mode, announcements      | Owner via settings page   |
| `mod_invitations`       | Pending moderator invitations (email, token, expiry)              | Owner via moderators page |

#### `audit_log` Schema

```json
{
  "_id": "ObjectId",
  "actor": {
    "userId": "admin-or-mod-id",
    "name": "Admin Name",
    "role": "admin"
  },
  "action": "user.deactivate",
  "target": {
    "type": "user",
    "id": "target-user-id",
    "name": "Target User Name"
  },
  "details": {
    "previousStatus": "active",
    "newStatus": "deactivated",
    "reason": "Spam account"
  },
  "ip": "192.168.1.1",
  "timestamp": "2026-09-06T05:30:00.000Z"
}
```

#### Action Types for Audit Log

| Action               | Description                        |
| -------------------- | ---------------------------------- |
| `user.activate`      | Activated a user account           |
| `user.deactivate`    | Deactivated a user account         |
| `user.flag`          | Flagged a user                     |
| `user.unflag`        | Removed flag from user             |
| `user.plan_override` | Owner changed a user's plan        |
| `user.note_added`    | Mod/admin added internal note      |
| `company.activate`   | Activated a company                |
| `company.deactivate` | Deactivated (hidden) a company     |
| `company.flag`       | Flagged company for review         |
| `job.close`          | Force-closed a job listing         |
| `job.delete`         | Deleted a job listing (admin only) |
| `job.flag`           | Flagged a job for review           |
| `plan.create`        | Created a new plan                 |
| `plan.update`        | Edited plan pricing/limits         |
| `plan.delete`        | Deleted a plan                     |
| `mod.invite`         | Owner invited a new moderator      |
| `mod.remove`         | Owner removed moderator access     |
| `settings.update`    | Owner changed platform settings    |
| `admin.login`        | Admin/mod logged in                |

---

### Proposed Features (🧠 Imagination)

#### 1. 📊 Activity Feed (Real-time)

A live feed on the admin dashboard showing:

- "Sarah K. signed up as Seeker — 2 min ago"
- "Acme Corp posted 'Senior Engineer' — 15 min ago"
- "John D. applied to 'ML Engineer at Google' — 1 hr ago"
- "Recruiter Bob upgraded to Pro — 3 hrs ago"

Implemented via polling `/api/admin/activity?since=<timestamp>` every 30s.

#### 2. 🚨 Flagged Items Dashboard

A dedicated "Needs Attention" section at the top of the admin dashboard:

- Flagged users count (click to see list)
- Flagged companies count
- Flagged jobs count
- Each with a quick "Review" action

#### 3. 📈 User Growth Chart

Show a line chart of signups over time (weekly/monthly), split by role:

- Seekers (blue line)
- Recruiters (green line)
- Total (gray line)
  Useful for the owner to see platform traction.

#### 4. 🔔 Mod Notification System

When a mod flags something, the owner gets a notification badge.
When the owner takes action on a flagged item, the mod who flagged it gets notified.
Simple in-app notification via a `notifications` collection.

#### 5. 📊 Recruiter Health Score

For each recruiter, compute a "health score" based on:

- Active vs closed jobs ratio
- Average applicants per job
- Response rate to applicants
- Account age
  Display as a colored badge (Green = healthy, Yellow = needs attention, Red = at risk).

#### 6. 🔍 Smart Search Across Everything

A global search bar in the admin panel that searches across:

- Users (by name, email)
- Companies (by name, field)
- Jobs (by title, company)
  Returns grouped results with quick-jump links.

#### 7. 📋 Export to CSV

Allow admin/mod to export:

- User list (with filters applied)
- Job listings
- Revenue data (owner only)
  as downloadable CSV files for reporting.

#### 8. 🕐 User Timeline View

On the user detail page, show a chronological timeline:

```
Sep 5  — Signed up as Seeker (free plan)
Sep 5  — Applied to "ML Engineer at Nexus"
Sep 5  — Saved 3 jobs
Sep 6  — Upgraded to Pro plan ($19)
Sep 6  — Applied to "Frontend Dev at Acme"
```

Built from aggregating applications, saved-jobs, plan changes.

#### 9. 🏷️ Bulk Actions

Select multiple users/jobs/companies and:

- Deactivate all selected
- Flag all selected
- Export selected to CSV

#### 10. 📊 Comparative Stats Cards

On admin dashboard, show comparison stats:

```
This Week vs Last Week:
  Signups:      +23% (47 → 58)
  Applications: +12% (312 → 349)
  Jobs Posted:  -5%  (21 → 20)
  Revenue:      +8%  ($1,200 → $1,296)
```

---

### Implementation Priority

#### Phase 1 — Foundation (Core Auth & Admin Shell)
- [ ] Create isolated `/admin/login` page
- [ ] Create `AdminLayout` with Mod/Admin role guards
- [ ] Create Admin Sidebar & Topbar UI
- [ ] Add `ADMIN_SECRET_KEY` and backend `requireAdmin` middleware
- [ ] Write `set-admin.js` script for initial owner promotion

#### Phase 2 — User Management & Moderation
- [ ] Create `/admin/users` list and detail pages
- [ ] Implement Activate/Deactivate users
- [ ] **Backend Logic:** Add Cascading Deactivation (deactivating a user auto-closes jobs/companies)
- [ ] Add Mod capabilities (View individual payment history, flag users)
- [ ] Add `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`

#### Phase 3 — Subscriptions & Billing Flow
- [ ] Implement Automated Stripe Downgrade (`proration_behavior: 'none'`) to replace the Mod Queue
- [ ] **Backend Logic:** Implement Plan Reconciliation Script on webhook downgrade (auto-pause excess jobs)
- [ ] **Backend Logic:** Billing-cycle Quota Math (calculate limits based on Stripe period, not calendar month)
- [ ] **Backend Logic:** Add Subscription History Ledger (push events to `subscriptions.history` array)

#### Phase 4 — Company & Job Moderation
- [ ] Create `/admin/companies` & `/admin/jobs` moderation pages
- [ ] Implement Company Approval Flow (`pending` status upon creation, jobs hidden until approved)
- [ ] **Backend Logic:** Apply-Button Race Condition fix (verify active status at exact moment of apply)
- [ ] **Backend Logic:** Orphaned Image ImgBB deletion hook

#### Phase 5 — Owner Features (Admin Only)
- [ ] Create Plan Management CRUD (`/admin/plans`)
- [ ] Create Revenue Dashboard fetching from Stripe API (`/admin/revenue`)
- [ ] Create Moderator Management (invite/remove mods via `/admin/moderators`)

---

## Existing Audit Findings (from previous audit)

### Duplication Findings (still open)

| Location                                                                                                                               | Pattern                                                    | Fix                              | Impact                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- | ---------------------------------- |
| `actions/jobs.js:request()` + `actions/company.js:request()` + `actions/applications.js:request()` + `actions/saved-jobs.js:request()` | `fetch(BASE+url,{headers:…}).then(r→r.json())` x4          | `lib/api/client.js`              | 100→30 lines, single error wrapper |
| `lib/api/imgbb.js:15-36` vs `38-64`                                                                                                    | `FormData+fetch+res.json` intra-file                       | Extract `uploadOne(file)`        | -30 lines                          |
| `SignInForm:42-50`, `SignUpForm:54-68`, `mycompany/new:34-48`, `update:69-112` validation                                              | `newErrors={}; if(!trim)...` x4                            | `lib/validation.js` or add `zod` | Consistent errors                  |
| `Navbar.jsx` raw `<Link><Button>`                                                                                                      | Only place not using `ButtonLink` (12 importers elsewhere) | Migrate to `ButtonLink`          | Consistent nav                     |
| `server: paginate()` x5, `buildJobLookup` x3, `attachStatsPublic` wrapper                                                              | `routes.js` clones                                         | Single helper, delete wrapper    | Fix pageSize 20 vs 12 drift        |

### Complexity Findings (still open)

| Location                                                                     | Problem                                                | Complexity                                | Simplification                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| `PlanUpgradeModal.jsx` ~590 lines                                            | 5-deep nested ternary className + 4-level map          | Untestable Tailwind strings               | Split `lib/plans.js` + `PlanCard.jsx` + `ConfirmStep.jsx`, variant map |
| `dashboard/page.jsx` SeekerHome ~286 lines                                   | fetch+`safeCall`+`normalizePage`+200 lines JSX in RSC  | Mixed layers                              | Thin RSC → `lib/services/dashboard.js` → presentational                |
| `JobForm.jsx` ~423 lines                                                     | validate+payload+create/update+push+toast in handler   | 61-line function                          | `lib/validation/job.js` (zod), presentational form                     |
| `recruiter/jobs/page.jsx`                                                    | fetch+normalize+filter+mutate+stats in one client comp | No pagination, `pageSize:100`             | RSC wrapper + `JobsManager` island, server `?status=&companyId=`       |
| `dashboard/page.jsx` `companies.map→jobs.filter`                             | O(C\*J) inline                                         | Slow                                      | Pre-index jobs by `companySlug` Map                                    |
| `useMemo` trivial filters, `useEffect refreshKey`, `motion.create` in render | `recruiter/jobs`, `Navbar`                             | Memo cost > benefit, refetch anti-pattern | Remove memos, `router.refresh()/SWR`, move `motion.create` out or drop |
| `lib/api/jobstruture.js` god-util                                            | plans+enums+forms+ids+dates                            | Split files                               | `plans.js`, `jobs/model.js`, `jobs/form.js`                            |

### Dependency Findings (still open)

| Dependency                                                                 | Status        | Reason                                  | Recommendation                         |
| -------------------------------------------------------------------------- | ------------- | --------------------------------------- | -------------------------------------- |
| `@stripe/stripe-js` frontend                                               | REMOVE        | 0 imports, only node SDK used           | Uninstall until Elements needed        |
| `framer-motion@13`                                                         | REPLACE       | 1 use: nav hover spin `Navbar` (~100kB) | CSS `transition-transform`, remove dep |
| `mongodb@7.5` frontend                                                     | KEEP          | Required by better-auth adapter         | Don't ad-hoc query outside `auth.js`   |
| `stripe@22` node                                                           | KEEP          | Live checkout                           | Add `apiVersion`, presence check       |
| `better-auth`, `@heroui/*`, `gravity-icons`, `tailwind4`, `next16/react19` | KEEP          | Core                                    | —                                      |
| Missing `zod` both apps                                                    | REPLACE (ADD) | 0 hits, all bodies unvalidated          | `npm i zod`                            |
| Missing `helmet`, `express-rate-limit` server                              | REPLACE (ADD) | Open CORS, no headers/limit             | Add both                               |
| `cors`, `dotenv`, `express`, `mongodb` server                              | KEEP          | All used                                | —                                      |

### Architecture Findings (still open)

1. **Dual recruiter namespaces:** `proxy.js:4` `mycompany` + `recruiter` for one role, cross-links in `page.jsx`, `JobForm`, `Sidebar`. Unify to `/dashboard/companies` + `/dashboard/jobs`, keep old as redirects. Single guard in `dashboard/layout.js`.
2. **`actions` vs `api` inverted:** `actions/*.js` are data-access fetchers, `api/*` pure helpers. Rename to `lib/server/*` vs `lib/utils/*` or make `api` real fetcher.
3. **ID duality:** server `$or:[jobId,slug,_id]` + `companySlug`, frontend `getJobId=id??_id` (ignores `jobId/slug`), `getCompanySlug=slug??id??_id`. Canonicalize: URL slug = `companySlug/slug`, fix `getJobId` to check `jobId??slug??id??_id`.
4. **Auth triplication:** `lib/auth.js` + `auth-client.js` + `core/session.js`. Keep DAG `actions→core/session→auth`, add `import/no-cycle`.

### Performance Findings (still open)

Only meaningful ones: **N+1 dashboard** `enrichJobs` does up to 6x `GET /api/jobs/:id` after list fetch (`dashboard/page.jsx`) — batch `?ids=` or embed job. **100-item overfetch** `pageSize:100` x6 sites + full refetch on toggle/delete — use optimistic patch. **No pagination** on `recruiter/jobs` (breaks >100). `framer-motion` for hover. Rest (parallel `Promise.all`, 30s SWR tags) is good.

### Logic & Edge Case Protections (New)

1. **Cascading Deactivation (Zombie Job Fix):** When a Mod deactivates a user, the backend must cascade the action: set all companies owned by the user to `deactivated` and all jobs to `closed`.
2. **Plan Downgrade Reconciliation:** When a webhook drops a user to a lower plan, the backend must check quotas. If active jobs > new limit, it sorts by newest, keeps the allowed amount `active`, and sets the rest to `paused`.
3. **Billing-Cycle Quota Math:** "Per month" limits (e.g., 30 apps/month) must not use calendar months. The backend calculates usage by counting actions strictly between `(currentPeriodEnd - 1 month)` and `currentPeriodEnd`.
4. **ImgBB Storage Leak Fix:** ImgBB uploads return a `delete_url`. The DB must store `{ url, deleteUrl }`. When updating an image, the backend hits the old `deleteUrl` to prevent orphaned files.
5. **Apply Button Race Condition:** `POST /api/my/applications` must do a real-time verify that `job.status === 'active'` and `company.status === 'active'` before saving.

### Security / Reliability Findings (still open)

| Issue                                                                                                                                                                               | Severity | Evidence                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| Secrets on disk both `.env` (Mongo+Stripe+imgbb+BetterAuth) — not git-tracked but live, shared user. Deleted seed/fix scripts still embedded the URI — secret is live until rotated | CRITICAL | `frontend/.env`, `server/.env` — rotate NOW, split Atlas users, Vercel envs                   |
| `x-recruiter-id` spoofable direct-to-backend, only non-empty check                                                                                                                  | CRITICAL | `routes.js:21-32` vs frontend stamps `user.id` — must verify session/JWT server-side          |
| No body validation, `...rest` into Mongo, can set `status/applicants/isPublicVisible`                                                                                               | HIGH     | `routes.js` companies/jobs POST+PUT — add zod allowlist                                       |
| Stripe anon checkout, `origin\|\|referer` open redirect, `err.message` leak, no webhook, plan from query                                                                            | HIGH     | `checkout_sessions` route — require session, allowlist origin, generic errors, webhook verify |
| Public reads leak `recruiterId/email/phone`                                                                                                                                         | HIGH     | `mountPublicEnhancements` — project out PII                                                   |
| CORS `app.use(cors())` any-origin                                                                                                                                                   | MED      | `index.js` — allowlist app URL                                                                |
| `error.message` leakage x28 handlers                                                                                                                                                | MED      | `routes.js` x23, `index.js` x5 — generic envelope + server log                                |
| `STRIPE_SECRET_KEY` no guard, no apiVersion; `NEXT_PUBLIC_API_URL` no fallback; lowercase `port`                                                                                    | LOW/MED  | `stripe.js:11`, `actions/*.js`, `index.js`                                                    |

---

## Refactoring Priority (updated)

### P0 — Critical

- Rotate all `.env` secrets. Split Mongo users. Add `.env.example`.
- `x-recruiter-id` → session-verified (forward Better-Auth cookie/JWT, min: `ObjectId.isValid`+DB lookup on all `/api/my/*`).

### P1 — High

- **Admin/Mod system** — implement Phase 1 & 2 (foundation + user management).
- Add `zod` both apps, allowlist POST/PUT/PATCH bodies + query.
- Stripe: require auth, allowlist origin, generic errors, `apiVersion`, webhook → `updateProfilePlan`.
- Kill dashboard N+1, add `recruiter/jobs` server pagination, replace `pageSize:100` dumps.
- Shared `lib/api/client.js` (dedupe 4x `request/normalizeList`).

### P2 — Medium

- **Admin/Mod system** — implement Phase 3 & 4 (company/job moderation + owner features).
- Split `PlanUpgradeModal`, `dashboard/page`, `JobForm`; flatten ternaries; extract validation.
- Unify `mycompany+recruiter` → `companies+jobs`; `src/pages/` already gone (no action).
- CORS allowlist, error envelope, eslint `import/no-cycle` + `unused-imports`, `lint --max-warnings 0`.
- Remove `@stripe/stripe-js` / `framer-motion` (or justify).

### P3 — Low

- **Admin/Mod system** — implement Phase 5 (activity feed, charts, exports, bulk actions).
- Renames: `DashBoardSideBar→DashboardSidebar`, `jobstruture→job-structure`, `checkout_sessions→checkout-sessions`, `Recruiter_*→RECRUITER_*`, `port→PORT`, `mycompany→companies`, `[id]→[slug]` for companies.
- `jsconfig baseUrl`, `Navbar→ButtonLink`, `getJobId` fallback cleanup, `README LICENSE` link fix.
- `next.config images.remotePatterns` already set — no action. `globe.png` KEEP (used).

---

## Recommended Cleanup Plan (remaining)

**MERGE:** `request()+buildQuery()+normalizeList()` x4 → `lib/api/client.js` · validation x4 → `lib/validation.js` (+zod) · `profile.js` preludes → helper · `imgbb uploadImage(s)` → `uploadOne` · home sections → `components/home/`.

**REFACTOR:** N+1 → batch/embed + parallel `Promise.all` · `pageSize:100` → paginated + optimistic patch · `PlanUpgradeModal/dashboard/page/JobForm/recruiter/jobs` splits · CORS allowlist · error envelope · eslint strict · Stripe hardening · `requireRole` on all `/api/my/*` + PII projection.

**REUSE:** Standardize on `ButtonLink` (migrate Navbar) · `getJobId/getCompanySlug/normalize*` canonical + fix `jobId/slug` gap · `normalizePage()` for `Array??items` triple · `PageStrip`, `CompanyFormFields/FieldError`, `safeCall` everywhere.

**KEEP:** Both Stripe routes (fix, don't delete) · auth handler · all used actions/helpers/components · `mongodb`, `stripe(node)`, `better-auth`, `heroui`, `tailwind` · `no-store` for `/api/my/*` + 30s SWR tags (fix dead tags) · `server-only` Stripe boundary · no-barrel direct imports · `globe.png`, `JobBadge`, `JobsTableSkeleton`, `requireCurrentUser`.

## Files to Remove (Unused / Test / One-off Scripts)

| File                                                | Reason                                                | Safe to Delete |
| --------------------------------------------------- | ----------------------------------------------------- | -------------- |
| `fix-dashboard.js`                                  | One-off fix script (already applied)                  | ✅ Yes         |
| `fix-plan.js`                                       | One-off fix script (already applied)                  | ✅ Yes         |
| `fix-remote-jobs.js`                                | One-off fix script (already applied)                  | ✅ Yes         |
| `fix-ui.js`                                         | One-off fix script (already applied)                  | ✅ Yes         |
| `fix_signin.sh`                                     | One-off fix script (already applied)                  | ✅ Yes         |
| `test-db-count.js`                                  | Debug/test script with hardcoded recruiter IDs        | ✅ Yes         |
| `test-stats.js`                                     | Debug/test script (broken — requires Next.js runtime) | ✅ Yes         |
| `test-user.js`                                      | Debug/test script with hardcoded email                | ✅ Yes         |
| `seed-enterprise-data.js`                           | Seed script (already run, data in DB)                 | ✅ Yes         |
| `seed-plans.js`                                     | Seed script (already run, data in DB)                 | ✅ Yes         |
| `seed-pro-data.js`                                  | Seed script (already run, data in DB)                 | ✅ Yes         |
| `src/proxy.js`                                      | Middleware-style guard — 0 imports, never used        | ✅ Yes         |
| `src/components/dashboard/CompanyNotRegistered.jsx` | 0 imports — dead component                            | ✅ Yes         |
| `CLAUDE.md`                                         | AI-specific config file (not project code)            | ⚠️ Ask user    |
| `.commandcode/` directory                           | IDE-specific settings                                 | ⚠️ Ask user    |
| `.DS_Store`                                         | macOS metadata — should be in .gitignore              | ✅ Yes         |
