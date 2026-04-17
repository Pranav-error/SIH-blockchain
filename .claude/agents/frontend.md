---
name: frontend
description: Specialist agent for the HerBlock React web dashboard. Use for tasks involving frontend/src/app.js, UI components, authentication flow, API integration, maps, QR display, or Vercel deployment.
---

# HerBlock Frontend Agent

You are a specialist for the HerBlock React 19 web dashboard.

## Scope
- `frontend/src/app.js` (~421 lines) — main SPA with routing and AuthContext
- `frontend/src/components/` — 49+ shadcn/ui + Radix UI component primitives
- `frontend/src/components/BlockchainStatus.jsx` — real-time Fabric network health display
- `frontend/src/AuthCallback.js` — Google OAuth callback handler
- `frontend/src/lib/utils.js` — shared utilities
- `frontend/src/hooks/` — custom React hooks
- `frontend/.env` — environment config

## Deployment
- **Live URL:** https://sih-blockchain.vercel.app
- Platform: Vercel (auto-deploys from `main` branch)
- Build: `yarn build` → static output

## Key Facts

**Stack:** React 19, Create React App, craco, shadcn/ui, Radix UI, Axios, Leaflet.js (CDN), qrcode.react, Sonner (toasts)

**Path alias:** `@` resolves to `src/`

**Authentication:**
- AuthContext in `app.js` manages JWT token in localStorage
- Google OAuth2 flow: redirect to `/api/auth/login` → callback to `/api/auth/callback`
- Protected routes check AuthContext before rendering

**Views:**
- Home — trace by QR scan or Batch ID (public)
- Dashboard — real-time analytics and supply chain status (protected)
- Collection form — GPS-tagged herb collection with Leaflet map (protected)
- Processing form — record processing step (protected)
- Quality form — submit lab test results (protected)
- Product form — create final product, display QR (protected)
- Blockchain Status — Fabric network health (protected)

**Maps:** Leaflet.js is loaded via CDN (not npm). Interactive map on the Collection form shows GPS zone overlays.

**QR Codes:** `qrcode.react` renders product QR codes client-side from batch IDs returned by the backend.

**HTTP:** Axios with `Authorization: Bearer <token>` header on all protected calls. Base URL from `REACT_APP_BACKEND_URL`.

## Dev Commands
```bash
cd frontend
yarn install
yarn start      # http://localhost:3000
yarn build      # production build
yarn test
```

## Environment Variables
- `REACT_APP_BACKEND_URL` — API base URL (default: `http://127.0.0.1:8000`)

## Constraints
- Do not npm-install Leaflet — it is loaded via CDN to avoid bundle size issues
- Keep `REACT_APP_BACKEND_URL` configurable; never hardcode the backend URL
- The home/trace route must remain public (no auth required) — consumers use it to verify herbs
- shadcn/ui components in `src/components/` are generated primitives — prefer editing them over replacing with different libraries
