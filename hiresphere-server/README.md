# HireSphere Server ⚙️

This is the API engine behind HireSphere — the part that powers public job browsing, recruiter operations, saved jobs, and application flows.

## 🌐 Live API

- https://hire-sphere-indol.vercel.app/

## 🧠 What this server is responsible for

The backend is the brain of the system. It does the heavy lifting for:

- company records
- job listings and statuses
- saved jobs
- applications
- recruiter-only management routes
- secure ownership checks between users and their content

The server keeps everything connected to one source of truth: MongoDB.

## 🏗️ Architecture

The backend is built around two core patterns:

1. Public routes for anyone to browse jobs and companies
2. Protected recruiter routes under `/api/my/*` that enforce ownership access

This separation keeps public browsing clean while ensuring recruiter data stays private and safe.

## 🛠️ Tech stack

- Node.js
- Express 5
- MongoDB
- CORS
- dotenv

## 📁 Project structure

```text
hiresphere-server/
├── index.js
├── routes.js
├── package.json
├── README.md
├── .env
├── vercel.json
└── LICENSE
```

## 🔌 Core endpoints

### Public routes

These are used by the website and public job discovery flows:

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/companies`
- `GET /api/companies/:id`

### Recruiter routes

These require the `x-recruiter-id` header and enforce data ownership:

- `GET /api/my/companies`
- `POST /api/my/companies`
- `PUT /api/my/companies/:id`
- `DELETE /api/my/companies/:id`
- `GET /api/my/jobs`
- `POST /api/my/jobs`
- `PATCH /api/my/jobs/:id/status`
- `DELETE /api/my/jobs/:id`
- `GET /api/my/applicants`

### Candidate actions

These support the experience for users who are applying and saving roles:

- saved jobs
- applications
- duplicate checks
- application withdrawal

## 🧪 Local setup

### Prerequisites

- Node.js 18+
- MongoDB connection string

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in this folder:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hiresphere
PORT=5000
```

### Run the server

```bash
npm run dev
# or
npm start
```

Then open:

```text
http://localhost:5000
```

## ✅ Health check

The root endpoint confirms the server is alive:

```bash
curl http://localhost:5000/
```

The response is a simple HTML page showing that the HireSphere API is running.

## 📦 Data model overview

### Companies

Recruiters manage company records, and public endpoints can read those records as needed.

Typical fields:

- `name`
- `companySlug`
- `companyId`
- `logo`
- `website`
- `location`
- `industry`
- `recruiterId`
- `createdAt`
- `updatedAt`

### Jobs

Jobs support lifecycle states and recruiter ownership rules.

Typical fields:

- `title`
- `companySlug`
- `companyId`
- `status`
- `category`
- `type`
- `location`
- `salary`
- `description`
- `applicants`
- `recruiterId`

### Saved jobs and applications

The backend also stores and manages:

- saved jobs for later
- candidate applications
- duplicate prevention on repeated saves/applications
- live applicant counts on job records

## 🔐 Security and ownership model

The recruiter APIs rely on the `x-recruiter-id` header. That means:

- recruiters can only work on their own data
- private company and job records cannot be crossed with another user's account
- public APIs stay separate from private recruiter operations

This is a strong and practical pattern for a hiring product that needs both flexibility and protection.

## ☁️ Deployment

The server is ready for Vercel and similar Node.js hosting environments.

Production env vars should include:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `PORT`

## � Credits

Built with ❤️ by Pradipta Sarker

- GitHub: https://github.com/axiomshuvo
- Role: Backend engineer and system architect

## �📝 Notes

The server is compact but powerful. Route logic is centralized in `routes.js`, and `index.js` handles the MongoDB connection and app setup. That keeps the backend easy to understand while still supporting real hiring workflows.

---

HireSphere Server is the operational foundation of the platform: it keeps the public job marketplace and recruiter dashboard aligned around the same MongoDB-backed data model. ⚙️💼
