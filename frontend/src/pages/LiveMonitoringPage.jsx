import React, { useState } from 'react';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Radio, 
  AlertTriangle, 
  Gauge, 
  Clock, 
  Cpu, 
  RefreshCw, 
  Play, 
  Square,
  ArrowRight,
  Terminal
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useData } from '../context/DataContext';

export default function LiveMonitoringPage({ setActiveTab }) {
  const { 
    mode, 
    setMode, 
    hardwareStatus, 
    latestReading, 
    liveReadings, 
    simulatedReadings,
    isStale,
    lastDataTimestamp,
    thresholds 
  } = useData();

  const [activeWindow, setActiveWindow] = useState(30); // 30 recent packets

  const isLive = mode === 'live';
  const isSimulation = mode === 'simulation';
  const isOnline = hardwareStatus.status === 'online';

  const streamData = isSimulation 
    ? simulatedReadings 
    : isLive 
      ? liveReadings 
      : [];

  const displayData = streamData.slice(-activeWindow).map((r, i) => ({
    time: (r.rawTimestamp || '').split(',')[1]?.trim() || r.rawTimestamp,
    accX: r.accelerationX,
    accY: r.accelerationY,
    accZ: r.accelerationZ,
    mag: r.vibrationMagnitude
  }));

  const accX = latestReading?.accelerationX != null ? latestReading.accelerationX.toFixed(1) : '---';
  const accY = latestReading?.accelerationY != null ? latestReading.accelerationY.toFixed(2) : '---';
  const accZ = latestReading?.accelerationZ != null ? latestReading.accelerationZ.toFixed(1) : '---';
  const mag = latestReading?.vibrationMagnitude != null ? latestReading.vibrationMagnitude.toFixed(2) : '---';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-industrial-900/70 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Live IoT Telemetry Cockpit
            </h2>
            {isSimulation && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SIMULATION STREAM
              </span>
            )}
            {isLive && isOnline && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                HARDWARE LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            High-frequency real-time telemetry stream via Socket.IO WebSocket
          </p>
        </div>

        {/* Mode Selector & Controls */}
        <div className="flex items-center gap-2">
          {mode !== 'live' ? (
            <button
              onClick={() => setMode('live')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-teal flex items-center gap-2 transition-all"
            >
              <Wifi className="w-4 h-4" />
              Switch to Live Mode
            </button>
          ) : (
            <button
              onClick={() => setMode('csv')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              Back to CSV Mode
            </button>
          )}

          {/* Development simulation toggle */}
          <button
            onClick={() => setMode(mode === 'simulation' ? 'csv' : 'simulation')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isSimulation
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-glow-amber'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {isSimulation ? 'Stop Simulation' : 'Test Simulation'}
          </button>
        </div>
      </div>

      {/* Mode & Connection Warning Banners */}
      {mode === 'csv' && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between text-xs font-mono text-cyan-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-white">Dashboard is currently running in CSV Historical Mode</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Displaying 48 static readings from Motor Vibration.csv. To receive real sensor packets from your ESP32 microcontroller, switch to Live Mode.
              </div>
            </div>
          </div>
          <button
            onClick={() => setMode('live')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-sans text-xs font-medium shrink-0 ml-4 transition-all"
          >
            Activate Live Mode
          </button>
        </div>
      )}

      {isLive && !isOnline && (
        <div className="bg-rose-950/20 border border-rose-500/40 rounded-xl p-5 text-xs font-mono">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 mt-0.5">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-300 text-sm">
                  Hardware Not Connected — Waiting for ESP32 Sensor Telemetry
                </h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  The dashboard will <strong>not display fake sensor readings as real hardware data</strong>. The real-time listener is active and waiting for your microcontroller to transmit sensor readings.
                </p>
                <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-300 font-semibold flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-teal-400" /> Quick Hardware Ingestion Test (cURL):
                  </div>
                  <code className="text-teal-300 block select-all">
                    curl -X POST http://localhost:5000/api/readings -H "Content-Type: application/json" -d '{`{"deviceId":"ESP32-VIB-01","accelerationX":561.2,"accelerationY":3.5,"accelerationZ":1920.8,"vibrationAngleX":1.1,"vibrationAngleY":1.0,"vibrationAngleZ":1.2}`}'
                  </code>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('device')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 font-sans text-xs flex items-center gap-1.5"
            >
              <span>Setup Guide</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isLive && isStale && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3 text-xs font-mono text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">STALE DATA WARNING:</span> No telemetry packets received in the last 15 seconds. Please inspect ESP32 power, Wi-Fi signal, and I2C accelerometer wiring.
          </div>
        </div>
      )}

      {/* 4 Live Circular Gauge Dial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Acc X */}
        <div className="industrial-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ACCELERATION X</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
          </div>
          <div className="my-3 text-center">
            <div className="text-3xl font-bold font-mono text-white tracking-tight">
              {accX}
            </div>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">mm/s² (Radial)</div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-800/80 pt-2">
            <span>Limit: {thresholds?.warning?.accelerationX || 600}</span>
            <span>Sensor: ADXL345</span>
          </div>
        </div>

        {/* Gauge 2: Acc Y */}
        <div className="industrial-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ACCELERATION Y</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-teal" />
          </div>
          <div className="my-3 text-center">
            <div className="text-3xl font-bold font-mono text-white tracking-tight">
              {accY}
            </div>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">mm/s² (Axial)</div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-800/80 pt-2">
            <span>Limit: {thresholds?.warning?.accelerationY || 100}</span>
            <span>Sensor: ADXL345</span>
          </div>
        </div>

        {/* Gauge 3: Acc Z */}
        <div className="industrial-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ACCELERATION Z</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 shadow-glow-teal" />
          </div>
          <div className="my-3 text-center">
            <div className="text-3xl font-bold font-mono text-white tracking-tight">
              {accZ}
            </div>
            <div className="text-xs font-mono text-teal-400 mt-0.5">mm/s² (Tangential)</div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between border-t border-slate-800/80 pt-2">
            <span>Limit: {thresholds?.warning?.accelerationZ || 1925}</span>
            <span>Sensor: ADXL345</span>
          </div>
        </div>

        {/* Gauge 4: Calculated Acceleration Magnitude */}
        <div className="industrial-card-highlight p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-teal-300">
            <span className="font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              ACC MAGNITUDE
            </span>
            <span className="text-[10px] font-mono text-teal-300 px-1 rounded bg-teal-500/20">
              VECTOR SUM
            </span>
          </div>
          <div className="my-3 text-center">
            <div className="text-3xl font-bold font-mono text-teal-200 tracking-tight">
              {mag}
            </div>
            <div className="text-xs font-mono text-teal-400 mt-0.5">mm/s² (√(X²+Y²+Z²))</div>
          </div>
          <div className="text-[10px] text-teal-400/80 font-mono flex justify-between border-t border-teal-500/20 pt-2">
            <span>Warn Limit: {thresholds?.warning?.magnitude || 2050}</span>
            <span className="truncate max-w-[120px]">Calculated Accel</span>
          </div>
        </div>
      </div>

      {/* Real-time Oscilloscope Waveform Chart */}
      <div className="industrial-card p-5 h-[420px] flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Real-Time Oscilloscope Waveform Stream
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live rolling buffer of incoming acceleration packets (mm/s²)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Buffer Window:</span>
            {[15, 30, 50].map((num) => (
              <button
                key={num}
                onClick={() => setActiveWindow(num)}
                className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
                  activeWindow === num
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num} pts
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          {displayData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" mm/s²" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-industrial-900 border border-slate-700 p-2.5 rounded text-xs font-mono">
                          <div className="text-slate-400 mb-1">{payload[0].payload.time}</div>
                          <div className="space-y-1">
                            {payload.map(p => (
                              <div key={p.name} className="flex justify-between gap-4">
                                <span style={{ color: p.color }}>{p.name}:</span>
                                <span className="font-bold text-white">{p.value} mm/s²</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="accX" name="Acc X" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accY" name="Acc Y" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accZ" name="Acc Z" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="mag" name="Magnitude" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 font-mono text-xs">
              <WifiOff className="w-8 h-8 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-300">No real-time sensor packets in buffer</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                {isLive 
                  ? 'Connect the ESP32 to start streaming live accelerometer data, or trigger the Test Simulation stream above.'
                  : 'Currently in CSV Mode. Switch to Live IoT Mode above to activate the live telemetry listener.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
