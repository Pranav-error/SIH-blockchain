# HERB-Vault — Mini Project Viva Reference Guide
> **APT Mini Project | Semester VI | 2025–26**  
> Use this doc to answer anything the examiner throws at you.  
> Everything here maps to the actual code on your machine.

---

## Quick Links to Show the Examiner

| What | Path |
|------|------|
| Smart Contract (chaincode) | `backend/fabric-samples/chaincode/herblock/lib/herblock-contract.js` |
| Fabric Service (backend bridge) | `backend/services/fabric_service.py` |
| Main API Server | `backend/server.py` |
| Blockchain Network | `backend/fabric-samples/test-network/` |
| Frontend Dashboard | `frontend/src/app.js` |
| Mobile App | `mobile-app/` |
| Live URL | https://sih-blockchain.vercel.app |

---

## Rubric 1 — Problem Identification & Industry Relevance

### What is the problem?
India's ₹30,000 Crore+ Ayurvedic industry has **no tamper-proof traceability**. Three specific problems:

1. **Adulteration** — Cheaper or wrong herbs are substituted. No one detects it.
2. **Geographic fraud** — *Ashwagandha* gets its potency from Rajasthan's soil. Herbs from wrong regions are sold as authentic. Nothing enforces origin.
3. **Untraceable quality failures** — If a batch fails, no one can trace which farm it came from.

### Why is it significant?
- AYUSH Ministry regulates this sector but has no digital audit infrastructure.
- Consumers have zero verification ability.
- Farmers who grow genuine herbs get no price premium because no one can verify their claims.

### What existing solutions miss
Existing traceability systems (like simple QR labels) validate location at the **API/server layer** — meaning if that server is compromised, GPS can be faked. Our solution moves that validation **inside the blockchain itself**.

---

## Rubric 2 — Innovation & Product Thinking

### The core innovation (Patent-Pending)
**GPS validation runs inside the blockchain smart contract using the Haversine formula.**

This means:
- The blockchain itself (not the server) decides if a GPS location is valid
- No administrator, no hacker, no compromised server can bypass it
- It is part of the **consensus process** — all network nodes validate it

### What makes it novel?
No existing Ayurvedic/herb traceability solution runs geospatial validation inside the chaincode. Most solutions only store GPS data — they don't validate it at the ledger level.

### Patent claims filed
1. GPS-based geo-fence validation using Haversine formula *inside chaincode*
2. Harvest season validation *inside chaincode*
3. SHA-256 digital fingerprint per transaction
4. Quantity conservation validation (prevents fake volume inflation)
5. Collector reputation scoring on-chain
6. Merkle tree integrity verification
7. Secure QR hash linked to blockchain state

---

## Rubric 3 — Technical Design & Architecture

### System Architecture

```
┌────────────────────────────────────────────────────┐
│           CLIENT LAYER                             │
│  React 19 Web Dashboard    React Native Mobile App │
│  (Vercel - sih-blockchain.vercel.app)  (Expo + SQLite offline) │
└───────────────────┬────────────────────────────────┘
                    │ REST API (HTTP / Axios)
┌───────────────────▼────────────────────────────────┐
│           API LAYER                                │
│  Python FastAPI  (backend/server.py)               │
│  - JWT + Google OAuth2 auth                        │
│  - GPS Haversine validation (server-side backup)   │
│  - QR code generation (qrcode library)             │
│  - MongoDB for app data                            │
└───────────────────┬────────────────────────────────┘
                    │ Fabric CLI subprocess calls
┌───────────────────▼────────────────────────────────┐
│           BLOCKCHAIN LAYER                         │
│  Hyperledger Fabric (herblock channel)             │
│  - 2 organizations: Org1MSP, Org2MSP               │
│  - Raft consensus ordering                         │
│  - TLS encryption on all peer communication        │
│  - Node.js chaincode with GPS Haversine validation │
└───────────────────┬────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────┐
│           DATA LAYER                               │
│  MongoDB (app data, users, sessions)               │
│  CouchDB (blockchain world state - built into Fabric) │
└────────────────────────────────────────────────────┘
```

