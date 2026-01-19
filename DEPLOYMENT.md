# HerBlock Deployment Guide

## 🚀 Quick Start (For Demo)

```bash
# One-command setup
./setup.sh

# Start demo (backend + frontend)
./demo.sh
```

## 📱 Mobile App Deployment

### Development Testing

```bash
cd mobile-app
npm install
npm start
```

Scan QR code with Expo Go app on your phone.

### Build for Production

#### Android APK

```bash
cd mobile-app

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (for testing)
eas build -p android --profile preview

# Build AAB (for Play Store)
eas build -p android --profile production
```

#### iOS

```bash
# Build for iOS (requires Apple Developer account)
eas build -p ios --profile production
```

### Build Configuration

Create `eas.json` in mobile-app:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 🌐 Frontend Deployment (Vercel)

Already deployed at: https://sih-blockchain.vercel.app

### Update Deployment

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://your-backend-url.com` |

---

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended for Demo)

1. Create account at railway.app
2. Connect GitHub repository
3. Add backend folder as service
4. Set environment variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `GOOGLE_CLIENT_ID`: OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: OAuth secret
   - `FRONTEND_URL`: Frontend URL

### Option 2: Azure Container Apps

```bash
# Login to Azure
az login

# Create resource group
az group create --name herblock-rg --location centralindia

# Create container app environment
az containerapp env create \
  --name herblock-env \
  --resource-group herblock-rg \
  --location centralindia

# Deploy container
az containerapp create \
  --name herblock-api \
  --resource-group herblock-rg \
  --environment herblock-env \
  --image herblock/api:latest \
  --target-port 8000 \
  --ingress external
```

### Option 3: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone https://github.com/yourusername/herblock.git
cd herblock/backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirement.txt

# Run with PM2
npm install -g pm2
pm2 start "python server.py" --name herblock-api
pm2 save
pm2 startup
```

---

## 📦 MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Get connection string
5. Update `backend/.env`:

```
MONGO_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/herblock?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

---

## 🔗 Hyperledger Fabric (Production)

### Prerequisites

- Docker & Docker Compose
- Go 1.19+
- Node.js 18+

### Network Setup

```bash
# Clone Fabric samples
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples/test-network

# Start network
./network.sh up createChannel -c herblock

# Deploy HerBlock chaincode
./network.sh deployCC -ccn herblock -ccp /path/to/herblock/chaincode -ccl javascript
```

### For Himalaya Pilot (Simplified)

Use MongoDB with blockchain-like features (audit trail, immutability simulation):

1. Enable Change Streams for audit
2. Use document versioning
3. Create read-only replica for verification

---

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set up API rate limiting
- [ ] Configure CORS properly
- [ ] Enable MongoDB authentication
- [ ] Set up backup schedule
- [ ] Configure monitoring (Sentry, DataDog)

---

## 📊 Monitoring

### Application Monitoring

```bash
# Install Sentry
pip install sentry-sdk[fastapi]
```

Add to server.py:
```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

### Uptime Monitoring

Use free services:
- UptimeRobot (free tier)
- Freshping
- StatusCake

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railwayapp/railway-action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📞 Support Contacts

- Technical Lead: [Your Name]
- Email: [your-email]
- Emergency: [phone]

---

## 📝 Post-Deployment Checklist

- [ ] Verify all endpoints working
- [ ] Test mobile app connectivity
- [ ] Run sample collection flow
- [ ] Check blockchain recording
- [ ] Verify GPS validation
- [ ] Test offline mode
- [ ] Set up monitoring alerts
- [ ] Document admin credentials
- [ ] Create backup procedures
