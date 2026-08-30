# HireSphere 🚀

HireSphere is a full-stack hiring platform designed to make the hiring journey smoother, smarter, and more human. It connects job seekers with real opportunities while giving recruiters a clean dashboard to manage companies, roles, applicants, and saved jobs without the usual chaos.

## 🌐 Live product

- Main website: https://hire-sphere-two.vercel.app/
- API backend: https://hire-sphere-indol.vercel.app/

## 🧠 What this project does

HireSphere is not just a job board. It is a mini hiring ecosystem built around two main users:

- Job seekers who want to discover, save, and apply to roles quickly
- Recruiters who want to publish jobs, manage companies, and review applicants in one place

The product blends a polished public experience with a powerful internal dashboard, so both sides of hiring feel connected and professional.

## 🏗️ Repository structure

This monorepo includes both halves of the app:

- `hiresphere-frontend/` — Next.js app for the public website and recruiter dashboard
- `hiresphere-server/` — Express + MongoDB API powering companies, jobs, applications, and saved roles

```text
HireSphere/
├── README.md
├── LICENSE
├── hiresphere-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── hiresphere-server/
│   ├── index.js
│   ├── routes.js
│   ├── package.json
│   └── README.md
└── .gitignore
```

## ✨ Core features

- 🔎 Public job board with search and filtering
- 🏢 Company profiles and hiring pages
- 📄 Detailed job listings with application flow
- 💾 Save jobs for later
- 🧾 Application tracking for candidates
- 🧑‍💼 Recruiter dashboard for company and job management
- 🔐 Authentication and role-aware user access
- 📊 MongoDB-backed workflow for companies, jobs, and applicants
- ☁️ Vercel-ready deployment structure for frontend + backend

## 🧩 Tech stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS
- Better Auth
- MongoDB integration
- Framer Motion + UI components

### Backend

- Node.js
- Express 5
- MongoDB
- CORS
- dotenv

## 🚀 Quick start

### 1) Install dependencies

```bash
cd hiresphere-frontend && npm install
cd ../hiresphere-server && npm install
```

### 2) Set up environment variables

Frontend `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hiresphere
```

Server `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hiresphere
PORT=5000
```

### 3) Run both apps

Frontend:

```bash
cd hiresphere-frontend
npm run dev
```

Backend:

```bash
cd hiresphere-server
npm run dev
```

Then visit:

- Frontend: http://localhost:3000
- API: http://localhost:5000

## 🏠 Public experience

The public side of HireSphere feels like a modern hiring marketplace. Users can:

- browse active openings
- filter roles by category, type, or location
- open detailed job pages
- save jobs they like
- apply to roles with structured application data

This is the top-of-funnel experience that helps candidates discover opportunities quickly and confidently.

## 🧑‍💻 Recruiter experience

The recruiter side is where the platform becomes operationally useful. Recruiters can:

- create and manage company profiles
- post jobs tied to their companies
- view job performance and applicant metrics
- manage candidates and applications
- keep job statuses organized between active and closed roles

This turns HireSphere from a simple job listing website into a working hiring workspace.

## 🔌 Backend capabilities

The Express API exposes both public and protected services:

- `GET /api/jobs`
- `GET /api/companies`
- `GET /api/jobs/:id`
- `GET /api/my/companies`
- `POST /api/my/jobs`
- `PATCH /api/my/jobs/:id/status`
- `GET /api/my/applicants`

The backend also manages saved jobs and applications, making sure candidate actions and recruiter operations are tied to the same data model.

## ☁️ Deployment

This project is designed for Vercel-style deployment:

- frontend deploys as a Next.js app
- backend deploys as an Express app
- MongoDB credentials are configured through environment variables

## 👤 Credits

Built with ❤️ by Pradipta Sarker

- GitHub: https://github.com/axiomshuvo
- Project: HireSphere
- Role: Full-stack product builder and developer

## 🤝 Contributing

1. Create a feature branch
2. Make changes in the relevant frontend or backend area
3. Test locally with both app layers running
4. Submit a clean pull request with a clear description of the feature or fix

## 📜 License

This project is licensed under the ISC License.

---

Built for modern hiring workflows, stronger recruiter operations, and a cleaner candidate experience. HireSphere is all about making talent discovery feel less painful and a lot more powerful. 💼✨
