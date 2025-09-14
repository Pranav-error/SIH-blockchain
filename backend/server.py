from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import json
import qrcode
import io
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class CollectionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str  # This holds the Batch ID
    collector_id: str
    collector_name: str
    species_name: str
    latitude: float
    longitude: float
    location_name: str
    harvest_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quantity_kg: float
    quality_grade: str
    weather_conditions: str
    blockchain_hash: str = Field(default_factory=lambda: "")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProcessingStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str  # This holds the Batch ID
    facility_id: str
    facility_name: str
    process_type: str
    equipment_used: str
    operator_name: str
    output_quantity_kg: float
    blockchain_hash: str = Field(default_factory=lambda: "")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QualityTest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str  # This holds the Batch ID
    lab_id: str
    lab_name: str
    test_type: str
    test_result: str
    pass_fail: str
    tested_by: str
    blockchain_hash: str = Field(default_factory=lambda: "")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_name: str
    batch_id: str  # This is the key that links to events
    species_name: str
    manufacturer: str
    manufacturing_date: datetime
    expiry_date: datetime
    final_quantity_kg: float
    qr_code: str = Field(default_factory=lambda: "")
    qr_code_image: str = Field(default_factory=lambda: "")
    certifications: List[str] = []
    blockchain_hash: str = Field(default_factory=lambda: "")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlockchainTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    transaction_type: str
    data_hash: str
    previous_hash: Optional[str] = None
    merkle_root: str
    block_index: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def calculate_hash(data: dict) -> str:
    json_str = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(json_str.encode()).hexdigest()

def generate_qr_code(product_id: str) -> tuple[str, str]:
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    qr_data = f"{frontend_url}/trace/{product_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
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

# API Endpoints
@api_router.post("/collection", response_model=CollectionEvent)
async def create_collection_event(event: CollectionEvent):
    approved_zones = {
        "Ashwagandha": {"min_lat": 15.0, "max_lat": 30.0, "min_lng": 70.0, "max_lng": 85.0},
        "Turmeric": {"min_lat": 8.0, "max_lat": 22.0, "min_lng": 75.0, "max_lng": 88.0},
        "Tulsi": {"min_lat": 20.0, "max_lat": 32.0, "min_lng": 72.0, "max_lng": 84.0}
    }
    if event.species_name in approved_zones:
        zone = approved_zones[event.species_name]
        is_valid = (zone["min_lat"] <= event.latitude <= zone["max_lat"] and zone["min_lng"] <= event.longitude <= zone["max_lng"])
        if not is_valid:
            raise HTTPException(status_code=400, detail="Collection outside approved geo-fenced zone.")
    
    event.blockchain_hash = calculate_hash(event.dict())
    await db.collection_events.insert_one(event.dict())
    await create_blockchain_transaction(event.product_id, "collection", event.dict())
    return event

@api_router.post("/processing", response_model=ProcessingStep)
async def create_processing_step(step: ProcessingStep):
    step.blockchain_hash = calculate_hash(step.dict())
    await db.processing_steps.insert_one(step.dict())
    await create_blockchain_transaction(step.product_id, "processing", step.dict())
    return step

@api_router.post("/quality", response_model=QualityTest)
async def create_quality_test(test: QualityTest):
    test.blockchain_hash = calculate_hash(test.dict())
    await db.quality_tests.insert_one(test.dict())
    await create_blockchain_transaction(test.product_id, "testing", test.dict())
    return test

@api_router.post("/product", response_model=Product)
async def create_product(product: Product):
    qr_data, qr_image = generate_qr_code(product.batch_id) # Use Batch ID for QR code
    product.qr_code = qr_data
    product.qr_code_image = qr_image
    product.blockchain_hash = calculate_hash(product.dict())
    await db.products.insert_one(product.dict())
    await create_blockchain_transaction(product.id, "formulation", product.dict())
    return product

# --- TRACEABILITY ENDPOINT (CORRECTED) ---
@api_router.get("/trace/{trace_id}")
async def trace_product(trace_id: str):
    product = await db.products.find_one({"$or": [{"id": trace_id}, {"batch_id": trace_id}]})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    batch_id_to_search = product["batch_id"]

    collection_events = await db.collection_events.find({"product_id": batch_id_to_search}).to_list(1000)
    processing_steps = await db.processing_steps.find({"product_id": batch_id_to_search}).to_list(1000)
    quality_tests = await db.quality_tests.find({"product_id": batch_id_to_search}).to_list(1000)
    blockchain_txs = await db.blockchain_transactions.find({"product_id": product["id"]}).sort("block_index", 1).to_list(1000)

    def clean_mongo_doc(doc):
        if doc and '_id' in doc:
            del doc['_id']
        return doc

    return {
        "product": clean_mongo_doc(product),
        "collection_events": [clean_mongo_doc(doc) for doc in collection_events],
        "processing_steps": [clean_mongo_doc(doc) for doc in processing_steps],
        "quality_tests": [clean_mongo_doc(doc) for doc in quality_tests],
        "blockchain_transactions": [clean_mongo_doc(doc) for doc in blockchain_txs],
    }

# --- OTHER ENDPOINTS ---
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    # ... (analytics code is unchanged)
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
        "statistics": {
            "total_products": total_products,
            "total_collections": total_collections,
            "total_processing": total_processing,
            "total_quality_tests": total_tests,
            "total_blockchain_transactions": total_blockchain_txs
        },
        "recent_collections": [clean_mongo_doc(doc) for doc in recent_collections_raw],
        "recent_products": [clean_mongo_doc(doc) for doc in recent_products_raw]
    }

app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

