# Smart Motor Vibration Monitoring - System Architecture & Design

## 1. High-Level Architecture Overview

The system is designed with a strict decoupling of layers:
```
[Physical Motor] 
       │
       ▼ (Tri-axial vibration: Radial X, Axial Y, Tangential Z)
[Tri-Axial MEMS Accelerometer (MPU-6050 / ADXL345)]
       │
       ▼ (I2C Bus: SDA/GPIO21, SCL/GPIO22)
[ESP32 Microcontroller Edge Node]
       │
       ▼ (HTTP POST / WebSocket JSON Telemetry over Wi-Fi)
[Node.js + Express Backend Gateway (Port 5000)]
       ├── Multer CSV Processing Engine
       ├── Deterministic ISO 10816 Threshold & Alert Engine
       ├── Storage Adapter (In-Memory + File Persistence + PostgreSQL/TimescaleDB Ready)
       │
       ▼ (Socket.IO Real-Time Broadcast: `sensor:reading`, `device:status`)
[React 18 + Vite Industrial IoT Dashboard]
       ├── DataProvider (Dual-Mode: CSV Provider vs Live IoT Provider vs Simulation)
       ├── 3D / Isometric Motor Digital Twin Schematic
       ├── Recharts Visualizations (Acceleration, Envelope, Angle Phase, Trends)
       └── Audit Logging, Filtering & CSV Exporters
```

## 2. Telemetry Normalization Model

Both historical CSV imports and live IoT packets from the ESP32 conform to a normalized data schema:

```typescript
interface NormalizedSensorReading {
  id: string;                      // Unique reading identifier
  timestamp: string;               // ISO 8601 UTC timestamp
  rawTimestamp: string;            // Exact original timestamp string (e.g. "03-09-26, 12:00 am")
  accelerationX: number | null;    // Radial acceleration (mm/s²)
  accelerationY: number | null;    // Axial acceleration (mm/s²)
  accelerationZ: number | null;    // Tangential acceleration (mm/s²)
  vibrationMagnitude: number;      // Calculated vector magnitude: sqrt(x² + y² + z²)
  vibrationAngleX: number | null;  // X-axis vibration tilt angle (degrees or null)
  vibrationAngleY: number | null;  // Y-axis vibration tilt angle (degrees or null)
  vibrationAngleZ: number | null;  // Z-axis vibration tilt angle (degrees or null)
  deviceId: string;                // Hardware identifier (e.g. "ESP32-VIB-01" or "CSV-HISTORICAL")
  source: 'csv' | 'live' | 'simulation'; // Telemetry origin
}
```

## 3. Strict Data Integrity Principles

1. **No Fake Data In Live Mode**: When in Live IoT Mode without hardware streaming, the UI displays "Hardware Not Connected" with a waiting state. It does NOT invent dummy values.
2. **Preservation of Nulls**: Vibration angle columns with empty/null cells are maintained as `null` rather than falsified to `0.0`. In charts, `connectNulls={false}` preserves genuine unrecorded intervals as line breaks.
3. **Calculated Acceleration Magnitude**: Magnitude is explicitly computed as:
   $$\text{Magnitude} = \sqrt{\text{Acc\_X}^2 + \text{Acc\_Y}^2 + \text{Acc\_Z}^2}$$
   It is labeled as "Calculated Acceleration Magnitude", not directly measured RMS velocity.
4. **Provisional Thresholds**: Alarm levels are clearly flagged as provisional guidelines requiring calibration against motor class specifications (ISO 10816 / 20816).
