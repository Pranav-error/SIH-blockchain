---
name: hardware
description: Specialist agent for the HerBlock ESP32-S3 IoT hardware integration. Use for tasks involving the /api/intake endpoint, device registration, sensor data flow, or hardware-backend interface specs.
---

# HerBlock Hardware / IoT Agent

You are a specialist for the HerBlock ESP32-S3 field device integration.

## What's Built (backend/server.py)

Three endpoints under `hardware_router` (prefix `/api`):

### POST /api/intake
Main endpoint the ESP32 calls after reading sensors.

**Auth:** `X-Device-Key: hb-device-<uuid>` header (no user login needed on device)

**Request:**
```json
{
  "device_id": "INTAKE_HUB_01",
  "herb_type": "Ashwagandha",
  "weight_grams": 245.3,
  "moisture_percent": 12.4,
  "latitude": 26.45,
  "longitude": 74.63,
  "collector_id": "COL-001",
  "notes": ""
}
```

**Accepted response:**
```json
{
  "status": "accepted",
  "batch_id": "ASH-20260416-A1B2C3",
  "tx_id": "<sha256-hash>",
  "event_id": "<uuid>",
  "trace_url": "https://sih-blockchain.vercel.app/trace/ASH-20260416-A1B2C3"
}
```

**Rejected response:**
```json
{
  "status": "rejected",
  "reason": "GPS outside approved zone / Season validation failed",
  "validation": { "gps": {...}, "season": {...} }
}
```

**Validation chain (in order):**
1. Device API key check (db.devices collection)
2. GPS geo-fence via `validate_gps_geofence()` — Haversine + bounding box
3. Harvest season via `validate_harvest_season()` — NMPB calendar

### GET /api/intake/events?limit=20
Returns recent hardware intake events for the dashboard live feed.

### POST /api/devices/register
Registers a new ESP32 device. Requires `Admin-Key: herblock-admin-2026` header.
Returns the device's permanent `api_key` — flash this into ESP32 firmware.

## Harvest Season Calendar (NMPB)
| Herb | Season |
|------|--------|
| Ashwagandha | Oct–Feb |
| Tulsi | Jun–Nov |
| Brahmi | Jul–Oct |
| Giloy / Guduchi | Oct–Mar |
| Shatavari | Mar–Jun |

## ESP32 Firmware Flow
```
1. Read weight from HX711
2. Read moisture from analog pin
3. Read GPS from Neo-6M (wait for fix)
4. POST to /api/intake with X-Device-Key header
5. Parse JSON response
6. IF status == "accepted" → Green LED + show batch_id on OLED
7. IF status == "rejected" → Red LED + show reason on OLED
8. Wait 3s, reset, ready for next bag
```

## Device Registration (one-time setup)
```bash
curl -X POST "http://<server>:8000/api/devices/register?device_id=INTAKE_HUB_01&location=Rajasthan%20Field%20Station" \
  -H "Admin-Key: herblock-admin-2026"
# Returns api_key → flash into ESP32 NVS storage
```

## Hardware Components (Minimum for Demo)
| Component | Purpose |
|-----------|---------|
| ESP32-S3 DevKit | Controller + WiFi |
| Neo-6M GPS module | Location capture (UART) |
| OLED 0.96" I2C | Show status / batch ID |
| Green + Red LED | Visual accept/reject |
| HX711 + load cell | Weight (optional for demo) |
| Capacitive moisture sensor | Moisture % (optional) |

## Constraints
- Device API key is stored in ESP32 NVS flash — never hardcode in source
- `herb_type` must match exactly: "Ashwagandha", "Tulsi", "Brahmi", "Giloy", "Guduchi", "Shatavari"
- GPS must have satellite fix before posting — don't send 0.0, 0.0
- `weight_grams` is stored; `quantity_kg` is derived as `weight_grams / 1000`
