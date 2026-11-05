import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { BarChart3, PieChart } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function AxisComparisonChart() {
  const { readings, latestReading } = useData();

  const comparisonData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    const xVals = readings.map(r => r.accelerationX).filter(v => v != null);
    const yVals = readings.map(r => r.accelerationY).filter(v => v != null);
    const zVals = readings.map(r => r.accelerationZ).filter(v => v != null);

    const calcMean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const calcMax = (arr) => arr.length ? Math.max(...arr) : 0;
    const calcMin = (arr) => arr.length ? Math.min(...arr) : 0;

    return [
      {
        axis: 'Acc X (Radial)',
        current: latestReading?.accelerationX || 0,
        average: parseFloat(calcMean(xVals).toFixed(1)),
        maximum: parseFloat(calcMax(xVals).toFixed(1)),
        minimum: parseFloat(calcMin(xVals).toFixed(1)),
        color: '#06b6d4'
      },
      {
        axis: 'Acc Y (Axial)',
        current: latestReading?.accelerationY || 0,
        average: parseFloat(calcMean(yVals).toFixed(1)),
        maximum: parseFloat(calcMax(yVals).toFixed(1)),
        minimum: parseFloat(calcMin(yVals).toFixed(1)),
        color: '#10b981'
      },
      {
        axis: 'Acc Z (Tangential)',
        current: latestReading?.accelerationZ || 0,
        average: parseFloat(calcMean(zVals).toFixed(1)),
        maximum: parseFloat(calcMax(zVals).toFixed(1)),
        minimum: parseFloat(calcMin(zVals).toFixed(1)),
        color: '#2dd4bf'
      }
    ];
  }, [readings, latestReading]);

  return (
    <div className="industrial-card p-5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Chart 4: Tri-Axial Comparative Distribution
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Side-by-side comparison of current, average, and maximum acceleration (mm/s²)
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="axis"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={{ stroke: '#334155' }}
              unit=" mm/s²"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-industrial-900 border border-slate-700 p-3 rounded-lg text-xs font-mono">
                      <div className="font-bold text-white mb-2 border-b border-slate-800 pb-1">{label}</div>
                      <div className="space-y-1">
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex justify-between gap-6">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-bold text-white">{entry.value} mm/s²</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

            <Bar dataKey="current" name="Latest Reading" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="average" name="Mean Average" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maximum" name="Max Peak" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>Computed strictly across actual imported dataset samples</span>
        <span>Units: mm/s²</span>
      </div>
    </div>
  );
}
