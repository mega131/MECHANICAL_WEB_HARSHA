# ESP32 Hardware Integration & Firmware Flashing Guide

This guide walks you through connecting an ESP32 microcontroller with an MPU-6050 (or ADXL345) 3-axis accelerometer to transmit real-time vibration data to the Smart Motor Vibration Monitoring dashboard.

---

## 1. Required Components

1. **ESP32 DevKit V1** (or ESP32-WROOM-32)
2. **MPU-6050 6-Axis IMU** (or ADXL345 3-Axis Accelerometer)
3. **Mounting Stud or Industrial Magnet Base** (to fix accelerometer securely onto motor Drive-End bearing housing)
4. **4-Pin Dupont Jumper Wires** (VCC, GND, SDA, SCL)
5. **Micro-USB Cable**

---

## 2. Wiring Diagram

Connect the sensor to the ESP32 using the standard I2C bus:

| MPU-6050 / ADXL345 Pin | ESP32 GPIO Pin | Function | Notes |
|:---|:---|:---|:---|
| **VCC** | **3V3** (or 5V if module has on-board 3.3V LDO) | Power Supply | 3.3V recommended |
| **GND** | **GND** | Ground | Common reference |
| **SDA** | **GPIO 21** | I2C Serial Data | Standard default ESP32 SDA |
| **SCL** | **GPIO 22** | I2C Serial Clock | Standard default ESP32 SCL |
| **AD0** | **GND** | I2C Address Select | Sets I2C address to `0x68` |

---

## 3. Arduino IDE Setup & Required Libraries

1. Open **Arduino IDE** (v2.0 or newer).
2. Go to **File -> Preferences** and add the ESP32 board manager URL:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools -> Board -> Boards Manager**, search for **esp32** by Espressif Systems, and click **Install**.
4. Go to **Sketch -> Include Library -> Manage Libraries...** and install:
   - **ArduinoJson** by Benoit Blanchon (version 6.x or 7.x)

---

## 4. Flashing the Firmware

1. Open the project firmware sketch located at:
   ```
   esp32/Motor_Vibration_Monitor.ino
   ```
2. Update the Wi-Fi credentials:
   ```cpp
   const char* ssid     = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Update the backend server URL with the local IP of the computer running the Node.js server:
   ```cpp
   // Replace with your backend server IP on port 5000
   const char* serverUrl = "http://192.168.1.100:5000/api/readings";
   ```
4. Connect your ESP32 via USB.
5. Select **Tools -> Board -> ESP32 Dev Module** and choose your COM port.
6. Click **Upload**.
7. Open **Tools -> Serial Monitor** (set baud rate to **115200**) to see the real-time sensor readings and HTTP 201 responses from the server.

---

## 5. Testing Ingestion Without Hardware (cURL Test)

You can immediately test whether the backend and dashboard receive live packets by running this cURL command from any terminal:

```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32-VIB-01",
    "accelerationX": 561.8,
    "accelerationY": 3.4,
    "accelerationZ": 1921.5,
    "vibrationAngleX": 1.05,
    "vibrationAngleY": 1.15,
    "vibrationAngleZ": 1.25
  }'
```

As soon as this command runs, the dashboard will immediately:
- Update metric cards with the new readings
- Append a point to the oscilloscope waveform
- Mark the ESP32 status as **ONLINE**
- Check threshold limits and trigger an alert if exceeded.
