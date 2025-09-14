HerBlock: Ayurvedic Herb Traceability System
HerBlock is a full-stack proof-of-concept designed to bring transparency, authenticity, and sustainability to the Ayurvedic herbal supply chain using a simulated blockchain ledger.
This project directly addresses the challenges of fragmented supply chains, lack of provenance, and potential for adulteration in the herbal industry by creating a verifiable, end-to-end audit trail for every product, from the farm to the final consumer.
Core Features
Blockchain Simulation: Creates a tamper-evident ledger by cryptographically chaining every supply chain event. Each transaction (collection, processing, etc.) is hashed and linked to the previous transaction's hash, ensuring data integrity.
Smart Contract Validation: The backend API acts as a smart contract to automatically enforce business rules:
Geo-Fencing: Validates that herb collection events occur within predefined, approved geographical zones for specific species.
Quality Control: Enforces quality thresholds and standards before data is committed to the ledger.
End-to-End Traceability: From a single Batch ID, the system can trace a product through its entire lifecycle.
Geo-Tagging with Interactive Maps:
Collectors can use an interactive map to pin the exact GPS coordinates of a harvest.
Consumers can view the collection location on a map on the final trace page.
Consumer QR Code Portal: Consumers can scan a QR code on a product's packaging (or enter its Batch ID) to view its complete, verified history on a simple web portal.
Stakeholder Dashboard: A central dashboard for producers, processors, and manufacturers to add new events to the supply chain and monitor key statistics in real-time.
Technology Stack
This project is a modern full-stack application built with the following technologies:
Area
Technology
Frontend
React, Create React App, Tailwind CSS, shadcn/ui, axios, leaflet.js (for maps)
Backend
Python 3, FastAPI, Uvicorn (ASGI Server)
Database
MongoDB (running locally via Docker)
Dev Tools
Git, Yarn, pip with venv, Docker Desktop

Local Setup and Installation Guide
Follow these steps to run the complete HerBlock application on your local machine.
Prerequisites
Node.js (v18 or later) and Yarn
Python (v3.10 or later)
Docker Desktop (must be installed and running)
1. Clone the Repository
git clone <your-repository-url>
cd herblock-project


2. Set Up the Database
Ensure Docker Desktop is running. Open a terminal and run the following command to start the MongoDB database container:
docker run -d -p 27017:27017 --name herblock-mongo mongo


3. Set Up the Backend
Navigate to the backend directory:
cd backend


Create and activate a Python virtual environment:
python3 -m venv venv
source venv/bin/activate


Install the required Python packages:
pip install -r requirement.txt


Create a .env file in the backend directory and add the following lines:
MONGO_URL=mongodb://localhost:27017
DB_NAME=herblock
FRONTEND_URL=http://localhost:3000


4. Set Up the Frontend
In a new terminal window, navigate to the frontend directory:
cd frontend


Install the required Node.js packages:
yarn install


Create a .env file in the frontend directory and add the following line:
REACT_APP_BACKEND_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)


5. Run the Application
You need to have three terminals running simultaneously:
Terminal 1 (Database): The Docker container should be running in the background.
Terminal 2 (Backend): Navigate to the backend directory, activate the venv, and run:
uvicorn server:app --reload


Terminal 3 (Frontend): Navigate to the frontend directory and run:
yarn start


