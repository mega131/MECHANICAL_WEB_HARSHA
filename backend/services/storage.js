import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'readings_store.json');

class StorageService {
  constructor() {
    this.readings = [];
    this.alerts = [];
    this.mode = 'csv'; // 'csv' | 'live' | 'simulation'
    
    // Configurable thresholds (Provisional defaults - labeled as requiring engineering validation)
    this.thresholds = {
      isConfigured: true,
      provisionalNotice: "Thresholds are provisional and require calibration against motor class specifications (e.g., ISO 10816 / 20816)",
      warning: {
        accelerationX: 600,   // mm/s²
        accelerationY: 100,   // mm/s²
        accelerationZ: 1925,  // mm/s²
        magnitude: 2050       // mm/s²
      },
      critical: {
        accelerationX: 650,   // mm/s²
        accelerationY: 300,   // mm/s²
        accelerationZ: 1935,  // mm/s²
        magnitude: 2150       // mm/s²
      }
    };

    // Registered hardware IoT devices
    this.devices = [
      {
        deviceId: 'ESP32-VIB-01',
        deviceName: 'Primary Motor Drive End (DE) Sensor',
        status: 'hardware_not_connected', // 'online' | 'offline' | 'hardware_not_connected'
        ipAddress: '192.168.1.120',
        port: 5000,
        firmwareVersion: 'v1.4.2-esp32',
        sensorModel: 'MPU-6050 / ADXL345',
        sampleRateHz: 100,
        lastSeen: null,
        totalPackets: 0
      }
    ];

    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.readings)) this.readings = data.readings;
        if (Array.isArray(data.alerts)) this.alerts = data.alerts;
        if (data.thresholds) this.thresholds = { ...this.thresholds, ...data.thresholds };
        if (Array.isArray(data.devices)) this.devices = data.devices;
        if (data.mode) this.mode = data.mode;
      }
    } catch (e) {
      console.warn('Could not load persistent store, starting fresh:', e.message);
    }
  }

  save() {
    try {
      const payload = {
        mode: this.mode,
        thresholds: this.thresholds,
        devices: this.devices,
        alerts: this.alerts.slice(-200), // persist latest 200 alerts
        readings: this.readings.slice(-10000) // keep latest 10k readings in file
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save data store:', e.message);
    }
  }

  setDataset(newReadings, source = 'csv') {
    this.readings = newReadings;
    this.mode = source;
    this.evaluateAlertsForDataset();
    this.save();
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode) {
    if (['csv', 'live', 'simulation'].includes(newMode)) {
      this.mode = newMode;
      this.save();
    }
    return this.mode;
  }

  getReadings(options = {}) {
    const {
      limit = 500,
      offset = 0,
      search = '',
      startDate = null,
      endDate = null,
      axis = null,
      source = null
    } = options;

    let filtered = [...this.readings];

    if (source) {
      filtered = filtered.filter(r => r.source === source);
    }

    if (startDate) {
      const startMs = new Date(startDate).getTime();
      if (!isNaN(startMs)) {
        filtered = filtered.filter(r => {
          const t = new Date(r.timestamp || r.rawTimestamp).getTime();
          return isNaN(t) || t >= startMs;
        });
      }
    }

    if (endDate) {
      const endMs = new Date(endDate).getTime();
      if (!isNaN(endMs)) {
        filtered = filtered.filter(r => {
          const t = new Date(r.timestamp || r.rawTimestamp).getTime();
          return isNaN(t) || t <= endMs;
        });
      }
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        (r.rawTimestamp && r.rawTimestamp.toLowerCase().includes(q)) ||
        (r.deviceId && r.deviceId.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

    return {
      total,
      limit: Number(limit),
      offset: Number(offset),
      readings: paginated
    };
  }

  getLatestReading() {
    if (this.readings.length === 0) return null;
    return this.readings[this.readings.length - 1];
  }

  addReading(reading) {
    // Validate required fields
    if (reading.accelerationX == null && reading.accelerationY == null && reading.accelerationZ == null) {
      throw new Error('Reading must contain at least one valid acceleration axis');
    }

    // Compute magnitude if not provided
    if (reading.vibrationMagnitude == null) {
      const x = reading.accelerationX ?? 0;
      const y = reading.accelerationY ?? 0;
      const z = reading.accelerationZ ?? 0;
      reading.vibrationMagnitude = parseFloat(Math.sqrt(x * x + y * y + z * z).toFixed(2));
    }

    const newReading = {
      id: reading.id || `live-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: reading.timestamp || new Date().toISOString(),
      rawTimestamp: reading.rawTimestamp || new Date().toLocaleString(),
      accelerationX: reading.accelerationX ?? null,
      accelerationY: reading.accelerationY ?? null,
      accelerationZ: reading.accelerationZ ?? null,
      vibrationMagnitude: reading.vibrationMagnitude,
      vibrationAngleX: reading.vibrationAngleX ?? null,
      vibrationAngleY: reading.vibrationAngleY ?? null,
      vibrationAngleZ: reading.vibrationAngleZ ?? null,
      deviceId: reading.deviceId || 'ESP32-VIB-01',
      source: reading.source || 'live'
    };

    this.readings.push(newReading);

    // Update device status if device exists
    const dev = this.devices.find(d => d.deviceId === newReading.deviceId);
    if (dev) {
      dev.lastSeen = new Date().toISOString();
      dev.totalPackets = (dev.totalPackets || 0) + 1;
      dev.status = 'online';
    } else if (newReading.source === 'live') {
      this.devices.push({
        deviceId: newReading.deviceId,
        deviceName: `IoT Motor Sensor (${newReading.deviceId})`,
        status: 'online',
        ipAddress: 'Dynamic IP',
        lastSeen: new Date().toISOString(),
        totalPackets: 1
      });
    }

    // Check alert conditions for this single new reading
    const triggeredAlert = this.checkReadingAlert(newReading);

    this.save();
    return { reading: newReading, alert: triggeredAlert };
  }

  checkReadingAlert(reading) {
    if (!this.thresholds.isConfigured) return null;

    const { warning, critical } = this.thresholds;
    const checks = [
      { axis: 'Acc_X', val: reading.accelerationX, warn: warning.accelerationX, crit: critical.accelerationX },
      { axis: 'Acc_Y', val: reading.accelerationY, warn: warning.accelerationY, crit: critical.accelerationY },
      { axis: 'Acc_Z', val: reading.accelerationZ, warn: warning.accelerationZ, crit: critical.accelerationZ },
      { axis: 'Magnitude', val: reading.vibrationMagnitude, warn: warning.magnitude, crit: critical.magnitude }
    ];

    for (const chk of checks) {
      if (chk.val != null) {
        if (chk.crit != null && chk.val >= chk.crit) {
          const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: reading.rawTimestamp || reading.timestamp,
            severity: 'critical',
            axis: chk.axis,
            value: chk.val,
            threshold: chk.crit,
            message: `CRITICAL: ${chk.axis} reading ${chk.val} mm/s² exceeded critical limit of ${chk.crit} mm/s²`,
            acknowledged: false
          };
          this.alerts.unshift(alert);
          return alert;
        } else if (chk.warn != null && chk.val >= chk.warn) {
          const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: reading.rawTimestamp || reading.timestamp,
            severity: 'warning',
            axis: chk.axis,
            value: chk.val,
            threshold: chk.warn,
            message: `WARNING: ${chk.axis} reading ${chk.val} mm/s² exceeded warning limit of ${chk.warn} mm/s²`,
            acknowledged: false
          };
          this.alerts.unshift(alert);
          return alert;
        }
      }
    }
    return null;
  }

  evaluateAlertsForDataset() {
    this.alerts = [];
    // Scan recent dataset to populate initial alerts
    for (const r of this.readings) {
      this.checkReadingAlert(r);
    }
    // Limit to latest 50
    this.alerts = this.alerts.slice(0, 50);
  }

  getThresholds() {
    return this.thresholds;
  }

  updateThresholds(newThresholds) {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds,
      isConfigured: true
    };
    this.evaluateAlertsForDataset();
    this.save();
    return this.thresholds;
  }

  getAlerts(limit = 100) {
    return this.alerts.slice(0, limit);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.save();
    }
    return alert;
  }

  getDevices() {
    const now = Date.now();
    // Check for stale devices: if last seen > 30 seconds ago, mark offline
    return this.devices.map(dev => {
      let currentStatus = dev.status;
      if (dev.status === 'online' && dev.lastSeen) {
        const diff = now - new Date(dev.lastSeen).getTime();
        if (diff > 30000) {
          currentStatus = 'offline';
        }
      }
      return { ...dev, status: currentStatus };
    });
  }

  updateDeviceHeartbeat(deviceId, ip = null) {
    let dev = this.devices.find(d => d.deviceId === deviceId);
    if (!dev) {
      dev = {
        deviceId,
        deviceName: `Motor Sensor (${deviceId})`,
        status: 'online',
        ipAddress: ip || 'Unknown',
        lastSeen: new Date().toISOString(),
        totalPackets: 0
      };
      this.devices.push(dev);
    } else {
      dev.status = 'online';
      dev.lastSeen = new Date().toISOString();
      if (ip) dev.ipAddress = ip;
    }
    this.save();
    return dev;
  }
}

export const storage = new StorageService();
