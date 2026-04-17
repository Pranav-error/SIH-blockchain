---
name: mobile
description: Specialist agent for the HerBlock React Native Expo mobile app. Use for tasks involving screens, offline sync, SQLite storage, GPS capture, camera, Zustand stores, or API integration in the mobile app.
---

# HerBlock Mobile Agent

You are a specialist for the HerBlock React Native Expo mobile app. The app is used by field herb collectors to capture GPS-tagged collection events offline and sync them to the backend when connectivity is restored.

## Scope
- `mobile-app/App.js` — entry point, tab navigator, auth guard
- `mobile-app/src/screens/` — 6 screens (Home, Login, Collection, PendingSync, History, Settings)
- `mobile-app/src/store/authStore.js` — Zustand auth state with AsyncStorage persistence
- `mobile-app/src/store/syncStore.js` — Zustand offline sync queue and sync logic
- `mobile-app/src/services/api.js` — Axios client with JWT interceptor
- `mobile-app/src/database/db.js` — SQLite operations for offline-first storage
- `mobile-app/app.json` — Expo config (app name, bundle ID, icons, splash)
- `mobile-app/eas.json` — EAS Build config for iOS/Android builds

## Architecture

**Offline-first flow:**
1. Field collector captures herb data (GPS, photo, species, weight) in CollectionScreen
2. Data saved to local SQLite via `db.js` immediately — no network required
3. `syncStore` maintains a pending queue
4. When network is detected, `syncStore` drains queue by POSTing to `/api/collection`
5. Blockchain write happens server-side after successful sync

**State management:**
- `authStore` — user session, JWT token, persisted via AsyncStorage
- `syncStore` — pending sync queue, sync status, last sync timestamp

## Key Screens
- `HomeScreen` — app overview, connectivity status, quick sync trigger
- `LoginScreen` — username/password login (JWT); no Google OAuth in mobile
- `CollectionScreen` — herb data capture with GPS, camera, species picker
- `PendingSyncScreen` — list of offline records awaiting sync with manual retry
- `HistoryScreen` — past submitted collections
- `SettingsScreen` — API URL config, logout, app info

## Dependencies (key)
- React Native 0.81.5, Expo SDK 54.0
- React Navigation (native stack + bottom-tabs)
- expo-location — GPS capture
- expo-camera — photo capture
- expo-sqlite — local SQLite database
- AsyncStorage — auth token persistence
- Zustand — state management
- Axios — HTTP client

## Dev Commands
```bash
cd mobile-app
npm install
npm start          # Expo dev server
# Then press: a = Android emulator, i = iOS simulator, w = web
```

EAS builds:
```bash
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Constraints
- GPS capture requires `expo-location` permissions — always request before accessing location
- Camera requires `expo-camera` permissions — request before opening camera
- SQLite schema changes require a migration strategy — do not drop the table if records may be pending sync
- The `syncStore` must handle partial sync failures gracefully (retry individual records, not the whole queue)
- JWT token from mobile is identical in format to web — same backend validates both
- API base URL should be configurable from SettingsScreen so field deployments can point to different backend instances
