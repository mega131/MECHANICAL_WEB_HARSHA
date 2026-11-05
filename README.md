# Smart Motor Vibration Monitoring Dashboard with Real-Time IoT Integration

![License](https://img.shields.io/badge/License-MIT-emerald.svg)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-teal.svg)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-cyan.svg)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-blue.svg)
![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-green.svg)
![Microcontroller](https://img.shields.io/badge/Hardware-ESP32%20%2B%20MPU6050-orange.svg)

A professional, high-performance industrial IoT web application for monitoring motor vibration and acceleration data.

Built with a dark charcoal industrial aesthetic, vibrant teal/emerald accents, warning amber badges, and high-frequency real-time charts. It initially operates using the supplied historical dataset `Motor Vibration.csv`, while featuring an extensible, decoupled architecture ready for live edge telemetry from an ESP32 or compatible microcontroller.

---

## 🚀 Key Highlights & Architecture

- **Dual-Data Architecture (CSV Mode & Live IoT Mode):**
  - **CSV Mode (Default):** Directly loads, parses, and analyzes historical sensor records from `Motor Vibration.csv`.
  - **Live IoT Mode:** Pre-wired for physical sensor telemetry via REST API and Socket.IO. When hardware is offline, displays an explicit waiting state without generating fake readings.
  - **Simulation Mode (Dev):** Opt-in test stream generator clearly badged as `SIMULATED DATA`.
- **10 Industrial Metric KPI Cards:**
  - Latest X-Axis Acceleration (`559.0 mm/s²`)
  - Latest Y-Axis Acceleration (`2.33 mm/s²`)
  - Latest Z-Axis Acceleration (`1922.1 mm/s²`)
  - **Calculated Acceleration Magnitude:** Explicitly computed using $\sqrt{\text{Acc\_X}^2 + \text{Acc\_Y}^2 + \text{Acc\_Z}^2}$ ($2001.9\text{ mm/s²}$).
  - Latest Vibration Angles (X, Y, Z) with proper `N/A` for missing values.
  - Total Recorded Readings counter.
  - Motor Condition status (Normal / Warning / Critical / Thresholds not configured).
  - Preserved original timestamp.
- **Interactive 3D / Isometric Motor Digital Twin:**
  - Real-time schematic showing Stator, Rotor Shaft, Drive-End (DE) bearing housing, and sensor pod.
  - Tri-axial vibration vectors (X, Y, Z) animated dynamically according to actual sensor values.
  - View modes: *3D View*, *Exploded View*, and *Sensor Axes*.
- **6 Comprehensive Interactive Charts (Recharts):**
  1. *Acceleration Over Time:* Tri-axial timeline with legend toggles, custom tooltips, and range selector.
  2. *Individual Axis Analysis:* Selectable X, Y, or Z zoom with statistical envelope and threshold lines.
  3. *Vibration-Angle Analysis:* Displays tilt angles with preserved gaps (`connectNulls={false}`) for missing values.
  4. *Axis Comparison:* Side-by-side current, average, and maximum comparison across axes.
  5. *Historical Trend:* Configurable parameter progression across time intervals.
  6. *Recent Readings Timeline:* Sleek compact chronological telemetry feed.
- **Configurable Motor Condition & Alerts:**
  - Threshold management for warning and critical limits.
  - Explicit provisional disclaimer: Requires validation against motor class standards (ISO 10816).
  - Historical alerts log with acknowledgement workflow.
- **Statistical Engineering Reports:**
  - Min, Max, Mean, Standard Deviation ($\sigma$), Peak-to-Peak, and null rates calculated strictly from real data.
  - Printable layout and downloadable summary text/CSV report.
- **ESP32 Microcontroller Ready:**
  - Complete Arduino C++ sketch in `esp32/Motor_Vibration_Monitor.ino`.
  - Ingestion endpoint: `POST /api/readings`.
  - PostgreSQL / TimescaleDB time-series schema in `backend/db/schema.sql`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Data Visualization** | Recharts (Responsive Line, Area, Bar, Composed charts) |
| **Real-Time Client** | Socket.IO Client (WebSocket) |
| **CSV Engine** | Papa Parse (High-speed client & server parsing) |
| **Backend API** | Node.js, Express, Socket.IO, Multer, Dotenv |
| **Storage & Database** | In-Memory Ring Buffer, JSON Store, PostgreSQL / TimescaleDB Schema |
| **Hardware Firmware** | C++ / Arduino sketch for ESP32 + MPU-6050 / ADXL345 |

---

## 📁 Project Structure

```
├── Motor Vibration.csv           # Original historical sensor readings dataset
├── package.json                  # Root runner script (runs frontend & backend)
├── README.md                     # Project documentation & overview
│
├── backend/                      # Node.js + Express Backend
│   ├── server.js                 # HTTP Server, REST API & Socket.IO Gateway
│   ├── services/
│   │   ├── csvParser.js          # CSV parsing, header trimming, null handling
│   │   └── storage.js            # Reading store, alerts engine, device tracker
│   ├── db/
│   │   └── schema.sql            # PostgreSQL & TimescaleDB hypertable schema
│   ├── test/
│   │   └── csvParser.test.js     # Unit tests for parser and magnitude calculation
│   ├── data/
│   │   └── Motor Vibration.csv   # Backend seed dataset
│   └── package.json
│
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI & Chart components
│   │   │   ├── Sidebar.jsx       # Fixed industrial navigation sidebar
│   │   │   ├── Navbar.jsx        # Top telemetry bar, live clock, status badges
│   │   │   ├── MetricCards.jsx   # 10 Main KPI cards
│   │   │   ├── Motor3DViewer.jsx # 3D / Isometric Digital Twin schematic
│   │   │   └── charts/           # 6 Recharts interactive visualizations
│   │   ├── context/
│   │   │   └── DataContext.jsx   # Global state & Dual-mode data provider
│   │   ├── pages/                # 9 Distinct functional dashboard pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LiveMonitoringPage.jsx
│   │   │   ├── VibrationAnalysisPage.jsx
│   │   │   ├── HistoricalDataPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SensorConfigPage.jsx
│   │   │   ├── DeviceConnectionPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/             # API client & client CSV parser
│   │   ├── App.jsx               # Root layout
│   │   └── main.jsx
│   └── public/
│       └── Motor Vibration.csv   # Client static fallback dataset
│
├── esp32/                        # Hardware Firmware
│   └── Motor_Vibration_Monitor.ino # Arduino C++ sketch for ESP32 + MPU6050
│
└── docs/                         # Detailed Engineering Specifications
    ├── ARCHITECTURE.md           # System data flow and integrity rules
    ├── ESP32_SETUP_GUIDE.md      # Pinouts, wiring, and flashing instructions
    └── API_DOCUMENTATION.md      # REST & Socket.IO specification
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or newer (Tested on Node v22)
- **npm**: v9.0.0 or newer

### 2. Install Dependencies
Run from the root directory:
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Run the Complete System
Run both backend and frontend together with a single command:
```bash
npm run dev
```

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Socket.IO Stream:** `ws://localhost:5000`

Or start them individually:
```bash
# Terminal 1: Start Backend API
npm run backend

# Terminal 2: Start Frontend Dashboard
npm run frontend
```

---

## 🧪 Running Automated Tests

To run the backend test suite verifying CSV parsing, trailing header whitespace trimming, null-value preservation, and mathematical magnitude calculation:

```bash
npm test
```

Expected output:
```
# Subtest: CSV Parser and Normalization
    ok 1 - should trim column headers with trailing spaces and map values accurately
    ok 2 - should calculate overall acceleration magnitude as sqrt(x^2 + y^2 + z^2)
    ok 3 - should handle missing values without inventing fake numbers
    ok 4 - should parse multi-line CSV string correctly
# tests 4 | pass 4 | fail 0
```

---

## 🔌 Connecting Physical ESP32 Hardware

1. Follow the wiring table in [docs/ESP32_SETUP_GUIDE.md](docs/ESP32_SETUP_GUIDE.md).
2. Open `esp32/Motor_Vibration_Monitor.ino` in Arduino IDE.
3. Configure your local Wi-Fi SSID and backend URL (`http://<YOUR_IP>:5000/api/readings`).
4. Flash the sketch to the ESP32.
5. In the dashboard, switch the Data Source mode to **Live IoT Mode**.
6. The dashboard will automatically detect incoming packets, switch the status to **ESP32 ONLINE**, and stream real-time tri-axial measurements.

---

## 🛡️ License

MIT License. Designed and engineered for industrial motor predictive maintenance and vibration telemetry.
