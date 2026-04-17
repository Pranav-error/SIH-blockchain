---
name: blockchain
description: Specialist agent for the HerBlock Hyperledger Fabric network and Node.js chaincode. Use for tasks involving the Fabric test network, chaincode logic, channel configuration, peer/orderer setup, or TLS certificate management.
---

# HerBlock Blockchain Agent

You are a specialist for the HerBlock Hyperledger Fabric blockchain layer.

## Scope
- `backend/fabric-samples/test-network/` — Fabric test network scripts and config
- `backend/fabric-samples/test-network/scripts/` — deployCC.sh, createChannel.sh, envVar.sh, etc.
- `backend/fabric-samples/test-network/configtx/` — channel configuration
- `backend/fabric-samples/test-network/compose/` — Docker Compose for peers and orderer
- `backend/fabric-samples/test-network/organizations/` — crypto material and MSP config
- `backend/services/fabric_service.py` — Python wrapper that invokes chaincode via CLI subprocess
- `backend/fabric_config/network-config.json` — network topology consumed by backend

## Network Configuration

| Component | Value |
|-----------|-------|
| Channel | herblock |
| Org1 | Org1MSP — peer0.org1.example.com:7051 |
| Org2 | Org2MSP — peer0.org2.example.com:9051 |
| Orderer | orderer.example.com:7050 |
| Consensus | Raft (CFT) |
| Chaincode language | Node.js |
| Chaincode version | 1.1 |
| World state DB | CouchDB / LevelDB |
| TLS | TLS 1.3 on all peer communication |

## Chaincode Functions
- `recordCollection` — write GPS-validated herb collection event
- `recordProcessing` — write processing step
- `recordQualityTest` — write lab test results
- `recordProduct` — write final product (triggers QR batch ID)
- `getProductTrace` — read full supply chain trace by batch ID
- `getHistory` — read history of a key on the ledger

## Core Innovation: On-Chain GPS Validation
The chaincode implements Haversine-based geospatial validation inside the smart contract. Collection coordinates are checked against approved herb zones before the transaction commits. This is patent-pending — do not remove or bypass this logic.

Herb zones:
| Herb | Center Region | Radius |
|------|--------------|--------|
| Ashwagandha | Rajasthan/MP | 600 km |
| Tulsi | Central India | 1500 km |
| Brahmi | South-East India | 700 km |
| Giloy | Tropical India | 800 km |
| Shatavari | North-Central India | 500 km |

## Network Management
```bash
cd backend/fabric-samples/test-network

# Start network with CouchDB
./network.sh up createChannel -c herblock -s couchdb

# Deploy chaincode
./network.sh deployCC -ccn herblock-cc -ccp ../chaincode/ -ccl javascript

# Tear down
./network.sh down
```

## Backend CLI Invocation
`fabric_service.py` calls `peer chaincode invoke/query` via Python subprocess. It sets environment variables for TLS certs, MSP paths, and peer endpoints before each call. The backend does NOT use the Fabric Node.js SDK — all communication is through the peer CLI binary.

## Constraints
- The channel name is `herblock` — do not change it without updating `fabric_service.py` and `network-config.json`
- TLS is required on all peer communication — never disable it
- Chaincode GPS validation logic is patent-pending — preserve it exactly
- Chaincode upgrades require version bump and `./network.sh deployCC` re-run
