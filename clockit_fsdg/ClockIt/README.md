# ClockIt

A student productivity app with a calendar/attendance tracker, a to-do list,
and a subject-based study timer. React + Vite frontend, Express + MongoDB
backend.

## Project structure

```
ClockIt/
├── backend/     Express API (auth, events/attendance, tasks, subjects, study sessions)
└── frontend/    React app (Vite)
```

## Backend setup

```
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # or: npm start
```

The server listens on `PORT` (default `5000`).

Required environment variables (see `.env.example`):
- `MONGO_URI` — your MongoDB connection string
- `PORT` — port to run the API on
- `JWT_SECRET` — any long random string, used to sign login tokens (the server refuses to start without it)
- `CORS_ORIGIN` — optional; your deployed frontend URL (comma-separated for several). Leave empty locally to allow any origin

> **Note:** if you're reusing credentials that were ever committed or shared
> anywhere, rotate them (change the database password / regenerate the
> connection string) before deploying.

## Frontend setup

```
cd frontend
npm install
npm run dev
```

By default the frontend talks to `http://localhost:5000`. To point it at a
different backend URL, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL`.

## Features / routes

- `/login`, `/signup` — account creation and sign-in; this is the entry
  point of the app. Visiting `/` while logged out sends you here.
- `/dashboard` — landing page with links to every section (requires login)
- `/calendar` — add events (one-off or weekly recurring), mark attendance
  (requires login)
- `/attendance` — attendance percentage per subject/category (requires login)
- `/todo` — personal to-do list (requires login)
- `/timer` — subject-based study timer with session history and stats
  (requires login)

## Notes

- Every feature route requires a logged-in user. Visiting the app while
  logged out redirects to `/login`; logging in (or signing up, then logging
  in) sends you to `/dashboard`.
- Run `npm install` in **both** `backend/` and `frontend/` — they're
  separate npm projects.
- If signup/login fails in the browser with "Failed to fetch", it almost
  always means the backend process isn't reachable — either it isn't
  running, or (most commonly with a shared MongoDB Atlas cluster) the
  database connection failed. Check the backend's terminal output: if you
  see `MongoDB Connection Failed`, add your current IP address to the
  cluster's Network Access list in Atlas (or allow `0.0.0.0/0` for local
  development) and double-check `MONGO_URI` in `backend/.env`.

### Trial account (only while the database is unreachable)

```
email:    trial@clockit.dev
password: trial1234
```

This login only works while MongoDB can't be reached; data is then kept in
memory and disappears when the server restarts. Once the database is
connected, use a normal signup instead.

## Deploying

- Backend: set the root to `backend/`, build `npm install`, start `npm start`,
  with `MONGO_URI`, `JWT_SECRET` and `CORS_ORIGIN` set.
- Frontend: set the root to `frontend/`, build `npm run build`, output `dist`,
  with `VITE_API_BASE_URL` set to the deployed backend URL (no trailing slash).
- Single-page routing: `frontend/vercel.json` (Vercel) and
  `frontend/public/_redirects` (Netlify) send every path to `index.html`.
  Keep the one for your host and delete the other.
