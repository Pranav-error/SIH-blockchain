# HerBlock — Claude's Project Understanding File

> Auto-generated after reading every file in the workspace.
> Last updated: 2026-03-24

---

## What This Project Is

**HerBlock** is a full-stack, production-ready blockchain traceability system built for **Smart India Hackathon 2024**. It solves the problem of counterfeit/adulterated Ayurvedic herbs (40% of Indian market) by creating an immutable, GPS-validated supply chain record from herb collection to final consumer product.

**Status:** Patent Pending (Indian Patent Office)
**Deployed Frontend:** https://sih-blockchain.vercel.app

---

## Core Innovation (Patent Feature)

GPS Geo-Fence Validation performed **on the blockchain** — validates latitude/longitude of herb collection against species-specific approved geographic zones using Haversine distance calculation. This is the first system to do this validation on-chain, not off-chain.

---

## Architecture Overview

```
Mobile App (React Native/Expo)        Web App (React 19)
       |                                      |
       └──────────────┬───────────────────────┘
                      ↓
            FastAPI Backend (Python)
                  |         |
               MongoDB    Hyperledger Fabric
                          (2 Orgs, Raft Consensus)
```

---

## Component Map

### Backend — `/backend/`

| File | Purpose |
|------|---------|
| `server.py` | Main FastAPI app (~450 lines) — all REST endpoints, auth, GPS validation, QR codes |
| `services/fabric_service.py` | Hyperledger Fabric CLI integration (~400 lines) — peer command execution |
| `fabric_config/network-config.json` | Fabric network topology (2 orgs, 2 peers, orderer) |
| `requirement.txt` | Python dependencies |
| `.env` | Secrets: MongoDB URL, Google OAuth, Render URL |

**Key Endpoints:**
- `POST /api/register` — user registration
- `POST /api/token` — JWT login
- `GET /api/auth/login` + `POST /api/auth/callback` — Google OAuth2
- `POST /api/collection` — GPS-validated collection (protected)
- `POST /api/processing` — processing step (protected)
- `POST /api/quality` — quality test (protected)
- `POST /api/product` — create product + QR code (protected)
- `GET /api/trace/{id}` — public traceability
- `GET /api/analytics/dashboard` — dashboard stats (protected)

**Auth:** JWT HS256, 30-min expiry, bcrypt passwords, Google OAuth2
**DB:** MongoDB via Motor (async) — 6 collections

### Blockchain — Hyperledger Fabric

| Config | Value |
|--------|-------|
| Channel | `herblock` |
| Orgs | Org1MSP (Government) + Org2MSP (Industry) |
| Peers | peer0.org1:7051, peer0.org2:9051 |
| Orderer | orderer.example.com:7050 |
| Consensus | Raft |
| Chaincode | JavaScript, v1.1, name `herblock` |
| Storage | LevelDB world state |

Chaincode functions: `recordCollection`, `recordProcessing`, `recordQualityTest`, `recordProduct`, `getProductTrace`, `getHistory`

### Frontend (Web) — `/frontend/`

| File/Dir | Purpose |
|----------|---------|
| `src/app.js` | Main app, routing, auth context, dashboard |
| `src/components/BlockchainStatus.jsx` | Live blockchain health display |
| `src/components/` | 40+ Radix UI + shadcn/ui components |
| `.env` | `REACT_APP_BACKEND_URL` |

**Tech:** React 19, React Router 7.5.1, Tailwind CSS, Radix UI, Leaflet.js (maps), qrcode.react, Axios, Sonner

### Mobile App — `/mobile-app/`

| File | Purpose |
|------|---------|
| `App.js` | Tab navigation (Home, Collect, Pending Sync, History, Settings) |
| `src/screens/` | 6 screens (Home, Login, Collection, PendingSync, History, Settings) |
| `src/store/authStore.js` | Zustand auth state with AsyncStorage persistence |
| `src/store/syncStore.js` | Collection sync logic, batch blockchain submission |
| `src/services/api.js` | Axios API client with interceptors |
| `src/database/db.js` | SQLite operations (210+ lines) — offline-first storage |