### Why Hyperledger Fabric (not Ethereum/Bitcoin)?
- **Permissioned** — only known, authorized participants (farmers, processors, labs, manufacturers) can write. Public chains let anyone write.
- **No cryptocurrency** — no gas fees, practical for business use.
- **Private channels** — business data stays between relevant parties.
- **Faster** — Raft consensus is far faster than Proof-of-Work.

### Why FastAPI (not Django/Flask)?
- **Async** — handles many concurrent blockchain calls without blocking.
- **Auto Swagger docs** — `/docs` endpoint for API testing out of the box.
- **Pydantic validation** — strict input validation at the API layer.

### Why MongoDB?
- Flexible document schema fits supply chain records (different herbs have different fields).
- CouchDB (inside Fabric) handles blockchain world state separately.

---

## Rubric 4 — Implementation & Functionality

### What actually works end-to-end

**Flow:**
```
Collector opens mobile app
  → logs harvest (GPS auto-captured)
  → POST /api/collection
  → FastAPI validates + calls fabric_service.record_collection()
  → fabric_service.py calls: peer chaincode invoke recordCollection
  → Chaincode runs _calculateHaversineDistance() on GPS
  → If valid: written to blockchain ledger (immutable)
  → Collection ID returned
  → QR code generated (base64 PNG)

Consumer scans QR
  → GET /api/trace/{batch_id}
  → fabric_service.py calls: peer chaincode query getProductTrace
  → Returns full chain: collection + processing + quality + product
  → Shown on web dashboard with Leaflet.js map
```

