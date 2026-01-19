# HerBlock System Architecture
## Hyperledger Fabric Blockchain for Ayurvedic Herb Traceability

```
                            ╔══════════════════════════════════════════════════════════════╗
                            ║                    HERBLOCK ARCHITECTURE                      ║
                            ║         GPS-Validated Ayurvedic Herb Traceability            ║
                            ╚══════════════════════════════════════════════════════════════╝


    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                                    USER LAYER                                            │
    │                                                                                          │
    │   👨‍🌾 Collector          🏭 Processor          🔬 QC Lab           👤 Consumer           │
    │   (Mobile App)         (Web Portal)        (Web Portal)       (QR Scanner)           │
    │        │                    │                   │                   │                   │
    └────────┼────────────────────┼───────────────────┼───────────────────┼───────────────────┘
             │                    │                   │                   │
             ▼                    ▼                   ▼                   ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              FRONTEND LAYER (React)                                      │
    │                                                                                          │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
    │  │  Collection  │  │  Processing  │  │   Quality    │  │    Trace     │                │
    │  │    Form      │  │    Form      │  │   Test Form  │  │    View      │                │
    │  │  + GPS 📍    │  │              │  │              │  │   + QR 📱    │                │
    │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘                │
    │                                                                                          │
    │                         URL: http://localhost:3001                                       │
    │                         Production: sih-blockchain.vercel.app                           │
    └─────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              │ REST API (JSON)
                                              ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              BACKEND LAYER (FastAPI/Python)                             │
    │                                                                                          │
    │  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
    │  │                           API ENDPOINTS                                          │   │
    │  │                                                                                  │   │
    │  │  POST /api/blockchain/collection    - Record herb collection with GPS           │   │
    │  │  POST /api/blockchain/processing    - Record processing step                    │   │
    │  │  POST /api/blockchain/quality-test  - Record quality test results               │   │
    │  │  POST /api/blockchain/product       - Create final product                      │   │
    │  │  GET  /api/blockchain/trace/{id}    - Get complete product trace                │   │
    │  │  GET  /api/blockchain/status        - Check blockchain network status           │   │
    │  │                                                                                  │   │
    │  └─────────────────────────────────────────────────────────────────────────────────┘   │
    │                                                                                          │
    │  ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐            │
    │  │  Fabric Service    │    │   Auth Service     │    │  MongoDB Service   │            │
    │  │  (Blockchain)      │    │   (JWT Tokens)     │    │  (User Data)       │            │
    │  └────────────────────┘    └────────────────────┘    └────────────────────┘            │
    │                                                                                          │
    │                              URL: http://localhost:8000                                  │
    └─────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              │ Peer CLI Commands
                                              ▼
    ╔═════════════════════════════════════════════════════════════════════════════════════════╗
    ║                         HYPERLEDGER FABRIC BLOCKCHAIN                                    ║
    ║                                                                                          ║
    ║  ┌─────────────────────────────────────────────────────────────────────────────────┐   ║
    ║  │                            CHANNEL: herblock                                     │   ║
    ║  │                                                                                  │   ║
    ║  │   ┌───────────────────┐              ┌───────────────────┐                      │   ║
    ║  │   │    ORGANIZATION 1 │              │    ORGANIZATION 2 │                      │   ║
    ║  │   │    (Government)   │              │    (Industry)     │                      │   ║
    ║  │   │                   │              │                   │                      │   ║
    ║  │   │  ┌─────────────┐  │              │  ┌─────────────┐  │                      │   ║
    ║  │   │  │   Peer 0    │  │◄────────────►│  │   Peer 0    │  │                      │   ║
    ║  │   │  │  Port 7051  │  │   Gossip     │  │  Port 9051  │  │                      │   ║
    ║  │   │  └─────────────┘  │   Protocol   │  └─────────────┘  │                      │   ║
    ║  │   │         │         │              │         │         │                      │   ║
    ║  │   │         ▼         │              │         ▼         │                      │   ║
    ║  │   │  ┌─────────────┐  │              │  ┌─────────────┐  │                      │   ║
    ║  │   │  │  Chaincode  │  │              │  │  Chaincode  │  │                      │   ║
    ║  │   │  │  (herblock) │  │              │  │  (herblock) │  │                      │   ║
    ║  │   │  └─────────────┘  │              │  └─────────────┘  │                      │   ║
    ║  │   │         │         │              │         │         │                      │   ║
    ║  │   │         ▼         │              │         ▼         │                      │   ║
    ║  │   │  ┌─────────────┐  │              │  ┌─────────────┐  │                      │   ║
    ║  │   │  │  World State│  │              │  │  World State│  │                      │   ║
    ║  │   │  │  (LevelDB)  │  │              │  │  (LevelDB)  │  │                      │   ║
    ║  │   │  └─────────────┘  │              │  └─────────────┘  │                      │   ║
    ║  │   │                   │              │                   │                      │   ║
    ║  │   └───────────────────┘              └───────────────────┘                      │   ║
    ║  │                                                                                  │   ║
    ║  │                              ┌───────────────────┐                              │   ║
    ║  │                              │     ORDERER       │                              │   ║
    ║  │                              │    Port 7050      │                              │   ║
    ║  │                              │  (Raft Consensus) │                              │   ║
    ║  │                              └───────────────────┘                              │   ║
    ║  │                                                                                  │   ║
    ║  └─────────────────────────────────────────────────────────────────────────────────┘   ║
    ║                                                                                          ║
    ╚═════════════════════════════════════════════════════════════════════════════════════════╝


    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              SMART CONTRACT (Chaincode)                                  │
    │                                                                                          │
    │  ╔═══════════════════════════════════════════════════════════════════════════════════╗  │
    │  ║                    🔒 GPS GEO-FENCE VALIDATION (PATENT INNOVATION)                 ║  │
    │  ╚═══════════════════════════════════════════════════════════════════════════════════╝  │
    │                                                                                          │
    │  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
    │  │  VALID COLLECTION ZONES:                                                         │   │
    │  │                                                                                  │   │
    │  │  📍 Madhya Pradesh  (23.2599°N, 77.4126°E)  - Ashwagandha, Safed Musli          │   │
    │  │  📍 Uttarakhand     (30.0668°N, 79.0193°E)  - Himalayan herbs                    │   │
    │  │  📍 Kerala          (10.8505°N, 76.2711°E)  - Turmeric, Cardamom                 │   │
    │  │  📍 Rajasthan       (27.0238°N, 74.2179°E)  - Senna, Guggul                      │   │
    │  │  📍 Gujarat         (22.2587°N, 71.1924°E)  - Isabgol, Cumin                     │   │
    │  │  📍 Karnataka       (15.3173°N, 75.7139°E)  - Neem, Sandalwood                   │   │
    │  │  📍 Tamil Nadu      (11.1271°N, 78.6569°E)  - Senna, Aloe Vera                   │   │
    │  │  📍 Himachal Pradesh(31.1048°N, 77.1734°E)  - Himalayan herbs                    │   │
    │  │                                                                                  │   │
    │  └─────────────────────────────────────────────────────────────────────────────────┘   │
    │                                                                                          │
    │  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
    │  │  VALIDATION PROCESS:                                                             │   │
    │  │                                                                                  │   │
    │  │    Input GPS ──► Haversine Distance Calc ──► Zone Check ──► Accept/Reject       │   │
    │  │                                                                                  │   │
    │  │    ✅ Within Zone (< radius km) ──► Record on Blockchain                        │   │
    │  │    ❌ Outside Zone ──► REJECT TRANSACTION                                        │   │
    │  │                                                                                  │   │
    │  └─────────────────────────────────────────────────────────────────────────────────┘   │
    │                                                                                          │
    └─────────────────────────────────────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              DATA FLOW EXAMPLE                                           │
    │                                                                                          │
    │  1. COLLECTION (Farmer in Madhya Pradesh)                                               │
    │     ┌──────────────────────────────────────────────────────────────────────────────┐   │
    │     │  📱 Mobile App sends:                                                         │   │
    │     │  {                                                                            │   │
    │     │    "species": "Ashwagandha",                                                  │   │
    │     │    "latitude": 23.2599,        ◄── GPS from device                           │   │
    │     │    "longitude": 77.4126,       ◄── GPS from device                           │   │
    │     │    "quantity_kg": 50,                                                         │   │
    │     │    "collector": "Rajesh Sharma"                                               │   │
    │     │  }                                                                            │   │
    │     │                                                                               │   │
    │     │  ✅ Smart Contract validates GPS ──► Records COLL-XXXXXXXX                   │   │
    │     └──────────────────────────────────────────────────────────────────────────────┘   │
    │                                           │                                             │
    │                                           ▼                                             │
    │  2. PROCESSING (Factory in Bhopal)                                                      │
    │     ┌──────────────────────────────────────────────────────────────────────────────┐   │
    │     │  🏭 Processing Portal sends:                                                  │   │
    │     │  {                                                                            │   │
    │     │    "source_collection": "COLL-XXXXXXXX",                                      │   │
    │     │    "process_type": "Drying and Grinding",                                     │   │
    │     │    "input_qty": 50, "output_qty": 45,                                         │   │
    │     │    "facility": "Bhopal Herbal Processing Center"                              │   │
    │     │  }                                                                            │   │
    │     │                                                                               │   │
    │     │  ✅ Records PROC-XXXXXXXX                                                     │   │
    │     └──────────────────────────────────────────────────────────────────────────────┘   │
    │                                           │                                             │
    │                                           ▼                                             │
    │  3. QUALITY TEST (NABL Lab in Delhi)                                                    │
    │     ┌──────────────────────────────────────────────────────────────────────────────┐   │
    │     │  🔬 Lab Portal sends:                                                         │   │
    │     │  {                                                                            │   │
    │     │    "test_type": "Withanolides Content",                                       │   │
    │     │    "result": "2.5%",                                                          │   │
    │     │    "pass_fail": "PASS",                                                       │   │
    │     │    "certificate": "AYUSH-QC-2026-5678"                                        │   │
    │     │  }                                                                            │   │
    │     │                                                                               │   │
    │     │  ✅ Records QT-XXXXXXXX                                                       │   │
    │     └──────────────────────────────────────────────────────────────────────────────┘   │
    │                                           │                                             │
    │                                           ▼                                             │
    │  4. FINAL PRODUCT (Manufacturer)                                                        │
    │     ┌──────────────────────────────────────────────────────────────────────────────┐   │
    │     │  📦 Creates final product linking all records:                                │   │
    │     │  {                                                                            │   │
    │     │    "product_id": "ASHWA-TRACE-001",                                           │   │
    │     │    "name": "Ashwagandha Root Powder",                                         │   │
    │     │    "collections": ["COLL-XXXXXXXX"],                                          │   │
    │     │    "processing": ["PROC-XXXXXXXX"],                                           │   │
    │     │    "quality_tests": ["QT-XXXXXXXX"]                                           │   │
    │     │  }                                                                            │   │
    │     │                                                                               │   │
    │     │  ✅ Generates QR Code for consumer verification                              │   │
    │     └──────────────────────────────────────────────────────────────────────────────┘   │
    │                                                                                          │
    └─────────────────────────────────────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              SECURITY FEATURES                                           │
    │                                                                                          │
    │  🔐 Multi-Organization Endorsement                                                      │
    │     └── Both Org1 AND Org2 must sign every transaction                                 │
    │                                                                                          │
    │  🔐 TLS Encryption                                                                       │
    │     └── All peer-to-peer communication is encrypted                                     │
    │                                                                                          │
    │  🔐 MSP (Membership Service Provider)                                                    │
    │     └── Only authorized users can submit transactions                                   │
    │                                                                                          │
    │  🔐 Immutable Ledger                                                                     │
    │     └── Once written, records cannot be modified or deleted                             │
    │                                                                                          │
    │  🔐 GPS Validation (PATENT FEATURE)                                                      │
    │     └── Collections rejected if GPS is outside approved zones                           │
    │                                                                                          │
    └─────────────────────────────────────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                              DOCKER CONTAINERS                                           │
    │                                                                                          │
    │  $ docker ps                                                                            │
    │  ┌────────────────────────────┬─────────────┬─────────────────────────────────────┐    │
    │  │ CONTAINER NAME             │ STATUS      │ PORTS                               │    │
    │  ├────────────────────────────┼─────────────┼─────────────────────────────────────┤    │
    │  │ peer0.org1.example.com     │ Up 2 hours  │ 7051/tcp                            │    │
    │  │ peer0.org2.example.com     │ Up 2 hours  │ 9051/tcp                            │    │
    │  │ orderer.example.com        │ Up 2 hours  │ 7050/tcp                            │    │
    │  └────────────────────────────┴─────────────┴─────────────────────────────────────┘    │
    │                                                                                          │
    └─────────────────────────────────────────────────────────────────────────────────────────┘


    ╔══════════════════════════════════════════════════════════════════════════════════════════╗
    ║                                    PATENT CLAIMS                                          ║
    ╠══════════════════════════════════════════════════════════════════════════════════════════╣
    ║                                                                                           ║
    ║  CLAIM 1: A system for validating geographic origin of medicinal herbs using             ║
    ║           GPS coordinates validated against predefined geo-fenced zones on a             ║
    ║           distributed ledger technology (blockchain).                                    ║
    ║                                                                                           ║
    ║  CLAIM 2: A method for preventing fraudulent herb collection records by                  ║
    ║           rejecting blockchain transactions when GPS coordinates fall outside            ║
    ║           government-approved collection zones.                                          ║
    ║                                                                                           ║
    ║  CLAIM 3: A smart contract implementing Haversine distance calculation for               ║
    ║           real-time GPS validation in Hyperledger Fabric blockchain network.             ║
    ║                                                                                           ║
    ╚══════════════════════════════════════════════════════════════════════════════════════════╝


    Created: January 2026
    Version: 1.1
    Author: HerBlock Team
    Patent Status: Pending (Indian Patent Office)
```
