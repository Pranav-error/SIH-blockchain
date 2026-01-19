# FORM 2 - PROVISIONAL SPECIFICATION
## (Under Section 9(1) of the Patents Act, 1970 and Rule 13)

---

## INDIAN PATENT OFFICE

---

### TITLE OF INVENTION

**"Consensus-Level Geographic Origin Validation System for Ayurvedic Herb Supply Chain Traceability Using Permissioned Blockchain with Embedded Haversine-Based GPS Geo-Fence Validation, Dynamic Regulatory Zone Governance, Multi-Organization Endorsement, and Cryptographic Identity Binding"**

**Short Title:** "HerBlock - Blockchain GPS-Validated Herb Traceability System"

---

### APPLICANT(S)

**Name:** [YOUR FULL NAME]
**Address:** [Your Address]
**Nationality:** Indian

---

## PROVISIONAL SPECIFICATION

### 1. FIELD OF THE INVENTION

The present invention relates to blockchain-based supply chain management systems, and more particularly to a novel method and system for authenticating the geographical origin of Ayurvedic medicinal herbs using GPS geo-fence validation integrated with Hyperledger Fabric distributed ledger technology.

---

### 2. DESCRIPTION OF THE INVENTION

#### 2.1 Background and Problem

The Indian Ayurvedic pharmaceutical industry, valued at approximately ₹50,000 crore (USD 6 billion), faces critical challenges:

1. **Adulteration Crisis**: Studies indicate 30-40% of Ayurvedic products contain adulterated or substituted herbs from unauthorized regions.

2. **Origin Fraud**: Herbs claimed to be from specific therapeutic regions (e.g., Himalayan medicinal plants) are often sourced from non-authentic locations, reducing therapeutic efficacy.

3. **Traceability Gap**: No existing system validates the actual GPS coordinates of herb collection at the blockchain consensus level.

4. **Export Losses**: Indian herbal exports face ₹2,000+ crore annual losses due to rejection at international borders for lack of verifiable source documentation.

#### 2.2 Limitations of Existing Solutions

| Existing Approach | Limitation |
|-------------------|------------|
| QR Code Tracking | Can be duplicated; no origin validation |
| RFID Tags | Expensive; can be removed and reattached to fraudulent products |
| Certificate Systems | Prone to forgery; rely on centralized authority |
| Generic Blockchain | Record data but do NOT validate GPS coordinates on-chain |

---

### 3. SUMMARY OF THE INVENTION

The present invention introduces a **GPS Geo-Fence Validation Layer** embedded within a Hyperledger Fabric blockchain smart contract (chaincode) that:

1. **Validates GPS coordinates** against pre-defined herb-specific collection zones BEFORE committing data to the blockchain ledger.

2. **Calculates geographical distance** using the Haversine formula to determine if the collection location falls within an approved radius from authorized collection centers.

3. **Rejects fraudulent entries** at the blockchain consensus level, preventing unauthorized origin claims from ever entering the immutable ledger.

4. **Creates cryptographic proof** of validated origin that cannot be altered post-facto.

5. **Binds collector identity** to GPS submissions via Membership Service Provider (MSP) certificates, preventing both location and identity spoofing.

---

### 4. DETAILED DESCRIPTION

#### 4.1 System Architecture

The invention comprises:

**A. Hyperledger Fabric Blockchain Network**
- Permissioned blockchain with multiple organizational peers
- Raft consensus mechanism for transaction ordering
- Private channel for herb supply chain transactions
- Minimum two endorsing peers for transaction validation

**B. Smart Contract (Chaincode) with GPS Validation**
- Embedded geo-fence validation logic
- Species-specific collection zone configuration
- Haversine formula implementation for distance calculation
- Dynamic zone management via state assets

**C. Identity Management**
- X.509 certificate-based collector authentication
- Membership Service Provider (MSP) integration
- Cryptographic binding of identity to GPS submissions

#### 4.2 Core Innovation: On-Chain GPS Validation

The key innovation is executing GPS validation **within** the blockchain smart contract during transaction endorsement, not as a separate pre-processing step. This ensures:

- Validation cannot be bypassed
- All endorsing peers must agree on validation result
- Fraudulent coordinates are rejected at consensus level
- Immutable audit trail of all validation attempts

#### 4.3 Mathematical Method

The system employs the Haversine formula to calculate geodesic distance between two points on Earth's surface:

**Central Angle Calculation:**
```
Δσ = 2 × arcsin(√[sin²((φ₂-φ₁)/2) + cos(φ₁) × cos(φ₂) × sin²((λ₂-λ₁)/2)])
```

**Distance Calculation:**
```
d = r × Δσ
```