**Tech:** React Native 0.81.5, Expo SDK 54.0, React Navigation, Zustand, expo-sqlite, expo-location, AsyncStorage, Axios

**Key Feature:** Offline-first — records collections locally in SQLite, auto-syncs to backend every 10 seconds when network detected.

---

## Data Flows

### Collection Flow
```
Mobile GPS capture
→ Store in SQLite (offline queue)
→ Network detected → POST /api/collection
→ Backend: Haversine GPS geo-fence check
→ If valid → Fabric peer chaincode invoke
→ Org1 + Org2 endorse → Raft consensus
→ Stored on blockchain + MongoDB
→ Return transaction ID
```

### Traceability Flow
```
Consumer scans QR code
→ Web app GET /api/trace/{batch_id}
→ Backend queries MongoDB (collection_events, processing_steps, quality_tests, products)
→ Full journey rendered on screen
```

### Auth Flow
```
Login (username/password OR Google OAuth)
→ FastAPI issues JWT (30-min expiry)
→ Stored in localStorage (web) / AsyncStorage (mobile)
→ Included as Bearer token in all protected requests
```

---

## GPS Herb Zones (Patent Data)

| Herb | Zone Radius | Center Region |
|------|------------|---------------|
| Ashwagandha | 600 km | Rajasthan/MP |
| Tulsi | 1500 km | Central India |
| Brahmi | 700 km | South-East India |
| Giloy | 800 km | Tropical India |
| Shatavari | 500 km | North-Central India |

Validation logic: Fast bounding box check → Precise Haversine distance. Reject if outside zone.

---

## Data Integrity Chain

Each transaction includes:
- SHA-256 hash of data
- Previous transaction hash (hash-chaining)
- Merkle root calculation
- Immutable Fabric ledger record

---

## MongoDB Collections

1. `users` — accounts with bcrypt passwords
2. `collection_events` — herb collection records
3. `processing_steps` — facility processing records
4. `quality_tests` — lab results
5. `products` — final products with QR codes
6. `blockchain_transactions` — hash-chained transaction ledger

---

## SQLite Schema (Mobile)

```sql
collections (id, herb_name, quantity, unit, gps_lat, gps_lon, gps_accuracy,
             collector_id, notes, timestamp, status, synced, blockchain_tx_id)
credentials (id, username, password_hash, token, expires_at)
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `setup.sh` | One-command full setup |
| `demo.sh` | Run full demo |
| `check-status.sh` | Check all service health |

---

## Documentation Files

- `README.md` — Getting started guide
- `TECHNICAL_DOCUMENTATION.md` — Detailed tech specs
- `ARCHITECTURE_DIAGRAM.md` — System architecture diagrams
- `DEPLOYMENT.md` — Deployment instructions
- `DEMO_GUIDE.md` — Demo walkthrough
- `PRODUCTION_READINESS.md` — Production checklist
- `HIMALAYA_PITCH/` — Pitch deck documents (investor/competition)
- `Documentation/PATENT/` — Patent filing documents (Form 2)

---

## Key Dependencies

### Backend (Python)
- fastapi==0.110.1, uvicorn==0.25.0
- motor==3.3.1 (async MongoDB)
- pydantic==2.11.7
- python-jose + cryptography (JWT)
- passlib + bcrypt (passwords)
- qrcode==8.2
- google-auth libraries

### Frontend (npm)
- react@19, react-router-dom@7.5.1
- tailwindcss, @radix-ui/* (20+ primitives)
- leaflet@1.9.4, react-leaflet
- qrcode.react, axios, sonner

### Mobile (npm)
- react-native@0.81.5, expo@~54.0.0
- @react-navigation/* (native + bottom-tabs)
- zustand, expo-sqlite, expo-location
- @react-native-async-storage/async-storage

---

## Security Notes
- JWT 30-min expiry (HS256)
- Bcrypt password hashing (PassLib)
- Google OAuth2 with auto account creation
- CORS restricted to frontend URL
- TLS on all Fabric peer communication
- `.env` files excluded from git
- No auth required for public `/api/trace/{id}` (by design)
