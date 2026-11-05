import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Radio, 
  RotateCcw, 
  Check, 
  Server, 
  ShieldCheck, 
  Volume2, 
  VolumeX,
  Layers,
  Cpu
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function SettingsPage() {
  const { mode, setMode, resetDefaultCsv, backendStatus, readings, liveReadings } = useData();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleReset = async () => {
    await resetDefaultCsv();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-teal-400" />
          System Settings &amp; Data Source Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Configure runtime providers, data mode abstractions, backend connectivity, and alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Data Source Architecture Selector */}
          <div className="industrial-card p-6">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Data Source Provider Selection</span>
              <span className="text-teal-400 text-[10px]">Active Provider: {mode.toUpperCase()}</span>
            </h3>

            <div className="space-y-3">
              {/* Option 1: CSV Mode */}
              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'csv'
                    ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dataMode"
                  value="csv"
                  checked={mode === 'csv'}
                  onChange={() => setMode('csv')}
                  className="mt-1 text-cyan-500 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs font-mono">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>CSV Mode — Historical Sensor Telemetry (Motor Vibration.csv)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Loads the calibrated 48-reading dataset from <code className="text-cyan-300">Motor Vibration.csv</code>. Completely offline capable, suitable for baseline inspections and historical trend evaluation.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-cyan-400">
                    Active Records: {readings.length} samples
                  </div>
                </div>
              </label>

              {/* Option 2: Live IoT Mode */}
              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'live'
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200 shadow-glow-teal'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dataMode"
                  value="live"
                  checked={mode === 'live'}
                  onChange={() => setMode('live')}
                  className="mt-1 text-emerald-500 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs font-mono">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Live IoT Mode — Hardware Microcontroller Stream (ESP32)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Receives real telemetry packets over Socket.IO from the backend hardware endpoint. If hardware is not connected, displays a waiting state without synthesizing artificial data.
                  </p>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400">
                    Live Buffer: {liveReadings.length} packets received
                  </div>
                </div>
              </label>

              {/* Option 3: Simulation Mode */}
              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'simulation'
                    ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 shadow-glow-amber'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="dataMode"
                  value="simulation"
                  checked={mode === 'simulation'}
                  onChange={() => setMode('simulation')}
                  className="mt-1 text-amber-500 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs font-mono">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>Simulation Mode — Synthetic Vibration Stream (Development Only)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Generates dynamic mathematical test signals representing an induction motor shaft at 1500 RPM. Always labeled explicitly as <strong className="text-amber-300">SIMULATED DATA</strong>.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Reset Dataset to Default */}
          <div className="industrial-card p-6">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-2">
              Restore Default Dataset
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Re-initializes the application memory from the root <code className="text-teal-300">Motor Vibration.csv</code> file, discarding temporary uploads.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Motor Vibration.csv</span>
              </button>
              {resetSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Reset completed!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Backend Connectivity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="industrial-card p-6">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" />
              Backend Service Gateway
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">GATEWAY STATUS</span>
                <span className={`font-bold uppercase ${
                  backendStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {backendStatus === 'connected' ? '● Connected (Socket.IO)' : '○ Standalone / Offline'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase">SERVER ENDPOINT</span>
                <span className="text-teal-300 truncate block">{apiUrl}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase">SECURITY POSTURE</span>
                <span className="text-slate-300">CORS Filtered • No Client Secrets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
