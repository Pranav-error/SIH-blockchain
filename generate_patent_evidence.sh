#!/bin/bash

# HerBlock Demo Evidence Generator
# Run this script to generate screenshots/logs for patent documentation

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         HERBLOCK BLOCKCHAIN EVIDENCE GENERATOR               ║"
echo "║         For Patent Documentation                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Create evidence directory
EVIDENCE_DIR="patent_evidence_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EVIDENCE_DIR"

echo "📁 Creating evidence directory: $EVIDENCE_DIR"
echo ""

# 1. Docker Containers Status
echo "1️⃣  Capturing Docker container status..."
echo "=== HYPERLEDGER FABRIC DOCKER CONTAINERS ===" > "$EVIDENCE_DIR/01_docker_containers.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/01_docker_containers.txt"
echo "" >> "$EVIDENCE_DIR/01_docker_containers.txt"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(peer|orderer|NAMES)" >> "$EVIDENCE_DIR/01_docker_containers.txt"
echo "✅ Docker status captured"

# 2. Blockchain Network Status
echo "2️⃣  Capturing blockchain network status..."
echo "=== HERBLOCK NETWORK STATUS ===" > "$EVIDENCE_DIR/02_network_status.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/02_network_status.txt"
echo "" >> "$EVIDENCE_DIR/02_network_status.txt"
curl -s http://127.0.0.1:8000/api/blockchain/status 2>/dev/null | python3 -m json.tool >> "$EVIDENCE_DIR/02_network_status.txt" 2>&1 || echo "Backend not running" >> "$EVIDENCE_DIR/02_network_status.txt"
echo "✅ Network status captured"

# 3. Product Trace Data
echo "3️⃣  Capturing product trace data..."
echo "=== PRODUCT TRACE: ASHWA-TRACE-001 ===" > "$EVIDENCE_DIR/03_product_trace.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/03_product_trace.txt"
echo "" >> "$EVIDENCE_DIR/03_product_trace.txt"
curl -s "http://127.0.0.1:8000/api/blockchain/trace/ASHWA-TRACE-001" 2>/dev/null | python3 -m json.tool >> "$EVIDENCE_DIR/03_product_trace.txt" 2>&1 || echo "Backend not running" >> "$EVIDENCE_DIR/03_product_trace.txt"
echo "✅ Product trace captured"

# 4. Chaincode Query - All Collections
echo "4️⃣  Querying blockchain for all collections..."
echo "=== BLOCKCHAIN COLLECTIONS ===" > "$EVIDENCE_DIR/04_blockchain_collections.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/04_blockchain_collections.txt"
echo "" >> "$EVIDENCE_DIR/04_blockchain_collections.txt"

cd backend/fabric-samples/herblock-network 2>/dev/null && \
export PATH="${PWD}/../bin:$PATH" && \
export FABRIC_CFG_PATH="${PWD}/../config/" && \
export CORE_PEER_TLS_ENABLED=true && \
export CORE_PEER_LOCALMSPID="Org1MSP" && \
export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" && \
export CORE_PEER_MSPCONFIGPATH="${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" && \
export CORE_PEER_ADDRESS=localhost:7051 && \
peer chaincode query -C herblock -n herblock -c '{"function":"queryByDocType","Args":["collection"]}' 2>/dev/null | python3 -m json.tool >> "../../../$EVIDENCE_DIR/04_blockchain_collections.txt" 2>&1
cd - > /dev/null 2>&1
echo "✅ Collections captured"

# 5. Smart Contract Info
echo "5️⃣  Capturing smart contract details..."
echo "=== SMART CONTRACT: herblock v1.1 ===" > "$EVIDENCE_DIR/05_smart_contract.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/05_smart_contract.txt"
echo "" >> "$EVIDENCE_DIR/05_smart_contract.txt"
echo "Key Innovation: GPS Geo-fence Validation" >> "$EVIDENCE_DIR/05_smart_contract.txt"
echo "" >> "$EVIDENCE_DIR/05_smart_contract.txt"
echo "--- GPS VALIDATION CODE ---" >> "$EVIDENCE_DIR/05_smart_contract.txt"
grep -A 50 "_validateGeoLocation" backend/fabric-samples/herblock-network/chaincode/herblock-contract.js 2>/dev/null | head -60 >> "$EVIDENCE_DIR/05_smart_contract.txt"
echo "✅ Smart contract captured"

# 6. System Info
echo "6️⃣  Capturing system information..."
echo "=== SYSTEM INFORMATION ===" > "$EVIDENCE_DIR/06_system_info.txt"
echo "Captured: $(date)" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "Operating System: $(uname -s) $(uname -r)" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "Machine: $(uname -m)" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "Docker Version: $(docker --version)" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "Node Version: $(node --version 2>/dev/null || echo 'Not installed')" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "Python Version: $(python3 --version)" >> "$EVIDENCE_DIR/06_system_info.txt"
echo "✅ System info captured"

# Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    EVIDENCE GENERATED                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Evidence saved to: $EVIDENCE_DIR/"
echo ""
echo "Files created:"
ls -la "$EVIDENCE_DIR/"
echo ""
echo "🎯 Use these files for patent documentation!"
echo ""
