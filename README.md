# SmartBiz AI

A business management web app for small businesses — products, customers,
orders, expenses, reports, and an AI assistant for business insights.

**Stack:** React 19 + Vite + Tailwind CSS v4 (frontend) · Node.js + Express 5
+ MongoDB/Mongoose + JWT (backend) · Google Gemini (AI features) · Resend
(transactional email)

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8 / ESLint 10 — an older Node 20.x patch will fail `npm ci`)
- A MongoDB connection string (local or [Atlas](https://www.mongodb.com/atlas))
- A [Gemini API key](https://aistudio.google.com/apikey) (for the AI Assistant)
- A [Resend API key](https://resend.com/api-keys) (for password-reset emails — optional for local dev)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm run dev
```

The API runs on `http://localhost:5000` by default (`PORT` in `.env`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default. It talks to the backend
at `http://localhost:5000/api` (hardcoded in `frontend/src/services/api.js`
— update that if you deploy the backend elsewhere).

### Demo data

To populate a ready-to-explore account with sample products, customers,
orders, and expenses:

```bash
cd backend
npm run seed
```

This creates (or resets) a demo account:

- **Email:** `demo@smartbiz.ai`
- **Password:** `Demo@12345`

Safe to re-run — it only wipes and recreates data owned by that one account.

## Environment variables

See [`backend/.env.example`](backend/.env.example) for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs auth tokens |
| `GEMINI_API_KEY` | Powers the AI Assistant and AI insights |
| `RESEND_API_KEY` | Sends password-reset emails |
| `FRONTEND_URL` | Used to build reset-password links **and** as the CORS allow-list — the API only accepts browser requests from this origin. Comma-separate multiple origins (e.g. staging + production). |

## Scripts

**Backend** (`backend/package.json`)
- `npm start` — run the server
- `npm run dev` — run with nodemon (auto-restart)
- `npm run seed` — populate/reset the demo account
- `npm run check` — load every route/controller/model/middleware file and syntax-check `server.js`; used in CI

**Frontend** (`frontend/package.json`)
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## API reference

A ready-to-import Postman collection covering every endpoint is at
[`backend/postman_collection.json`](backend/postman_collection.json). Import
it, set the `baseUrl` collection variable if your API isn't on
`localhost:5000`, and run **Auth → Login** first — it automatically stores
the returned token for every other request in the collection.

## CI

[`​.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push
and PR to `main`: the backend job installs dependencies and runs
`npm run check`; the frontend job installs dependencies, builds, and runs
lint (informational only — see the workflow comment).

## Known limitations

- The frontend's API base URL is hardcoded to `http://localhost:5000/api`
  rather than driven by an environment variable — update
  `frontend/src/services/api.js` before deploying the backend to a different
  host.
- There is no automated test suite yet; `backend/scripts/check.js` is a
  lightweight load/syntax check, not a substitute for real tests.
- Password-reset email delivery uses Resend's shared sandbox sender
  (`onboarding@resend.dev`), which only delivers to the email address on the
  Resend account itself unless you verify your own sending domain.

## License

Proprietary — all rights reserved. See [LICENSE](LICENSE).
