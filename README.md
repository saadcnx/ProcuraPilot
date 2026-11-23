# ProcuraPilot

Invoice / purchase-order matcher with an append-only audit trail. Compares every incoming bill against its PO to the cent and holds any mismatch for a signed decision.

## Requirements

- Node.js 20+
- PostgreSQL 14+ (Supabase compatible)

## Backend

```bash
cd server
cp .env.example .env   # then fill in DATABASE_URL, JWT_SECRET, SECRET_BOX_KEY
npm install
npm run db:migrate
npm run dev
```

## Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173. In dev, Vite proxies `/api/*` to `http://localhost:3001`.

## Production

```bash
docker compose up -d --build
```

Frontend on :8080, backend on :3001. Set `NODE_ENV=production` and rotate `JWT_SECRET` and `SECRET_BOX_KEY` before first boot. Keep `.env` out of source control.

## Seed data (demo only)

`npm run db:seed` refuses to run when `NODE_ENV=production`. For a demo or staging instance, force development mode explicitly:

```bash
cd server
NODE_ENV=development npm run db:seed