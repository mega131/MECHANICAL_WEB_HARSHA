import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  LineChart, 
  Database, 
  Bell, 
  FileText, 
  Sliders, 
  Cpu, 
  Settings,
  WifiOff,
  Wifi,
  Radio,
  Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { mode, hardwareStatus, devices } = useData();
  const esp32 = devices[0] || {};
  const isOnline = hardwareStatus.status === 'online';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'analysis', label: 'Vibration Analysis', icon: LineChart },
    { id: 'history', label: 'Historical Data', icon: Database },
    { id: 'alerts', label: 'Alerts and Events', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'sensor-config', label: 'Sensor Configuration', icon: Sliders },
    { id: 'device', label: 'Device Connection', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-industrial-900 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-600/30 border border-teal-500/40 flex items-center justify-center shadow-glow-teal">
          <Zap className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
            VibroGuard <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">IoT</span>
          </h1>
          <p className="text-[11px] text-slate-400 tracking-tight">Smart Motor Vibration</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group text-left relative ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-400 rounded-r-full shadow-glow-teal" />
              )}
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
              <span className="flex-1">{item.label}</span>
              {item.id === 'live' && mode === 'live' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Hardware Status Card (Adapted from reference screenshot) */}
      <div className="p-3 border-t border-slate-800/80">
        <div className={`p-3.5 rounded-xl border transition-all ${
          isOnline
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-glow-teal animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-semibold text-slate-200">
                {isOnline ? 'ESP32 Online' : 'ESP32 Offline'}
              </span>
            </div>
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          <div className="space-y-1 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>IP Address:</span>
              <span className="text-slate-300">{esp32.ipAddress || '192.168.1.120'}</span>
            </div>
            <div className="flex justify-between">
              <span>Port / Proto:</span>
              <span className="text-slate-300">{esp32.port || 5000} / HTTP</span>
            </div>
            <div className="flex justify-between">
              <span>Sensor:</span>
              <span className="text-teal-400 font-sans">{esp32.sensorModel || 'MPU6050'}</span>
            </div>
            <div className="flex justify-between">
              <span>Packets:</span>
              <span className="text-slate-300">{esp32.totalPackets || 0}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">State:</span>
            <span className={`font-semibold uppercase ${
              isOnline ? 'text-emerald-400' : 'text-amber-400/90'
            }`}>
              {isOnline ? 'Streaming' : 'Hardware Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
