import React from 'react';
import { History, Clock, ArrowRight, Gauge, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function RecentReadingsTimeline({ maxRecords = 8 }) {
  const { readings, thresholds } = useData();

  const recentList = [...(readings || [])].reverse().slice(0, maxRecords);

  const getStatusBadge = (r) => {
    if (!thresholds?.isConfigured) return null;
    const { warning, critical } = thresholds;
    const mag = r.vibrationMagnitude;
    const x = r.accelerationX;
    const y = r.accelerationY;
    const z = r.accelerationZ;

    const isCrit = (x != null && critical.accelerationX && x >= critical.accelerationX) ||
                   (y != null && critical.accelerationY && y >= critical.accelerationY) ||
                   (z != null && critical.accelerationZ && z >= critical.accelerationZ) ||
                   (mag != null && critical.magnitude && mag >= critical.magnitude);

    if (isCrit) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/40">
          <AlertOctagon className="w-2.5 h-2.5" /> CRIT
        </span>
      );
    }

    const isWarn = (x != null && warning.accelerationX && x >= warning.accelerationX) ||
                   (y != null && warning.accelerationY && y >= warning.accelerationY) ||
                   (z != null && warning.accelerationZ && z >= warning.accelerationZ) ||
                   (mag != null && warning.magnitude && mag >= warning.magnitude);

    if (isWarn) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/40">
          <AlertTriangle className="w-2.5 h-2.5" /> WARN
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-2.5 h-2.5" /> NORM
      </span>
    );
  };

  return (
    <div className="industrial-card p-5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Chart 6: Recent Sensor Readings Stream
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Chronological log of latest valid telemetry samples
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Showing latest {recentList.length} readings
        </span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-2 text-right">Acc X (mm/s²)</th>
              <th className="py-2 px-2 text-right">Acc Y (mm/s²)</th>
              <th className="py-2 px-2 text-right">Acc Z (mm/s²)</th>
              <th className="py-2 px-2 text-right">Magnitude</th>
              <th className="py-2 px-2 text-center">Angles (X/Y/Z)</th>
              <th className="py-2 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentList.map((r, i) => (
              <tr key={r.id || i} className="hover:bg-slate-800/40 transition-colors group">
                <td className="py-2.5 px-3 text-slate-300 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500 group-hover:text-teal-400" />
                    <span>{r.rawTimestamp}</span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right text-cyan-300">
                  {r.accelerationX != null ? r.accelerationX.toFixed(1) : 'null'}
                </td>
                <td className="py-2.5 px-2 text-right text-emerald-300">
                  {r.accelerationY != null ? r.accelerationY.toFixed(2) : 'null'}
                </td>
                <td className="py-2.5 px-2 text-right text-teal-200">
                  {r.accelerationZ != null ? r.accelerationZ.toFixed(1) : 'null'}
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-white">
                  {r.vibrationMagnitude != null ? `${r.vibrationMagnitude} mm/s²` : 'N/A'}
                </td>
                <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                  {r.vibrationAngleX != null ? `${r.vibrationAngleX}°` : '-'} / {' '}
                  {r.vibrationAngleY != null ? `${r.vibrationAngleY}°` : '-'} / {' '}
                  {r.vibrationAngleZ != null ? `${r.vibrationAngleZ}°` : '-'}
                </td>
                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                  {getStatusBadge(r)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recentList.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs font-mono">
            No sensor records loaded.
          </div>
        )}
      </div>

      <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800/60 mt-1">
        <span>Units: mm/s² (acceleration), degrees (tilt)</span>
        <span>Real data stream directly from active dataset</span>
      </div>
    </div>
  );
}