Where:
- φ₁, λ₁ = GPS coordinates of herb collection point (input)
- φ₂, λ₂ = Center coordinates of approved collection zone (ledger state)
- r = 6,371 km (Earth's mean radius)
- d = Geodesic distance in kilometers

**Validation Rule:**
```
Transaction ACCEPTED if: d ≤ Tₛ
Transaction REJECTED if: d > Tₛ
```

Where Tₛ = Species-specific threshold radius stored as a state asset on the ledger.

#### 4.4 Alternative Embodiment: Bounding Box Validation

An alternative embodiment uses rectangular bounding box validation:

```
Transaction ACCEPTED if:
  minLat ≤ latitude ≤ maxLat AND minLng ≤ longitude ≤ maxLng
```

This provides computational simplicity while achieving the same technical effect of on-chain GPS validation.

#### 4.5 Dynamic Zone Governance

Collection zones are stored as **State-Controlled Assets** on the ledger (not hardcoded), enabling:

- Authorized regulator organizations to add/modify zones
- Full audit trail of zone changes
- No chaincode redeployment required for zone updates
- Granular access control via Fabric ACLs

---

### 5. CLAIMS (Provisional)

**Claim 1:** A computer-implemented method for validating geographical origin of agricultural products on a blockchain network, comprising:
- Receiving GPS coordinates from a collection device
- Executing distance calculation within a blockchain smart contract
- Comparing calculated distance against species-specific threshold
- Committing validated transactions to distributed ledger
- Rejecting transactions that fail geo-fence validation

**Claim 2:** The method of Claim 1, wherein distance calculation uses the Haversine formula:
```
Δσ = 2 × arcsin(√[sin²((φ₂-φ₁)/2) + cos(φ₁) × cos(φ₂) × sin²((λ₂-λ₁)/2)])
d = r × Δσ
```
And transaction is rejected if d > Tₛ (species-specific threshold).

**Claim 3:** The method of Claim 1, wherein GPS submissions are cryptographically bound to collector identity via X.509 certificates issued by Membership Service Provider (MSP).

**Claim 4:** A blockchain-based herb traceability system comprising:
- Hyperledger Fabric network with multiple organizational peers
- Smart contract implementing GPS geo-fence validation
- State assets storing dynamically updatable collection zones
- Access control restricting zone modifications to authorized regulators

**Claim 5:** The system of Claim 4, wherein collection zones are stored as ledger state assets updatable by designated Regulator Organization without chaincode redeployment.

---

### 6. ADVANTAGES OF THE INVENTION

1. **Fraud Prevention at Source**: GPS validation occurs before data enters blockchain, not after.

2. **Consensus-Level Security**: Multiple peers must agree on validation, preventing single-point manipulation.

3. **Herb-Specific Zones**: Different herbs have different approved regions based on AYUSH guidelines.

4. **Immutable Proof**: Once validated and committed, origin proof cannot be altered.

5. **No Cryptocurrency**: Uses permissioned blockchain with no gas fees or tokens.

6. **Export Compliance**: Provides internationally-recognized, tamper-proof source verification.

---

### 7. INDUSTRIAL APPLICABILITY

The invention is applicable to:

1. **Ayurvedic Pharmaceutical Industry** - Authentication of raw material origin
2. **AYUSH Ministry Programs** - Premium Mark certification compliance
3. **Export Agencies** - International phytosanitary compliance
4. **Organic Certification Bodies** - Origin verification
5. **Food Safety (FSSAI)** - Traceability requirements
6. **International Markets** - EU THMPD, US FDA DSHEA compliance

---

### 8. DRAWINGS (Description)

**Figure 1:** System architecture showing mobile device → GPS validation layer → blockchain commit flow

**Figure 2:** Haversine distance calculation on spherical Earth surface

**Figure 3:** Transaction flow diagram showing endorsement, validation, and commit stages

**Figure 4:** Dynamic zone oracle architecture with regulator access control

*Note: Actual drawings to be prepared for complete specification*

---

### 9. ABSTRACT

A GPS geo-fence validated blockchain system for Ayurvedic herb traceability that validates the geographical origin of medicinal herbs by executing Haversine-based distance calculations within a Hyperledger Fabric smart contract. The system receives GPS coordinates from collection devices, calculates the geodesic distance to approved collection zones using the formula d = r × Δσ, and rejects transactions where the distance exceeds a species-specific threshold (d > Tₛ). Collection zones are stored as dynamically updatable state assets governed by authorized regulator organizations. Collector identity is cryptographically bound to GPS submissions via X.509 certificates, preventing both location and identity spoofing. The invention addresses the ₹50,000 crore Indian Ayurvedic industry's adulteration crisis by preventing fraudulent origin claims at the blockchain consensus level.

---

### DECLARATION

I/We declare that:

1. The invention as disclosed herein is novel and has not been published before the date of this application.
2. The invention has been developed independently by the inventor(s) named herein.
3. We are the true and first inventor(s) of this invention.
4. We have the full right to make this application.

---

### SIGNATURE

**Inventor/Applicant:**

_______________________________

**Name:** [YOUR FULL NAME]

**Date:** ___/___/2026

**Place:** Bengaluru, Karnataka

---

*This provisional specification is filed to secure the priority date. A complete specification with detailed claims, drawings, and examples will be filed within 12 months from this date.*
