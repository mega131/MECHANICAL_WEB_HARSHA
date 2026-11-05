/*
  Smart Motor Vibration & Acceleration Monitor - ESP32 Firmware
  Hardware: ESP32 DevKit V1 + MPU-6050 (or ADXL345) 3-Axis Accelerometer
  
  Sends calibrated sensor readings to Node.js Backend API:
  POST http://<SERVER_IP>:5000/api/readings
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (v6+)

// ================= WIFI CONFIGURATION =================
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ================= BACKEND API CONFIGURATION =================
// Replace with the IP address of the machine running the backend server
const char* serverUrl = "http://192.168.1.100:5000/api/readings";
const char* deviceId  = "ESP32-VIB-01";

// ================= SENSOR (MPU6050) REGISTERS =================
const int MPU_ADDR = 0x68;
const float G_TO_MM_S2 = 9806.65; // 1g = 9.80665 m/s² = 9806.65 mm/s²

// Transmission interval in milliseconds
const unsigned long TRANSMIT_INTERVAL_MS = 2000;
unsigned long lastTransmitTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n[INIT] Starting Smart Motor Vibration IoT Transmitter");

  // Initialize I2C communication
  Wire.begin(21, 22); // SDA = GPIO 21, SCL = GPIO 22
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0);    // Wake up MPU-6050
  byte error = Wire.endTransmission();
  
  if (error == 0) {
    Serial.println("[SENSOR] MPU-6050 initialized successfully.");
  } else {
    Serial.printf("[SENSOR] ERROR: Could not find MPU-6050 (code %d). Check wiring.\n", error);
  }

  // Connect to WiFi
  Serial.printf("[WIFI] Connecting to %s", ssid);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected!");
    Serial.printf("[WIFI] IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Failed to connect. Will retry during loop.");
  }
}

void loop() {
  unsigned long now = millis();
  if (now - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = now;
    readAndTransmitVibration();
  }
}

void readAndTransmitVibration() {
  // Read raw acceleration from MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Starting register for Accel readings
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  if (Wire.available() < 6) {
    Serial.println("[SENSOR] Error: Accelerometer data unavailable.");
    return;
  }

  int16_t rawX = Wire.read() << 8 | Wire.read();
  int16_t rawY = Wire.read() << 8 | Wire.read();
  int16_t rawZ = Wire.read() << 8 | Wire.read();

  // Convert raw 16-bit to 'g' (at default +-2g sensitivity, 16384 LSB/g)
  // Then convert to mm/s² (1 g = 9806.65 mm/s²)
  float accX_mm_s2 = (rawX / 16384.0) * G_TO_MM_S2;
  float accY_mm_s2 = (rawY / 16384.0) * G_TO_MM_S2;
  float accZ_mm_s2 = (rawZ / 16384.0) * G_TO_MM_S2;

  // Calculate tilt/vibration angles in degrees if applicable
  float angleX = atan2(accY_mm_s2, sqrt(accX_mm_s2 * accX_mm_s2 + accZ_mm_s2 * accZ_mm_s2)) * 180.0 / PI;
  float angleY = atan2(accX_mm_s2, sqrt(accY_mm_s2 * accY_mm_s2 + accZ_mm_s2 * accZ_mm_s2)) * 180.0 / PI;
  float angleZ = atan2(sqrt(accX_mm_s2 * accX_mm_s2 + accY_mm_s2 * accY_mm_s2), accZ_mm_s2) * 180.0 / PI;

  // Print to Serial for debugging
  Serial.printf("[READING] Acc(X,Y,Z)=(%.1f, %.1f, %.1f) mm/s² | Ang(X,Y,Z)=(%.1f, %.1f, %.1f) deg\n",
    accX_mm_s2, accY_mm_s2, accZ_mm_s2, angleX, angleY, angleZ);

  // If WiFi is disconnected, attempt reconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Reconnecting...");
    WiFi.reconnect();
    return;
  }

  // Construct JSON payload
  StaticJsonDocument<384> doc;
  doc["deviceId"] = deviceId;
  doc["source"] = "live";
  doc["accelerationX"] = round(accX_mm_s2 * 10.0) / 10.0;
  doc["accelerationY"] = round(accY_mm_s2 * 10.0) / 10.0;
  doc["accelerationZ"] = round(accZ_mm_s2 * 10.0) / 10.0;
  doc["vibrationAngleX"] = round(angleX * 10.0) / 10.0;
  doc["vibrationAngleY"] = round(angleY * 10.0) / 10.0;
  doc["vibrationAngleZ"] = round(angleZ * 10.0) / 10.0;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send HTTP POST to backend server
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    Serial.printf("[HTTP] Success! Server code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[HTTP] Error sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
