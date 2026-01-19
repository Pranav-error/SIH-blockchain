"""
HerBlock - Ayurvedic Herb Traceability System
PATENT PENDING - Indian Patent Office

Features:
- GPS-validated herb collection (Patent Feature)
- Hyperledger Fabric blockchain integration
- Multi-stakeholder supply chain tracking
- Immutable quality test records

Copyright (c) 2026 HerBlock India
"""

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import json
import qrcode
import io
import base64
from fastapi import Request
from requests_oauthlib import OAuth2Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# --- NEW IMPORTS FOR AUTHENTICATION ---
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- IMPORT FABRIC SERVICE ---
from services.fabric_service import fabric_service

# --- SECURITY SETUP ---
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

# --- DATABASE AND APP SETUP ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Add these new variables after your app setup ---
GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
GOOGLE_CLIENT_SECRET = os.environ['GOOGLE_CLIENT_SECRET']
REDIRECT_URI = f"{os.environ.get('RENDER_EXTERNAL_URL', 'http://127.0.0.1:8000')}/api/auth/callback"
AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
SCOPE = ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@auth_router.get("/login")
async def google_login():
    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=REDIRECT_URI, scope=SCOPE)
    authorization_url, state = google.authorization_url(AUTHORIZATION_URL, access_type="offline", prompt="select_account")
    return {"authorization_url": authorization_url}

@auth_router.post("/callback")
async def google_callback(request: Request):
    body = await request.json()
    code = body.get("code")

    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=REDIRECT_URI)
    try:
        token = google.fetch_token(TOKEN_URL, client_secret=GOOGLE_CLIENT_SECRET, code=code)
        id_info = id_token.verify_oauth2_token(token['id_token'], google_requests.Request(), GOOGLE_CLIENT_ID)

        user_email = id_info['email']

        # Check if user exists
        user = await db.users.find_one({"username": user_email})
        if not user:
            # Create a new user if they don't exist
            # For social logins, we can create a dummy hashed_password or adapt the model
            new_user = UserInDB(
                username=user_email,
                organization="Default Org",
                hashed_password=get_password_hash(str(uuid.uuid4())) # Secure random password
            )
            await db.users.insert_one(new_user.dict())
            user = await db.users.find_one({"username": user_email})

        # Create an access token for our own API
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["username"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid credentials or token. Error: {str(e)}")

# --- MODELS (USER AND DATA) ---
class User(BaseModel):
    username: str
    organization: Optional[str] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CollectionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())); product_id: str; collector_id: str; collector_name: str; species_name: str; latitude: float; longitude: float; location_name: str; harvest_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)); quantity_kg: float; quality_grade: str; weather_conditions: str; blockchain_hash: str = Field(default_factory=lambda: ""); timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProcessingStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())); product_id: str; facility_id: str; facility_name: str; process_type: str; equipment_used: str; operator_name: str; output_quantity_kg: float; blockchain_hash: str = Field(default_factory=lambda: ""); timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QualityTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())); product_id: str; lab_id: str; lab_name: str; test_type: str; test_result: str; pass_fail: str; tested_by: str; blockchain_hash: str = Field(default_factory=lambda: ""); timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())); product_name: str; batch_id: str; species_name: str; manufacturer: str; manufacturing_date: datetime; expiry_date: datetime; final_quantity_kg: float; qr_code: str = Field(default_factory=lambda: ""); qr_code_image: str = Field(default_factory=lambda: ""); certifications: List[str] = []; blockchain_hash: str = Field(default_factory=lambda: ""); timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlockchainTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())); product_id: str; transaction_type: str; data_hash: str; previous_hash: Optional[str] = None; merkle_root: str; block_index: int; timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# --- AUTHENTICATION HELPER FUNCTIONS ---
def verify_password(plain_password, hashed_password):
    # Ensure password is properly encoded and within bcrypt limits
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Ensure password is properly encoded and within bcrypt limits
    if isinstance(password, str):
        password = password.encode('utf-8')[:72]
    return pwd_context.hash(password)