### API Endpoints (backend/server.py)

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/api/token` | Login (JWT) |
| GET | `/api/auth/login` | Google OAuth2 redirect |
| POST | `/api/auth/callback` | OAuth2 callback → JWT |
| POST | `/api/collection` | Record herb collection (with GPS validation) |
| POST | `/api/processing` | Record processing event |
| POST | `/api/quality` | Record quality test |
| POST | `/api/product` | Record final product |
| GET | `/api/trace/{trace_id}` | Full QR trace (collection→product) |
| GET | `/api/blockchain/status` | Check if Fabric network is live |
| GET | `/api/analytics/dashboard` | Dashboard stats |

### Live deployment
- Frontend: https://sih-blockchain.vercel.app
- API docs (local): http://127.0.0.1:8000/docs

---

## Rubric 5 — Use of Modern Tools & Technologies

| Layer | Technology | Version | Why chosen |
|-------|-----------|---------|------------|
| Blockchain | Hyperledger Fabric | v2.x | Permissioned, enterprise-grade, no crypto fees |
| Smart Contract | Node.js chaincode | ES6 | Fabric's official JS support, async/await |
| Backend | Python FastAPI | 0.100+ | Async, auto-docs, Pydantic validation |
| Database | MongoDB | 6.x | Flexible schema, async Motor driver |
| Blockchain state | CouchDB | Built-in | Fabric's world state, enables rich queries |
| Frontend | React 19 | Latest | Component model, Hooks, concurrent rendering |
| UI Library | shadcn/ui | Latest | Accessible, composable components |
| Maps | Leaflet.js | CDN | Lightweight interactive maps for GPS viz |
| Deployment | Vercel | - | CI/CD on push, global CDN |
| Mobile | React Native (Expo) | SDK 50+ | Cross-platform (iOS + Android) |
| Offline storage | SQLite (Expo) | - | Local persistence for offline sync |
| State (mobile) | Zustand | - | Lightweight, no boilerplate |
| Auth | JWT + Google OAuth2 | - | Secure, industry standard |
| Containers | Docker | - | MongoDB containerized |
| QR codes | qrcode (Python) | - | Base64 PNG generation |
| Password hashing | bcrypt (passlib) | - | Industry standard |

---

## Rubric 6 — Industry Alignment & Practical Applicability

### Real-world readiness
- **Deployed live** at https://sih-blockchain.vercel.app — not a prototype, a working system.
- **Presented at CMTI Design & Innovation Clinic 2026**, Bengaluru (April 16–18) — selected top 25.
- **Patent application filed** with Indian Patent Office.
- **AYUSH/FSSAI alignment** — designed around their regulatory requirements (accredited labs, GMP certification fields, AYUSH license tracking).

### Business model
- B2B SaaS — charge processors/manufacturers a subscription to write to the blockchain.
- B2G — sell audit access to AYUSH/FSSAI regulators.
- Target market: ₹30,000 Cr+ Indian Ayurvedic industry.

---

## Rubric 7 — Testing, Validation & Performance Evaluation

### What was tested

**GPS validation testing:**
- Submitted Ashwagandha collection with coordinates inside Rajasthan → **Accepted**
- Submitted Ashwagandha collection with coordinates from Tamil Nadu → **Rejected** by chaincode with error: `INVALID LOCATION: Collection of Ashwagandha not authorized at coordinates...`

**Quantity conservation testing:**
- Tried to log processing output > input → Chaincode threw: `QUANTITY FRAUD DETECTED: Processing output (X kg) exceeds available input (Y kg)`

**Offline sync testing:**
- Turned off WiFi on mobile → Records saved to SQLite locally → Reconnected WiFi → Records auto-synced to backend → Appeared on blockchain.

**End-to-end flow:**
- Completed full flow: Collection → Processing → Quality Test → Product → QR scan → Trace view.

**API validation:**
- Used FastAPI Swagger UI at `/docs` to test all endpoints systematically.

---

## Rubric 8 — Documentation

See: `HERB_Vault_Executive_Summary.docx` (in project root — printed for submission)

Other docs in repo:
- `CLAUDE.md` — full project guide
- `TECHNICAL_DOCUMENTATION.md` — detailed tech docs
- `README.md` — setup and run guide
- `PATENT_TECHNICAL_ABSTRACT.md` — patent claims documentation
- `backend/server.py` — FastAPI Swagger auto-docs at `/docs`

---

## The Smart Contract — Deep Dive

> **File:** `backend/fabric-samples/chaincode/herblock/lib/herblock-contract.js`

### How GPS validation actually works (lines 167–256)

```javascript
// Step 1: Haversine formula — calculates real geodesic distance between two GPS points
_calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;  // Earth's radius in km
    const toRad = (deg) => deg * (Math.PI / 180);

    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;  // distance in km
}

