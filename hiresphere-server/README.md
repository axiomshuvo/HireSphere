# HireSphere Server

Backend API for [HireSphere](https://hire-sphere-indol.vercel.app/) — a recruiter platform for managing companies and job postings. Built with Express 5 and MongoDB.

## 👤 Author & Credits

Crafted with ❤️ (and a lot of `console.log`) by **Pradipta Sarker** — aka [axiomshuvo](https://github.com/axiomshuvo) on GitHub.

- 🐙 **GitHub:** [github.com/axiomshuvo](https://github.com/axiomshuvo)
- 📦 **Repository:** [axiomshuvo/HireSphere](https://github.com/axiomshuvo/HireSphere/tree/main/hiresphere-server)
- 🌐 **Live API:** [hire-sphere-indol.vercel.app](https://hire-sphere-indol.vercel.app/)

> ✨ "Hire smart. Ship faster." — HireSphere 🚀

If this project helped you, drop a ⭐ on the repo — it means a lot! 🙌

## Live API

- Production: [https://hire-sphere-indol.vercel.app/](https://hire-sphere-indol.vercel.app/)

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (official driver, Stable API v1)
- **Middleware**: `cors`, `dotenv`

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=hiresphere
port=5000
```

### Run

```bash
node index.js
# or
npm start
```

The server will start on the configured port. Hit `GET /` for a landing page confirming the API is live, and `GET /api/companies` or `GET /api/jobs` to verify data is flowing.

## Project Structure

```
hiresphere-server/
├── index.js          # Express app, MongoDB connection, all routes
├── package.json
├── .env              # Local secrets (gitignored)
└── README.md
```

The entire server lives in `index.js` — MongoDB connection, route definitions, and middleware are wired together in a single `run()` function that exits the process if the database connection fails.

## API Reference

Base URL: `/api`

### Companies

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/companies` | List all companies |
| `POST` | `/api/companies` | Create a company (auto-stamps `createdAt`) |
| `PUT` | `/api/companies/:id` | Update a company by `_id` or `companyId` |
| `DELETE` | `/api/companies/:id` | Delete a company; also closes all of its active jobs |

**Company payload** — flexible shape passed through from the request body, e.g.:

```json
{
  "companyId": "acme-001",
  "name": "Acme Corp",
  "logo": "https://...",
  "location": "Remote",
  "website": "https://acme.com",
  "industry": "Software"
}
```

#### `POST /api/companies`

```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{ "companyId": "acme-001", "name": "Acme Corp", "location": "Remote" }'
```

Response: `201` with the inserted company document.

#### `DELETE /api/companies/:id`

Returns the number of jobs that were auto-closed:

```json
{ "message": "Company deleted successfully", "closedJobs": 3 }
```

### Jobs

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/jobs` | List jobs (optional `?status=active\|closed`, `?companyId=...`) |
| `GET` | `/api/jobs/:id` | Get a single job by `_id` |
| `POST` | `/api/jobs` | Create a job (auto-sets `status: "active"`, `applicants: 0`, `createdAt`) |
| `PUT` | `/api/jobs/:id` | Update a job |
| `PATCH` | `/api/jobs/:id/status` | Toggle job `status` between `active` and `closed` |
| `DELETE` | `/api/jobs/:id` | Delete a job |

**Job payload** — flexible shape, typically:

```json
{
  "title": "Senior Frontend Engineer",
  "companyId": "acme-001",
  "location": "Remote",
  "type": "Full-time",
  "salary": "$120k - $160k",
  "description": "...",
  "requirements": ["React", "TypeScript"],
  "category": "Engineering"
}
```

#### `POST /api/jobs`

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{ "title": "Senior Frontend Engineer", "companyId": "acme-001" }'
```

#### `PATCH /api/jobs/:id/status`

```bash
curl -X PATCH http://localhost:5000/api/jobs/<id>/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "closed" }'
```

Reactivating a job (`status: "active"`) requires the linked company to still exist — otherwise the API returns `400` with a descriptive message.

## Data Model

Two MongoDB collections in the database named by `MONGODB_DB_NAME`:

### `companies`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Mongo default |
| `companyId` | string | Custom business id (optional) |
| `name` | string | Required by clients |
| `logo` | string | URL |
| `location` | string | |
| `website` | string | |
| `industry` | string | |
| `createdAt` | ISO string | Auto-stamped on create |

### `jobs`

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Mongo default |
| `title` | string | |
| `companyId` | string | Foreign key to a company |
| `location` | string | |
| `type` | string | Full-time / Part-time / Contract |
| `salary` | string | |
| `description` | string | |
| `requirements` | string[] | |
| `category` | string | |
| `status` | `"active" \| "closed"` | Default `"active"` on create |
| `applicants` | number | Default `0` on create |
| `createdAt` | ISO string | Auto-stamped |
| `closedAt` | ISO string | Stamped when status flips to `closed` |
| `reopenedAt` | ISO string | Stamped when status flips back to `active` |

## Error Handling

All routes return JSON errors with a `message` and the underlying `error.message`:

```json
{ "message": "Job not found", "error": "..." }
```

Common status codes:

- `400` — invalid id or invalid `status` value, or a rule violation (e.g. reactivating a job with no company)
- `404` — resource not found
- `500` — server/database error

## Deployment

The repo is configured for Vercel-style deployment. Make sure to set `MONGODB_URI`, `MONGODB_DB_NAME`, and `port` in your hosting provider's environment variables. The MongoDB driver uses the Stable API (`ServerApiVersion.v1`) with `strict: true`, so any feature usage must be compatible with that version.

## License

ISC