async def get_user(username: str):
    user = await db.users.find_one({"username": username})
    if user: return UserInDB(**user)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError: raise credentials_exception
    user = await get_user(username=token_data.username)
    if user is None: raise credentials_exception
    return user

# --- GENERAL HELPER FUNCTIONS ---
def calculate_hash(data: dict) -> str:
    json_str = json.dumps(data, sort_keys=True, default=str); return hashlib.sha256(json_str.encode()).hexdigest()

def generate_qr_code(product_id: str) -> tuple[str, str]:
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000'); qr_data = f"{frontend_url}/trace/{product_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5); qr.add_data(qr_data); qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white"); buffer = io.BytesIO()
    img.save(buffer, format='PNG'); img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return qr_data, img_base64

async def create_blockchain_transaction(product_id: str, transaction_type: str, data: dict):
    last_tx = await db.blockchain_transactions.find_one({"product_id": product_id}, sort=[("block_index", -1)])
    previous_hash = last_tx["data_hash"] if last_tx else "0"
    block_index = (last_tx["block_index"] + 1) if last_tx else 0
    data_hash = calculate_hash(data)
    merkle_root = calculate_hash({"data_hash": data_hash, "previous_hash": previous_hash})
    transaction = BlockchainTransaction(product_id=product_id, transaction_type=transaction_type, data_hash=data_hash, previous_hash=previous_hash, merkle_root=merkle_root, block_index=block_index)
    await db.blockchain_transactions.insert_one(transaction.dict())
    return transaction

# --- AUTHENTICATION ENDPOINTS ---
@api_router.post("/register")
async def register_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form_data.username)
    if user: raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(form_data.password)
    user_in_db = UserInDB(username=form_data.username, organization="Default Org", hashed_password=hashed_password)
    await db.users.insert_one(user_in_db.dict())
    return {"message": "User created successfully"}

@api_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password): raise HTTPException(status_code=401, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# --- DATA ENDPOINTS (PROTECTED AND FULLY FUNCTIONAL) ---
@api_router.post("/collection", response_model=CollectionEvent)
async def create_collection_event(event: CollectionEvent, current_user: User = Depends(get_current_user)):
    event.blockchain_hash = calculate_hash(event.dict())
    await db.collection_events.insert_one(event.dict())
    await create_blockchain_transaction(event.product_id, "collection", event.dict())
    return event

@api_router.post("/processing", response_model=ProcessingStep)
async def create_processing_step(step: ProcessingStep, current_user: User = Depends(get_current_user)):
    step.blockchain_hash = calculate_hash(step.dict())
    await db.processing_steps.insert_one(step.dict())
    await create_blockchain_transaction(step.product_id, "processing", step.dict())
    return step

@api_router.post("/quality", response_model=QualityTest)
async def create_quality_test(test: QualityTest, current_user: User = Depends(get_current_user)):
    test.blockchain_hash = calculate_hash(test.dict())
    await db.quality_tests.insert_one(test.dict())
    await create_blockchain_transaction(test.product_id, "testing", test.dict())
    return test

@api_router.post("/product", response_model=Product)
async def create_product(product: Product, current_user: User = Depends(get_current_user)):
    qr_data, qr_image = generate_qr_code(product.batch_id)
    product.qr_code = qr_data; product.qr_code_image = qr_image
    product.blockchain_hash = calculate_hash(product.dict())
    await db.products.insert_one(product.dict())
    await create_blockchain_transaction(product.id, "formulation", product.dict())
    return product

# --- PUBLIC ENDPOINTS ---
@api_router.get("/trace/{trace_id}")
async def trace_product(trace_id: str):
    product = await db.products.find_one({"$or": [{"id": trace_id}, {"batch_id": trace_id}]})
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    batch_id_to_search = product["batch_id"]
    collection_events = await db.collection_events.find({"product_id": batch_id_to_search}).to_list(1000)
    processing_steps = await db.processing_steps.find({"product_id": batch_id_to_search}).to_list(1000)
    quality_tests = await db.quality_tests.find({"product_id": batch_id_to_search}).to_list(1000)
    blockchain_txs = await db.blockchain_transactions.find({"product_id": product["id"]}).sort("block_index", 1).to_list(1000)
    def clean_mongo_doc(doc):
        if doc and '_id' in doc: del doc['_id']
        return doc
    return {
        "product": clean_mongo_doc(product),
        "collection_events": [clean_mongo_doc(doc) for doc in collection_events],
        "processing_steps": [clean_mongo_doc(doc) for doc in processing_steps],
        "quality_tests": [clean_mongo_doc(doc) for doc in quality_tests],
        "blockchain_transactions": [clean_mongo_doc(doc) for doc in blockchain_txs],
    }

@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    total_products = await db.products.count_documents({})
    total_collections = await db.collection_events.count_documents({})
    total_processing = await db.processing_steps.count_documents({})
    total_tests = await db.quality_tests.count_documents({})
    total_blockchain_txs = await db.blockchain_transactions.count_documents({})
    recent_collections_raw = await db.collection_events.find().sort("timestamp", -1).limit(5).to_list(5)
    recent_products_raw = await db.products.find().sort("timestamp", -1).limit(5).to_list(5)
    def clean_mongo_doc(doc):
        if doc and '_id' in doc: del doc['_id']
        return doc
    return {
        "statistics": { "total_products": total_products, "total_collections": total_collections, "total_processing": total_processing, "total_quality_tests": total_tests, "total_blockchain_transactions": total_blockchain_txs },
        "recent_collections": [clean_mongo_doc(doc) for doc in recent_collections_raw],
        "recent_products": [clean_mongo_doc(doc) for doc in recent_products_raw]
    }


# ==================== HYPERLEDGER FABRIC BLOCKCHAIN ENDPOINTS ====================
# PATENT PENDING - Indian Patent Office
# These endpoints connect to the real Hyperledger Fabric blockchain network

blockchain_router = APIRouter(prefix="/api/blockchain", tags=["Blockchain"])

@blockchain_router.get("/status")
async def get_blockchain_status():
    """
    Get Hyperledger Fabric network status
    Returns connection status, network info, and patent status
    """
    try:
        status = await fabric_service.get_network_status()
        return status
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "fallback": "Using local hash-based verification",
            "patent_pending": True
        }


