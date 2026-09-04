# 🌐 HireSphere — Complete Website Architecture & Work Plan

> A full-stack job marketplace connecting **Job Seekers** and **Recruiters**, built with Next.js 15, MongoDB, better-auth, and Stripe.

---

## 📐 High-Level Architecture

```
┌────────────────────────────────────────────────────┐
│              BROWSER (User)                        │
└───────────────────┬────────────────────────────────┘
                    │ HTTPS
┌───────────────────▼────────────────────────────────┐
│         NEXT.JS FRONTEND (Vercel / Node)           │
│   - App Router (React Server Components + Client)  │
│   - better-auth (session management)               │
│   - Stripe Checkout API route                      │
│   - Server Actions (data fetching via fetch)       │
└──────────┬─────────────────────┬───────────────────┘
           │ MongoDB (Auth only)  │ REST API calls
           │                     │ (NEXT_PUBLIC_API_URL)
┌──────────▼──────────┐ ┌────────▼──────────────────┐
│  MongoDB Database   │ │  Backend REST API Server   │
│  (better-auth only) │ │  (Express/Node — port 5000)│
│  - users            │ │  - /api/jobs               │
│  - sessions         │ │  - /api/companies          │
│  - plans            │ │  - /api/my/jobs            │
└─────────────────────┘ │  - /api/my/applications    │
                        │  - /api/my/saved-jobs      │
                        │  - /api/my/companies       │
                        │  - /api/plans              │
                        └───────────────────────────-┘
```

> **Key Distinction:** MongoDB is used in TWO ways:
> - **Directly** (via `auth.js`) → only for user accounts and sessions
> - **Via REST API** (via `NEXT_PUBLIC_API_URL`) → for all business data (jobs, companies, applications, plans)

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend REST API (your Express/Node server)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Frontend URL (used by better-auth)
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# MongoDB (for user auth only)
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=hiresphere

# Stripe (server-side only, never exposed to browser)
STRIPE_SECRET_KEY=sk_test_...

# ImgBB (image hosting — exposed to browser)
NEXT_PUBLIC_IMGBB_KEY=your_imgbb_key
```

---

## 👤 User Model

Users are stored in MongoDB by `better-auth`. Each user has:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | auto | Unique user ID |
| `name` | string | — | Display name |
| `email` | string | — | Login email |
| `image` | string | null | Profile photo URL (via ImgBB) |
| `role` | string | `"seeker"` | Either `"seeker"` or `"recruiter"` |
| `plan` | string | `"free"` | Current plan ID (must match a `planId` in MongoDB `plans` collection) |
| `createdAt` | date | auto | Signup timestamp |

---

## 🗺️ All Website Routes

### 🌍 Public Pages (No login needed)

| URL | What It Does |
|-----|-------------|
| `/` | Landing/home page with hero, features, job stats |
| `/jobs` | Browse all job listings with search + filters |
| `/jobs/[id]` | View a single job detail, see company info, apply |
| `/company` | Browse all companies |
| `/company/[id]` | View a company profile, open roles, team |
| `/pricing` | View plan tiers, upgrade CTA, Stripe checkout trigger |
| `/pricing/success` | Post-payment success page (updates user plan in DB) |
| `/help` | FAQ and help page |
| `/auth/signin` | Login page |
| `/auth/signup` | Sign-up page (choose role: Seeker or Recruiter) |

### 🔐 Dashboard Pages (Login required)

All dashboard pages live at `/dashboard/...`. If a user visits without being logged in, they are redirected to `/auth/signin`.

#### Shared (both Seeker and Recruiter)
| URL | What It Does |
|-----|-------------|
| `/dashboard` | Overview stats, quick links, role-aware home view |
| `/dashboard/profile` | Edit name, photo, view plan status and usage |
| `/dashboard/settings` | Account settings, delete account, plan info |

#### Seeker Only
| URL | What It Does |
|-----|-------------|
| `/dashboard/applications` | View all submitted job applications + status |
| `/dashboard/saved-jobs` | View bookmarked/saved jobs |

#### Recruiter Only
| URL | What It Does |
|-----|-------------|
| `/dashboard/mycompany` | List all registered companies |
| `/dashboard/mycompany/new` | Create a new company profile |
| `/dashboard/mycompany/[id]` | View/manage a specific company |
| `/dashboard/mycompany/[id]/update` | Edit company info |
| `/dashboard/recruiter/jobs` | View all posted jobs, filter, manage status |
| `/dashboard/recruiter/jobs/new` | Post a brand new job |
| `/dashboard/recruiter/jobs/[id]` | View a specific job's details and applicants |
| `/dashboard/recruiter/jobs/[id]/edit` | Edit a posted job |
| `/dashboard/recruiter/applications` | View all applicants across all jobs |
| `/dashboard/recruiter/applications/[id]` | View a single applicant's profile + cover letter |

---

## 🔒 Authentication Flow

**Library:** `better-auth` (email + password)

```
1. User visits /auth/signup
   └─ Fills in: name, email, password, role (seeker/recruiter)
   └─ SignUpForm calls signUp() from auth-client.js
   └─ better-auth saves user to MongoDB with role + plan: "free"
   └─ Session cookie is set
   └─ User is redirected to /dashboard

