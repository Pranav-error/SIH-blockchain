# 🌿 HerBlock: Ayurvedic Herb Traceability System

**A blockchain-powered supply chain traceability solution for Ayurvedic herbs**  
Built for Smart India Hackathon 2024

HerBlock brings transparency, authenticity, and sustainability to the Ayurvedic herbal supply chain using a simulated blockchain ledger. Track herbs from farm to formulation with complete end-to-end verification.

---

## ✨ Core Features

- **🔗 Blockchain Simulation**: Tamper-evident ledger with cryptographic hash-chaining
- **📍 Geo-Tagging**: Interactive maps for precise GPS location tracking of herb collection
- **🔍 End-to-End Traceability**: Complete journey from collection → processing → testing → final product
- **📱 QR Code System**: Auto-generated QR codes for instant product verification
- **🔐 Authentication**: JWT-based auth + Google OAuth2 integration
- **📊 Analytics Dashboard**: Real-time statistics and supply chain monitoring
- **🌐 Public Verification**: Anyone can trace products via QR code or batch ID

---

## 🛠️ Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Frontend** | React 19, React Router, Tailwind CSS, Radix UI, shadcn/ui, Leaflet.js, Axios |
| **Backend** | Python 3, FastAPI, Uvicorn |
| **Database** | MongoDB |
| **Authentication** | JWT, PassLib, Google OAuth2 |
| **Build Tools** | Craco, PostCSS, Yarn |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) and **Yarn**
- **Python** (v3.10 or later)
- **Docker Desktop** (must be running)
- **Git**

---

## 🚀 Getting Started

Follow these steps to run HerBlock on your local machine:

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/Pranav-error/SIH-blockchain.git
cd SIH-blockchain
```

### **Step 2: Start MongoDB (Docker)**

Ensure Docker Desktop is running, then start MongoDB:

```bash
docker run -d -p 27017:27017 --name herblock-mongo mongo
```

To verify MongoDB is running:
```bash
docker ps
```

### **Step 3: Set Up the Backend**

#### 3.1 Navigate to the backend directory:
```bash
cd backend
```

#### 3.2 Create and activate a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows
```

#### 3.3 Install Python dependencies:
```bash
pip install -r requirement.txt
```

#### 3.4 Install Google Auth libraries:
```bash
pip install google-auth google-auth-oauthlib
```

#### 3.5 Environment Configuration

The `.env` file should already be created in the `backend` folder with these variables:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=herblock
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
RENDER_EXTERNAL_URL=http://127.0.0.1:8000
```

**Note**: To enable Google OAuth login, you need to:
1. Create a Google Cloud Project
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add `http://127.0.0.1:8000/api/auth/callback` as an authorized redirect URI
5. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the `.env` file

#### 3.6 Start the Backend Server:
```bash
uvicorn server:app --reload
```

The backend will be running at: **http://127.0.0.1:8000**

---

### **Step 4: Set Up the Frontend**

Open a **new terminal window** and:

#### 4.1 Navigate to the frontend directory:
```bash
cd frontend
```

#### 4.2 Install Node.js dependencies:
```bash
yarn install
```

#### 4.3 Environment Configuration

The `.env` file should already exist in the `frontend` folder with:
```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

#### 4.4 Start the Frontend Development Server:
```bash
yarn start
```

The frontend will automatically open at: **http://localhost:3000**

---

## 🎯 Running the Application

You should now have **3 processes running**:

1. **MongoDB** (Docker container on port 27017)
2. **Backend** (FastAPI server on http://127.0.0.1:8000)
3. **Frontend** (React app on http://localhost:3000)

### Quick Start Commands Summary:

**Terminal 1 - MongoDB:**
```bash
docker run -d -p 27017:27017 --name herblock-mongo mongo
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload
```

**Terminal 3 - Frontend:**
```bash
cd frontend
yarn start
```

---

## 📱 Using the Application

### 1. **Home Page**
- Visit http://localhost:3000
- Enter a QR code or Product/Batch ID to trace a product
- Try demo ID: `ASH-MP-2025-01`

### 2. **Register/Login**
- Click "View Dashboard" or navigate to `/login`
- Register a new account or login with existing credentials
- Option to login with Google OAuth

### 3. **Dashboard** (Protected Route)
- View real-time analytics and statistics
- Add Collection Events (with interactive map)
- Add Processing Steps
- Add Quality Tests
- Create Final Products (with auto-generated QR codes)

### 4. **Product Tracing**
- Scan QR code or enter Batch ID
- View complete supply chain journey
- See collection locations on interactive maps
- Verify blockchain transactions

---

## 🔧 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### Key Endpoints:

**Authentication:**
- `POST /api/register` - Register new user
- `POST /api/token` - Login (get JWT token)
- `GET /api/auth/login` - Google OAuth login
- `POST /api/auth/callback` - Google OAuth callback

**Protected Endpoints (requires JWT token):**
- `POST /api/collection` - Add collection event
- `POST /api/processing` - Add processing step
- `POST /api/quality` - Add quality test
- `POST /api/product` - Create product with QR code

**Public Endpoints:**
- `GET /api/trace/{trace_id}` - Trace product by ID or batch ID
- `GET /api/analytics/dashboard` - Get dashboard statistics

---

## 🐛 Troubleshooting

### MongoDB Connection Issues:
```bash
# Check if MongoDB container is running
docker ps

# If not running, start it
docker start herblock-mongo

# Or create a new container
docker run -d -p 27017:27017 --name herblock-mongo mongo
```

### Backend Issues:
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirement.txt
pip install google-auth google-auth-oauthlib
```

### Frontend Issues:
```bash
# Clear node modules and reinstall
rm -rf node_modules
yarn install

# Clear yarn cache
yarn cache clean
```

### Port Already in Use:
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

---

## 📁 Project Structure

```
SIH-blockchain/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirement.txt        # Python dependencies
│   ├── .env                   # Environment variables
│   └── venv/                  # Python virtual environment
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── app.js            # Main React application
│   │   ├── index.js          # Entry point
│   │   ├── app.css           # Custom styles
│   │   ├── index.css         # Tailwind base styles
│   │   ├── components/       # Radix UI components
│   │   ├── hooks/            # React hooks
│   │   └── lib/              # Utilities
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── craco.config.js       # Webpack configuration
│   └── .env                  # Environment variables
│
└── README.md                 # This file
```

---

## 🔒 Security Notes

- The `.env` files contain sensitive information and should **never** be committed to version control
- Add `.env` to your `.gitignore` file
- For production deployment, use secure secret management services
- The current `SECRET_KEY` in `server.py` should be changed for production

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for Smart India Hackathon 2024.

---

## 👥 Team

- **Repository Owner**: [Pranav-error](https://github.com/Pranav-error)

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Review the API documentation at http://127.0.0.1:8000/docs
3. Open an issue on GitHub

---

## 🎉 Acknowledgments

- Smart India Hackathon 2024
- All contributors and team members
- Open-source libraries and frameworks used in this project

---

**Made with 💚 for Ayurvedic Supply Chain Transparency**
