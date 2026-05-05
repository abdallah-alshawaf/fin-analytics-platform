# Multi-Account Portfolio App (MERN)

A full-stack portfolio management app with authentication, linked investment accounts, transaction tracking, and analytics dashboards.

This root README explains the project as one system. It complements the component docs in:
- `Backend/README.md`
- `Frontend/README.md`

## 1) Project Overview

This project is a MERN-style application split into two services:
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Frontend**: React + Vite + TypeScript + Tailwind + React Query + Zustand + Recharts

Core capabilities:
- User registration and login (JWT access token + refresh cookie)
- Auto-linked default account on registration
- Multi-account transaction entry (`BUY` / `SELL`)
- Account-scoped transaction table from API data
- Portfolio analytics (summary, allocation, time-series)
- Dashboard visualizations including account comparison charts
- Swagger API docs for backend routes

## 2) Repository Structure

```text
Job 3 (MERN)/
  Backend/
    src/
      routes/
      models/
      services/
      middleware/
      utils/
    package.json
    README.md
  Frontend/
    src/
      api/
      components/
      features/
      pages/
      store/
    package.json
    README.md
  README.md  <- this file
```

## 3) Tech Stack

### Backend
- Express 4
- TypeScript
- Mongoose 7 (MongoDB)
- Zod validation
- JWT (`jsonwebtoken`)
- Argon2 password hashing
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)

### Frontend
- React 18 + TypeScript
- Vite 5
- TailwindCSS
- TanStack Query
- Zustand
- React Hook Form + Zod
- Recharts

## 4) How Data Flows

1. User registers or logs in.
2. Backend issues access token and sets refresh cookie.
3. Frontend stores access token in Zustand/localStorage.
4. Frontend `fetcher` attaches bearer token and sends credentials (cookies).
5. Protected backend routes resolve `req.user` and return user-scoped data.
6. Dashboard queries analytics + transactions and renders charts/tables.

## 5) Environment Configuration

Create `Backend/.env` with at least:

```env
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_access_token_secret>
JWT_REFRESH_SECRET=<your_refresh_token_secret>
FRONTEND_ORIGIN=http://localhost:3000
PORT=4000
```

Optional frontend env (`Frontend/.env`):

```env
VITE_API_BASE=http://localhost:4000
```

If `VITE_API_BASE` is not set, frontend defaults to `http://localhost:4000`.

## 6) Install and Run

### Prerequisites
- Node.js 18+ recommended
- npm
- MongoDB instance (local or Atlas)

### Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Run backend (terminal 1)

```bash
cd Backend
npm run dev
```

### Run frontend (terminal 2)

```bash
cd Frontend
npm run dev
```

Expected local URLs:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Swagger docs: `http://localhost:4000/api-docs`

## 7) Build and Test

### Backend

```bash
cd Backend
npm run build
npm test
```

### Frontend

```bash
cd Frontend
npm run build
npm run start
```

## 8) API Summary

Base URL: `http://localhost:4000/api/v1`

### Auth
- `POST /register` (root alias)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Accounts
- `GET /accounts` (protected)
- `POST /accounts` (protected)

### Transactions
- `GET /transactions` (protected) - user-scoped list used by the frontend table
- `POST /transactions` (protected) - create `BUY`/`SELL`

### Analytics
- `GET /analytics/summary` (protected)
- `GET /analytics/allocation` (protected)
- `GET /analytics/timeseries?start=ISO&end=ISO` (protected)

## 9) Authentication Notes

- Access token is sent in `Authorization: Bearer <token>`.
- Refresh token is stored as an HTTP-only cookie.
- Frontend fetcher uses `credentials: include` to support refresh/logout cookie flow.

## 10) Financial Precision and Validation

- Quantity and price are stored as MongoDB `Decimal128`.
- API clients should send quantity/price as **strings**.
- Backend uses Zod for request shape validation.
- Sell transactions are validated against available quantity (`canSell`).

## 11) Dashboard and UI Features

- Portfolio summary cards (value, P/L, assets)
- Asset allocation chart with concentration risk
- Transactions table using real API data
- Account comparison growth chart
- Account selection used across transactions and settings
- Collapsible sidebar + top bar + light/dark mode

## 12) Seeding Development Data

To seed a test user, accounts, and transactions:

```bash
cd Backend
npm run seed
```

This helps populate charts and tables quickly for local testing.

## 13) Troubleshooting

### 401 on protected routes
- Confirm login succeeded and `accessToken` exists.
- Confirm backend and frontend base URLs match.
- Confirm CORS origin and `credentials: include` setup.

### Empty dashboard/table data
- Ensure you have linked accounts and transactions for the signed-in user.
- Seed data or create transactions manually.

### Build warnings about chunk size (frontend)
- This is currently informational.
- You can add route-level code splitting later if needed.

### Swagger not available
- Confirm backend is running and visit `/api-docs`.

## 14) Known Implementation Notes

- `POST /transactions` currently enforces `date` at runtime, even though schema allows optional date.
- The frontend sends current ISO date on submit, so this works in practice.

## 15) Suggested Next Improvements

- Add pagination and date filters for transactions endpoint/table.
- Add backend endpoint for true mark-to-market account growth per date.
- Add global toast notifications and richer mutation feedback.
- Add `.env.example` files for both services.
- Add CI checks for backend tests + frontend build.

---

If you are onboarding: start with section 6, then section 8 for API testing, then section 11 for UI behavior.