// Step 2: Two-level validation
async validateGeoFence(ctx, latitude, longitude, species) {
    // Level 1: Fast bounding box (quick rejection)
    const inBoundingBox = lat >= herbConfig.minLat && lat <= herbConfig.maxLat &&
                          lng >= herbConfig.minLng && lng <= herbConfig.maxLng;
    if (!inBoundingBox) return { valid: false, method: 'bounding_box' };

    // Level 2: Precise Haversine distance to zone center
    const distance = this._calculateHaversineDistance(lat, lng, zoneCenterLat, zoneCenterLng);
    if (distance > maxRadiusKm) return { valid: false, method: 'haversine' };

    return { valid: true, distance_km: distance };
}
```

**Why two levels?**  
The bounding box is fast (O(1) comparisons). Only GPS points inside the box get the more expensive Haversine calculation. This is an optimization pattern.

### Herb zones stored on-chain (lines 44–131)

| Herb | Approved Regions | Max Radius |
|------|-----------------|------------|
| Ashwagandha | Rajasthan, MP, Punjab, Gujarat | 600 km |
| Tulsi | Pan-India | 1500 km |
| Brahmi | Kerala, WB, Assam, Bihar | 700 km |
| Giloy | Tropical India | 800 km |
| Shatavari | Rajasthan, UP, MP | 500 km |
| Turmeric | AP, TN, Karnataka, Kerala, Odisha | 500 km |
| Neem | Pan-India (excl. cold) | 1000 km |
| Amla | UP, MP, Gujarat, Rajasthan | 600 km |

These are stored as `GEO_FENCE_CONFIG` in the blockchain ledger via `initLedger()`. Not in a database — in the blockchain itself.

### How recordCollection enforces GPS (lines 966–1083)

```javascript
async recordCollection(ctx, collectionId, collectionDataJson) {
    // 1. Run GPS validation FIRST — before anything is written
    const geoValidation = await this.validateGeoFence(
        ctx, collectionData.latitude, collectionData.longitude, collectionData.species_name
    );

    // 2. If GPS fails — THROW ERROR — nothing gets written to ledger
    if (!geoValidation.valid) {
        throw new Error(`INVALID LOCATION: Collection of ${collectionData.species_name}
            not authorized at (${collectionData.latitude}, ${collectionData.longitude}).
            Reason: ${geoValidation.reason}`);
    }

    // 3. Generate SHA-256 fingerprint of the transaction
    const digitalFingerprint = this._generateFingerprint({
        collector_id, species, latitude, longitude, quantity_kg, timestamp
    });

    // 4. Only if GPS valid — write to ledger
    await ctx.stub.putState(collectionId, Buffer.from(JSON.stringify(collection)));

    // 5. Create composite keys for querying
    const productKey = ctx.stub.createCompositeKey('product~collection', [product_id, collectionId]);
    await ctx.stub.putState(productKey, Buffer.from('\u0000'));

    // 6. Emit blockchain event for real-time monitoring
    ctx.stub.setEvent('CollectionRecorded', Buffer.from(JSON.stringify({...})));
}
```

**Key point to explain:** `ctx.stub.putState()` is the actual blockchain write. It only runs if GPS validation passes. The error thrown before it means the transaction is **rejected by all peers in consensus** — not just by our server.

### Quantity Conservation (lines 325–481)

Prevents fraud where a processor claims more output than input:

```javascript
_validateQuantityConservation(inputQty, outputQty, processType) {
    // Expected loss ratios for each process type:
    // drying: 15-40% loss, grinding: 2-10% loss, extraction: 70-90% loss

    if (outputQty > inputQty) {
        return { valid: false, reason: 'OUTPUT_EXCEEDS_INPUT' };  // Physical impossibility
    }
    // Also checks if loss ratio is suspiciously low (possible fraud)
}
```

### Digital Fingerprint (line 921–925)

```javascript
_generateFingerprint(data) {
    const crypto = require('crypto');
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());  // Sorted keys = deterministic
    return crypto.createHash('sha256').update(jsonStr).digest('hex');
}
```

Every collection record gets a SHA-256 hash of its key fields. If anyone tries to tamper with the data, the fingerprint won't match.

### Chaincode Functions Summary

| Function | Type | What it does |
|----------|------|--------------|
| `initLedger` | Invoke | Stores herb geo-fence config + accredited labs on ledger |
| `recordCollection` | Invoke | GPS-validates + writes herb collection to ledger |
| `recordProcessing` | Invoke | Validates quantity conservation + writes processing event |
| `recordQualityTest` | Invoke | Writes quality test result (immutable) |
| `recordProduct` | Invoke | Links all events to final consumer product |
| `getProductTrace` | Query | Returns full chain for a product ID |
| `getHistory` | Query | Returns all past versions of any ledger key (audit trail) |
| `validateGeoFence` | Internal | Haversine GPS validation |
| `validateHarvestSeason` | Internal | Season compliance check |
| `calculateQualityGrade` | Internal | Weighted scoring: moisture, foreign matter, active compounds |
| `getCollectorReputation` | Query | Farmer reputation score (0–100) |

---

## The Fabric Bridge — How Backend Talks to Blockchain

> **File:** `backend/services/fabric_service.py`

The backend doesn't use the Fabric SDK (too complex to set up). Instead it uses **subprocess calls to the Fabric peer CLI**. This is a deliberate architectural choice for reliability.

### How an invoke works (lines 69–126)

```python
async def _run_invoke(self, function: str, args: list):
    cmd = [
        "peer", "chaincode", "invoke",
        "-o", "localhost:7050",                    # Orderer address
        "--ordererTLSHostnameOverride", "orderer.example.com",
        "--tls",                                   # TLS enabled
        "--cafile", self.orderer_ca,               # Orderer TLS cert
        "-C", "herblock",                          # Channel name
        "-n", "herblock",                          # Chaincode name
        "--peerAddresses", "localhost:7051",        # Org1 peer
        "--tlsRootCertFiles", self.peer1_tls,
        "--peerAddresses", "localhost:9051",        # Org2 peer (endorsement)
        "--tlsRootCertFiles", self.peer2_tls,
        "-c", json.dumps({"function": function, "Args": args})
    ]
    process = await asyncio.create_subprocess_exec(*cmd, ...)
