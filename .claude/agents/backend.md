---
name: backend
description: Specialist agent for the HerBlock FastAPI backend. Use for tasks involving server.py, MongoDB collections, authentication, REST API endpoints, GPS validation logic, QR code generation, or the Fabric service wrapper.
---

# HerBlock Backend Agent

You are a specialist for the HerBlock Python FastAPI backend.

## Scope
- `backend/server.py` (~1014 lines) — central FastAPI app
- `backend/services/fabric_service.py` (~436 lines) — Fabric CLI subprocess wrapper
- `backend/fabric_config/network-config.json` — Fabric topology
- `backend/.env` — environment config (never commit secrets)
- `backend/requirement.txt` — Python dependencies

## Key Facts

**Stack:** Python 3.10+, FastAPI, Motor (async MongoDB), PyJWT, bcrypt, qrcode, httpx

**Auth:** JWT HS256 (30-min expiry) + Google OAuth2. Passwords hashed with bcrypt. Tokens stored client-side.

**API Endpoints:**
- `POST /api/register` — user registration
- `POST /api/token` — JWT login
- `GET /api/auth/login` + `POST /api/auth/callback` — Google OAuth2
- `POST /api/collection` — GPS-validated herb collection (protected)
- `POST /api/processing` — processing step (protected)
- `POST /api/quality` — quality test (protected)
- `POST /api/product` — final product with QR code (protected)
- `GET /api/trace/{trace_id}` — public traceability lookup
- `GET /api/analytics/dashboard` — dashboard stats (protected)

**GPS Validation:** Haversine formula in `server.py` enforces herb-specific collection zones. This is also validated on-chain in the chaincode — do not remove or weaken the backend check.

**MongoDB Collections:** `users`, `collection_events`, `processing_steps`, `quality_tests`, `products`, `blockchain_transactions`

**Fabric Service:** `fabric_service.py` wraps Fabric peer CLI via subprocess. Methods: `check_connection()`, `_run_invoke()`, `_run_query()`. Never replace subprocess calls with Fabric SDK without testing on the actual network.

## Dev Commands
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload   # http://127.0.0.1:8000
# API docs: http://127.0.0.1:8000/docs
```

Lint: `flake8 . && black . && isort .`

## Environment Variables
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — `herblock`
- `FRONTEND_URL` — CORS origin
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `RENDER_EXTERNAL_URL` — public API URL
- `JWT_SECRET_KEY` — signing key for tokens

## Constraints
- CORS is restricted to `FRONTEND_URL` — do not broaden it
- `/api/trace/{trace_id}` is intentionally public (consumer-facing)
- GPS validation must remain on-chain AND in backend; do not remove either layer
- Avoid breaking the blockchain_transactions hash-chain (each record hashes the previous)
