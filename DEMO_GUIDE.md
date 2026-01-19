# 🌿 HerBlock Demo Guide
## How to Demonstrate the Hyperledger Blockchain System

---

## 🎯 What is HerBlock?

**HerBlock** is a blockchain-powered traceability system for Ayurvedic herbs that uses **GPS geo-fencing** to ensure herbs are collected only from authentic, government-approved regions.

### The Problem We Solve:
- ❌ Fake Ayurvedic products flood the market
- ❌ No way to verify where herbs actually come from
- ❌ Adulteration and mislabeling is common
- ❌ Consumers can't trust product authenticity

### Our Solution:
- ✅ **GPS-validated collection** - Herbs must be collected from approved zones
- ✅ **Immutable blockchain records** - Cannot be tampered with
- ✅ **Complete traceability** - Farm to pharmacy tracking
- ✅ **QR code verification** - Consumers can verify authenticity

---

## 🔗 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│              sih-blockchain.vercel.app                      │
└─────────────────────┬───────────────────────────────────────┘
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI/Python)                   │
│                    Port 8000                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ Blockchain Transactions
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            HYPERLEDGER FABRIC BLOCKCHAIN                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Peer 0    │  │   Peer 1    │  │   Orderer   │         │
│  │  (Org1)     │  │  (Org2)     │  │             │         │
│  │  Port 7051  │  │  Port 9051  │  │  Port 7050  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  Channel: herblock    Chaincode: herblock v1.1              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Start the Demo

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your Mac.

### Step 2: Check Blockchain is Running
```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(peer|orderer)"
```

You should see:
```
peer0.org1.example.com    Up X hours
peer0.org2.example.com    Up X hours
orderer.example.com       Up X hours
```

### Step 3: Start the Backend
```bash
cd backend
source venv/bin/activate
python server.py
```

### Step 4: Start the Frontend
```bash
cd frontend
npm start
```

### Step 5: Open the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:8000/docs

---

## 🎬 Demo Script (What to Show)

### Part 1: Show the Blockchain Network (2 min)

**Terminal Command:**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(peer|orderer)"
```

**Explain:**
> "Here you can see our Hyperledger Fabric network running. We have:
> - **Two peer nodes** (Org1 and Org2) that validate transactions
> - **One orderer node** that sequences transactions
> - All running in Docker containers"

---

### Part 2: Show the Smart Contract (3 min)

**Open the file:** `backend/fabric-samples/chaincode/herblock/lib/herblock-contract.js`

**Key code to highlight:**

```javascript
// GPS Geo-fence Validation - OUR PATENT INNOVATION
_validateGeoLocation(latitude, longitude) {
    const VALID_ZONES = [
        { name: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, radius: 200 },
        { name: "Uttarakhand", lat: 30.0668, lng: 79.0193, radius: 150 },
        { name: "Kerala", lat: 10.8505, lng: 76.2711, radius: 100 },
        // ... more zones
    ];
    
    // Calculate distance using Haversine formula
    // REJECT if outside approved zones!
}
```

**Explain:**
> "This is our **patentable innovation**. The smart contract validates GPS coordinates 
> before accepting any herb collection. If someone tries to record a collection from 
> an unauthorized location - like Kashmir for Ashwagandha - the blockchain REJECTS it."

---

### Part 3: Live Demo - Record a Collection (5 min)

**Show the API endpoint:**
```bash
curl -X POST "http://localhost:8000/api/blockchain/collection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "product_id": "DEMO-PRODUCT-001",
    "species_name": "Ashwagandha",
    "latitude": 23.2599,
    "longitude": 77.4126,
    "location_name": "Narmada Valley, MP",
    "quantity_kg": 25
  }'
```

**Explain:**
> "Watch what happens when I submit this collection with GPS coordinates from 
> Madhya Pradesh - a valid Ashwagandha growing region..."

**Show the response:**
```json
{
  "success": true,
  "collection_id": "COLL-XXXXXXXX",
  "geo_validated": true,  // <-- GPS VALIDATED!
  "blockchain_tx": "abc123..."
}
```

---

### Part 4: Show GPS Rejection (3 min)

**Try invalid coordinates:**
```bash
curl -X POST "http://localhost:8000/api/blockchain/collection" \
  -H "Content-Type: application/json" \
  -d '{
    "species_name": "Ashwagandha",
    "latitude": 34.0837,
    "longitude": 74.7973,
    "location_name": "Kashmir"
  }'
