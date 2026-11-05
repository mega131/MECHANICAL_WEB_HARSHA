import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { SlidersHorizontal, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AccelerationTimelineChart() {
  const { readings, thresholds } = useData();
  const [visibleAxes, setVisibleAxes] = useState({ x: true, y: true, z: true });
  const [rangeFilter, setRangeFilter] = useState('all'); // 'all' | '50' | '25' | '10'

  // Filter readings based on range selector
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    let slice = [...readings];
    if (rangeFilter === '10') slice = slice.slice(-10);
    else if (rangeFilter === '25') slice = slice.slice(-25);
    else if (rangeFilter === '50') slice = slice.slice(-50);
    
    return slice.map((r, i) => ({
      index: i,
      time: r.rawTimestamp || r.timestamp,
      shortTime: (r.rawTimestamp || '').split(',')[1]?.trim() || r.rawTimestamp,
      accX: r.accelerationX,
      accY: r.accelerationY,
      accZ: r.accelerationZ,
      magnitude: r.vibrationMagnitude
    }));
  }, [readings, rangeFilter]);

  const toggleAxis = (axis) => {
    setVisibleAxes((prev) => ({ ...prev, [axis]: !prev[axis] }));
  };

  // Custom Dark Industrial Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-industrial-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
          <div className="text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800 flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-200">{dataPoint.time}</span>
            <span className="text-[10px] text-teal-400 font-bold">SAMPLE #{dataPoint.index + 1}</span>
          </div>
          <div className="space-y-1">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value != null ? `${entry.value} mm/s²` : 'N/A'}
                </span>
              </div>
            ))}
            {dataPoint.magnitude != null && (
              <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-teal-300">
                <span>Calculated Magnitude:</span>
                <span className="font-bold">{dataPoint.magnitude} mm/s²</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="industrial-card p-5 flex flex-col h-[420px]">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            Chart 1: Tri-Axial Acceleration Over Time
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Plots X, Y, and Z acceleration histories in mm/s²
          </p>
        </div>

        {/* Legend toggle pills & Range selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Axis Toggles */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => toggleAxis('x')}
              className={`px-2 py-0.5 rounded transition-all font-mono ${
                visibleAxes.x
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 opacity-50'
              }`}
            >
              Acc X
            </button>
            <button
              onClick={() => toggleAxis('y')}
              className={`px-2 py-0.5 rounded transition-all font-mono ${
                visibleAxes.y
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 opacity-50'
              }`}
            >
              Acc Y
            </button>
            <button
              onClick={() => toggleAxis('z')}
              className={`px-2 py-0.5 rounded transition-all font-mono ${
                visibleAxes.z
                  ? 'bg-teal-400/20 text-teal-200 border border-teal-400/40'
                  : 'text-slate-400 opacity-50'
              }`}
            >
              Acc Z
            </button>
          </div>

          {/* Time Range Selector */}
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-teal-500 font-mono"
          >
            <option value="all">All Records ({readings.length})</option>
            <option value="50">Last 50 Records</option>
            <option value="25">Last 25 Records</option>
            <option value="10">Last 10 Records</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="shortTime"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
              interval="preserveStartEnd"
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
              unit=" mm/s²"
              domain={['auto', 'auto']}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Warning threshold reference line for Acc X if visible */}
            {visibleAxes.x && thresholds?.warning?.accelerationX && (
              <ReferenceLine 
                y={thresholds.warning.accelerationX} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: 'X-Warn (600)', fill: '#f59e0b', fontSize: 9, position: 'right' }} 
              />
            )}

            {visibleAxes.x && (
              <Line
                type="monotone"
                dataKey="accX"
                name="Acc X"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff' }}
              />
            )}

            {visibleAxes.y && (
              <Line
                type="monotone"
                dataKey="accY"
                name="Acc Y"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#fff' }}
              />
            )}

            {visibleAxes.z && (
              <Line
                type="monotone"
                dataKey="accZ"
                name="Acc Z"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#2dd4bf', stroke: '#fff' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Axis Unit Reminder */}
      <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>Units: mm/s² (Millimeters per second squared)</span>
        <span>Click legend buttons to toggle individual axes</span>
      </div>
    </div>
  );
}
