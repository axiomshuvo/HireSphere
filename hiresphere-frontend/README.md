# HireSphere Frontend 🌐

This is the customer-facing layer of HireSphere — the polished, modern web app that powers the public job marketplace and the recruiter dashboard experience.

## 🚀 Live site

- https://hire-sphere-two.vercel.app/

## ✨ What this frontend is doing

The frontend brings the whole HireSphere experience to life:

- job seekers can browse and filter open roles
- candidates can save jobs and submit applications
- recruiters can manage companies and jobs from a dedicated dashboard
- the interface balances modern design, product clarity, and real business workflow

In short: it is the visible face of the platform, turning backend data into a smooth and useful hiring experience.

## 🧱 Main app areas

### Public side

The public pages include:

- landing page
- company directory
- role listings
- job details
- save/apply buttons
- static marketing and content sections

These routes live under `src/app/(public)` and connect to the server through the data-layer actions in `src/lib/actions`.

### Recruiter dashboard

The private dashboard lives under `src/app/dashboard` and includes:

- overview page
- company management
- job creation and editing
- applicant review
- profile and settings

This is where recruiters actually run their hiring operations.

### Auth layer

Authentication is managed with Better Auth, and the app uses a MongoDB-backed auth setup.

Key files:

- `src/lib/auth.js`
- `src/lib/auth-client.js`
- `src/app/api/auth/[...all]/route.js`

## 🛠️ Tech stack

- Next.js 16
- React 19
- Tailwind CSS
- Better Auth
- MongoDB integration
- HeroUI / Framer Motion UI patterns

## 📁 Project structure

```text
hiresphere-frontend/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── providers/
│   └── pages/
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── proxy.js
└── README.md
```

## ⚙️ Environment variables

Create a `.env.local` file in this folder:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hiresphere
```

## ▶️ Local development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open the local site:

```text
http://localhost:3000
```

## 📜 Available scripts

```bash
npm run dev     # run the local Next.js app
npm run build   # build for production
npm run start   # start production build
npm run lint    # run static checks
```

## 🔗 API integration

The frontend talks to the backend through server actions and fetch wrappers. The action layer keeps the UI organized and centralizes requests for things like:

- company data
- job data
- saved jobs
- applications
- profile management

Examples:

- `src/lib/actions/company.js`
- `src/lib/actions/jobs.js`
- `src/lib/actions/saved-jobs.js`
- `src/lib/actions/applications.js`
- `src/lib/actions/profile.js`

## ☁️ Deployment

This app is built for Vercel deployment and expects the production backend URL to be passed through `NEXT_PUBLIC_API_URL`.

Recommended setup:

- deploy as a Next.js app
- add production env vars in Vercel
- connect frontend to the live API backend URL

## � Credits

Built with ❤️ by Pradipta Sarker

- GitHub: https://github.com/axiomshuvo
- Role: Frontend engineer and product builder

## �📝 Notes

This frontend is designed around a real product workflow rather than just static pages. A candidate can discover jobs, save them, and apply, while a recruiter can manage the full hiring lifecycle from a separate authenticated dashboard. That makes the app feel much closer to a real hiring platform than a basic job board.

---

HireSphere Frontend is where product design, hiring flow, and user experience come together in one clean interface. 💼✨