2. User visits /auth/signin
   └─ Fills in: email, password
   └─ signIn() from auth-client.js is called
   └─ Session cookie is set
   └─ User is redirected to /dashboard

3. Protected pages (/dashboard/*)
   └─ Layout calls auth.api.getSession({ headers })
   └─ If no session → redirect("/auth/signin")
   └─ If session → render page with user data

4. Sign out
   └─ signOut() from auth-client.js
   └─ Session cookie cleared
   └─ User redirected to /
```

### Server-Side Session Helpers (`src/lib/core/session.js`)

| Helper | Does |
|--------|------|
| `getCurrentUser()` | Returns `session.user` or `null` |
| `requireCurrentUser()` | Throws `"Unauthorized"` if not logged in |
| `requireRecruiter()` | Throws `"Forbidden"` if user is not a recruiter |

---

## 💳 Plans & Pricing System

Plans are stored in the **MongoDB `plans` collection** (not hardcoded in the code). Each plan document looks like:

```json
{
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
  "features": [...],
  "ui": { "icon": "rocket", "highlight": true, "badgeText": "Most popular" },
  "isActive": true
}
```

### Plan IDs and Roles

| planId | role | Limit |
|--------|------|-------|
| `free` | seeker | 3 applications/month, 10 saved jobs |
| `pro` | seeker | 30 applications/month, unlimited saved jobs |
| `premium` | seeker | Unlimited everything |
| `free` | recruiter | 3 active job posts |
| `growth` | recruiter | 10 active job posts |
| `enterprise` | recruiter | 50 active job posts |

> `-1` in the limits object means **unlimited**.

### How Plan Limits are Enforced

The `src/lib/api/jobstruture.js` utility reads limits directly from the DB plan object:

- **Recruiters:** `getPlanUsage(activeJobCount, dbPlan)` → reads `dbPlan.limits.activeJobPosts`
- **Seekers:** `getSeekerPlanUsage(activeApplications, dbPlan)` → reads `dbPlan.limits.applicationsPerMonth` and `dbPlan.limits.savedJobs`

---

## 💰 Stripe Payment Flow

```
1. User clicks "Upgrade" on /pricing or PlanUpgradeModal
   └─ Frontend sends POST /api/checkout_sessions with { plan: "pro" }

2. /api/checkout_sessions/route.js (Next.js API route)
   └─ Calls getPlans() to fetch all plans from MongoDB
   └─ Finds the matching plan by planId
   └─ Rejects if plan is "free" (can't buy free)
   └─ If plan has stripePriceId → uses it directly
   └─ If no stripePriceId → builds price_data from DB pricing
   └─ Creates Stripe Checkout Session (mode: "subscription")
   └─ Returns { url: "https://checkout.stripe.com/..." }

3. Frontend redirects user to Stripe's hosted checkout page
   └─ User enters card details on Stripe's UI

4. Stripe redirects to /pricing/success?session_id=...&plan=pro

5. /pricing/success page
   └─ Reads the plan param from the URL
   └─ Calls updateProfilePlan("pro") server action
   └─ updateProfilePlan() validates plan against DB plans
   └─ Calls auth.api.updateUser({ plan: "pro" })
   └─ User's plan field in MongoDB is updated
   └─ Revalidates /dashboard and /dashboard/profile caches
   └─ User sees "Upgrade Successful!" page
```

---

## 🖼️ Image Upload Flow

Images (profile photos, company logos) are hosted on **ImgBB** (free image CDN):

```
1. User selects an image in ImageUploader component
2. Client-side uploadImage(file) calls ImgBB API with NEXT_PUBLIC_IMGBB_KEY
3. ImgBB returns a public URL (e.g. https://i.ibb.co/...)
4. The URL is saved to MongoDB (profile) or backend API (company logo)
```

---

## 🔄 Data Fetching & Caching Strategy

All business data comes from the backend REST API via Next.js Server Actions in `src/lib/actions/`.

| Type | Cache Strategy | Why |
|------|---------------|-----|
| Public jobs (`/api/jobs`) | `revalidate: 30s` + tag `"jobs"` | Stale for max 30s, refreshed on mutations |
| Public companies (`/api/companies`) | `revalidate: 30s` | Same pattern |
| Plans (`/api/plans`) | `revalidate: 60s` + tag `"plans"` | Plans rarely change |
| My jobs (`/api/my/jobs`) | `cache: "no-store"` | Per-user — must never be cached cross-user |
| My applications (`/api/my/applications`) | `cache: "no-store"` | Per-user |
| My saved jobs (`/api/my/saved-jobs`) | `cache: "no-store"` | Per-user |
| Auth session | N/A | Managed by better-auth cookies |

---

## 🏗️ Component Architecture

### Layout Hierarchy

```
app/layout.js (root — Inter font, dark theme, Toast)
├── (public)/layout.js
│   ├── <Navbar />            ← role-aware top nav
│   ├── <main>{children}</main>
│   └── <Footer />
├── (auth)/layout.js          ← no nav/footer
│   └── auth pages (signin, signup)
└── dashboard/layout.js
    ├── <DashBoardSideBar />  ← role-aware sidebar
    ├── <DashboardTopBar />   ← user info + plan badge
    └── <main>{children}</main>
```

### Key Shared Components

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Public navigation, role-aware links, login/logout |
| `PlanUpgradeModal.jsx` | Full plan comparison modal with Stripe checkout trigger |
| `SeekerPlanCard.jsx` | Shows seeker's current plan usage on profile |
| `PlanUsageCard.jsx` | Shows recruiter's active job usage on profile |
| `JobsOverview.jsx` | Recruiter dashboard job stats overview |
| `JobForm.jsx` | Create/edit job form with plan limit guard |
| `ApplyJobModal.jsx` | Full job application form (seeker) |
| `ImageUploader.jsx` | Drag-and-drop image upload to ImgBB |
| `DashBoardSideBar.jsx` | Role-aware sidebar navigation |

---

## 🛡️ Security Model

| Concern | How It's Handled |
|---------|-----------------|
| Auth | `better-auth` session cookies (httpOnly) |
| Route protection | Dashboard layout checks session server-side |
| Recruiter-only actions | `requireRecruiter()` throws if role ≠ recruiter |
| Plan upgrade validation | `updateProfilePlan` cross-checks plan against DB |
| Cross-user data leakage | `/api/my/*` endpoints use `cache: "no-store"` |
| Stripe secret | `STRIPE_SECRET_KEY` server-side only (not `NEXT_PUBLIC_`) |
| ImgBB key | `NEXT_PUBLIC_IMGBB_KEY` — client-safe (rate-limited by ImgBB) |

> ⚠️ **Note:** There is no `middleware.js`. Route protection is done at the layout level only. A user who knows a dashboard URL can attempt to visit it, but the layout will catch the missing session and redirect them.

---

## 🔗 Backend API Endpoints Used

All backend calls go through `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000`).

### Public (no auth header needed)
| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | `/api/jobs` | Job board page |
| GET | `/api/jobs/:id` | Job detail page |
| GET | `/api/companies` | Company directory |
| GET | `/api/companies/:id` | Company detail page |
| GET | `/api/plans?role=seeker` | Pricing page, checkout, profile |

### Protected (sends `x-recruiter-id` or `x-user-id` header)
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/my/jobs` | Recruiter |
| GET | `/api/my/jobs/:id` | Recruiter |
| GET | `/api/my/jobs/stats` | Recruiter |
| POST | `/api/my/jobs` | Recruiter |
| PUT | `/api/my/jobs/:id` | Recruiter |
| PATCH | `/api/my/jobs/:id/status` | Recruiter |
| DELETE | `/api/my/jobs/:id` | Recruiter |
| GET | `/api/my/companies` | Recruiter |
| POST | `/api/my/companies` | Recruiter |
| PUT | `/api/my/companies/:id` | Recruiter |
| DELETE | `/api/my/companies/:id` | Recruiter |
| GET | `/api/my/applicants` | Recruiter |
| GET | `/api/my/applicants/:id` | Recruiter |
| GET | `/api/my/applications` | Seeker |
| POST | `/api/my/applications` | Seeker |
| DELETE | `/api/my/applications/:jobId` | Seeker |
| GET | `/api/my/saved-jobs` | Seeker |
| POST | `/api/my/saved-jobs` | Seeker |
| DELETE | `/api/my/saved-jobs/:jobId` | Seeker |

---

## 🗂️ MongoDB Collections

| Collection | Managed By | Contents |
|------------|-----------|----------|
| `users` | better-auth | User accounts (id, name, email, role, plan, image) |
| `sessions` | better-auth | Active login sessions |
| `accounts` | better-auth | OAuth accounts (if added later) |
| `plans` | Manual / App | Plan definitions with limits, pricing, features |
| `jobs` | Backend API | All job postings |
| `companies` | Backend API | All company profiles |
| `applications` | Backend API | All job applications |
| `saved-jobs` | Backend API | Seeker bookmarks |

---

## ⚡ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI Components | HeroUI (+ Tailwind CSS) |
| Icons | `@gravity-ui/icons` |
| Auth | better-auth (email + password) |
| Database | MongoDB (Atlas) |
| Payments | Stripe (Subscriptions) |
| Image Hosting | ImgBB |
| Deployment | Vercel (frontend) + separate backend host |
