
# Portfolio Backend (Phase 1+)

Setup:

1. Create a `.env` file with `MONGODB_URI` set to your connection string.
2. Install dependencies:

```bash
cd Backend
npm install
```

Run dev server:

```bash
npm run dev
```

Seed database:

```bash
npm run seed
```

API Endpoints

Auth
- `POST /api/v1/auth/register` — Register new user. Body: `{ email, password }`.
- `POST /api/v1/auth/login` — Login. Body: `{ email, password }`. Returns `accessToken` and sets `refreshToken` cookie.
- `POST /api/v1/auth/refresh` — Exchange refresh cookie for new access token.
- `POST /api/v1/auth/logout` — Clear refresh cookie.

Transactions
- `POST /api/v1/transactions` — Create a transaction (BUY/SELL).
	- Body: `{ accountId, assetSymbol, type: 'BUY'|'SELL', quantity: string, priceAtDate: string, date?: ISO }`.
	- Protected: requires `Authorization: Bearer <accessToken>` header.

Analytics
- `GET /api/v1/analytics/summary` — Current balances per asset (quantity, avg cost, current price, value).
- `GET /api/v1/analytics/allocation` — Allocation percentages and concentration risk flag.
- `GET /api/v1/analytics/timeseries?start=ISO&end=ISO` — Time-series of portfolio value between dates.

Swagger UI
- Interactive API docs are served at `/api-docs` when the server is running.

Notes
- Quantities and prices use `Decimal128` in MongoDB to preserve precision. Send them as strings in the API body.
- For local development the project includes a deterministic `mockPriceService` that simulates historical prices for charts.

