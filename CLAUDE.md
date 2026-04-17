# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HERB-Vault (internal codename: HerBlock)** is a blockchain-based Ayurvedic herb traceability system targeting India's ₹30,000 Cr+ Ayurvedic industry. Originally built for Smart India Hackathon 2024, it uses Hyperledger Fabric to track herbs from farm to consumer with GPS-validated collection zones, QR code tracing, and an offline-first mobile app.

**Live Frontend:** https://sih-blockchain.vercel.app

### Team

| Name | Role |
|------|------|
| Pranav (sai pranav) | Full-stack, Blockchain, Mobile |
| Harshalykumar | Hardware / Mechatronics (ESP32-S3) |
| Karanam Nayan | Hardware / Mechatronics (ESP32-S3) |

### Milestones
- SIH 2024 — Initial build and submission
- CMTI Design & Innovation Clinic 2026 — April 16–18, Bengaluru (presentation)

### Component Completion Status

| Component | Status |
|-----------|--------|
| FastAPI + MongoDB backend | Done |
| Hyperledger Fabric network (herblock channel) | Done |
| Node.js chaincode | Done |
| React 19 frontend (deployed on Vercel) | Done |
| React Native mobile app (offline, QR, GPS) | Done |
| Presentation deck | Done |
| ESP32-S3 hardware/IoT integration | In Progress |

## Repository Structure

- `backend/` — Python FastAPI server with MongoDB and Hyperledger Fabric integration
- `backend/services/fabric_service.py` — Fabric CLI subprocess wrapper (~436 lines)
- `backend/fabric-samples/` — Hyperledger Fabric test network and chaincode
- `frontend/` — React 19 web dashboard (CRA + craco + shadcn/ui), deployed on Vercel
- `mobile-app/` — React Native Expo app for field collection with offline-first support
- `HIMALAYA_PITCH/` — Business/investor pitch materials
- `patent/`, `PATENT/`, `PATENT_FILING_PACKAGE/` — Patent filing documents (GPS on-chain validation)

## Development Commands

### Backend
```bash
cd backend
source venv/bin/activate          # activate venv (create with: python3 -m venv venv)
pip install -r requirement.txt    # install dependencies
uvicorn server:app --reload       # run dev server on http://127.0.0.1:8000
# API docs at http://127.0.0.1:8000/docs
```

Linting/formatting:
```bash
flake8 .
black .
mypy . --strict
isort .
```

### Frontend
```bash
cd frontend
yarn install
yarn start      # dev server on http://localhost:3000
yarn build      # production build
yarn test       # run tests
```

### Mobile App
```bash
cd mobile-app
npm install
npm start       # Expo dev server; press a/i/w for Android/iOS/web
```

### Infrastructure
```bash
# MongoDB (required for backend)
docker run -d -p 27017:27017 --name herblock-mongo mongo
# or: docker start herblock-mongo
```

Automated setup: `chmod +x setup.sh && ./setup.sh`

## Architecture

### Three-Tier System
```
React Web + React Native Mobile
        ↓ REST API (Axios)
FastAPI Backend (server.py)
        ↓ gRPC / Fabric CLI subprocess
Hyperledger Fabric (herblock channel, 2 orgs, Raft consensus)
        ↓
MongoDB (app data) + CouchDB (blockchain world state)
```

### Backend (`backend/server.py` ~1014 lines)
Central FastAPI app with:
- JWT + Google OAuth2 authentication
- Supply chain endpoints: `/api/collection`, `/api/processing`, `/api/quality`, `/api/product`
- Tracing endpoint: `GET /api/trace/{trace_id}`
- Analytics: `GET /api/analytics/dashboard`
- GPS validation using Haversine formula for collection zone enforcement
- QR code generation (base64 PNG via `qrcode` library)
- Delegates all blockchain writes/reads to `fabric_service.py`

### Fabric Service (`backend/services/fabric_service.py` ~436 lines)
Wraps Hyperledger Fabric operations:
- Uses subprocess calls to `peer` CLI for chaincode invoke/query
- Manages TLS certs and environment variables for Fabric network
- Key methods: `check_connection()`, `_run_invoke()`, `_run_query()`

### Frontend (`frontend/src/app.js`)
React 19 SPA with protected routes via `AuthContext`. Key views: home (trace by QR/Batch ID), dashboard, collection/processing/quality/product forms, blockchain status. Uses Leaflet.js (loaded via CDN) for interactive maps. Path alias `@` resolves to `src/`.

### Mobile App (`mobile-app/`)
Offline-first Expo app for field herb collectors:
- Zustand stores: `authStore` (auth state), `syncStore` (offline queue)
- SQLite via Expo SQLite for local persistence
- Syncs pending records to backend when connectivity is restored

## Key Environment Variables

**Backend** (`backend/.env`):
- `MONGO_URL` — MongoDB connection string (default: `mongodb://localhost:27017`)
- `DB_NAME` — Database name (`herblock`)
- `FRONTEND_URL` — CORS origin (`http://localhost:3000`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth2 credentials
- `RENDER_EXTERNAL_URL` — Public API URL

**Frontend** (`frontend/.env`):
- `REACT_APP_BACKEND_URL` — API base URL (default: `http://127.0.0.1:8000`)

## Port Reference

| Service | Port |
|---------|------|
| Frontend | 3000 |
| Backend | 8000 |
| MongoDB | 27017 |
| Fabric Org1 peer | 7051 |
| Fabric Org2 peer | 9051 |
| Fabric orderer | 7050 |

## Blockchain Network

The Hyperledger Fabric network lives in `backend/fabric-samples/test-network/`. Channel name: `herblock`. Two organizations (Org1MSP, Org2MSP) with Raft-based ordering. Chaincode is in Node.js. The backend invokes it via subprocess calls to the Fabric peer CLI rather than using the Fabric SDK directly.

Chaincode functions: `recordCollection`, `recordProcessing`, `recordQualityTest`, `recordProduct`, `getProductTrace`, `getHistory`.

## Patent Feature: On-Chain GPS Validation

The core innovation (patent-pending) is performing geospatial validation **inside the chaincode** using the Haversine formula, so GPS spoofing is rejected at the blockchain level with no off-chain bypass possible.

Herb zones (patent data):
| Herb | Approved Zone | Radius |
|------|--------------|--------|
| Ashwagandha | Rajasthan/MP | 600 km |
| Tulsi | Central India | 1500 km |
| Brahmi | South-East India | 700 km |
| Giloy | Tropical India | 800 km |
| Shatavari | North-Central India | 500 km |

## Hardware / IoT Layer (In Progress)

ESP32-S3 sensor nodes capture field data (temperature, humidity, soil) and upload to the backend API. Integration is owned by hardware teammates Harshalykumar and Karanam Nayan. A handover doc covering wiring, API specs, and build timeline exists. When working on ESP32 integration points in the backend, check the `/api/collection` endpoint and any `iot` or `sensor` related routes.

## Sub-Agents

Specialized Claude Code agents are defined in `.claude/agents/` for focused work on each layer:
- `backend.md` — FastAPI + MongoDB + Fabric service
- `blockchain.md` — Hyperledger Fabric network + chaincode
- `frontend.md` — React web dashboard
- `mobile.md` — React Native Expo mobile app
- `hardware.md` — ESP32-S3 IoT integration