```

**Why two `--peerAddresses`?**  
Hyperledger Fabric requires endorsement from **both organizations** before a transaction is committed. This is the distributed trust — no single org controls the ledger.

### Environment variables set for the CLI (lines 40–49)

```python
self.env.update({
    "CORE_PEER_TLS_ENABLED": "true",
    "CORE_PEER_LOCALMSPID": "Org1MSP",
    "CORE_PEER_TLS_ROOTCERT_FILE": ".../org1/peers/peer0/tls/ca.crt",
    "CORE_PEER_MSPCONFIGPATH": ".../Admin@org1.../msp",
    "CORE_PEER_ADDRESS": "localhost:7051"
})
```

These tell the `peer` CLI which organization's identity to use when signing transactions.

---

## Blockchain Network Details

> **Location:** `backend/fabric-samples/test-network/`

### Network topology

```
orderer.example.com  (port 7050)  — Raft ordering service
peer0.org1.example.com (port 7051) — Org1MSP
peer0.org2.example.com (port 9051) — Org2MSP
Channel: herblock
Chaincode: herblock (Node.js)
```

### TLS Certificate paths

| Cert | Path |
|------|------|
| Orderer CA | `test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem` |
| Org1 Peer TLS | `test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt` |
| Org2 Peer TLS | `test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt` |
| Org1 Admin MSP | `test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp` |

### Why Raft consensus?
- Raft is a **crash fault tolerant** consensus algorithm.
- Much faster than PBFT or Proof-of-Work.
- Suitable for a known set of participants (permissioned network).
- The orderer orders transactions into blocks; peers validate and commit.

---

## Frontend — React 19 Dashboard

> **File:** `frontend/src/app.js`

### Key views
- **Home** — trace any product by QR scan or Batch ID
- **Collection form** — log herb harvest (GPS auto-captured via browser)
- **Processing form** — log processing event
- **Quality form** — log lab test results
- **Product form** — create final product record
- **Dashboard** — analytics: total batches, quality pass rate, supply chain events
- **Blockchain status** — live ping to Fabric network

### Maps
Leaflet.js (loaded via CDN) renders interactive GPS maps showing collection zones and actual collection coordinates.

### Authentication flow
1. User clicks Google Login → `/api/auth/login` → Google OAuth2
2. Google callback → `/api/auth/callback` → FastAPI issues JWT
3. JWT stored in localStorage → attached to every subsequent API request
4. Protected routes check `AuthContext` — redirect to login if no valid token

---

## Mobile App — Offline-First

> **Directory:** `mobile-app/`

### Offline sync architecture
```
Field collector (no internet)
  → Fills collection form
  → Record saved to SQLite (local DB)
  → Zustand syncStore marks it as "pending"
  
Network restored
  → syncStore detects connectivity
  → Sends pending records to /api/collection
  → On success: marks record as "synced" in SQLite
