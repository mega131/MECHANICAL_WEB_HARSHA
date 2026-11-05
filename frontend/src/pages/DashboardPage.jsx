import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Sparkles,
  Zap,
  Activity,
  Radio
} from 'lucide-react';
import { useData } from '../context/DataContext';
import MetricCards from '../components/MetricCards';
import Motor3DViewer from '../components/Motor3DViewer';
import AccelerationTimelineChart from '../components/charts/AccelerationTimelineChart';
import AxisComparisonChart from '../components/charts/AxisComparisonChart';
import RecentReadingsTimeline from '../components/charts/RecentReadingsTimeline';

export default function DashboardPage({ setActiveTab }) {
  const { mode, setMode, hardwareStatus, alerts, thresholds } = useData();
  const isLive = mode === 'live';
  const isOnline = hardwareStatus.status === 'online';

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner & Quick Hardware Action (Adapted from reference screenshot) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {greeting}, Monitoring Team <span className="animate-pulse">👋</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
            {mode === 'csv'
              ? 'Dashboard operating in CSV Mode using historical sensor records from Motor Vibration.csv.'
              : mode === 'live'
                ? isOnline
                  ? 'Real-time telemetry stream active from ESP32 motor accelerometer node.'
                  : 'Live IoT Mode active — Waiting for hardware packets on POST /api/readings.'
                : 'Development Simulation Mode active — Synthetic sensor readings for interface testing.'}
          </p>
        </div>

        {/* Quick ESP32 IoT Mode Trigger / Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (mode === 'live') {
                setActiveTab('device');
              } else {
                setMode('live');
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all border ${
              isLive && isOnline
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-glow-teal'
                : isLive
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-teal-500/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              isLive && isOnline
                ? 'bg-emerald-400 animate-ping-slow'
                : isLive
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
            }`} />
            <span>
              {isLive && isOnline ? 'ESP32 Streaming' : isLive ? 'Waiting for Hardware' : 'Connect ESP32 (Live IoT)'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Provisional Thresholds Warning Banner */}
      {thresholds?.provisionalNotice && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono text-amber-300/90">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: Default alarm limits are provisional and require calibration against specific motor class standards (ISO 10816).</span>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-[11px] underline hover:text-amber-200 shrink-0 ml-4 font-sans font-medium"
          >
            Configure Thresholds
          </button>
        </div>
      )}

      {/* 10 Main Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Telemetry Overview &amp; Key Performance Indicators
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Source: {mode.toUpperCase()}
          </span>
        </div>
        <MetricCards />
      </div>

      {/* Middle Row: 3D Motor Twin Schematic + Tri-Axial Acceleration Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <Motor3DViewer />
        </div>
        <div className="lg:col-span-7">
          <AccelerationTimelineChart />
        </div>
      </div>

      {/* Lower Row: Axis Comparative Distribution + Recent Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <AxisComparisonChart />
        </div>
        <div className="lg:col-span-7">
          <RecentReadingsTimeline maxRecords={6} />
        </div>
      </div>
    </div>
  );
}
