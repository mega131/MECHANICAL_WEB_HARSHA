import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { parseMotorVibrationCsvClient } from '../services/csvParser';
import * as api from '../services/api';

// Socket.IO is not available on Vercel serverless.
// We use a lightweight polling shim that calls REST endpoints periodically.
// When a real Socket.IO backend is available (local dev / Railway), it still works
// because the REST endpoints exist on both environments.
const USE_SOCKETIO = false; // Set to true only when running against a full Node.js backend

const DataContext = createContext(null);

const DEFAULT_THRESHOLDS = {
  isConfigured: true,
  provisionalNotice: "Thresholds are provisional and require engineering validation against motor specifications (e.g. ISO 10816)",
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

export function DataProvider({ children }) {
  const [mode, setMode] = useState('csv'); // 'csv' | 'live' | 'simulation'
  const [readings, setReadings] = useState([]);
  const [liveReadings, setLiveReadings] = useState([]);
  const [simulatedReadings, setSimulatedReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [devices, setDevices] = useState([
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
  ]);
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connected' | 'offline' | 'connecting'
  const [isStale, setIsStale] = useState(false);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const socketRef = useRef(null);
  const staleTimerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Determine active dataset based on mode
  const activeReadings = mode === 'csv' 
    ? readings 
    : mode === 'live' 
      ? liveReadings 
      : simulatedReadings;

  const latestReading = activeReadings.length > 0 
    ? activeReadings[activeReadings.length - 1] 
    : null;

  // Stale detection handler for live mode
  const resetStaleTimer = useCallback(() => {
    setIsStale(false);
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    if (mode === 'live') {
      staleTimerRef.current = setTimeout(() => {
        setIsStale(true);
      }, 15000); // 15 seconds without packet = stale warning
    }
  }, [mode]);

  // Load default CSV file from public directory
  const loadDefaultCsvData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/Motor Vibration.csv');
      if (!res.ok) throw new Error('Could not fetch Motor Vibration.csv');
      const text = await res.text();
      const parsed = parseMotorVibrationCsvClient(text);
      if (parsed.readings.length > 0) {
        setReadings(parsed.readings);
        setLastDataTimestamp(parsed.readings[parsed.readings.length - 1].rawTimestamp);
      }
    } catch (err) {
      console.warn('Fallback CSV load failed:', err);
      setErrorMsg('Failed to load initial dataset from Motor Vibration.csv');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Backend connectivity: REST polling (replaces Socket.IO for Vercel deploy)
  // Polls /api/health every 5 seconds to track backend status.
  // When in 'live' mode, also polls /api/readings/latest for new IoT readings.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function pollHealth() {
      try {
        const data = await api.checkBackendHealth();
        if (!cancelled) {
          setBackendStatus(data.status === 'ok' ? 'connected' : 'offline');
        }
      } catch {
        if (!cancelled) setBackendStatus('offline');
      }
    }

    async function pollLiveReadings() {
      if (mode !== 'live') return;
      try {
        const latest = await api.fetchLatestReading();
        if (!cancelled && latest && latest.id) {
          setLiveReadings(prev => {
            const lastId = prev.length ? prev[prev.length - 1].id : null;
            if (latest.id !== lastId) {
              resetStaleTimer();
              setLastDataTimestamp(latest.rawTimestamp || new Date().toLocaleTimeString());
              setDevices(prevDevs => prevDevs.map(dev =>
                dev.deviceId === latest.deviceId
                  ? { ...dev, status: 'online', lastSeen: new Date().toISOString(), totalPackets: (dev.totalPackets || 0) + 1 }
                  : dev
              ));
              return [...prev.slice(-499), latest];
            }
            return prev;
          });
        }
      } catch { /* backend offline — silent */ }
    }

    // Initial health check
    pollHealth();

    // Poll health every 5 s, live readings every 2 s
    const healthTimer = setInterval(pollHealth, 5000);
    const liveTimer = setInterval(pollLiveReadings, 2000);

    pollIntervalRef.current = { healthTimer, liveTimer };

    return () => {
      cancelled = true;
      clearInterval(healthTimer);
      clearInterval(liveTimer);
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, [mode, resetStaleTimer]);

  // Load readings from backend or local CSV on mount
  const loadBackendReadings = useCallback(async () => {
    try {
      const data = await api.fetchReadings({ limit: 1000 });
      if (data && data.readings && data.readings.length > 0) {
        setReadings(data.readings);
        const last = data.readings[data.readings.length - 1];
        setLastDataTimestamp(last.rawTimestamp || last.timestamp);
      } else {
        await loadDefaultCsvData();
      }
    } catch {
      await loadDefaultCsvData();
    }
  }, [loadDefaultCsvData]);

  useEffect(() => {
    loadBackendReadings();
  }, [loadBackendReadings]);

  // Handle Simulation Mode Stream Generator (Disabled by default, clearly marked)
  useEffect(() => {
    if (mode === 'simulation') {
      let simIndex = simulatedReadings.length;
      simIntervalRef.current = setInterval(() => {
        simIndex++;
        // Generate realistic industrial vibration profile around 1500 RPM motor shaft
        const t = simIndex * 0.1;
        const baseAccX = 560 + Math.sin(t * 1.5) * 25 + (Math.random() - 0.5) * 8;
        const baseAccY = 15 + Math.cos(t * 1.8) * 45 + (Math.random() - 0.5) * 5;
        const baseAccZ = 1918 + Math.sin(t * 0.8) * 12 + (Math.random() - 0.5) * 4;
        
        const simReading = {
          id: `sim-${Date.now()}`,
          rawTimestamp: new Date().toLocaleTimeString(),
          timestamp: new Date().toISOString(),
          accelerationX: parseFloat(baseAccX.toFixed(1)),
          accelerationY: parseFloat(baseAccY.toFixed(1)),
          accelerationZ: parseFloat(baseAccZ.toFixed(1)),
          vibrationMagnitude: parseFloat(Math.sqrt(baseAccX ** 2 + baseAccY ** 2 + baseAccZ ** 2).toFixed(2)),
          vibrationAngleX: parseFloat((1 + Math.sin(t) * 0.5).toFixed(2)),
          vibrationAngleY: parseFloat((1.2 + Math.cos(t) * 0.3).toFixed(2)),
          vibrationAngleZ: parseFloat((1.5 + Math.sin(t * 0.5) * 0.4).toFixed(2)),
          deviceId: 'SIMULATOR-01',
          source: 'simulation'
        };

        setSimulatedReadings(prev => [...prev.slice(-300), simReading]);
        setLastDataTimestamp(simReading.rawTimestamp);
      }, 1000);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [mode, simulatedReadings.length]);

  // Compute Motor Condition
  const getMotorCondition = useCallback(() => {
    if (!thresholds || !thresholds.isConfigured) {
      return { status: 'Thresholds not configured', color: 'slate', level: 'none' };
    }
    if (!latestReading) {
      return { status: 'Insufficient Data', color: 'gray', level: 'insufficient' };
    }

    const { warning, critical } = thresholds;
    const { accelerationX: x, accelerationY: y, accelerationZ: z, vibrationMagnitude: mag } = latestReading;

    const isCritical = (x != null && critical.accelerationX != null && x >= critical.accelerationX) ||
                       (y != null && critical.accelerationY != null && y >= critical.accelerationY) ||
                       (z != null && critical.accelerationZ != null && z >= critical.accelerationZ) ||
                       (mag != null && critical.magnitude != null && mag >= critical.magnitude);

    if (isCritical) {
      return { status: 'Critical', color: 'red', level: 'critical' };
    }

    const isWarning = (x != null && warning.accelerationX != null && x >= warning.accelerationX) ||
                      (y != null && warning.accelerationY != null && y >= warning.accelerationY) ||
                      (z != null && warning.accelerationZ != null && z >= warning.accelerationZ) ||
                      (mag != null && warning.magnitude != null && mag >= warning.magnitude);

    if (isWarning) {
      return { status: 'Warning', color: 'amber', level: 'warning' };
    }

    return { status: 'Normal', color: 'emerald', level: 'normal' };
  }, [latestReading, thresholds]);

  // Check hardware connection status
  const getHardwareStatus = useCallback(() => {
    if (mode === 'simulation') {
      return { status: 'simulated', label: 'Simulated Data Stream', color: 'amber' };
    }
    if (mode === 'csv') {
      return { status: 'csv', label: 'Historical CSV Mode', color: 'teal' };
    }
    
    // Live mode
    const onlineDevice = devices.find(d => d.status === 'online');
    if (onlineDevice && !isStale) {
      return { status: 'online', label: 'ESP32 Online', color: 'emerald', device: onlineDevice };
    }
    if (isStale) {
      return { status: 'stale', label: 'Data Stream Stale', color: 'amber' };
    }
    return { status: 'offline', label: 'Hardware Not Connected', color: 'rose' };
  }, [mode, devices, isStale]);

  // Change active mode
  const handleSetMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'live') {
      resetStaleTimer();
    }
  };

  // Upload new CSV
  const handleUploadCsv = async (file) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      // Try backend upload first
      try {
        const res = await api.uploadCsvFile(file);
        await loadBackendReadings();
        return res;
      } catch (backendErr) {
        // Fallback to client-side parse
        console.warn('Backend upload failed, parsing locally:', backendErr);
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const parsed = parseMotorVibrationCsvClient(e.target.result);
            if (parsed.readings.length === 0) {
              setErrorMsg('No valid records found in uploaded CSV file');
              reject(new Error('No valid records'));
            } else {
              setReadings(parsed.readings);
              setMode('csv');
              setLastDataTimestamp(parsed.readings[parsed.readings.length - 1].rawTimestamp);
              resolve({ importedCount: parsed.readings.length, stats: parsed.stats });
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to default CSV
  const handleResetCsv = async () => {
    try {
      await api.resetDefaultCsv();
      await loadBackendReadings();
    } catch {
      await loadDefaultCsvData();
    }
    setMode('csv');
  };

  // Update thresholds
  const handleUpdateThresholds = async (newThresholds) => {
    setThresholds(newThresholds);
    try {
      await api.saveThresholds(newThresholds);
    } catch (e) {
      console.warn('Failed to save thresholds to backend:', e);
    }
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = async (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    try {
      await api.acknowledgeAlert(alertId);
    } catch (e) {
      console.warn('Failed to acknowledge on server:', e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        readings: activeReadings,
        csvReadings: readings,
        liveReadings,
        simulatedReadings,
        latestReading,
        totalReadings: activeReadings.length,
        alerts,
        thresholds,
        devices,
        backendStatus,
        hardwareStatus: getHardwareStatus(),
        motorCondition: getMotorCondition(),
        isStale,
        lastDataTimestamp,
        isLoading,
        errorMsg,
        setErrorMsg,
        searchQuery,
        setSearchQuery,
        uploadCsv: handleUploadCsv,
        resetDefaultCsv: handleResetCsv,
        updateThresholds: handleUpdateThresholds,
        acknowledgeAlert: handleAcknowledgeAlert,
        refreshData: loadBackendReadings
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
