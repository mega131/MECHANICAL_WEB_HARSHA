import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Clock, 
  Wifi, 
  WifiOff, 
  Radio, 
  Database, 
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Navbar({ onOpenDeviceModal }) {
  const { 
    mode, 
    setMode, 
    hardwareStatus, 
    lastDataTimestamp, 
    refreshData, 
    isLoading,
    searchQuery,
    setSearchQuery,
    backendStatus
  } = useData();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (d) => {
    return {
      date: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const { date, time } = formatClock(currentTime);

  return (
    <header className="h-16 bg-industrial-900/95 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Project Title & Search */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase flex items-center gap-2">
            Smart Motor Vibration Monitoring
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">Tri-Axial Acceleration & Bearing Diagnostics</p>
        </div>

        {/* Search Field */}
        <div className="relative hidden md:block w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search records, timestamps, metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 focus:border-teal-500/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Telemetry metadata & Status Indicators */}
      <div className="flex items-center gap-4">
        {/* Live Date/Time Clock */}
        <div className="hidden lg:flex items-center gap-2 text-right border-r border-slate-800/80 pr-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-[11px] font-mono font-medium text-slate-300">{date}</div>
            <div className="text-xs font-mono font-bold text-teal-400">{time}</div>
          </div>
        </div>

        {/* Data Source Badge: strictly indicates CSV, LIVE, or SIMULATION */}
        <div className="flex items-center gap-2">
          {mode === 'csv' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/40">
              <Database className="w-3 h-3 text-cyan-400" />
              CSV MODE
            </span>
          )}

          {mode === 'live' && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
              hardwareStatus.status === 'online'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/50 shadow-glow-teal'
                : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                hardwareStatus.status === 'online' ? 'bg-emerald-400 animate-ping-slow' : 'bg-rose-500'
              }`} />
              LIVE IOT MODE
            </span>
          )}

          {mode === 'simulation' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/40">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              SIMULATED DATA
            </span>
          )}
        </div>

        {/* Hardware Connection Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
          {hardwareStatus.status === 'online' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-emerald-400">ESP32 Connected</span>
            </>
          ) : hardwareStatus.status === 'stale' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-amber-400">Stream Stale (&gt;15s)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-400">Hardware Not Connected</span>
            </>
          )}
        </div>

        {/* Last Data Update Timestamp */}
        {lastDataTimestamp && (
          <div className="hidden xl:block text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Last Reading</div>
            <div className="text-xs font-mono text-slate-300 truncate max-w-[150px]">
              {lastDataTimestamp}
            </div>
          </div>
        )}

        {/* Quick Mode Switch Dropdown / Button */}
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 hover:border-teal-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="csv">Mode: Historical CSV</option>
          <option value="live">Mode: Live IoT (ESP32)</option>
          <option value="simulation">Mode: Simulation (Dev)</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          disabled={isLoading}
          title="Reload dataset from backend"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
