import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function HistoricalTrendChart() {
  const { readings } = useData();
  const [metric, setMetric] = useState('vibrationMagnitude');
  const [timeSlice, setTimeSlice] = useState('all');

  const metricOptions = [
    { id: 'vibrationMagnitude', label: 'Calculated Acc Magnitude', unit: 'mm/s²', color: '#10b981' },
    { id: 'accelerationX', label: 'Acc X-Axis', unit: 'mm/s²', color: '#06b6d4' },
    { id: 'accelerationY', label: 'Acc Y-Axis', unit: 'mm/s²', color: '#34d399' },
    { id: 'accelerationZ', label: 'Acc Z-Axis', unit: 'mm/s²', color: '#2dd4bf' },
    { id: 'vibrationAngleX', label: 'Vibration Angle X', unit: '°', color: '#f59e0b' },
    { id: 'vibrationAngleY', label: 'Vibration Angle Y', unit: '°', color: '#fbbf24' },
    { id: 'vibrationAngleZ', label: 'Vibration Angle Z', unit: '°', color: '#eab308' },
  ];

  const currentOption = metricOptions.find(m => m.id === metric) || metricOptions[0];

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    let list = [...readings];

    if (timeSlice === 'first_half') {
      list = list.slice(0, Math.ceil(list.length / 2));
    } else if (timeSlice === 'second_half') {
      list = list.slice(Math.floor(list.length / 2));
    } else if (timeSlice === 'recent20') {
      list = list.slice(-20);
    }

    return list.map((r, i) => ({
      index: i,
      rawTime: r.rawTimestamp,
      shortTime: (r.rawTimestamp || '').split(',')[1]?.trim() || r.rawTimestamp,
      value: r[currentOption.id]
    }));
  }, [readings, metric, timeSlice, currentOption.id]);

  // Compute Trend stats
  const validValues = chartData.map(d => d.value).filter(v => v != null);
  const avg = validValues.length ? (validValues.reduce((a, b) => a + b, 0) / validValues.length) : null;
  const firstVal = validValues[0];
  const lastVal = validValues[validValues.length - 1];
  const delta = (firstVal != null && lastVal != null) ? (lastVal - firstVal) : 0;

  return (
    <div className="industrial-card p-5 flex flex-col h-[400px]">
      {/* Header with Metric & Range Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Chart 5: Historical Trend &amp; Progression
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Tracks metric progression across dataset intervals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-teal-500"
          >
            {metricOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label} ({opt.unit})
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <select
            value={timeSlice}
            onChange={(e) => setTimeSlice(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-teal-500"
          >
            <option value="all">Full Timeline</option>
            <option value="first_half">Initial Phase (First 50%)</option>
            <option value="second_half">Operating Phase (Last 50%)</option>
            <option value="recent20">Recent 20 Readings</option>
          </select>
        </div>
      </div>

      {/* Quick Trend Indicator */}
      <div className="flex items-center gap-4 text-xs font-mono mb-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
        <div>
          <span className="text-[10px] text-slate-400 block">AVERAGE</span>
          <span className="font-bold text-slate-200">
            {avg != null ? `${avg.toFixed(2)} ${currentOption.unit}` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">TOTAL SHIFT</span>
          <span className={`font-bold ${delta > 0 ? 'text-amber-400' : delta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)} {currentOption.unit}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">DATA POINTS</span>
          <span className="font-bold text-teal-400">{validValues.length} samples</span>
        </div>
      </div>

      {/* Canvas */}
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
              unit={` ${currentOption.unit}`}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dp = payload[0].payload;
                  return (
                    <div className="bg-industrial-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono">
                      <div className="text-slate-400 mb-1">{dp.rawTime}</div>
                      <div className="text-white font-bold">
                        {currentOption.label}: {dp.value != null ? `${dp.value} ${currentOption.unit}` : 'N/A'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {avg != null && (
              <ReferenceLine
                y={avg}
                stroke="#64748b"
                strokeDasharray="2 2"
                label={{ value: `Avg (${avg.toFixed(1)})`, fill: '#94a3b8', fontSize: 9, position: 'left' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name={currentOption.label}
              stroke={currentOption.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
