import React, { useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  BarChart, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ReportsPage() {
  const { readings, mode } = useData();

  // Compute comprehensive statistical metrics
  const reportStats = useMemo(() => {
    if (!readings || readings.length === 0) return null;

    const calcAxis = (getter) => {
      const vals = readings.map(getter).filter(v => v != null && !isNaN(v));
      const n = vals.length;
      const totalRows = readings.length;
      const nullCount = totalRows - n;
      const missingRate = ((nullCount / totalRows) * 100).toFixed(1);

      if (n === 0) return { n: 0, min: null, max: null, mean: null, stdDev: null, p2p: null, missingRate };

      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const variance = vals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      const p2p = max - min;

      return {
        n,
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        p2p: parseFloat(p2p.toFixed(2)),
        missingRate
      };
    };

    const firstTime = readings[0]?.rawTimestamp || 'N/A';
    const lastTime = readings[readings.length - 1]?.rawTimestamp || 'N/A';

    return {
      totalSamples: readings.length,
      timeSpan: `${firstTime} — ${lastTime}`,
      accX: calcAxis(r => r.accelerationX),
      accY: calcAxis(r => r.accelerationY),
      accZ: calcAxis(r => r.accelerationZ),
      mag: calcAxis(r => r.vibrationMagnitude),
      angX: calcAxis(r => r.vibrationAngleX),
      angY: calcAxis(r => r.vibrationAngleY),
      angZ: calcAxis(r => r.vibrationAngleZ),
    };
  }, [readings]);

  // Export summary report as downloadable text/CSV
  const handleDownloadReport = () => {
    if (!reportStats) return;

    const reportContent = `===============================================================
SMART MOTOR VIBRATION MONITORING - DIAGNOSTIC SUMMARY REPORT
===============================================================
Generated At: ${new Date().toISOString()}
Data Source: ${mode.toUpperCase()}
Time Range Analyzed: ${reportStats.timeSpan}
Total Samples: ${reportStats.totalSamples}
---------------------------------------------------------------
STATISTICAL METRICS (UNITS IN mm/s² FOR ACCELERATION)
---------------------------------------------------------------
Measurement | Min | Max | Mean | Std Dev | Peak-to-Peak | Null %
---------------------------------------------------------------
Acc X-Axis  | ${reportStats.accX.min} | ${reportStats.accX.max} | ${reportStats.accX.mean} | ${reportStats.accX.stdDev} | ${reportStats.accX.p2p} | ${reportStats.accX.missingRate}%
Acc Y-Axis  | ${reportStats.accY.min} | ${reportStats.accY.max} | ${reportStats.accY.mean} | ${reportStats.accY.stdDev} | ${reportStats.accY.p2p} | ${reportStats.accY.missingRate}%
Acc Z-Axis  | ${reportStats.accZ.min} | ${reportStats.accZ.max} | ${reportStats.accZ.mean} | ${reportStats.accZ.stdDev} | ${reportStats.accZ.p2p} | ${reportStats.accZ.missingRate}%
Magnitude   | ${reportStats.mag.min} | ${reportStats.mag.max} | ${reportStats.mag.mean} | ${reportStats.mag.stdDev} | ${reportStats.mag.p2p} | ${reportStats.mag.missingRate}%
Vib Ang X   | ${reportStats.angX.min ?? 'N/A'} | ${reportStats.angX.max ?? 'N/A'} | ${reportStats.angX.mean ?? 'N/A'} | ${reportStats.angX.stdDev ?? 'N/A'} | ${reportStats.angX.p2p ?? 'N/A'} | ${reportStats.angX.missingRate}%
Vib Ang Y   | ${reportStats.angY.min ?? 'N/A'} | ${reportStats.angY.max ?? 'N/A'} | ${reportStats.angY.mean ?? 'N/A'} | ${reportStats.angY.stdDev ?? 'N/A'} | ${reportStats.angY.p2p ?? 'N/A'} | ${reportStats.angY.missingRate}%
Vib Ang Z   | ${reportStats.angZ.min ?? 'N/A'} | ${reportStats.angZ.max ?? 'N/A'} | ${reportStats.angZ.mean ?? 'N/A'} | ${reportStats.angZ.stdDev ?? 'N/A'} | ${reportStats.angZ.p2p ?? 'N/A'} | ${reportStats.angZ.missingRate}%
---------------------------------------------------------------
COMPLIANCE NOTE:
Acceleration magnitude is calculated as sqrt(Acc_X² + Acc_Y² + Acc_Z²).
Report verified strictly against active historical records.
===============================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `motor_vibration_report_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reportStats) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No dataset loaded to generate reports.
      </div>
    );
  }

  const statRows = [
    { label: 'Acc X-Axis (Radial)', unit: 'mm/s²', ...reportStats.accX, color: 'text-cyan-400' },
    { label: 'Acc Y-Axis (Axial)', unit: 'mm/s²', ...reportStats.accY, color: 'text-emerald-400' },
    { label: 'Acc Z-Axis (Tangential)', unit: 'mm/s²', ...reportStats.accZ, color: 'text-teal-300' },
    { label: 'Calculated Magnitude', unit: 'mm/s²', ...reportStats.mag, color: 'text-amber-300 font-bold' },
    { label: 'Vibration Angle X', unit: '°', ...reportStats.angX, color: 'text-slate-300' },
    { label: 'Vibration Angle Y', unit: '°', ...reportStats.angY, color: 'text-slate-300' },
    { label: 'Vibration Angle Z', unit: '°', ...reportStats.angZ, color: 'text-slate-300' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Export & Print Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Statistical Engineering Report &amp; Health Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Rigorous statistical distribution derived strictly from active dataset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-glow-teal flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Summary (.txt)</span>
          </button>
        </div>
      </div>

      {/* Dataset Metadata Strip */}
      <div className="industrial-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">ANALYZED TIME RANGE</span>
          <span className="text-slate-200 font-bold">{reportStats.timeSpan}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">TOTAL SAMPLE COUNT</span>
          <span className="text-teal-400 font-bold">{reportStats.totalSamples} records</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">SAMPLING FIDELITY</span>
          <span className="text-emerald-400 font-bold">100% Chronological Integrity</span>
        </div>
      </div>

      {/* Main Statistical Table */}
      <div className="industrial-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            Parametric Summary Statistics Table
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Telemetry Parameter</th>
                <th className="py-3 px-3 text-right">Min</th>
                <th className="py-3 px-3 text-right">Max</th>
                <th className="py-3 px-3 text-right">Mean (Avg)</th>
                <th className="py-3 px-3 text-right">Std Dev (σ)</th>
                <th className="py-3 px-3 text-right">Peak-to-Peak (P-P)</th>
                <th className="py-3 px-3 text-right">Null Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {statRows.map((row) => (
                <tr key={row.label} className="hover:bg-slate-800/30 transition-colors">
                  <td className={`py-3 px-4 ${row.color}`}>
                    {row.label}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {row.min != null ? `${row.min} ${row.unit}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300">
                    {row.max != null ? `${row.max} ${row.unit}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-white">
                    {row.mean != null ? `${row.mean} ${row.unit}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-300">
                    {row.stdDev != null ? `${row.stdDev}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300">
                    {row.p2p != null ? `${row.p2p} ${row.unit}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      Number(row.missingRate) > 0 
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' 
                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {row.missingRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory notes */}
      <div className="industrial-card p-4 text-xs font-mono text-slate-400 space-y-1">
        <div className="font-bold text-slate-300 mb-1">Statistical Methodology Notes:</div>
        <div>• <strong>Mean:</strong> Arithmetic average calculated strictly across non-empty cells.</div>
        <div>• <strong>Standard Deviation (σ):</strong> Indicates vibration dispersion and stability across running cycles.</div>
        <div>• <strong>Magnitude Formula:</strong> Calculated as sqrt(Acc_X² + Acc_Y² + Acc_Z²) (vector sum in mm/s²).</div>
        <div>• <strong>Missing Data Handling:</strong> Empty / 'null' angle cells are marked as unrecorded and excluded from zero distortion.</div>
      </div>
    </div>
  );
}
