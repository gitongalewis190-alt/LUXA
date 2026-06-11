# LUXA — Advanced Vehicle Innovation Platform

Curated vehicle concepts, engineering innovations, and automotive project documentation.
Built by Antonio | Technical direction by Lewis Gitonga | Art Is Life Foundation.

## Quick Start

```bash
cd web
cp .env.local.example .env.local
# Fill in Firebase credentials and Daraja API keys
npm install
npm run dev
```

## Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Payments**: Daraja M-Pesa
- **Hosting**: Vercel

## Structure

```
web/          Next.js application
mobile/       Flutter app (Phase 6)
docs/         Specifications and guides
scripts/      Deploy and maintenance scripts
```

## Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Foundation (landing, auth, Firebase schema) | In Progress |
| 2 | Browse feed, project CRUD | Planned |
| 3 | Cart, checkout, Daraja payments | Planned |
| 4 | Admin console | Planned |
| 5 | Engagement, analytics, mobile polish | Planned |
| 6 | Flutter app | Optional |

## Environment Variables

See `web/.env.local.example` for all required configuration.
