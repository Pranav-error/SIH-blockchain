#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import time

class HerBlockAPITester:
    def __init__(self, base_url="https://herblock-path.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_product_id = f"test-product-{int(time.time())}"
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_api_status(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Message: {data.get('message', 'No message')}"
            return self.log_test("API Status Check", success, details)
        except Exception as e:
            return self.log_test("API Status Check", False, f"Error: {str(e)}")

    def test_dashboard_analytics(self):
        """Test dashboard analytics endpoint"""
        try:
            response = requests.get(f"{self.api_url}/analytics/dashboard", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                stats = data.get('statistics', {})
                details += f" - Products: {stats.get('total_products', 0)}, Collections: {stats.get('total_collections', 0)}"
            return self.log_test("Dashboard Analytics", success, details)
        except Exception as e:
            return self.log_test("Dashboard Analytics", False, f"Error: {str(e)}")

    def test_create_collection_event(self):
        """Test creating a collection event"""
        try:
            collection_data = {
                "product_id": self.test_product_id,
                "collector_id": f"collector_{int(time.time())}",
                "collector_name": "Test Collector",
                "species_name": "Ashwagandha",
                "latitude": 23.2599,
                "longitude": 77.4126,
                "location_name": "Bhopal, Madhya Pradesh",
                "quantity_kg": 10.5,
                "quality_grade": "A",
                "weather_conditions": "Sunny, 25°C",
                "organic_certified": True
            }
            
            response = requests.post(f"{self.api_url}/collection", json=collection_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Collection ID: {data.get('id', 'Unknown')}"
            return self.log_test("Create Collection Event", success, details)
        except Exception as e:
            return self.log_test("Create Collection Event", False, f"Error: {str(e)}")

    def test_create_processing_step(self):
        """Test creating a processing step"""
        try:
            processing_data = {
                "product_id": self.test_product_id,
                "facility_id": f"facility_{int(time.time())}",
                "facility_name": "Test Processing Center",
                "process_type": "drying",
                "temperature": 60.0,
                "duration_hours": 24.0,
                "equipment_used": "Industrial Dryer",
                "operator_name": "Test Operator",
                "output_quantity_kg": 9.8
            }
            
            response = requests.post(f"{self.api_url}/processing", json=processing_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Processing ID: {data.get('id', 'Unknown')}"
            return self.log_test("Create Processing Step", success, details)
        except Exception as e:
            return self.log_test("Create Processing Step", False, f"Error: {str(e)}")

    def test_create_quality_test(self):
        """Test creating a quality test"""
        try:
            quality_data = {
                "product_id": self.test_product_id,
                "lab_id": f"lab_{int(time.time())}",
                "lab_name": "Test Quality Lab",
                "test_type": "moisture",
                "test_result": "Moisture content within acceptable limits",
                "test_value": 8.5,
                "test_unit": "%",
                "pass_fail": "PASS",
                "tested_by": "Test Lab Technician"
            }
            
            response = requests.post(f"{self.api_url}/quality", json=quality_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Test ID: {data.get('id', 'Unknown')}"
            return self.log_test("Create Quality Test", success, details)
        except Exception as e:
            return self.log_test("Create Quality Test", False, f"Error: {str(e)}")

    def test_create_product(self):
        """Test creating a final product"""
        try:
            product_data = {
                "id": self.test_product_id,
                "product_name": "Test Ashwagandha Root Powder",
                "batch_id": f"BATCH_{int(time.time())}",
                "species_name": "Ashwagandha",
                "manufacturer": "Test Ayurvedic Company",
                "manufacturing_date": datetime.now(timezone.utc).isoformat(),
                "expiry_date": datetime.now(timezone.utc).replace(year=datetime.now().year + 2).isoformat(),
                "final_quantity_kg": 9.5,
                "certifications": ["Organic", "GMP"],
                "price_per_kg": 1200.0
            }
            
            response = requests.post(f"{self.api_url}/product", json=product_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Product ID: {data.get('id', 'Unknown')}"
            return self.log_test("Create Product", success, details)
        except Exception as e:
            return self.log_test("Create Product", False, f"Error: {str(e)}")

    def test_get_product(self):
        """Test retrieving a product"""
        try:
            response = requests.get(f"{self.api_url}/product/{self.test_product_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Product: {data.get('product_name', 'Unknown')}"
            return self.log_test("Get Product", success, details)
        except Exception as e:
            return self.log_test("Get Product", False, f"Error: {str(e)}")

    def test_trace_product(self):
        """Test complete product traceability"""
        try:
            response = requests.get(f"{self.api_url}/trace/{self.test_product_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Events: {data.get('total_events', 0)}, Blockchain Verified: {data.get('blockchain_verified', False)}"
            return self.log_test("Trace Product", success, details)
        except Exception as e:
            return self.log_test("Trace Product", False, f"Error: {str(e)}")

    def test_demo_product_trace(self):
        """Test tracing the demo product"""
        try:
            demo_id = "demo-ashwagandha-001"
            response = requests.get(f"{self.api_url}/trace/{demo_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Demo Events: {data.get('total_events', 0)}, Verified: {data.get('blockchain_verified', False)}"
            return self.log_test("Demo Product Trace", success, details)
        except Exception as e:
            return self.log_test("Demo Product Trace", False, f"Error: {str(e)}")

    def test_geo_fence_validation(self):
        """Test geo-fence smart contract validation"""
        try:
            params = {
                "latitude": 23.2599,
                "longitude": 77.4126,
                "species_name": "Ashwagandha"
            }
            
            response = requests.post(f"{self.api_url}/validate/geo-fence", params=params, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Valid: {data.get('valid', False)}, Message: {data.get('message', 'No message')}"
            else:
                details += f" - Response: {response.text[:100]}"
            return self.log_test("Geo-fence Validation", success, details)
        except Exception as e:
            return self.log_test("Geo-fence Validation", False, f"Error: {str(e)}")

    def test_quality_validation(self):
        """Test quality standards validation"""
        try:
            params = {
                "test_type": "moisture",
                "test_value": 8.5,
                "species_name": "Ashwagandha"
            }
            
            response = requests.post(f"{self.api_url}/validate/quality", params=params, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Valid: {data.get('valid', False)}, Message: {data.get('message', 'No message')}"
            else:
                details += f" - Response: {response.text[:100]}"
            return self.log_test("Quality Validation", success, details)
        except Exception as e:
            return self.log_test("Quality Validation", False, f"Error: {str(e)}")

    def test_get_all_products(self):
        """Test getting all products"""
        try:
            response = requests.get(f"{self.api_url}/products", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" - Total Products: {len(data)}"
            return self.log_test("Get All Products", success, details)
        except Exception as e:
            return self.log_test("Get All Products", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧪 Starting HerBlock Backend API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_api_status()
        self.test_dashboard_analytics()
        
        # CRUD operations - Create full workflow
        self.test_create_collection_event()
        self.test_create_processing_step()
        self.test_create_quality_test()
        self.test_create_product()
        
        # Read operations
        self.test_get_product()
        self.test_get_all_products()
        
        # Traceability
        self.test_trace_product()
        self.test_demo_product_trace()
        
        # Smart contract validations
        self.test_geo_fence_validation()
        self.test_quality_validation()
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests PASSED!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests FAILED")
            return 1

def main():
    tester = HerBlockAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())