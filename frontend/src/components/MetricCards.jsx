import React from 'react';
import { 
  Activity, 
  Compass, 
  Database, 
  ShieldAlert, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Zap, 
  Gauge,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function MetricCards() {
  const { latestReading, totalReadings, motorCondition, thresholds } = useData();

  // Handle latest sensor values safely
  const accX = latestReading?.accelerationX != null ? latestReading.accelerationX.toFixed(1) : 'No data';
  const accY = latestReading?.accelerationY != null ? latestReading.accelerationY.toFixed(2) : 'No data';
  const accZ = latestReading?.accelerationZ != null ? latestReading.accelerationZ.toFixed(1) : 'No data';

  // Overall calculated acceleration magnitude
  let calculatedMag = 'No data';
  if (latestReading?.accelerationX != null && latestReading?.accelerationY != null && latestReading?.accelerationZ != null) {
    const x = latestReading.accelerationX;
    const y = latestReading.accelerationY;
    const z = latestReading.accelerationZ;
    calculatedMag = Math.sqrt(x * x + y * y + z * z).toFixed(2);
  } else if (latestReading?.vibrationMagnitude != null) {
    calculatedMag = latestReading.vibrationMagnitude.toFixed(2);
  }

  // Vibration angles - must show 'N/A' or 'No data' instead of zero when null
  const formatAngle = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return `${Number(val).toFixed(2)}°`;
  };

  const angX = formatAngle(latestReading?.vibrationAngleX);
  const angY = formatAngle(latestReading?.vibrationAngleY);
  const angZ = formatAngle(latestReading?.vibrationAngleZ);

  // Motor condition badge styles
  const getConditionUI = () => {
    switch (motorCondition.level) {
      case 'critical':
        return {
          icon: AlertOctagon,
          title: 'CRITICAL',
          desc: 'Reading exceeds critical threshold',
          bg: 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-glow-danger'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          title: 'WARNING',
          desc: 'Reading exceeds warning threshold',
          bg: 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-glow-amber'
        };
      case 'normal':
        return {
          icon: CheckCircle2,
          title: 'NORMAL',
          desc: 'Within configured limits',
          bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-glow-teal'
        };
      default:
        return {
          icon: HelpCircle,
          title: 'CONFIG REQUIRED',
          desc: 'Thresholds not configured',
          bg: 'bg-slate-900 border-slate-800 text-slate-400'
        };
    }
  };

  const condUI = getConditionUI();
  const ConditionIcon = condUI.icon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Acc X */}
      <div className="industrial-card p-4 hover:border-teal-500/30 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Latest Acc X-Axis
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {accX}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm/s²</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Radial Direction</span>
          <span className="text-cyan-400/80 font-mono">Warn: {thresholds?.warning?.accelerationX || 600}</span>
        </div>
      </div>

      {/* 2. Acc Y */}
      <div className="industrial-card p-4 hover:border-teal-500/30 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Latest Acc Y-Axis
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-teal" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {accY}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm/s²</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Axial Direction</span>
          <span className="text-emerald-400/80 font-mono">Warn: {thresholds?.warning?.accelerationY || 100}</span>
        </div>
      </div>

      {/* 3. Acc Z */}
      <div className="industrial-card p-4 hover:border-teal-500/30 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Latest Acc Z-Axis
          </span>
          <span className="w-2 h-2 rounded-full bg-teal-400 shadow-glow-teal" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {accZ}
          </span>
          <span className="text-xs text-slate-400 font-mono">mm/s²</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Tangential Direction</span>
          <span className="text-teal-400/80 font-mono">Warn: {thresholds?.warning?.accelerationZ || 1925}</span>
        </div>
      </div>

      {/* 4. Calculated Overall Acceleration Magnitude (Crucial: labeled as calculated acceleration magnitude, not velocity or RMS) */}
      <div className="industrial-card-highlight p-4 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-semibold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-teal-400" />
            Acc Magnitude
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
            √(X²+Y²+Z²)
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-teal-200 tracking-tight">
            {calculatedMag}
          </span>
          <span className="text-xs text-teal-400/80 font-mono">mm/s²</span>
        </div>
        <div className="mt-2 text-[10px] text-teal-400/70 truncate" title="Calculated Acceleration Magnitude (Vector Sum)">
          Calculated Acc Magnitude
        </div>
      </div>

      {/* 5. Motor Condition / Vibration Alert Status */}
      <div className={`p-4 rounded-xl border transition-all ${condUI.bg} flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Motor Condition
          </span>
          <ConditionIcon className="w-4 h-4" />
        </div>
        <div className="my-1">
          <div className="text-xl font-bold font-mono tracking-wide">
            {condUI.title}
          </div>
          <div className="text-[10px] opacity-80 truncate">
            {condUI.desc}
          </div>
        </div>
        <div className="text-[10px] font-mono opacity-60">
          Provisional Limits
        </div>
      </div>

      {/* 6. Vibration Angle X */}
      <div className="industrial-card p-4 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Vib Angle X
          </span>
          <Compass className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono tracking-tight ${angX === 'N/A' ? 'text-slate-400' : 'text-white'}`}>
            {angX}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          X-Axis Tilt Angle
        </div>
      </div>

      {/* 7. Vibration Angle Y */}
      <div className="industrial-card p-4 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Vib Angle Y
          </span>
          <Compass className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono tracking-tight ${angY === 'N/A' ? 'text-slate-400' : 'text-white'}`}>
            {angY}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Y-Axis Tilt Angle
        </div>
      </div>

      {/* 8. Vibration Angle Z */}
      <div className="industrial-card p-4 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Vib Angle Z
          </span>
          <Compass className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono tracking-tight ${angZ === 'N/A' ? 'text-slate-400' : 'text-white'}`}>
            {angZ}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Z-Axis Tilt Angle
        </div>
      </div>

      {/* 9. Total Recorded Readings */}
      <div className="industrial-card p-4 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Total Readings
          </span>
          <Database className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalReadings}
          </span>
          <span className="text-xs text-slate-400 font-mono">records</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Historical Time Series
        </div>
      </div>

      {/* 10. Last Reading Timestamp */}
      <div className="industrial-card p-4 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Last Reading Time
          </span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="text-sm font-semibold font-mono text-slate-200 mt-1 truncate" title={latestReading?.rawTimestamp || 'No data'}>
          {latestReading?.rawTimestamp || 'No records loaded'}
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Preserved original timestamp
        </div>
      </div>
    </div>
  );
}
