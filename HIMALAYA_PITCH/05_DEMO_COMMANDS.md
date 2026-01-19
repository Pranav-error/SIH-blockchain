# 🔧 DEMO COMMANDS - Quick Reference
## Commands to Run During Himalaya Presentation

---

## PRE-MEETING SETUP

### 1. Start Blockchain Network (10 min before meeting)

```bash
cd ~/fabric-samples/test-network
./network.sh up createChannel -ca -c herblock
./network.sh deployCC -ccn herblock -ccp ../chaincode/herblock -ccl javascript
```

### 2. Start Backend Server

```bash
cd /Users/saipranav/Documents/GitHub/SIH-blockchain/backend
source venv/bin/activate
python server.py
```

### 3. Start Frontend (optional, can use deployed version)

```bash
cd /Users/saipranav/Documents/GitHub/SIH-blockchain/frontend
npm start
```

### 4. Verify Blockchain is Running

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

Expected output:
```
NAMES                              STATUS
dev-peer0.org2.example.com-...     Up X minutes
dev-peer0.org1.example.com-...     Up X minutes
peer0.org2.example.com             Up X minutes
peer0.org1.example.com             Up X minutes
orderer.example.com                Up X minutes
ca_orderer                         Up X minutes
ca_org2                            Up X minutes
ca_org1                            Up X minutes
```

---

## DURING PRESENTATION

### Demo 1: Show Blockchain is Real

```bash
# Show running containers
docker ps | head -10

# Show channel info
docker exec peer0.org1.example.com peer channel list
```

**SAY:** "These are real blockchain nodes running - the same technology used by Walmart and IBM Food Trust."

---

### Demo 2: Valid Collection (MP Coordinates)

**API Call:**
```bash
curl -X POST http://localhost:8000/api/blockchain/collection \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "ASHWA-DEMO-HIMAL-001",
    "species": "Ashwagandha",
    "gps": {
      "lat": 23.2599,
      "lon": 77.4126
    },
    "collector_id": "COL-MP-DEMO-01",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**SAY:** "Watch - GPS coordinates from Madhya Pradesh, valid Ashwagandha zone..."

**Expected Response:**
```json
{
  "success": true,
  "geo_validated": true,
  "message": "Collection recorded on blockchain"
}
```

**SAY:** "See `geo_validated: true`? The smart contract validated this location using the Haversine formula before accepting."

---

### Demo 3: Invalid Collection - THE KEY DEMO (Kashmir Coordinates)

**API Call:**
```bash
curl -X POST http://localhost:8000/api/blockchain/collection \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "ASHWA-FRAUD-TEST-001",
    "species": "Ashwagandha",
    "gps": {
      "lat": 34.0837,
      "lon": 74.7973
    },
    "collector_id": "COL-FRAUD-01",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**SAY:** "Now watch THIS. Same request, but with GPS coordinates from **Kashmir** - NOT an approved zone for Ashwagandha..."

**Expected Response:**
```json
{
  "success": false,
  "error": "GPS validation failed: Location outside approved collection zone"
}
```

**SAY:** (with emphasis)
> "**REJECTED.** The blockchain itself rejected this transaction. 
> 
> This is the breakthrough - the smart contract calculated the distance using the Haversine formula and determined this location is 1,200+ kilometers from approved zones.
>
> No matter how sophisticated a fraudster is, they **cannot** bypass this. The math doesn't lie."

---

### Demo 4: Complete Trace

**API Call:**
```bash
curl -X GET "http://localhost:8000/api/blockchain/trace/ASHWA-TRACE-001"
```

**Or open in browser:**
- Local: http://localhost:3000/trace/ASHWA-TRACE-001
- Live: https://sih-blockchain.vercel.app/trace/ASHWA-TRACE-001

**SAY:** "Here's the complete journey of a product - collection, processing, quality testing. The QR code links directly to this trace."

---

### Demo 5: QR Code Scan

**Show on screen:**
- Open: https://sih-blockchain.vercel.app/trace/ASHWA-TRACE-001
- Point phone camera at QR code displayed
- Show how it opens the trace page

**SAY:** "Any smartphone can scan this. Your customer verifies authenticity in 5 seconds - no app download required."

---

## QUICK RECOVERY COMMANDS

### If Backend Crashes:
```bash
cd /Users/saipranav/Documents/GitHub/SIH-blockchain/backend
source venv/bin/activate
python server.py
```

### If Docker Shows No Containers:
```bash
cd ~/fabric-samples/test-network
./network.sh up createChannel -ca -c herblock
./network.sh deployCC -ccn herblock -ccp ../chaincode/herblock -ccl javascript
```

### If Connection Refused:
```bash
# Check if backend is running
lsof -i :8000

# Check if blockchain is running
docker ps | grep peer
```

---

## BACKUP DEMO (If Live Demo Fails)

Have these screenshots ready:
1. `docker ps` output showing nodes
2. Successful collection response (geo_validated: true)
3. Failed collection response (GPS validation failed)
4. Trace page with full journey
5. QR code scan working

**Location:** Save in `/Users/saipranav/Documents/GitHub/SIH-blockchain/HIMALAYA_PITCH/demo_screenshots/`

---

## POST-DEMO NOTES

After successful demo, be ready for:

1. **"Can we see the smart contract code?"**
   - Show: `backend/fabric-samples/chaincode/herblock/lib/herblock-contract.js`
   - Point to `validateGeoFence()` function

2. **"How is Haversine calculated?"**
   - Show the formula in the code
   - Explain: Great circle distance between two GPS points

3. **"What's the response time?"**
   - Typically 1-3 seconds for transactions
   - Query traces are < 500ms

---

**PRO TIP:** Practice this demo 5 times before the meeting. Know these commands by heart.
