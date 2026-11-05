# Smart Motor Vibration Monitoring - REST API & Socket.IO Specification

Backend Service Base URL: `http://localhost:5000`  
WebSocket Stream: `ws://localhost:5000`

---

## 1. REST Endpoints

### 1.1 Service Health
`GET /api/health`
- **Description:** Verifies service uptime, current active mode, and storage metrics.
- **Response `200 OK`:**
```json
{
  "status": "ok",
  "system": "Smart Motor Vibration Monitoring Service",
  "uptime": 1420,
  "timestamp": "2026-10-15T09:30:00.000Z",
  "mode": "csv",
  "totalReadings": 48,
  "devices": 1
}
```

---

### 1.2 Query Sensor Readings
`GET /api/readings`
- **Query Parameters:**
  - `limit` (number, default: 500)
  - `offset` (number, default: 0)
  - `search` (string)
  - `startDate` (ISO string / date string)
  - `endDate` (ISO string / date string)
  - `source` ('csv' | 'live' | 'simulation')
- **Response `200 OK`:**
```json
{
  "total": 48,
  "limit": 500,
  "offset": 0,
  "readings": [
    {
      "id": "csv-1",
      "rawTimestamp": "03-09-26, 12:00 am",
      "timestamp": "2026-09-03T00:00:00.000Z",
      "accelerationX": 558.8,
      "accelerationY": 1.95,
      "accelerationZ": 1922.2,
      "vibrationMagnitude": 2001.9,
      "vibrationAngleX": null,
      "vibrationAngleY": null,
      "vibrationAngleZ": null,
      "deviceId": "CSV-HISTORICAL",
      "source": "csv"
    }
  ]
}
```

---

### 1.3 Latest Sensor Reading
`GET /api/readings/latest`
- **Description:** Returns the single most recent valid sensor reading.
- **Response `200 OK`:**
```json
{
  "id": "csv-48",
  "rawTimestamp": "04-09-26, 11:00 pm",
  "timestamp": "2026-09-04T23:00:00.000Z",
  "accelerationX": 559.0,
  "accelerationY": 2.33,
  "accelerationZ": 1922.1,
  "vibrationMagnitude": 2001.91,
  "vibrationAngleX": null,
  "vibrationAngleY": null,
  "vibrationAngleZ": null,
  "deviceId": "CSV-HISTORICAL",
  "source": "csv"
}
```

---

### 1.4 Ingest Hardware Sensor Reading (ESP32 Ingestion)
`POST /api/readings`
- **Description:** Ingests a new sensor reading packet from an authorized hardware node or test client.
- **Request Body:**
```json
{
  "deviceId": "ESP32-VIB-01",
  "accelerationX": 560.5,
  "accelerationY": 3.12,
  "accelerationZ": 1920.4,
  "vibrationAngleX": 1.0,
  "vibrationAngleY": 1.2,
  "vibrationAngleZ": 1.1,
  "timestamp": "2026-10-15T09:35:00.000Z"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "reading": {
    "id": "live-1729000000-abc12",
    "timestamp": "2026-10-15T09:35:00.000Z",
    "rawTimestamp": "10/15/2026, 3:05:00 PM",
    "accelerationX": 560.5,
    "accelerationY": 3.12,
    "accelerationZ": 1920.4,
    "vibrationMagnitude": 2000.74,
    "vibrationAngleX": 1.0,
    "vibrationAngleY": 1.2,
    "vibrationAngleZ": 1.1,
    "deviceId": "ESP32-VIB-01",
    "source": "live"
  },
  "alert": null
}
```

---

### 1.5 CSV Upload
`POST /api/upload-csv`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (.csv file up to 15MB)
- **Response `200 OK`:**
```json
{
  "message": "CSV parsed and imported successfully",
  "stats": {
    "totalParsed": 48,
    "validRecords": 48,
    "skippedRecords": 0,
    "errors": []
  },
  "importedCount": 48
}
```

---

### 1.6 Thresholds & Alerts
- `GET /api/alerts`: Returns recent alerts and current threshold configuration.
- `POST /api/alerts/thresholds`: Updates warning and critical thresholds for Acc X, Y, Z, and Magnitude.
- `POST /api/alerts/acknowledge/:id`: Marks an alert as acknowledged.

---

### 1.7 Registered Devices
- `GET /api/devices`: Returns registered devices, online/offline status, IP, sample rate, and packet count.
- `POST /api/devices/heartbeat`: IoT ping endpoint.

---

## 2. Real-Time Socket.IO Events

| Event Name | Direction | Payload | Description |
|:---|:---|:---|:---|
| `initial:state` | Server -> Client | `{ mode, thresholds, devices, latestReading }` | Sent immediately on client connection |
| `sensor:reading` | Server -> Client | `NormalizedSensorReading` | Broadcast whenever a new packet arrives |
| `alert:triggered` | Server -> Client | `AlertObject` | Broadcast when a reading crosses a threshold |
| `device:status` | Server -> Client | `Device[]` | Updated online/offline device states |
| `data:reloaded` | Server -> Client | `{ source, count }` | Triggered when CSV is uploaded or reset |
| `thresholds:updated` | Server -> Client | `ThresholdsObject` | Real-time threshold sync |
| `mode:changed` | Server -> Client | `{ mode }` | Active mode changed |
