/**
 * HerBlock ESP32-S3 Field Intake Node
 * =====================================
 * Captures herb weight + moisture from sensors, lets the collector
 * press A/B/C to assign quality grade, then POSTs a JSON record to
 * the HerBlock backend /api/intake endpoint.
 *
 * GPS is HARDCODED for the CMTI demo (Neo-6M won't lock indoors).
 * Coords 26.45, 74.63 = Rajasthan — valid Ashwagandha zone (600 km radius).
 *
 * Hardware team: Harshalykumar + Karanam Nayan
 * Backend by: Pranav (sai pranav)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <HX711.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

// ─────────────────────────────────────────────
//  CONFIG — edit before flashing
// ─────────────────────────────────────────────
const char* WIFI_SSID    = "YOUR_WIFI_SSID";
const char* WIFI_PASS    = "YOUR_WIFI_PASSWORD";

const char* SERVER_IP    = "192.168.1.100";  // run: ifconfig | grep "inet " on your laptop
const int   SERVER_PORT  = 8080;
const char* DEVICE_KEY   = "hb-device-REPLACE_WITH_API_KEY"; // from: POST /api/devices/register
const char* DEVICE_ID    = "INTAKE_HUB_01";
const char* HERB_TYPE    = "Ashwagandha";    // change per batch
const char* COLLECTOR_ID = "COL-001";

// GPS — hardcoded (Neo-6M won't lock indoors)
// 26.45, 74.63 = Rajasthan — passes 600 km Haversine check for Ashwagandha
const float GPS_LAT = 26.45;
const float GPS_LON = 74.63;

// ─────────────────────────────────────────────
//  PIN DEFINITIONS
// ─────────────────────────────────────────────
// HX711 weight sensor
#define HX711_DOUT  4
#define HX711_SCK   5

// Moisture sensor (analog)
#define MOISTURE_PIN 34

// Grade buttons
#define BTN_GRADE_A  12
#define BTN_GRADE_B  13
#define BTN_GRADE_C  14

// Status LEDs
#define LED_GREEN    25
#define LED_RED      26

// OLED (I2C)
#define OLED_SDA     21
#define OLED_SCL     22
#define OLED_ADDR    0x3C
#define OLED_WIDTH   128
#define OLED_HEIGHT  64

// ─────────────────────────────────────────────
//  GLOBALS
// ─────────────────────────────────────────────
HX711 scale;
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

float   weightGrams   = 0.0;
float   moisturePct   = 0.0;
char    gradeSelected = 0;   // 'A', 'B', or 'C' — set by button press
bool    submitted     = false;

// ─────────────────────────────────────────────
//  SETUP
// ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  // OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("[OLED] init failed");
  }
  oledMessage("HerBlock", "Booting...");

  // Grade buttons
  pinMode(BTN_GRADE_A, INPUT_PULLUP);
  pinMode(BTN_GRADE_B, INPUT_PULLUP);
  pinMode(BTN_GRADE_C, INPUT_PULLUP);

  // LEDs
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED,   OUTPUT);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED,   LOW);

  // HX711
  scale.begin(HX711_DOUT, HX711_SCK);
  scale.set_scale(2280.0);  // calibration factor — adjust for your load cell
  scale.tare();
  Serial.println("[HX711] ready");

  // WiFi
  oledMessage("WiFi", "Connecting...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] connected — IP: %s\n", WiFi.localIP().toString().c_str());
    oledMessage("WiFi OK", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] FAILED — running offline");
    oledMessage("WiFi FAIL", "Offline mode");
  }

  delay(1500);
  oledMessage("Ready", "Press A / B / C");
}

// ─────────────────────────────────────────────
//  LOOP
// ─────────────────────────────────────────────
void loop() {
  // Read sensors
  if (scale.is_ready()) {
    weightGrams = scale.get_units(5);
    if (weightGrams < 0) weightGrams = 0;
  }

  int rawMoisture = analogRead(MOISTURE_PIN);
  // Map raw ADC (0–4095) to percentage (0–100)
  moisturePct = map(rawMoisture, 0, 4095, 100, 0);

  // Poll grade buttons (active LOW)
  if (digitalRead(BTN_GRADE_A) == LOW) { gradeSelected = 'A'; submitted = false; delay(300); }
  if (digitalRead(BTN_GRADE_B) == LOW) { gradeSelected = 'B'; submitted = false; delay(300); }
  if (digitalRead(BTN_GRADE_C) == LOW) { gradeSelected = 'C'; submitted = false; delay(300); }

  // Update OLED display
  if (!submitted) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.printf("Herb:  %s\n", HERB_TYPE);
    display.printf("Wt:    %.1f g\n", weightGrams);
    display.printf("Moist: %.1f%%\n", moisturePct);
    display.printf("GPS:   DEMO MODE\n");
    if (gradeSelected) {
      display.printf("Grade: %c  [SUBMIT?]\n", gradeSelected);
    } else {
      display.println("Press A / B / C");
    }
    display.display();
  }

  // Submit once a grade is selected and we haven't submitted yet
  if (gradeSelected && !submitted) {
    delay(1000);  // short pause so collector can confirm
    submitToBackend();
  }

  delay(200);
}

// ─────────────────────────────────────────────
//  SUBMIT TO BACKEND
// ─────────────────────────────────────────────
void submitToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] no WiFi — skipping");
    oledMessage("No WiFi", "Can't submit");
    flashLED(LED_RED, 3);
    return;
  }

  oledMessage("Sending...", "Please wait");

  // Build JSON payload
  StaticJsonDocument<512> doc;
  doc["device_id"]       = DEVICE_ID;
  doc["herb_type"]       = HERB_TYPE;
  doc["weight_grams"]    = weightGrams;
  doc["moisture_percent"]= moisturePct;
  doc["latitude"]        = GPS_LAT;
  doc["longitude"]       = GPS_LON;
  doc["collector_id"]    = COLLECTOR_ID;
  doc["quality_grade"]   = String(gradeSelected);
  doc["notes"]           = "CMTI DIC 2026 Demo - GPS hardcoded";

  String payload;
  serializeJson(doc, payload);

  Serial.printf("[HTTP] POST %s:%d/api/intake\n", SERVER_IP, SERVER_PORT);
  Serial.println(payload);

  String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/intake";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type",  "application/json");
  http.addHeader("X-Device-Key",  DEVICE_KEY);

  int statusCode = http.POST(payload);
  String response = http.getString();
  http.end();

  Serial.printf("[HTTP] status: %d\n", statusCode);
  Serial.println(response);

  // Parse response
  StaticJsonDocument<512> resp;
  DeserializationError err = deserializeJson(resp, response);

  if (statusCode == 200 && !err) {
    const char* status = resp["status"] | "unknown";
    const char* grade  = resp["grade"]  | "?";

    if (String(status) == "accepted") {
      oledMessage("ACCEPTED", String("Grade: ") + grade);
      flashLED(LED_GREEN, 3);
      submitted = true;
      gradeSelected = 0;  // reset for next batch
    } else {
      const char* reason = resp["reason"] | "GPS rejected";
      oledMessage("REJECTED", reason);
      flashLED(LED_RED, 5);
      submitted = true;
    }
  } else {
    Serial.printf("[HTTP] error — code %d\n", statusCode);
    oledMessage("HTTP Error", String(statusCode));
    flashLED(LED_RED, 3);
  }

  delay(3000);
  submitted = false;
  oledMessage("Ready", "Press A / B / C");
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
void oledMessage(const char* line1, const char* line2) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 8);
  display.println(line1);
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.println(line2);
  display.display();
}

void oledMessage(const char* line1, String line2) {
  oledMessage(line1, line2.c_str());
}

void flashLED(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200);
    digitalWrite(pin, LOW);
    delay(200);
  }
}
