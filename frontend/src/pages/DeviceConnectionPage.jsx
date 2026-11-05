import React, { useState } from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Terminal, 
  Copy, 
  Check, 
  Radio, 
  ExternalLink,
  Shield,
  Layers,
  Activity,
  Code2
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function DeviceConnectionPage() {
  const { devices, hardwareStatus, latestReading, mode, setMode } = useData();
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const esp32 = devices[0] || {
    deviceId: 'ESP32-VIB-01',
    deviceName: 'Primary Motor Drive End (DE) Sensor',
    status: 'hardware_not_connected',
    ipAddress: '192.168.1.120',
    port: 5000,
    firmwareVersion: 'v1.4.2-esp32',
    sensorModel: 'MPU-6050 / ADXL345',
    sampleRateHz: 100,
    lastSeen: null,
    totalPackets: 0
  };

  const isOnline = hardwareStatus.status === 'online';
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const ingestionEndpoint = `${backendUrl}/api/readings`;

  const curlExample = `curl -X POST ${ingestionEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "ESP32-VIB-01",
    "accelerationX": 561.4,
    "accelerationY": 2.8,
    "accelerationZ": 1921.0,
    "vibrationAngleX": 1.05,
    "vibrationAngleY": 1.12,
    "vibrationAngleZ": 1.20
  }'`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'endpoint') {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            IoT Hardware &amp; Microcontroller Connection
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Provision, monitor, and link ESP32 or compatible edge sensor nodes
          </p>
        </div>

        {/* Live Mode quick switch */}
        <button
          onClick={() => setMode(mode === 'live' ? 'csv' : 'live')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
            mode === 'live'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-glow-teal'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{mode === 'live' ? 'Live Mode Active' : 'Switch to Live Mode'}</span>
        </button>
      </div>

      {/* Device Connection Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Status Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="industrial-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isOnline
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-glow-teal'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{esp32.deviceName}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Device ID: <strong className="text-teal-400">{esp32.deviceId}</strong></p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/50 text-emerald-300 border border-emerald-500/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping-slow" />
                    ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-slate-400 border border-slate-700/80">
                    <WifiOff className="w-3 h-3 text-slate-400" />
                    HARDWARE NOT CONNECTED
                  </span>
                )}
              </div>
            </div>

            {/* Hardware Specification Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 text-xs font-mono border-b border-slate-800/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">SENSOR MODEL</span>
                <span className="text-white font-semibold">{esp32.sensorModel}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">FIRMWARE VERSION</span>
                <span className="text-white font-semibold">{esp32.firmwareVersion || 'v1.4.2'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">CONFIGURED IP</span>
                <span className="text-teal-400 font-semibold">{esp32.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">TOTAL PACKETS RECEIVED</span>
                <span className="text-white font-semibold">{esp32.totalPackets || 0}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">LAST RECEIVED TIME</span>
                <span className="text-slate-300 font-semibold truncate block">
                  {esp32.lastSeen ? new Date(esp32.lastSeen).toLocaleTimeString() : 'No packets received yet'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">TRANSMISSION PROTOCOL</span>
                <span className="text-cyan-400 font-semibold">HTTP REST / WebSocket</span>
              </div>
            </div>

            {/* Note on hardware status */}
            <div className="pt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Notice: Backend running state is decoupled from hardware state.</span>
              <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
                {isOnline ? 'Telemetry streaming' : 'No fake data generated'}
              </span>
            </div>
          </div>

          {/* Ingestion Endpoint Box */}
          <div className="industrial-card p-6">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
              <span>Backend Telemetry Ingestion Endpoint</span>
              <span className="text-[10px] text-teal-400">HTTP POST</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3 font-mono">
              Configure your microcontroller to transmit JSON payloads to this URL:
            </p>

            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-teal-300 select-all">
              <span className="flex-1 truncate">{ingestionEndpoint}</span>
              <button
                onClick={() => handleCopy(ingestionEndpoint, 'endpoint')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="Copy URL"
              >
                {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: cURL & Arduino Integration Guide */}
        <div className="lg:col-span-6 space-y-6">
          {/* Quick Terminal Test */}
          <div className="industrial-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-teal-400" />
                Quick Hardware Ingestion Test (cURL)
              </h4>
              <button
                onClick={() => handleCopy(curlExample, 'curl')}
                className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
              {curlExample}
            </pre>
          </div>

          {/* Wiring Pinout Table */}
          <div className="industrial-card p-6">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              ESP32 &amp; MPU-6050 / ADXL345 Hardware Wiring Guide
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-3 p-2 bg-slate-950/70 rounded border border-slate-800 font-bold text-slate-400 text-[10px] uppercase">
                <span>SENSOR PIN</span>
                <span>ESP32 PIN</span>
                <span>FUNCTION</span>
              </div>
              <div className="grid grid-cols-3 p-2 hover:bg-slate-800/40 rounded border border-slate-800/50 text-slate-200">
                <span className="text-teal-400 font-bold">VCC</span>
                <span>3V3 (or 5V for module with reg)</span>
                <span className="text-slate-400">Power Supply</span>
              </div>
              <div className="grid grid-cols-3 p-2 hover:bg-slate-800/40 rounded border border-slate-800/50 text-slate-200">
                <span className="text-teal-400 font-bold">GND</span>
                <span>GND</span>
                <span className="text-slate-400">Ground</span>
              </div>
              <div className="grid grid-cols-3 p-2 hover:bg-slate-800/40 rounded border border-slate-800/50 text-slate-200">
                <span className="text-cyan-400 font-bold">SDA</span>
                <span>GPIO 21</span>
                <span className="text-slate-400">I2C Data Bus</span>
              </div>
              <div className="grid grid-cols-3 p-2 hover:bg-slate-800/40 rounded border border-slate-800/50 text-slate-200">
                <span className="text-cyan-400 font-bold">SCL</span>
                <span>GPIO 22</span>
                <span className="text-slate-400">I2C Clock Bus</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-400">
              Firmware sketch provided in <code className="text-teal-300">esp32/Motor_Vibration_Monitor.ino</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