```

**Show the REJECTION:**
```json
{
  "success": false,
  "error": "GPS validation failed: Location not in approved herb collection zone"
}
```

**Explain:**
> "See! The blockchain REJECTED this because Kashmir is NOT an approved zone 
> for Ashwagandha collection. This prevents fraud at the source!"

---

### Part 5: Trace a Product (3 min)

**Open in browser:** `http://localhost:3001/trace/ASHWA-TRACE-001`

**Show:**
- Product information
- Collection events with GPS badges
- Processing steps
- Quality test results
- QR code for verification

**Explain:**
> "Any consumer can scan the QR code and see the complete journey of their 
> Ayurvedic product - from the exact GPS location where it was collected, 
> through processing, quality testing, to the final product."

---

## 📊 Key Numbers to Mention

| Metric | Value |
|--------|-------|
| Blockchain Type | Hyperledger Fabric 2.4.7 |
| Consensus | Raft (enterprise-grade) |
| Peer Nodes | 2 (multi-organization) |
| Smart Contract Version | v1.1 |
| GPS Zones Configured | 15+ Indian states |
| Supported Herb Species | 50+ Ayurvedic herbs |

---

## 🏆 What Makes This Patent-Worthy?

### Innovation 1: GPS Geo-fence on Blockchain
- **First system** to validate herb collection location on-chain
- Prevents fraud at the SOURCE, not after the fact
- Immutable proof of origin

### Innovation 2: Multi-Organization Consensus
- Both government (Org1) and industry (Org2) must validate
- Prevents single-point-of-failure
- Enterprise-grade security

### Innovation 3: Complete Supply Chain
- Collection → Processing → Quality Test → Product
- Every step recorded on blockchain
- Full audit trail

---

## 🎤 Elevator Pitch (30 seconds)

> "HerBlock uses Hyperledger Fabric blockchain with GPS geo-fencing to ensure 
> Ayurvedic herbs are collected only from authentic, government-approved regions. 
> When a collector tries to record a harvest, our smart contract validates their 
> GPS coordinates against approved zones. If they're outside the zone - the 
> blockchain rejects it. This is the first system that prevents herb fraud at 
> the source, not after the fake product is already in the market."

---

## 📱 QR Code Demo

Show the QR code on the trace page and explain:
> "Consumers can scan this QR code with their phone to instantly verify:
> - Where the herbs were collected (GPS coordinates)
> - Who collected them
> - Processing facility details
> - Quality test results
> - All secured on blockchain and impossible to fake"

---

## ❓ Common Questions & Answers

**Q: Why Hyperledger Fabric instead of Ethereum?**
> "Hyperledger Fabric is designed for enterprise use. It's permissioned (only authorized 
> parties can participate), has no cryptocurrency/gas fees, and is used by IBM, Walmart, 
> and major pharmaceutical companies."

**Q: Can someone fake the GPS coordinates?**
> "The GPS comes from the mobile device, and we can add additional verification like 
> device attestation. But even if someone fakes GPS, the blockchain creates an immutable 
> record - any audit would reveal inconsistencies."

**Q: How is this different from a regular database?**
> "A database can be edited by an admin. Blockchain is IMMUTABLE - once a record is 
> written, it cannot be changed, even by us. Plus, multiple organizations must agree 
> on every transaction."

**Q: What's the cost to run this?**
> "Hyperledger has no transaction fees like Ethereum. The only cost is server hosting. 
> For a pilot, it can run on a single server for under ₹5,000/month."

---

## 📁 Files to Show During Demo

1. **Smart Contract:** `backend/fabric-samples/chaincode/herblock/lib/herblock-contract.js`
2. **Backend Service:** `backend/services/fabric_service.py`
3. **API Docs:** `http://localhost:8000/docs`
4. **Frontend Trace:** `http://localhost:3001/trace/ASHWA-TRACE-001`
5. **Docker Containers:** `docker ps`

---

## 🎯 Demo Checklist

Before presenting:
- [ ] Docker Desktop is running
- [ ] All 3 containers are up (2 peers + 1 orderer)
- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 3001
- [ ] Test the trace page works
- [ ] Have terminal ready for live commands
- [ ] Product ASHWA-TRACE-001 exists in blockchain

---

*Created for HerBlock Patent Demo - January 2026*
