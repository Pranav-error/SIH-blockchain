"""
HerBlock Fabric Service
Connects FastAPI backend to Hyperledger Fabric blockchain

PATENT PENDING - Indian Patent Office
Innovation: GPS-validated herb traceability on enterprise blockchain

Copyright (c) 2026 HerBlock India
"""

import os
import json
import subprocess
import asyncio
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FABRIC_SAMPLES = os.path.join(BASE_DIR, "fabric-samples")
HERBLOCK_NETWORK = os.path.join(FABRIC_SAMPLES, "herblock-network")
FABRIC_BIN = os.path.join(FABRIC_SAMPLES, "bin")
FABRIC_CONFIG = os.path.join(FABRIC_SAMPLES, "config")


class HerBlockFabricService:
    """
    Service to interact with HerBlock Hyperledger Fabric network
    Uses CLI-based approach for simplicity and reliability
    """
    
    def __init__(self):
        self.channel_name = "herblock"
        self.chaincode_name = "herblock"
        self.is_connected = False
        self.last_error = None
        
        # Environment variables for Fabric CLI
        self.env = os.environ.copy()
        self.env.update({
            "PATH": f"{FABRIC_BIN}:{os.environ.get('PATH', '')}",
            "FABRIC_CFG_PATH": FABRIC_CONFIG,
            "CORE_PEER_TLS_ENABLED": "true",
            "CORE_PEER_LOCALMSPID": "Org1MSP",
            "CORE_PEER_TLS_ROOTCERT_FILE": f"{HERBLOCK_NETWORK}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt",
            "CORE_PEER_MSPCONFIGPATH": f"{HERBLOCK_NETWORK}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp",
            "CORE_PEER_ADDRESS": "localhost:7051"
        })
        
        # TLS certificate paths
        self.orderer_ca = f"{HERBLOCK_NETWORK}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
        self.peer1_tls = f"{HERBLOCK_NETWORK}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
        self.peer2_tls = f"{HERBLOCK_NETWORK}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
    
    async def check_connection(self) -> bool:
        """Check if blockchain network is accessible"""
        try:
            result = await self._run_query("getNetworkStatus", [])
            if result and "active" in str(result):
                self.is_connected = True
                return True
        except Exception as e:
            self.last_error = str(e)
        
        self.is_connected = False
        return False
    
    async def _run_invoke(self, function: str, args: list) -> Dict[str, Any]:
        """Run a chaincode invoke (write operation)"""
        try:
            # Build the arguments JSON
            invoke_args = {
                "function": function,
                "Args": args
            }
            
            cmd = [
                "peer", "chaincode", "invoke",
                "-o", "localhost:7050",
                "--ordererTLSHostnameOverride", "orderer.example.com",
                "--tls",
                "--cafile", self.orderer_ca,
                "-C", self.channel_name,
                "-n", self.chaincode_name,
                "--peerAddresses", "localhost:7051",
                "--tlsRootCertFiles", self.peer1_tls,
                "--peerAddresses", "localhost:9051",
                "--tlsRootCertFiles", self.peer2_tls,
                "-c", json.dumps(invoke_args)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=self.env,
                cwd=HERBLOCK_NETWORK
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                raise Exception(f"Invoke failed: {error_msg}")
            
            # Parse the response
            output = stderr.decode() if stderr else stdout.decode()
            
            # Extract payload from response
            if "payload:" in output:
                payload_start = output.find('payload:"') + 9
                payload_end = output.rfind('"')
                if payload_start > 8 and payload_end > payload_start:
                    payload = output[payload_start:payload_end]
                    # Unescape the JSON
                    payload = payload.replace('\\"', '"').replace('\\n', '\n')
                    try:
                        return json.loads(payload)
                    except:
                        return {"raw": payload}
            
            return {"success": True, "output": output}
            
        except Exception as e:
            raise Exception(f"Blockchain invoke error: {str(e)}")
    
    async def _run_query(self, function: str, args: list) -> Dict[str, Any]:
        """Run a chaincode query (read operation)"""
        try:
            query_args = {
                "function": function,
                "Args": args
            }
            
            cmd = [
                "peer", "chaincode", "query",
                "-C", self.channel_name,
                "-n", self.chaincode_name,
                "-c", json.dumps(query_args)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=self.env,
                cwd=HERBLOCK_NETWORK
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                raise Exception(f"Query failed: {error_msg}")
            
            output = stdout.decode().strip()
            
            try:
                return json.loads(output)
            except:
                return {"raw": output}
                
        except Exception as e:
            raise Exception(f"Blockchain query error: {str(e)}")
    
    # ==================== Collection Operations ====================
    
    async def record_collection(self, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Record herb collection on blockchain with GPS validation
        
        PATENT FEATURE: Geo-fence validation
        """
        try:
            # Generate collection ID if not provided
            collection_id = collection_data.get("id") or f"COLL-{uuid.uuid4().hex[:8].upper()}"
            
            # Prepare data for blockchain
            blockchain_data = {
                "product_id": collection_data.get("product_id") or f"BATCH-{uuid.uuid4().hex[:8].upper()}",
                "collector_id": collection_data.get("collector_id", "unknown"),
                "collector_name": collection_data.get("collector_name", "Unknown Collector"),
                "species_name": collection_data.get("species_name", "Unknown"),
                "latitude": str(collection_data.get("latitude", 0)),
                "longitude": str(collection_data.get("longitude", 0)),
                "location_name": collection_data.get("location_name", "Unknown Location"),
                "state": collection_data.get("state", ""),
                "district": collection_data.get("district", ""),
                "quantity_kg": str(collection_data.get("quantity_kg", 0)),
                "quality_grade": collection_data.get("quality_grade", "Pending"),
                "weather_conditions": collection_data.get("weather_conditions", ""),
                "organic_certified": collection_data.get("organic_certified", False)
            }
            
            result = await self._run_invoke(
                "recordCollection",
                [collection_id, json.dumps(blockchain_data)]
            )
            
            return {
                "success": True,
                "collection_id": collection_id,
                "product_id": blockchain_data["product_id"],
                "blockchain_verified": True,
                "geo_validated": result.get("geo_validated", True),
                "timestamp": datetime.utcnow().isoformat(),
                "data": result,
                "patent_pending": True
            }
            
        except Exception as e:
            error_msg = str(e)
            # Check if it's a geo-fence validation error
            if "INVALID LOCATION" in error_msg:
                return {
                    "success": False,
                    "error": "geo_validation_failed",
                    "message": error_msg,
                    "patent_feature": "GPS Geo-Fence Validation"
                }
            raise
    
    async def get_collection(self, collection_id: str) -> Dict[str, Any]:
        """Get collection by ID from blockchain"""
        result = await self._run_query("getCollection", [collection_id])
        result["blockchain_verified"] = True
        result["patent_pending"] = True
        return result
    
    # ==================== Quality Test Operations ====================
    
    async def record_quality_test(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Record quality test on blockchain"""
        try:
            test_id = test_data.get("id") or f"QT-{uuid.uuid4().hex[:8].upper()}"
            product_id = test_data.get("product_id", "")
            
            blockchain_data = {
                "product_id": product_id,
                "lab_id": test_data.get("lab_id", ""),
                "lab_name": test_data.get("lab_name", ""),
                "test_type": test_data.get("test_type", ""),
                "test_result": test_data.get("test_result", ""),
                "pass_fail": test_data.get("pass_fail", "pending"),
                "tested_by": test_data.get("tested_by", ""),
                "certificate_number": test_data.get("certificate_number", ""),
                "accreditation_number": test_data.get("accreditation_number", "")
            }
            
            result = await self._run_invoke(
                "recordQualityTest",
                [test_id, json.dumps(blockchain_data)]
            )
            
            return {
                "success": True,
                "test_id": test_id,
                "product_id": product_id,
                "blockchain_verified": True,
                "data": result,
                "patent_pending": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to record quality test: {str(e)}")
    
    # ==================== Processing Operations ====================
    
    async def record_processing(self, processing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Record processing event on blockchain"""
        try:
            processing_id = processing_data.get("id") or f"PROC-{uuid.uuid4().hex[:8].upper()}"
            
            blockchain_data = {
                "product_id": processing_data.get("product_id", ""),
                "source_collection_id": processing_data.get("source_collection_id", ""),
                "processor_id": processing_data.get("processor_id", ""),
                "processor_name": processing_data.get("processor_name", ""),
                "facility_name": processing_data.get("facility_name", ""),
                "facility_location": processing_data.get("facility_location", ""),
                "processing_type": processing_data.get("processing_type", ""),
                "input_quantity_kg": str(processing_data.get("input_quantity_kg", 0)),
                "output_quantity_kg": str(processing_data.get("output_quantity_kg", 0)),
                "batch_number": processing_data.get("batch_number", ""),
                "gmp_certified": processing_data.get("gmp_certified", False),
                "ayush_license": processing_data.get("ayush_license", "")
            }
            
            result = await self._run_invoke(
                "recordProcessing",
                [processing_id, json.dumps(blockchain_data)]
            )
            
            return {
                "success": True,
                "processing_id": processing_id,
                "blockchain_verified": True,
                "data": result,
                "patent_pending": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to record processing: {str(e)}")
    
    # ==================== Product Operations ====================
    
    async def record_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Record final product on blockchain"""
        try:
            product_id = product_data.get("id") or f"PROD-{uuid.uuid4().hex[:8].upper()}"
            
            blockchain_data = {
                "product_name": product_data.get("product_name", ""),
                "product_name_hindi": product_data.get("product_name_hindi", ""),
                "manufacturer_id": product_data.get("manufacturer_id", ""),
                "manufacturer_name": product_data.get("manufacturer_name", ""),
                "ayush_license": product_data.get("ayush_license", ""),
                "fssai_license": product_data.get("fssai_license", ""),
                "batch_number": product_data.get("batch_number", ""),
                "manufacturing_date": product_data.get("manufacturing_date", ""),
                "expiry_date": product_data.get("expiry_date", ""),
                "mrp": product_data.get("mrp", 0),
                "source_collections": product_data.get("source_collections", []),
                "processing_ids": product_data.get("processing_ids", []),
                "quality_test_ids": product_data.get("quality_test_ids", []),
                "ingredients": product_data.get("ingredients", [])
            }
            
            result = await self._run_invoke(
                "recordProduct",
                [product_id, json.dumps(blockchain_data)]
            )
            
            return {
                "success": True,
                "product_id": product_id,
                "blockchain_verified": True,
                "data": result,
                "patent_pending": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to record product: {str(e)}")
    
    # ==================== Traceability Operations ====================
    
    async def trace_product(self, product_id: str) -> Dict[str, Any]:
        """
        Get complete product traceability from blockchain
        
        PATENT FEATURE: Full supply chain visibility
        """
        try:
            result = await self._run_query("getProductTrace", [product_id])
            
            return {
                "product_id": product_id,
                "blockchain_verified": True,
                "trace_data": result,
                "total_events": result.get("total_events", 0),
                "collections": result.get("collections", []),
                "processing": result.get("processing", []),
                "quality_tests": result.get("quality_tests", []),
                "product": result.get("product"),
                "patent_pending": True
            }
            
        except Exception as e:
            raise Exception(f"Failed to trace product: {str(e)}")
    
    async def get_history(self, key: str) -> Dict[str, Any]:
        """Get transaction history for any key"""
        result = await self._run_query("getHistory", [key])
        return {
            "key": key,
            "history": result,
            "blockchain_verified": True,
            "patent_pending": True
        }
    
    # ==================== Network Status ====================
    
    async def get_network_status(self) -> Dict[str, Any]:
        """Get blockchain network status"""
        try:
            await self.check_connection()
            
            return {
                "network": "HerBlock Hyperledger Fabric",
                "channel": self.channel_name,
                "chaincode": self.chaincode_name,
                "status": "connected" if self.is_connected else "disconnected",
                "organizations": ["Org1MSP", "Org2MSP"],
                "peers": [
                    {"name": "peer0.org1.example.com", "port": 7051},
                    {"name": "peer0.org2.example.com", "port": 9051}
                ],
                "orderer": {"name": "orderer.example.com", "port": 7050},
                "timestamp": datetime.utcnow().isoformat(),
                "patent_pending": True,
                "version": "1.0.0"
            }
            
        except Exception as e:
            return {
                "network": "HerBlock Hyperledger Fabric",
                "status": "error",
                "error": str(e),
                "patent_pending": True
            }


# Global instance
fabric_service = HerBlockFabricService()


# Convenience functions for direct import
async def record_collection_on_blockchain(data: Dict[str, Any]) -> Dict[str, Any]:
    """Record collection on blockchain"""
    return await fabric_service.record_collection(data)


async def record_quality_test_on_blockchain(data: Dict[str, Any]) -> Dict[str, Any]:
    """Record quality test on blockchain"""
    return await fabric_service.record_quality_test(data)


async def trace_product_on_blockchain(product_id: str) -> Dict[str, Any]:
    """Trace product on blockchain"""
    return await fabric_service.trace_product(product_id)


async def get_blockchain_status() -> Dict[str, Any]:
    """Get blockchain network status"""
    return await fabric_service.get_network_status()
