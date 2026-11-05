import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Eye, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function IndividualAxisAnalysisChart() {
  const { readings, thresholds } = useData();
  const [selectedAxis, setSelectedAxis] = useState('x'); // 'x' | 'y' | 'z'

  const axisConfig = {
    x: {
      name: 'X-Axis Acceleration',
      dataKey: 'accelerationX',
      unit: 'mm/s²',
      color: '#06b6d4',
      warnLimit: thresholds?.warning?.accelerationX || 600,
      critLimit: thresholds?.critical?.accelerationX || 650,
      desc: 'Radial vibration across horizontal stator bore plane'
    },
    y: {
      name: 'Y-Axis Acceleration',
      dataKey: 'accelerationY',
      unit: 'mm/s²',
      color: '#10b981',
      warnLimit: thresholds?.warning?.accelerationY || 100,
      critLimit: thresholds?.critical?.accelerationY || 300,
      desc: 'Axial thrust vibration parallel to motor drive shaft'
    },
    z: {
      name: 'Z-Axis Acceleration',
      dataKey: 'accelerationZ',
      unit: 'mm/s²',
      color: '#2dd4bf',
      warnLimit: thresholds?.warning?.accelerationZ || 1925,
      critLimit: thresholds?.critical?.accelerationZ || 1935,
      desc: 'Tangential vibration along vertical housing axis'
    }
  };

  const currentCfg = axisConfig[selectedAxis];

  const { chartData, stats } = useMemo(() => {
    if (!readings || readings.length === 0) return { chartData: [], stats: {} };

    const vals = [];
    const data = readings.map((r, i) => {
      const v = r[currentCfg.dataKey];
      if (v != null) vals.push(v);
      return {
        index: i,
        time: r.rawTimestamp,
        shortTime: (r.rawTimestamp || '').split(',')[1]?.trim() || r.rawTimestamp,
        value: v
      };
    });

    if (vals.length === 0) return { chartData: data, stats: {} };

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const peakToPeak = max - min;
    const latest = vals[vals.length - 1];

    return {
      chartData: data,
      stats: { min, max, mean, peakToPeak, latest }
    };
  }, [readings, currentCfg.dataKey]);

  return (
    <div className="industrial-card p-5 flex flex-col h-[420px]">
      {/* Header and Axis Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Chart 2: Individual Axis Analysis &amp; Envelope
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            {currentCfg.desc}
          </p>
        </div>

        {/* Axis Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSelectedAxis('x')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              selectedAxis === 'x'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Axis X
          </button>
          <button
            onClick={() => setSelectedAxis('y')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              selectedAxis === 'y'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-glow-teal'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Axis Y
          </button>
          <button
            onClick={() => setSelectedAxis('z')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              selectedAxis === 'z'
                ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-glow-teal'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Axis Z
          </button>
        </div>
      </div>

      {/* Axis Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">LATEST</span>
          <span className="font-bold text-white text-sm">
            {stats.latest != null ? `${stats.latest.toFixed(1)} mm/s²` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">MEAN (AVG)</span>
          <span className="font-bold text-cyan-300 text-sm">
            {stats.mean != null ? `${stats.mean.toFixed(1)} mm/s²` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">MIN RECORDED</span>
          <span className="font-bold text-emerald-400 text-sm">
            {stats.min != null ? `${stats.min.toFixed(1)} mm/s²` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">MAX RECORDED</span>
          <span className="font-bold text-amber-400 text-sm">
            {stats.max != null ? `${stats.max.toFixed(1)} mm/s²` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 block">PEAK-TO-PEAK (P-P)</span>
          <span className="font-bold text-slate-200 text-sm">
            {stats.peakToPeak != null ? `${stats.peakToPeak.toFixed(1)} mm/s²` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
            <defs>
              <linearGradient id={`gradient-${selectedAxis}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentCfg.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentCfg.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              unit=" mm/s²"
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dp = payload[0].payload;
                  return (
                    <div className="bg-industrial-900 border border-slate-700 p-2.5 rounded-lg text-xs font-mono">
                      <div className="text-slate-400 mb-1">{dp.time}</div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentCfg.color }} />
                        {currentCfg.name}: {dp.value} mm/s²
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Mean Reference Line */}
            {stats.mean != null && (
              <ReferenceLine
                y={stats.mean}
                stroke="#94a3b8"
                strokeDasharray="2 2"
                label={{ value: `Avg: ${stats.mean.toFixed(1)}`, fill: '#94a3b8', fontSize: 9, position: 'left' }}
              />
            )}

            {/* Threshold Reference Line */}
            {currentCfg.warnLimit && (
              <ReferenceLine
                y={currentCfg.warnLimit}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: `Warn Limit (${currentCfg.warnLimit})`, fill: '#f59e0b', fontSize: 9, position: 'right' }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              name={currentCfg.name}
              stroke={currentCfg.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${selectedAxis})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
