import React, { useState } from 'react';
import { Layers, Eye, Compass, Cpu, Zap, Activity } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Motor3DViewer() {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'exploded' | 'axes'
  const { latestReading, motorCondition, mode } = useData();

  const accX = latestReading?.accelerationX ?? 559.0;
  const accY = latestReading?.accelerationY ?? 2.3;
  const accZ = latestReading?.accelerationZ ?? 1920.0;
  const mag = latestReading?.vibrationMagnitude ?? Math.sqrt(accX * accX + accY * accY + accZ * accZ);

  // Vector animation scale factors
  const xPulse = Math.min(Math.max((accX / 600) * 15, 6), 25);
  const yPulse = Math.min(Math.max((accY / 100) * 20, 4), 30);
  const zPulse = Math.min(Math.max((accZ / 1920) * 18, 8), 28);

  const glowColor = motorCondition.level === 'critical' 
    ? 'rgba(239, 68, 68, 0.8)' 
    : motorCondition.level === 'warning'
      ? 'rgba(245, 158, 11, 0.8)'
      : 'rgba(16, 185, 129, 0.8)';

  return (
    <div className="industrial-card p-5 relative overflow-hidden flex flex-col justify-between h-[420px]">
      {/* Top Header & View Mode Switcher */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Motor Digital Twin & Bearing Sensor
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Drive-End (DE) Tri-Axial Vibration Vector</p>
          </div>
        </div>

        {/* View Mode Pills (as seen in screenshot) */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode('exploded')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'exploded'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exploded View
          </button>
          <button
            onClick={() => setViewMode('axes')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'axes'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sensor Axes
          </button>
        </div>
      </div>

      {/* Center: Vector Schematic Visualizer */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        {/* Radar concentric circular rings in background */}
        <div className="absolute w-64 h-64 rounded-full border border-teal-500/10 pointer-events-none" />
        <div className="absolute w-48 h-48 rounded-full border border-teal-500/15 pointer-events-none" />
        <div className="absolute w-32 h-32 rounded-full border border-teal-500/20 pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full border-t border-teal-500/30 animate-radar pointer-events-none" />

        {/* SVG Motor Isometric Model */}
        <svg viewBox="0 0 460 260" className="w-full h-full max-h-[250px] z-0 select-none">
          <defs>
            <linearGradient id="motorBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <linearGradient id="finGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="shaftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <radialGradient id="sensorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Stator Mounting Feet / Base */}
          <path d="M 120 185 L 340 185 L 360 205 L 100 205 Z" fill="#0b0f17" stroke="#1e293b" strokeWidth="2" />
          <rect x="130" y="195" width="20" height="8" rx="2" fill="#1e293b" />
          <rect x="310" y="195" width="20" height="8" rx="2" fill="#1e293b" />

          {/* Rotor Shaft Output (Drive-End) */}
          <rect x="350" y="118" width="80" height="24" rx="3" fill="url(#shaftGradient)" stroke="#475569" strokeWidth="1.5" />
          {/* Keyway on shaft */}
          <rect x="380" y="125" width="35" height="5" rx="1" fill="#334155" />

          {/* Motor Main Cylindrical Stator Casing */}
          <rect x="140" y="80" width="210" height="100" rx="12" fill="url(#motorBody)" stroke="#334155" strokeWidth="2" />

          {/* Cooling Fins */}
          <line x1="160" y1="78" x2="160" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="180" y1="78" x2="180" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="200" y1="78" x2="200" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="220" y1="78" x2="220" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="240" y1="78" x2="240" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="260" y1="78" x2="260" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="280" y1="78" x2="280" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="300" y1="78" x2="300" y2="182" stroke="url(#finGradient)" strokeWidth="3" />
          <line x1="320" y1="78" x2="320" y2="182" stroke="url(#finGradient)" strokeWidth="3" />

          {/* Terminal Box on Top of Motor */}
          <rect x="210" y="55" width="70" height="28" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <circle cx="245" cy="69" r="4" fill="#10b981" />

          {/* Non-Drive-End (NDE) Fan Cover on Left */}
          <path d="M 140 85 C 105 85 105 175 140 175 Z" fill="#131b26" stroke="#334155" strokeWidth="2" />
          <line x1="115" y1="105" x2="135" y2="105" stroke="#334155" strokeWidth="2" />
          <line x1="112" y1="130" x2="135" y2="130" stroke="#334155" strokeWidth="2" />
          <line x1="115" y1="155" x2="135" y2="155" stroke="#334155" strokeWidth="2" />

          {/* Drive-End (DE) Bearing Housing Endbell */}
          <ellipse cx="350" cy="130" rx="14" ry="46" fill="#1e293b" stroke="#475569" strokeWidth="2" />

          {/* Exploded View Elements (if viewMode === 'exploded') */}
          {viewMode === 'exploded' && (
            <g className="transition-all duration-300">
              <ellipse cx="245" cy="130" rx="50" ry="32" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="245" y="134" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">ROTOR AIR GAP (0.45mm)</text>
              <ellipse cx="350" cy="130" rx="8" ry="24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="350" y="95" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">DE Bearing (6208)</text>
            </g>
          )}

          {/* Mounted Accelerometer Sensor Node on Bearing Housing */}
          <g transform="translate(348, 86)">
            {/* Pulsing Aura */}
            <circle cx="0" cy="0" r="18" fill="url(#sensorGlow)" />
            {/* Sensor Housing */}
            <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#047857" stroke="#10b981" strokeWidth="2" />
            <circle cx="0" cy="0" r="3" fill="#ecfdf5" />
            <text x="14" y="-4" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">SENSOR POD</text>
            <text x="14" y="8" fill="#94a3b8" fontSize="8" fontFamily="monospace">ESP32 / ADXL</text>

            {/* Tri-Axial Vibration Vectors (X, Y, Z) */}
            {/* Vector X (Radial - Upwards) */}
            <line x1="0" y1="-8" x2="0" y2={-8 - xPulse} stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points={`-3,${-8 - xPulse} 3,${-8 - xPulse} 0,${-14 - xPulse}`} fill="#06b6d4" />
            <text x="-16" y={-10 - xPulse} fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="monospace">X</text>

            {/* Vector Y (Axial - Horizontal left) */}
            <line x1="-8" y1="0" x2={-8 - yPulse} y2="0" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points={`${-8 - yPulse},-3 ${-8 - yPulse},3 ${-14 - yPulse},0`} fill="#10b981" />
            <text x={-22 - yPulse} y="10" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">Y</text>

            {/* Vector Z (Tangential - Diagonal Right) */}
            <line x1="6" y1="6" x2={6 + zPulse} y2={6 + zPulse * 0.7} stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points={`${6 + zPulse},${3 + zPulse * 0.7} ${3 + zPulse},${8 + zPulse * 0.7} ${12 + zPulse},${9 + zPulse * 0.7}`} fill="#14b8a6" />
            <text x={14 + zPulse} y={18 + zPulse * 0.7} fill="#14b8a6" fontSize="9" fontWeight="bold" fontFamily="monospace">Z</text>
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry Overlay Strip */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono z-10">
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-400">VECTOR MAGNITUDE</div>
          <div className="text-teal-400 font-bold text-sm">
            {typeof mag === 'number' ? mag.toFixed(1) : mag} <span className="text-[10px] text-slate-400">mm/s²</span>
          </div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-400">BEARING POSITION</div>
          <div className="text-slate-200 font-bold text-sm">DE Housing</div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-400">VIB ANGLE (X/Y/Z)</div>
          <div className="text-slate-300 truncate">
            {latestReading?.vibrationAngleX ?? 'N/A'}° / {latestReading?.vibrationAngleY ?? 'N/A'}° / {latestReading?.vibrationAngleZ ?? 'N/A'}°
          </div>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
          <div className="text-[10px] text-slate-400">SAMPLING SOURCE</div>
          <div className="text-cyan-400 uppercase font-bold truncate">
            {mode === 'csv' ? 'CSV (Motor Vibration.csv)' : mode === 'live' ? 'Live IoT Node' : 'Simulated Profile'}
          </div>
        </div>
      </div>
    </div>
  );
}
