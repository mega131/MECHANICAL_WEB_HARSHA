/**
 * Shared in-memory store for Vercel Serverless Functions.
 *
 * NOTE: Vercel serverless functions are stateless — each cold start
 * begins fresh. This module holds state for the duration of a warm
 * function instance and seeds from the bundled CSV on every cold start.
 *
 * For the primary use case (CSV mode / historical data), the frontend
 * fetches the CSV directly from /Motor Vibration.csv (public dir), so
 * the backend store is only needed for live IoT readings and alerts.
 */

const path = require('path');
const fs = require('fs');
const { parseMotorVibrationCsv } = require('./_csvParser');

const DEFAULT_THRESHOLDS = {
  isConfigured: true,
  provisionalNotice: 'Thresholds are provisional and require engineering validation against motor specifications (e.g. ISO 10816)',
  warning:  { accelerationX: 600, accelerationY: 100, accelerationZ: 1925, magnitude: 2050 },
  critical: { accelerationX: 650, accelerationY: 300, accelerationZ: 1935, magnitude: 2150 }
};

// Global state (lives as long as the serverless instance is warm)
if (!global._motorStore) {
  global._motorStore = {
    readings: [],
    alerts: [],
    mode: 'csv',
    thresholds: { ...DEFAULT_THRESHOLDS },
    devices: [
      {
        deviceId: 'ESP32-VIB-01',
        deviceName: 'Primary Motor Drive End (DE) Sensor',
        status: 'hardware_not_connected',
        ipAddress: '192.168.1.120',
        port: 5000,
        sensorModel: 'MPU-6050 / ADXL345',
        lastSeen: null,
        totalPackets: 0
      }
    ]
  };

  // Seed from bundled CSV (located at backend/data/Motor Vibration.csv)
  try {
    const csvPath = path.join(__dirname, '..', 'backend', 'data', 'Motor Vibration.csv');
    if (fs.existsSync(csvPath)) {
      const { readings } = parseMotorVibrationCsv(fs.readFileSync(csvPath, 'utf8'));
      global._motorStore.readings = readings;
      console.log(`[Store] Seeded ${readings.length} records from CSV`);
    }
  } catch (e) {
    console.warn('[Store] Could not seed CSV:', e.message);
  }
}

const store = global._motorStore;

function getReadings({ limit = 500, offset = 0, search = '', startDate = null, endDate = null } = {}) {
  let filtered = [...store.readings];

  if (startDate) {
    const startMs = new Date(startDate).getTime();
    if (!isNaN(startMs)) filtered = filtered.filter(r => new Date(r.timestamp).getTime() >= startMs);
  }
  if (endDate) {
    const endMs = new Date(endDate).getTime();
    if (!isNaN(endMs)) filtered = filtered.filter(r => new Date(r.timestamp).getTime() <= endMs);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r =>
      (r.rawTimestamp && r.rawTimestamp.toLowerCase().includes(q)) ||
      (r.deviceId && r.deviceId.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  return { total, limit: Number(limit), offset: Number(offset), readings: filtered.slice(Number(offset), Number(offset) + Number(limit)) };
}

function getLatestReading() {
  return store.readings.length ? store.readings[store.readings.length - 1] : null;
}

function addReading(reading) {
  if (reading.accelerationX == null && reading.accelerationY == null && reading.accelerationZ == null) {
    throw new Error('Reading must contain at least one valid acceleration axis');
  }
  if (reading.vibrationMagnitude == null) {
    const x = reading.accelerationX ?? 0;
    const y = reading.accelerationY ?? 0;
    const z = reading.accelerationZ ?? 0;
    reading.vibrationMagnitude = parseFloat(Math.sqrt(x*x + y*y + z*z).toFixed(2));
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
  store.readings.push(newReading);

  // Update device status
  const dev = store.devices.find(d => d.deviceId === newReading.deviceId);
  if (dev) {
    dev.lastSeen = new Date().toISOString();
    dev.totalPackets = (dev.totalPackets || 0) + 1;
    dev.status = 'online';
  }

  const alert = checkAlert(newReading);
  return { reading: newReading, alert };
}

function checkAlert(reading) {
  if (!store.thresholds.isConfigured) return null;
  const { warning, critical } = store.thresholds;
  const checks = [
    { axis: 'Acc_X', val: reading.accelerationX, warn: warning.accelerationX, crit: critical.accelerationX },
    { axis: 'Acc_Y', val: reading.accelerationY, warn: warning.accelerationY, crit: critical.accelerationY },
    { axis: 'Acc_Z', val: reading.accelerationZ, warn: warning.accelerationZ, crit: critical.accelerationZ },
    { axis: 'Magnitude', val: reading.vibrationMagnitude, warn: warning.magnitude, crit: critical.magnitude }
  ];
  for (const chk of checks) {
    if (chk.val != null) {
      const severity = chk.crit != null && chk.val >= chk.crit ? 'critical'
                     : chk.warn != null && chk.val >= chk.warn ? 'warning' : null;
      if (severity) {
        const alert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: reading.rawTimestamp || reading.timestamp,
          severity, axis: chk.axis, value: chk.val,
          threshold: severity === 'critical' ? chk.crit : chk.warn,
          message: `${severity.toUpperCase()}: ${chk.axis} reading ${chk.val} mm/s² exceeded ${severity} limit`,
          acknowledged: false
        };
        store.alerts.unshift(alert);
        if (store.alerts.length > 200) store.alerts = store.alerts.slice(0, 200);
        return alert;
      }
    }
  }
  return null;
}

function setDataset(readings, source = 'csv') {
  store.readings = readings;
  store.mode = source;
  store.alerts = [];
  for (const r of readings) checkAlert(r);
  store.alerts = store.alerts.slice(0, 50);
}

module.exports = {
  store,
  getReadings,
  getLatestReading,
  addReading,
  setDataset,
  checkAlert
};

