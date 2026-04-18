/**
 * HerBlock ESP32 Field Intake Node
 * =====================================
 * Components: HX711 load cell, moisture sensor, LEDs
 * GPS: hardcoded to CMTI Bengaluru for demo
 *
 * Hardware: Harshalykumar + Karanam Nayan
 * Backend:  Pranav (sai pranav)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <HX711.h>

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const char* WIFI_SSID    = "CMTI Tp-link";
const char* WIFI_PASS    = "Cmti@2026";

const char* SERVER_URL   = "https://herblock-api.onrender.com/api/intake";
const char* DEVICE_KEY   = "hb-device-ef3a2e6af3f744c9b25972733bfcadd1";
const char* DEVICE_ID    = "INTAKE_HUB_01";
const char* HERB_TYPE    = "Ashwagandha";
const char* COLLECTOR_ID = "COL-001";

// GPS hardcoded — CMTI Bengaluru (zone expanded to 1800 km for demo)
const float GPS_LAT = 13.0326;
const float GPS_LON = 77.5354;

// ─────────────────────────────────────────────
//  PIN DEFINITIONS
// ─────────────────────────────────────────────
// HX711 load cell
#define HX711_DT    4
#define HX711_SCK   5

// Moisture sensor (analog)
#define MOISTURE_PIN  34

// Grade — hardcoded to A
#define DEFAULT_GRADE 'A'

// Status LEDs
#define LED_GREEN   25
#define LED_RED     26

// ─────────────────────────────────────────────
//  GLOBALS
// ─────────────────────────────────────────────
HX711 scale;

float weightGrams  = 0.0;
float moisturePct  = 0.0;
char  gradeSelected = DEFAULT_GRADE;
bool  submitted     = false;

// ─────────────────────────────────────────────
//  READ WEIGHT via HX711
// ─────────────────────────────────────────────
float readWeight() {
  if (scale.is_ready()) {
    float w = scale.get_units(5);
    return w < 0 ? 0 : w;
  }
  return 0.0;
}

// ─────────────────────────────────────────────
//  LED HELPER
// ─────────────────────────────────────────────
void flashLED(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH); delay(200);
    digitalWrite(pin, LOW);  delay(200);
  }
}

// ─────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n===== HerBlock Booting =====");

  // LEDs
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED,   OUTPUT);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED,   LOW);
  flashLED(LED_GREEN, 1);
  flashLED(LED_RED,   1);

  // HX711
  scale.begin(HX711_DT, HX711_SCK);
  scale.set_scale(2280.0);  // calibration factor — adjust if weight reads wrong
  scale.tare();
  if (scale.is_ready()) {
    Serial.println("[HX711] OK — tared");
  } else {
    Serial.println("[HX711] NOT FOUND — check DT=4, SCK=5");
  }

  // WiFi
  Serial.printf("[WiFi] connecting to: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WiFi] connected — IP: %s\n", WiFi.localIP().toString().c_str());
    flashLED(LED_GREEN, 3);
  } else {
    Serial.println("[WiFi] FAILED — check credentials");
    flashLED(LED_RED, 5);
  }

  Serial.println("===== Ready =====");
}

// ─────────────────────────────────────────────
//  LOOP
// ─────────────────────────────────────────────
void loop() {
  // Read load cell
  weightGrams = readWeight();
  if (weightGrams < 0) weightGrams = 0;

  // Read moisture
  int raw = analogRead(MOISTURE_PIN);
  moisturePct = map(raw, 0, 4095, 100, 0);

  // Serial debug every 2s
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 2000) {
    Serial.printf("[SENSOR] wt=%.1fg  moist=%.1f%%  grade=%c  wifi=%s\n",
      weightGrams, moisturePct,
      gradeSelected,
      WiFi.status() == WL_CONNECTED ? "OK" : "LOST");
    lastPrint = millis();
  }

  // Auto-submit every 30 seconds
  static unsigned long lastSubmit = 0;
  if (!submitted && WiFi.status() == WL_CONNECTED && millis() - lastSubmit > 30000) {
    lastSubmit = millis();
    submitToBackend();
  }

  delay(200);
}

// ─────────────────────────────────────────────
//  SUBMIT TO BACKEND
// ─────────────────────────────────────────────
void submitToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] No WiFi — skipping submit");
    flashLED(LED_RED, 3);
    return;
  }

  Serial.println("[HTTP] Submitting...");
  digitalWrite(LED_GREEN, HIGH);

  String payload = "{";
  payload += "\"device_id\":\""      + String(DEVICE_ID)      + "\",";
  payload += "\"herb_type\":\""      + String(HERB_TYPE)       + "\",";
  payload += "\"weight_grams\":"     + String(weightGrams, 1)  + ",";
  payload += "\"moisture_percent\":" + String(moisturePct, 1)  + ",";
  payload += "\"latitude\":"         + String(GPS_LAT, 4)      + ",";
  payload += "\"longitude\":"        + String(GPS_LON, 4)      + ",";
  payload += "\"collector_id\":\""   + String(COLLECTOR_ID)    + "\",";
  payload += "\"quality_grade\":\""  + String(gradeSelected)   + "\",";
  payload += "\"notes\":\"CMTI DIC 2026 Demo\"";
  payload += "}";

  Serial.printf("[HTTP] POST → %s\n", SERVER_URL);
  Serial.println(payload);

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key",  DEVICE_KEY);

  int    code     = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.printf("[HTTP] code=%d  response=%s\n", code, response.c_str());

  digitalWrite(LED_GREEN, LOW);

  if (code == 200) {
    if (response.indexOf("accepted") >= 0) {
      Serial.println("[RESULT] ACCEPTED — Blockchain OK!");
      flashLED(LED_GREEN, 3);
    } else {
      Serial.println("[RESULT] REJECTED — GPS/Zone fail");
      flashLED(LED_RED, 5);
    }
  } else {
    Serial.printf("[RESULT] HTTP Error %d\n", code);
    flashLED(LED_RED, 3);
  }

  submitted     = true;
  gradeSelected = DEFAULT_GRADE;
  delay(3000);
  submitted = false;
}