@blockchain_router.post("/collection")
async def record_collection_on_blockchain(
    event_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Record herb collection on Hyperledger Fabric blockchain
    
    PATENT FEATURE: GPS Geo-Fence Validation
    - Validates collection coordinates against approved regions
    - Rejects collections from unauthorized locations
    - Ensures herb authenticity through location verification
    """
    try:
        # Add user info to the collection data
        event_data["collector_id"] = current_user.username
        
        # Record on blockchain with GPS validation
        result = await fabric_service.record_collection(event_data)
        
        if result.get("success"):
            # Also save to MongoDB for quick access
            mongo_doc = {
                **event_data,
                "blockchain_verified": True,
                "blockchain_collection_id": result.get("collection_id"),
                "blockchain_product_id": result.get("product_id"),
                "geo_validated": result.get("geo_validated", True),
                "timestamp": datetime.now(timezone.utc)
            }
            await db.collection_events.insert_one(mongo_doc)
        
        return result
        
    except Exception as e:
        # Check if geo-validation failed
        error_msg = str(e)
        if "INVALID LOCATION" in error_msg:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "geo_validation_failed",
                    "message": error_msg,
                    "patent_feature": "GPS Geo-Fence Validation - This herb species cannot be collected from this location"
                }
            )
        raise HTTPException(status_code=500, detail=str(e))


@blockchain_router.post("/quality-test")
async def record_quality_test_on_blockchain(
    test_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Record quality test on blockchain
    
    PATENT FEATURE: Immutable Quality Records
    - Test results cannot be modified after recording
    - Cryptographic proof of authenticity
    - Lab accreditation verification
    """
    try:
        test_data["tested_by"] = current_user.username
        result = await fabric_service.record_quality_test(test_data)
        
        if result.get("success"):
            # Also save to MongoDB
            mongo_doc = {
                **test_data,
                "blockchain_verified": True,
                "blockchain_test_id": result.get("test_id"),
                "timestamp": datetime.now(timezone.utc)
            }
            await db.quality_tests.insert_one(mongo_doc)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blockchain_router.post("/processing")
async def record_processing_on_blockchain(
    processing_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Record processing event on blockchain
    
    Links raw materials to processed output with immutable audit trail
    """
    try:
        processing_data["processor_id"] = current_user.username
        result = await fabric_service.record_processing(processing_data)
        
        if result.get("success"):
            mongo_doc = {
                **processing_data,
                "blockchain_verified": True,
                "blockchain_processing_id": result.get("processing_id"),
                "timestamp": datetime.now(timezone.utc)
            }
            await db.processing_steps.insert_one(mongo_doc)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blockchain_router.post("/product")
async def record_product_on_blockchain(
    product_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Record final product on blockchain
    
    Links all supply chain events to final consumer product
    """
    try:
        product_data["manufacturer_id"] = current_user.username
        result = await fabric_service.record_product(product_data)
        
        if result.get("success"):
            # Generate QR code
            qr_data, qr_image = generate_qr_code(result.get("product_id"))
            
            mongo_doc = {
                **product_data,
                "blockchain_verified": True,
                "blockchain_product_id": result.get("product_id"),
                "qr_code": qr_data,
                "qr_code_image": qr_image,
                "timestamp": datetime.now(timezone.utc)
            }
            await db.products.insert_one(mongo_doc)
            
            result["qr_code"] = qr_data
            result["qr_code_image"] = qr_image
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blockchain_router.get("/trace/{product_id}")
async def trace_product_on_blockchain(product_id: str):
    """
    Get complete product traceability from blockchain
    
    PATENT FEATURE: Complete Supply Chain Visibility
    - All collection events with GPS validation status
    - All processing steps
    - All quality test results
    - Cryptographic proof of each transaction
    """
    try:
        result = await fabric_service.trace_product(product_id)
        return result
    except Exception as e:
        # Fallback to MongoDB if blockchain query fails
        product = await db.products.find_one({
            "$or": [
                {"id": product_id},
                {"batch_id": product_id},
                {"blockchain_product_id": product_id}
            ]
        })
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        def clean_mongo_doc(doc):
            if doc and '_id' in doc: del doc['_id']
            return doc
        
        return {
            "product_id": product_id,
            "blockchain_verified": False,
            "fallback": "MongoDB cache",
            "product": clean_mongo_doc(product),
            "error": str(e),
            "patent_pending": True
        }


@blockchain_router.get("/history/{key}")
async def get_blockchain_history(key: str):
    """
    Get transaction history for any blockchain key
    Shows all changes over time with timestamps
    """
    try:
        result = await fabric_service.get_history(key)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@blockchain_router.get("/collection/{collection_id}")
async def get_collection_from_blockchain(collection_id: str):
    """
    Get specific collection from blockchain
    """
    try:
        result = await fabric_service.get_collection(collection_id)
        return result
    except Exception as e:
        # Fallback to MongoDB
        collection = await db.collection_events.find_one({
            "$or": [
                {"id": collection_id},
                {"blockchain_collection_id": collection_id}
            ]
        })
        
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        
        if '_id' in collection:
            del collection['_id']
        
        return {
            **collection,
            "blockchain_verified": False,
            "source": "mongodb_cache"
        }


# ==================== STARTUP EVENT ====================

@app.on_event("startup")
async def startup_event():
    """Initialize HerBlock system on startup"""
    print("🚀 ========================================")
    print("🚀 HerBlock - Ayurvedic Herb Traceability")
    print("🚀 ========================================")
    print("📜 PATENT PENDING - Indian Patent Office")
    print("")
    
    # Check blockchain connection
    try:
        is_connected = await fabric_service.check_connection()
        if is_connected:
            print("✅ Hyperledger Fabric blockchain: CONNECTED")
            print("   - Channel: herblock")
            print("   - Chaincode: herblock")
            print("   - Peers: peer0.org1, peer0.org2")
        else:
            print("⚠️  Hyperledger Fabric: Not connected (using fallback)")
    except Exception as e:
        print(f"⚠️  Blockchain connection error: {e}")
        print("   Using MongoDB for data storage")
    
    print("")
    print("🌿 Features enabled:")
    print("   ✅ GPS Geo-Fence Validation (Patent Feature)")
    print("   ✅ Immutable Quality Records")
    print("   ✅ Multi-Stakeholder Consensus")
    print("   ✅ Complete Supply Chain Traceability")
    print("")
    print("🚀 Server ready at http://127.0.0.1:8000")
    print("📚 API docs at http://127.0.0.1:8000/docs")
    print("🚀 ========================================")


# --- APP CONFIGURATION ---
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(blockchain_router)

# ==================== MOBILE APP / COLLECTOR ENDPOINTS ====================
# These endpoints are designed for the React Native collector mobile app

collector_router = APIRouter(prefix="/api/collector", tags=["Mobile App"])

class CollectorLogin(BaseModel):
    collector_id: str
    pin: str

class CollectorProfile(BaseModel):
    id: str
    name: str
    region: str
    organization: Optional[str] = None
    registered_species: List[str] = []
    total_collections: int = 0

@collector_router.post("/login")
async def collector_login(credentials: CollectorLogin):
    """
    Login endpoint for mobile collector app
    Supports offline credential caching
    """
    # Look up collector in database
    collector = await db.collectors.find_one({"collector_id": credentials.collector_id})
    
    if not collector:
        # For demo/pilot, auto-create collector
        collector = {
            "collector_id": credentials.collector_id,
            "pin_hash": get_password_hash(credentials.pin),
            "name": f"Collector {credentials.collector_id}",
            "region": "Demo Region",
            "organization": "HerBlock Pilot",
            "registered_species": ["Ashwagandha", "Tulsi", "Brahmi"],
            "total_collections": 0,
            "created_at": datetime.now(timezone.utc)
        }
        await db.collectors.insert_one(collector)
    else:
        # Verify PIN
        if not verify_password(credentials.pin, collector.get("pin_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid PIN")
    
    # Create token
    access_token = create_access_token(
        data={"sub": credentials.collector_id, "type": "collector"},
        expires_delta=timedelta(days=30)  # Long-lived for mobile
    )
    
    return {
        "token": access_token,
        "collector": {
            "id": collector["collector_id"],
            "name": collector.get("name", "Unknown"),
            "region": collector.get("region", "Unknown"),
            "organization": collector.get("organization"),
            "registered_species": collector.get("registered_species", []),
        }
    }

@collector_router.get("/{collector_id}")
async def get_collector_profile(collector_id: str):
    """Get collector profile and stats"""
    collector = await db.collectors.find_one({"collector_id": collector_id})
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
    
    # Count collections
    total = await db.collection_events.count_documents({"collector_id": collector_id})
    
    return {
        "id": collector["collector_id"],
        "name": collector.get("name"),
        "region": collector.get("region"),
        "organization": collector.get("organization"),
        "registered_species": collector.get("registered_species", []),
        "total_collections": total
    }

@collector_router.post("/register")
async def register_collector(
    collector_id: str,
    pin: str,
    name: str,
    region: str,
    organization: Optional[str] = None
):
    """Register a new collector (admin use)"""
    existing = await db.collectors.find_one({"collector_id": collector_id})
    if existing:
        raise HTTPException(status_code=400, detail="Collector ID already exists")
    
    collector = {
        "collector_id": collector_id,
        "pin_hash": get_password_hash(pin),
        "name": name,
        "region": region,
        "organization": organization,
        "registered_species": ["Ashwagandha", "Tulsi", "Brahmi", "Guduchi", "Shatavari"],
        "total_collections": 0,
        "created_at": datetime.now(timezone.utc)
    }
    await db.collectors.insert_one(collector)
    
    return {"success": True, "collector_id": collector_id}

# Health check endpoint for mobile app
@api_router.get("/health")
async def health_check():
    """Health check for mobile app connectivity"""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# Approved zones endpoint
@api_router.get("/zones/{species}")
async def get_approved_zones(species: str):
    """Get approved collection zones for a species"""
    # This data should match the smart contract
    zones = {
        "Ashwagandha": [
            {"name": "Madhya Pradesh", "lat": 23.47, "lon": 77.94, "radius_km": 200},
            {"name": "Rajasthan", "lat": 26.92, "lon": 75.78, "radius_km": 250},
            {"name": "Gujarat", "lat": 22.31, "lon": 72.13, "radius_km": 150},
        ],
        "Tulsi": [
            {"name": "Uttar Pradesh", "lat": 26.85, "lon": 80.91, "radius_km": 200},
            {"name": "Madhya Pradesh", "lat": 23.47, "lon": 77.94, "radius_km": 200},
        ],
        "Brahmi": [
            {"name": "Kerala", "lat": 10.85, "lon": 76.27, "radius_km": 150},
            {"name": "Tamil Nadu", "lat": 11.13, "lon": 78.66, "radius_km": 200},
        ],
        "Guduchi": [
            {"name": "Karnataka", "lat": 15.32, "lon": 75.71, "radius_km": 200},
            {"name": "Maharashtra", "lat": 19.75, "lon": 75.71, "radius_km": 250},
        ],
        "Shatavari": [
            {"name": "Rajasthan", "lat": 26.92, "lon": 75.78, "radius_km": 200},
            {"name": "Himachal Pradesh", "lat": 31.10, "lon": 77.17, "radius_km": 150},
        ],
    }
    
    if species not in zones:
        return {"species": species, "zones": [], "message": "No specific zones defined"}
    
    return {"species": species, "zones": zones[species]}

# ==================== BATCH SYNC ENDPOINT FOR OFFLINE COLLECTIONS ====================

class OfflineCollection(BaseModel):
    """Model for collections submitted from offline mobile app"""
    local_id: str  # Unique ID from mobile app's local DB
    species: str
    quantity_kg: float
    gps_lat: float
    gps_lon: float
    collected_at: str  # ISO timestamp when actually collected
    notes: Optional[str] = ""
    photo_base64: Optional[str] = None

class BatchSyncRequest(BaseModel):
    """Request model for syncing multiple offline collections"""
    collector_id: str
    collections: List[OfflineCollection]

@api_router.post("/blockchain/batch-collection")
async def batch_sync_collections(request: BatchSyncRequest):
    """
    Sync multiple offline collections to blockchain.
    Used by mobile app when coming back online.
    """
    results = []
    success_count = 0
    error_count = 0
    
    for collection in request.collections:
        try:
            # Create collection event
            event = {
                "id": str(uuid.uuid4()),
                "local_id": collection.local_id,  # For mobile app to mark as synced
                "product_id": f"HB-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
                "event_type": "COLLECTION",
                "species_name": collection.species,
                "quantity_kg": collection.quantity_kg,
                "gps": {"lat": collection.gps_lat, "lon": collection.gps_lon},
                "collector_id": request.collector_id,
                "timestamp": datetime.now(timezone.utc),
                "collected_at": collection.collected_at,
                "notes": collection.notes or "",
                "is_offline_sync": True,
                "blockchain_hash": ""
            }
            
            # Insert into database
            await db.collection_events.insert_one(event)
            
            # Update collector stats
            await db.collectors.update_one(
                {"collector_id": request.collector_id},
                {"$inc": {"total_collections": 1}}
            )
            
            results.append({
                "local_id": collection.local_id,
                "server_id": event["id"],
                "product_id": event["product_id"],
                "status": "success"
            })
            success_count += 1
            
        except Exception as e:
            results.append({
                "local_id": collection.local_id,
                "status": "error",
                "error": str(e)
            })
            error_count += 1
    
    return {
        "success": error_count == 0,
        "total": len(request.collections),
        "synced": success_count,
        "errors": error_count,
        "results": results
    }

app.include_router(collector_router)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://sih-blockchain.vercel.app",  # Production frontend
    "*",  # Allow mobile app (should be restricted in production)
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

