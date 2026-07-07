# Aura Mystic Admin (`aura-mystic-admin`)

Internal admin panel for the Aura Mystic platform. Next.js 14 (App Router),
TypeScript, TailwindCSS, React Query. **Persian (Farsi) UI, RTL throughout.**

Part of a 3-repo platform: `fared-frontend` (storefront) · `fared-backend` (REST API) · **`aura-mystic-admin`** (this repo).

> 📄 **For the full project status, API contract, and known issues, see [HANDOFF.md](HANDOFF.md).**

## Getting started

```bash
npm install
cp .env.example .env.local        # set NEXT_PUBLIC_API_URL to your fared-backend
npm run dev                       # http://localhost:3000
```

Other scripts: `npm run build` (production build) · `npm run start` (serve build) ·
`npm run lint` · `npx tsc --noEmit` (type check).

## Requirements

- **Node.js** 18.18+ (Next.js 14 requirement).
- A running **`fared-backend`** REST API at `NEXT_PUBLIC_API_URL`. The admin is a
  frontend only — every screen fetches from that backend, so without it login fails
  and no data loads. See [HANDOFF.md §4](HANDOFF.md) for the endpoint contract.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API. See [.env.example](.env.example). |

## What's implemented

Layout/auth/login, products, orders, customers, tours, courses, mentorship,
media library, CMS (articles), leads (messages), and admins — all wired to the
backend via a service layer. Some areas diverge from the original spec and a few
items are partial/stubbed; see the **Implemented vs not** and **Known issues**
sections of [HANDOFF.md](HANDOFF.md).
