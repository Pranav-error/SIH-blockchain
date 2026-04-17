/**
 * HerBlock ESP32 Field Intake Node
 * =====================================
 * OLED: SPI (MOSI=23, CLK=18, DC=2, RESET=4)
 * Load cell: I2C at 0x08 (SDA=21, SCL=22)
 * GPS: hardcoded to CMTI Bengaluru for demo
 *
 * Hardware: Harshalykumar + Karanam Nayan
 * Backend:  Pranav (sai pranav)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const char* WIFI_SSID    = "CMTI Tp-link";
const char* WIFI_PASS    = "Cmti@2026";

const char* SERVER_URL   = "https://herblock-api.onrender.com/api/intake";
const char* DEVICE_KEY   = "hb-device-ef3a2e6af3f744c9b25972733bfcadd1";  // production key
const char* DEVICE_ID    = "INTAKE_HUB_01";
const char* HERB_TYPE    = "Ashwagandha";
const char* COLLECTOR_ID = "COL-001";

// GPS hardcoded — CMTI Bengaluru (zone expanded to 1800 km for demo)
const float GPS_LAT = 13.0326;
const float GPS_LON = 77.5354;

// ─────────────────────────────────────────────
//  PIN DEFINITIONS
// ─────────────────────────────────────────────
// I2C (load cell)
#define I2C_SDA        21
#define I2C_SCL        22
#define LOADCELL_ADDR  0x08

// SPI OLED
#define OLED_MOSI   23
#define OLED_CLK    18
#define OLED_DC      2
#define OLED_RESET   4
#define OLED_CS     -1
#define SCREEN_W   128
#define SCREEN_H    64

// Moisture sensor (analog)
#define MOISTURE_PIN  34

// Grade buttons (active LOW)
#define BTN_GRADE_A  12
#define BTN_GRADE_B  13
#define BTN_GRADE_C  14

// Status LEDs
#define LED_GREEN    25
#define LED_RED      26

// ─────────────────────────────────────────────
//  GLOBALS
// ─────────────────────────────────────────────
Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &SPI, OLED_DC, OLED_RESET, OLED_CS);

float weightGrams  = 0.0;
float moisturePct  = 0.0;
char  gradeSelected = 0;
bool  submitted     = false;

// ─────────────────────────────────────────────
//  READ WEIGHT via I2C load cell
// ─────────────────────────────────────────────
float readWeight() {
  Wire.beginTransmission(LOADCELL_ADDR);
  Wire.write(0x00);
  Wire.endTransmission();

  Wire.requestFrom(LOADCELL_ADDR, 4);
  if (Wire.available() == 4) {
    long value = 0;
    value |= (long)Wire.read() << 24;
    value |= (long)Wire.read() << 16;
    value |= (long)Wire.read() << 8;
    value |= (long)Wire.read();
    return value / 100.0;  // adjust scale factor if needed
  }
  return 0.0;
}

// ─────────────────────────────────────────────
//  OLED HELPERS
// ─────────────────────────────────────────────
void oledMessage(const char* line1, const char* line2) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 8);
  display.println(line1);
  display.setTextSize(1);
  display.setCursor(0, 42);
  display.println(line2);
  display.display();
}

void oledMessage(const char* line1, String line2) {
  oledMessage(line1, line2.c_str());
}

void oledSplash() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(10, 4);
  display.println("HerBlock");

  display.drawLine(0, 24, 127, 24, SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(4, 28);
  display.println("Blockchain Herb Trace");
  display.setCursor(4, 40);
  display.println("CMTI DIC 2026");
  display.setCursor(4, 52);
  display.println("Patent Pending - GPS");
  display.display();
  delay(2500);
}

void oledDashboard() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Header bar (inverted)
  display.fillRect(0, 0, 128, 10, SSD1306_WHITE);
  display.setTextSize(1);
  display.setTextColor(SSD1306_BLACK);
  display.setCursor(2, 1);
  display.print("HerBlock | ");
  display.print(HERB_TYPE);
  display.setTextColor(SSD1306_WHITE);

  // Weight — large font
  display.setTextSize(2);
  display.setCursor(0, 12);
  display.print("Wt: ");
  display.print((int)weightGrams);
  display.print("g");
  display.setTextSize(1);

  // Moisture
  display.setCursor(0, 30);
  display.print("Moisture: ");
  display.print((int)moisturePct);
  display.print("%");

  // GPS
  display.setCursor(0, 40);
  display.print("GPS: CMTI BLR [OK]");

  display.drawLine(0, 51, 127, 51, SSD1306_WHITE);

  // Bottom: grade / instruction
  display.setCursor(0, 54);
  if (gradeSelected) {
    display.print("Grade: ");
    display.print(gradeSelected);
    display.print("  -> Submitting");
  } else {
    display.print("A=Best  B=OK  C=Low");
  }

  display.display();
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

  // SPI OLED — init before I2C, no manual SPI.begin()
  if (!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println("[OLED] FAILED — check SPI wiring");
  } else {
    Serial.println("[OLED] OK");
  }
  oledSplash();

  // I2C for load cell
  Wire.begin(I2C_SDA, I2C_SCL);

  // Buttons
  pinMode(BTN_GRADE_A, INPUT_PULLUP);
  pinMode(BTN_GRADE_B, INPUT_PULLUP);
  pinMode(BTN_GRADE_C, INPUT_PULLUP);

  // LEDs
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED,   OUTPUT);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED,   LOW);
  flashLED(LED_GREEN, 1);
  flashLED(LED_RED,   1);

  // WiFi
  oledMessage("WiFi", "Connecting...");
  Serial.printf("[WiFi] connecting to: %s  →  %s\n", WIFI_SSID, SERVER_URL);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Connecting WiFi...");
    display.printf("Try: %d/30\n", tries);
    display.display();
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("[WiFi] connected — IP: %s\n", WiFi.localIP().toString().c_str());
    oledMessage("WiFi OK", WiFi.localIP().toString().c_str());
    flashLED(LED_GREEN, 2);
  } else {
    Serial.println("[WiFi] FAILED");
    oledMessage("WiFi FAIL", "Check creds");
    flashLED(LED_RED, 3);
  }

  delay(1500);
  oledDashboard();
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

  // Grade buttons
  if (digitalRead(BTN_GRADE_A) == LOW) { gradeSelected = 'A'; submitted = false; delay(300); }
  if (digitalRead(BTN_GRADE_B) == LOW) { gradeSelected = 'B'; submitted = false; delay(300); }
  if (digitalRead(BTN_GRADE_C) == LOW) { gradeSelected = 'C'; submitted = false; delay(300); }

  // Refresh OLED
  if (!submitted) {
    oledDashboard();
  }

  // Serial debug every 2s
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 2000) {
    Serial.printf("[SENSOR] wt=%.1fg  moist=%.1f%%  grade=%c  wifi=%s\n",
      weightGrams, moisturePct,
      gradeSelected ? gradeSelected : '-',
      WiFi.status() == WL_CONNECTED ? "OK" : "LOST");
    lastPrint = millis();
  }

  // Submit on grade press
  if (gradeSelected && !submitted) {
    delay(800);
    submitToBackend();
  }

  delay(200);
}

// ─────────────────────────────────────────────
//  SUBMIT TO BACKEND
// ─────────────────────────────────────────────
void submitToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    oledMessage("No WiFi", "Can't submit");
    flashLED(LED_RED, 3);
    return;
  }

  oledMessage("Sending...", "Please wait");

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

  if (code == 200) {
    // Quick parse — look for "accepted"
    if (response.indexOf("accepted") >= 0) {
      oledMessage("ACCEPTED", "Blockchain OK!");
      flashLED(LED_GREEN, 3);
    } else {
      oledMessage("REJECTED", "GPS/Zone fail");
      flashLED(LED_RED, 5);
    }
  } else {
    oledMessage("HTTP Error", String(code));
    flashLED(LED_RED, 3);
  }

  submitted     = true;
  gradeSelected = 0;
  delay(3000);
  submitted = false;
  oledDashboard();
}
