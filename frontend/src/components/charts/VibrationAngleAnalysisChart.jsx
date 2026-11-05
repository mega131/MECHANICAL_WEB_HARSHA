import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Compass, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function VibrationAngleAnalysisChart() {
  const { readings } = useData();

  const chartData = (readings || []).map((r, i) => ({
    index: i,
    time: r.rawTimestamp,
    shortTime: (r.rawTimestamp || '').split(',')[1]?.trim() || r.rawTimestamp,
    // When null in dataset, maintain as null so recharts leaves visible gaps (connectNulls={false})
    angX: r.vibrationAngleX,
    angY: r.vibrationAngleY,
    angZ: r.vibrationAngleZ
  }));

  // Calculate missing value percentage
  const total = chartData.length;
  const missingX = chartData.filter(d => d.angX === null).length;
  const missingRate = total > 0 ? ((missingX / total) * 100).toFixed(0) : 0;

  return (
    <div className="industrial-card p-5 flex flex-col h-[400px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            Chart 3: Tri-Axial Vibration-Angle Analysis
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Displays X, Y, and Z angles. Gaps in lines represent unrecorded / null samples.
          </p>
        </div>

        {/* Missing data indicator badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Null Rate: <strong className="text-amber-300">{missingRate}%</strong> (Gaps Preserved)</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="shortTime"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
              unit="°"
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dp = payload[0].payload;
                  return (
                    <div className="bg-industrial-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono">
                      <div className="text-slate-400 mb-1 border-b border-slate-800 pb-1">{dp.time}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-cyan-400">Vib_Ang_X:</span>
                          <span className="font-bold text-white">{dp.angX != null ? `${dp.angX}°` : 'No data (null)'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-emerald-400">Vib_Ang_Y:</span>
                          <span className="font-bold text-white">{dp.angY != null ? `${dp.angY}°` : 'No data (null)'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-teal-300">Vib_Ang_Z:</span>
                          <span className="font-bold text-white">{dp.angZ != null ? `${dp.angZ}°` : 'No data (null)'}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
            />

            {/* Crucial requirement: connectNulls={false} ensures gaps in lines for nulls instead of drawing zeros */}
            <Line
              type="monotone"
              dataKey="angX"
              name="Angle X"
              stroke="#06b6d4"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 3, fill: '#06b6d4' }}
            />
            <Line
              type="monotone"
              dataKey="angY"
              name="Angle Y"
              stroke="#10b981"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 3, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="angZ"
              name="Angle Z"
              stroke="#2dd4bf"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 3, fill: '#2dd4bf' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>No interpolation applied — unrecorded periods appear as line breaks</span>
        <span>Units: Angular degrees (°)</span>
      </div>
    </div>
  );
}
