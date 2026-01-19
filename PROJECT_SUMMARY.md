# HerBlock - Ayurvedic Herb Traceability System

## 🌿 PROJECT SUMMARY

**Patent Pending** - Indian Patent Office

### Innovation: GPS Geo-Fence Validation on Hyperledger Fabric Blockchain

---

## 🚀 What Was Built

HerBlock is a **production-ready** blockchain-based traceability system for Ayurvedic herbs, built with:

### Backend
- **FastAPI** (Python 3.13) - High-performance REST API
- **Hyperledger Fabric 2.4.7** - Enterprise blockchain network
- **MongoDB** - Document database for fast queries
- **JWT Authentication** - Secure user management

### Frontend
- **React 19** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Leaflet Maps** - GPS location visualization

### Blockchain Network
- **Channel**: `herblock`
- **Chaincode**: `herblock` v1.1 (JavaScript/Node.js)
- **Organizations**: Org1MSP, Org2MSP
- **Peers**: peer0.org1 (port 7051), peer0.org2 (port 9051)
- **Orderer**: orderer.example.com (port 7050)

---

## 📜 PATENT FEATURES

### 1. GPS Geo-Fence Validation (Core Innovation)
The system validates that herb collection coordinates fall within approved geographical regions for each species.

**Example**: Ashwagandha can only be collected from:
- Rajasthan
- Madhya Pradesh
- Punjab
- Gujarat

**Result**: Collections from Kashmir (lat: 35°N) are **REJECTED** with error:
```json
{
  "success": false,
  "error": "geo_validation_failed",
  "message": "INVALID LOCATION: Collection of Ashwagandha not authorized at coordinates (35.0, 77.0)"
}
```

### 2. Immutable Supply Chain Records
All events are recorded on Hyperledger Fabric with:
- Cryptographic signatures from multiple organizations
- Transaction history (audit trail)
- Tamper-proof data storage

### 3. Multi-Stakeholder Consensus
Both Org1MSP and Org2MSP must endorse transactions, ensuring:
- No single party can manipulate records
- Transparent governance
- Regulatory compliance

---

## 🧪 TESTED & VERIFIED

### Successful Tests:
1. ✅ Network connection: `herblock` channel active
2. ✅ Collection recording with GPS validation
3. ✅ GPS rejection for unauthorized locations
4. ✅ Query collections from blockchain
5. ✅ Frontend-backend integration

### Sample Blockchain Record:
```json
{
  "id": "COLL-1A65D757",
  "species_name": "Ashwagandha",
  "latitude": 23.5,
  "longitude": 77.2,
  "location_name": "Bhopal Forest",
  "state": "Madhya Pradesh",
  "quantity_kg": 25,
  "geo_validated": true,
  "blockchain_verified": true
}
```

---

## 🌐 API ENDPOINTS

### Blockchain Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockchain/status` | Network status |
| POST | `/api/blockchain/collection` | Record collection |
| GET | `/api/blockchain/collection/{id}` | Get collection |
| POST | `/api/blockchain/quality-test` | Record quality test |
| POST | `/api/blockchain/processing` | Record processing |
| POST | `/api/blockchain/product` | Record product |
| GET | `/api/blockchain/trace/{id}` | Full traceability |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token` | Login |
| POST | `/api/register` | Register |

---

## 💡 FOR PATENT APPLICATION

### Title
"GPS-Validated Blockchain Traceability System for Ayurvedic Herb Supply Chain"

### Key Claims
1. Method for validating geographic coordinates of herb collection against species-specific geo-fences
2. System combining GPS validation with multi-stakeholder blockchain consensus
3. Apparatus for rejecting supply chain entries from unauthorized collection locations

### Technical Differentiators
- First-of-its-kind GPS validation in herb blockchain
- Enterprise-grade Hyperledger Fabric (not public blockchain)
- India-specific herb geo-fence database
- Immutable audit trail with multi-organization endorsement

---

## 📊 PROJECT STATISTICS

| Metric | Value |
|--------|-------|
| Backend Lines of Code | ~1,500 |
| Smart Contract LOC | ~600 |
| Frontend Components | 15+ |
| Supported Herb Species | 8 |
| Docker Containers | 6 |
| API Endpoints | 20+ |
| Organizations | 2 |

---

## 🎓 FOR STUDENT PRESENTATION

### Problem Statement (SIH 2024)
- Lack of traceability in Ayurvedic herb supply chain
- Counterfeit/adulterated herbs reaching consumers
- No verification of sourcing location

### Solution
- Real-time GPS-validated collection recording
- Blockchain-immutable supply chain records
- End-to-end traceability via QR codes

### Innovation Score
- **Novelty**: GPS geo-fence validation (new)
- **Technical Complexity**: Hyperledger Fabric integration
- **Impact**: Consumer safety, farmer empowerment
- **Scalability**: Enterprise blockchain architecture

---

## 🚀 RUNNING THE PROJECT

```bash
# Start Hyperledger Fabric network
cd backend/fabric-samples/test-network
./network.sh up createChannel -c herblock

# Start Backend
cd backend
source venv/bin/activate
uvicorn server:app --reload

# Start Frontend
cd frontend
npm start
```

**URLs:**
- Frontend: http://localhost:3001
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

---

## 📞 CONTACT

For patent inquiries: [Your Details]
Indian Patent Office Reference: [To be assigned]

---

*Built with ❤️ for Smart India Hackathon 2024*
*Copyright © 2026 HerBlock India*
