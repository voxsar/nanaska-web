# Nanaska CIMA – Workspace Instructions

Full-stack CIMA exam prep platform. React + Vite frontend; NestJS + Prisma + PostgreSQL backend.
https://api.nanaska.com/ is the backend api hosted in and needed to be migrated and restart when work is changed and completed
## Architecture

```
/                        # Frontend (React 19 + Vite 8, Netlify)
  src/
    components/          # Shared UI components, each with co-located .css
    pages/               # Route-level page components
    context/             # React context providers (CartContext, PricingContext)
    hooks/               # Custom hooks (useApi, useCountryDetection, …)
    data/                # Static fallback data (coursesData, lecturersData, …)
  src/admin/             # Separate admin SPA (AdminApp.jsx as root)
backend/                 # NestJS REST API (port 3001, PM2 in production)
  src/<module>/           # One folder per NestJS module: controller + service + module + dto/
  prisma/schema.prisma   # Source of truth for DB schema
  node/                  # Local Paycorp Sampath IPG client library (ESM)
```

**Color palette**: `#1B365D` (navy) · `#24ADE3` (cyan) · `#F5A623` (orange)

## Build & Dev

**Frontend** (root):
```bash
cp .env.example .env.local   # set VITE_API_URL
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # output → dist/
npm run lint         # ESLint
```

**Backend** (`cd backend`):
```bash
cp .env.example .env          # fill all values (see table below)
npm install
npx prisma migrate dev        # run DB migrations
npm run prisma:seed           # seed courses & combinations
npm run dev                   # ts-node-dev → http://localhost:3001
npm run build                 # nest build → dist/
```

## Required Environment Variables

**Frontend** (`.env.local`):
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:3001` |

**Backend** (`backend/.env`):
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | **Must be set** — app refuses to start without it |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `FRONTEND_URL` | Comma-separated allowed CORS origins |
| `PORT` | Defaults to `3001` |
| `IPG_MERCHANT_ID` | Paycorp/Sampath merchant ID |
| `IPG_MERCHANT_SECRET` | Paycorp merchant secret |
| `IPG_HMAC_SECRET` | HMAC-SHA256 signing secret for payment envelopes |
| `IPG_BASE_URL`, `IPG_NOTIFY_URL`, `IPG_RETURN_URL`, `IPG_CANCEL_URL` | Payment gateway URLs |
| `IPG_CURRENCY` | `LKR` or `GBP` |

## Backend Conventions

- **Module structure**: every feature lives in `backend/src/<module>/` with `<module>.controller.ts`, `<module>.service.ts`, `<module>.module.ts`, and a `dto/` subfolder.
- **Validation**: DTOs use `class-validator` decorators. The global `ValidationPipe` runs with `whitelist: true, forbidNonWhitelisted: true, transform: true`.
- **Auth**: JWT via `@nestjs/jwt` + `passport-jwt`. Passwords hashed with `bcrypt`. Admin routes use a separate `AdminJwtStrategy`.
- **Database**: Prisma ORM. Column names are `snake_case` via `@map`; table names via `@@map`. IDs are UUIDs unless the domain ID is meaningful (e.g. course `id = "BA1"`).
- **CORS**: Whitelist-only — set `FRONTEND_URL` to every allowed origin (comma-separated). Do not use wildcard `*`.
- **Payment gateway**: Paycorp Sampath Bank IPG (not PayHere). The local ESM client is in `backend/node/`. Payments use HMAC-SHA256 envelope signing (`IPG_HMAC_SECRET`).

## Frontend Conventions

- Components are `.jsx`. Styles are co-located `.css` files (no CSS modules / Tailwind).
- API calls go through `src/admin/api.js` (admin) or Axios directly in hooks/pages.
- Country detection drives LKR vs GBP pricing (`useCountryDetection` + `PricingContext`).
- No frontend test suite currently.

## Deployment

- **Frontend**: Netlify — config in `netlify.toml`, build output `dist/`.
- **Backend**: PM2 — config in `backend/ecosystem.config.cjs`. Use `npx prisma migrate deploy` (not `dev`) in production.
