import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { loadCsvFromFile, parseMotorVibrationCsv } from './services/csvParser.js';
import { storage } from './services/storage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Setup Multer for CSV uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Seed initial dataset from Motor Vibration.csv if empty
function seedInitialData() {
  try {
    const csvPath = path.join(__dirname, 'data', 'Motor Vibration.csv');
    if (fs.existsSync(csvPath) && storage.readings.length === 0) {
      console.log(`[Storage] Initializing database from CSV: ${csvPath}`);
      const result = loadCsvFromFile(csvPath);
      storage.setDataset(result.readings, 'csv');
      console.log(`[Storage] Successfully loaded ${result.readings.length} historical records.`);
    } else {
      console.log(`[Storage] Current store contains ${storage.readings.length} records.`);
    }
  } catch (err) {
    console.error('[Storage] Error during initial CSV load:', err.message);
  }
}

seedInitialData();

// Socket.IO real-time connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  // Send current state immediately upon client connection
  socket.emit('initial:state', {
    mode: storage.getMode(),
    thresholds: storage.getThresholds(),
    devices: storage.getDevices(),
    latestReading: storage.getLatestReading(),
    totalReadings: storage.readings.length
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

/* ========================================================
   REST API ENDPOINTS
======================================================== */

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Motor Vibration Monitoring Service',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    mode: storage.getMode(),
    totalReadings: storage.readings.length,
    devices: storage.getDevices().length
  });
});

// 2. Retrieve readings with pagination and filters
app.get('/api/readings', (req, res) => {
  try {
    const { limit, offset, search, startDate, endDate, axis, source } = req.query;
    const result = storage.getReadings({
      limit: limit ? parseInt(limit, 10) : 500,
      offset: offset ? parseInt(offset, 10) : 0,
      search,
      startDate,
      endDate,
      axis,
      source
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sensor readings', details: error.message });
  }
});

// 3. Retrieve latest sensor reading
app.get('/api/readings/latest', (req, res) => {
  const latest = storage.getLatestReading();
  if (!latest) {
    return res.status(404).json({ error: 'No sensor readings found in dataset' });
  }
  res.json(latest);
});

// 4. Ingest hardware sensor reading (ESP32 / IoT device endpoint)
app.post('/api/readings', (req, res) => {
  try {
    const payload = req.body;

    // Strict validation
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid reading payload. Expected JSON object.' });
    }

    const { reading, alert } = storage.addReading(payload);

    // Broadcast new reading to all connected dashboard clients via Socket.IO
    io.emit('sensor:reading', reading);

    if (alert) {
      io.emit('alert:triggered', alert);
    }

    // Broadcast updated device status
    io.emit('device:status', storage.getDevices());

    res.status(201).json({
      success: true,
      reading,
      alert: alert || null
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to process sensor reading', details: error.message });
  }
});

// 5. Upload new CSV file
app.post('/api/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please attach a CSV file.' });
  }

  try {
    const filePath = req.file.path;
    const { readings, stats } = loadCsvFromFile(filePath);

    // Clean up uploaded temp file
    fs.unlink(filePath, () => {});

    if (readings.length === 0) {
      return res.status(422).json({
        error: 'No valid records found in uploaded CSV',
        stats
      });
    }

    // Set dataset in storage
    storage.setDataset(readings, 'csv');

    // Broadcast update to all connected clients
    io.emit('data:reloaded', {
      source: 'csv',
      count: readings.length,
      latestReading: storage.getLatestReading()
    });

    res.json({
      message: 'CSV parsed and imported successfully',
      stats,
      importedCount: readings.length,
      sample: readings.slice(0, 3)
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
  }
});

// 6. Reset to default Motor Vibration.csv
app.post('/api/reset-default-csv', (req, res) => {
  try {
    const csvPath = path.join(__dirname, 'data', 'Motor Vibration.csv');
    const result = loadCsvFromFile(csvPath);
    storage.setDataset(result.readings, 'csv');

    io.emit('data:reloaded', {
      source: 'csv',
      count: result.readings.length,
      latestReading: storage.getLatestReading()
    });

    res.json({
      message: 'Reset to default Motor Vibration.csv completed',
      count: result.readings.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset default CSV', details: err.message });
  }
});

// 7. Alerts endpoints
app.get('/api/alerts', (req, res) => {
  res.json({
    alerts: storage.getAlerts(100),
    thresholds: storage.getThresholds()
  });
});

app.post('/api/alerts/thresholds', (req, res) => {
  try {
    const updated = storage.updateThresholds(req.body);
    io.emit('thresholds:updated', updated);
    res.json({ success: true, thresholds: updated });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update thresholds', details: error.message });
  }
});

app.post('/api/alerts/acknowledge/:id', (req, res) => {
  const alert = storage.acknowledgeAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  io.emit('alert:acknowledged', alert);
  res.json({ success: true, alert });
});

// 8. Device management & heartbeat endpoints
app.get('/api/devices', (req, res) => {
  res.json({ devices: storage.getDevices() });
});

app.post('/api/devices/heartbeat', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const dev = storage.updateDeviceHeartbeat(deviceId, ip);
  io.emit('device:status', storage.getDevices());
  res.json({ success: true, device: dev });
});

// 9. System configuration & mode
app.get('/api/config', (req, res) => {
  res.json({
    mode: storage.getMode(),
    thresholds: storage.getThresholds(),
    supportedUnits: {
      acceleration: 'mm/s²',
      angle: 'degrees / rad (as provided)'
    },
    version: '1.0.0-industrial'
  });
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (!['csv', 'live', 'simulation'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode. Supported: csv, live, simulation' });
  }
  const updatedMode = storage.setMode(mode);
  io.emit('mode:changed', { mode: updatedMode });
  res.json({ success: true, mode: updatedMode });
});

// Start HTTP + Socket.IO server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Smart Motor Vibration Backend & IoT Gateway`);
  console.log(` HTTP Server running on: http://localhost:${PORT}`);
  console.log(` Real-time Socket.IO: ws://localhost:${PORT}`);
  console.log(` Active Mode: ${storage.getMode().toUpperCase()}`);
  console.log(` Records in Memory: ${storage.readings.length}`);
  console.log(`=======================================================`);
});