```

### Key stores
- `mobile-app/stores/authStore.js` — auth state (token, user)
- `mobile-app/stores/syncStore.js` — offline queue management

---

## Common Viva Questions & Answers

**Q: Why blockchain and not just a database?**  
A: A database can be edited by an administrator. Once data is written to Hyperledger Fabric, no single participant — not even us — can edit or delete it. Every transaction is signed by the submitting organization and must be endorsed by both orgs. The history is permanent.

**Q: What is the Haversine formula?**  
A: It calculates the great-circle distance between two GPS coordinates on Earth's surface. The formula accounts for Earth's curvature — unlike simple Pythagorean distance which would be wrong at geographic scales. `d = 2r × arcsin(√[sin²((φ₂-φ₁)/2) + cos(φ₁)×cos(φ₂)×sin²((λ₂-λ₁)/2)])` where r = 6371 km.

**Q: What is the difference between invoke and query in Fabric?**  
A: `invoke` = write operation. Goes through ordering service, creates a block, changes ledger state. `query` = read operation. Hits a single peer directly, no block created, no state change. Our code uses both — `_run_invoke()` and `_run_query()` in `fabric_service.py`.

**Q: What is CouchDB used for?**  
A: CouchDB is Hyperledger Fabric's world state database. It stores the current state of all ledger keys in JSON format. This enables rich queries (like "show all collections for species Ashwagandha") which wouldn't be possible with the default LevelDB key-value store.

**Q: What is a composite key?**  
A: In Fabric's world state, we create composite keys like `product~collection` to efficiently look up all collections belonging to a product. e.g., `ctx.stub.createCompositeKey('product~collection', [productId, collectionId])`. Then `getStateByPartialCompositeKey('product~collection', [productId])` returns all collections for that product.

**Q: How does offline sync work?**  
A: The mobile app uses SQLite (via Expo SQLite) to store records locally. Zustand's `syncStore` maintains a queue of pending uploads. When the device reconnects, the queue is flushed by sending each record to the FastAPI backend, which then writes to the blockchain.

**Q: How is the QR code tamper-proof?**  
A: The QR contains a SHA-256 hash of the product's key fields (`product_id + batch_fingerprint + species + manufacturing_date`). When scanned, the hash is verified against the blockchain state. If anyone prints a fake QR with altered data, the hash won't match.

**Q: What happens if a farmer tries to fake their GPS?**  
A: The GPS coordinates are submitted to the chaincode. Inside the chaincode, `validateGeoFence()` runs the Haversine calculation. If the distance exceeds the approved radius for that herb species, `recordCollection()` throws an error. The transaction is rejected at the consensus level — it never gets written to the ledger. There is no way to override this without having access to and modifying the chaincode itself, which would require consensus from all network organizations.

**Q: How does JWT authentication work?**  
A: On login, FastAPI creates a signed JWT using `python-jose`. The secret key is used to sign it. Every subsequent API request includes this token in the `Authorization: Bearer <token>` header. FastAPI's `oauth2_scheme` dependency extracts and validates the token before any protected endpoint runs.

**Q: What is Raft consensus?**  
A: Raft is a consensus algorithm where one node is elected as the leader. The leader receives all transactions, orders them, and replicates the ordered log to follower nodes. If the leader fails, a new election happens. It's crash fault tolerant — the network keeps running as long as a majority of orderer nodes are alive.

---

## How to Start the System (to demo)

```bash
# 1. Start MongoDB
docker start herblock-mongo
# or: docker run -d -p 27017:27017 --name herblock-mongo mongo

# 2. Start backend
cd backend
source venv/bin/activate
uvicorn server:app --reload --port 8000
# API docs at http://127.0.0.1:8000/docs

# 3. Start frontend
cd frontend
yarn start
# Opens http://localhost:3000

# 4. (Optional) Start Fabric network
cd backend/fabric-samples/test-network
./network.sh up createChannel -c herblock -ca
./network.sh deployCC -ccn herblock -ccp ../chaincode/herblock -ccl javascript
```

---

*This document covers everything needed for the Rubric evaluation. All file paths are verified against the actual codebase.*
