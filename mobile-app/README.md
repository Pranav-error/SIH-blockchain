# HerBlock Collector Mobile App
## React Native (Expo) App for Field Collectors

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile-app
npm install
```

### Run Development

```bash
# Start Expo dev server
npm start

# Or for specific platform
npm run android
npm run ios
```

### Test on Device

1. Install "Expo Go" app from Play Store / App Store
2. Scan QR code from terminal
3. App loads on your device

---

## 📱 Features

### ✅ Implemented
- [x] Login screen with collector ID + PIN
- [x] Home screen with quick stats
- [x] Collection screen with GPS capture
- [x] Pending sync screen with manual sync
- [x] History screen with filters
- [x] Settings/logout
- [x] Offline data storage (SQLite)
- [x] Online/offline status indicator
- [x] Zustand state management

### 🔜 Coming Soon
- [ ] Background sync
- [ ] Camera for photo evidence
- [ ] Push notifications
- [ ] Multi-language support (Hindi)
- [ ] Biometric login
- [ ] Location tracking

---

## 🏗️ Architecture

```
mobile-app/
├── App.js                    # Main entry, navigation
├── app.json                  # Expo config
├── package.json              # Dependencies
└── src/
    ├── screens/              # UI Screens
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── CollectionScreen.js
    │   ├── PendingSyncScreen.js
    │   ├── HistoryScreen.js
    │   └── SettingsScreen.js
    ├── store/                # Zustand state
    │   ├── authStore.js      # Auth state
    │   └── syncStore.js      # Sync state
    ├── database/             # SQLite
    │   └── db.js             # Database operations
    └── services/             # API
        └── api.js            # Backend API calls
```

---

## 🔐 Offline Mode

The app works completely offline:

1. **Collections saved locally** - SQLite database
2. **Queued for sync** - Pending list with retry
3. **Auto-sync** - When connectivity returns
4. **Conflict handling** - Server response decides

### Data Flow

```
User submits collection
        ↓
    Is online? ─── Yes ──→ Submit to API
        │                      ↓
        No              Blockchain validates
        ↓                      ↓
  Save to SQLite         Success? ─── No ──→ Mark rejected
        ↓                      │
  Add to pending         Yes
        ↓                      ↓
  Show in Pending      Remove from pending
  Sync screen          Mark as synced
```

---

## 🔌 Backend Integration

### Required Endpoints

```
POST /api/collector/login
  Body: { collector_id, pin }
  Response: { token, collector: { id, name, region } }

POST /api/blockchain/collection
  Body: { product_id, species, gps: { lat, lon }, collector_id, timestamp }
  Response: { success, geo_validated, txId?, error? }

GET /api/blockchain/trace/:productId
  Response: { collection, processing, quality_tests }

GET /api/health
  Response: { status: 'ok' | 'error' }
```

---

## 📦 Build for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

### iOS (requires Mac + Apple Developer account)

```bash
eas build --platform ios --profile preview
```

---

## 🎨 Customization

### Change API URL

Edit `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.com/api"
    }
  }
}
```

### Change Colors

Primary color is `#10B981` (emerald green). Search and replace in screen files.

### Add Languages

Add translation files and use i18n library like `react-i18next`.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npm run typecheck
```

---

## 📋 TODO for Production

1. [ ] Add proper error boundaries
2. [ ] Add crash reporting (Sentry)
3. [ ] Add analytics (Mixpanel/Amplitude)
4. [ ] Add proper loading states
5. [ ] Add pull-to-refresh
6. [ ] Add pagination for history
7. [ ] Add photo capture
8. [ ] Add background location tracking
9. [ ] Add proper form validation
10. [ ] Add unit tests

---

## 📄 License

Part of HerBlock - Patent Pending Technology

---

**Built for Smart India Hackathon 2024** 🇮🇳
