import React from 'react';
import { LineChart as LineChartIcon, Activity, Compass, Layers, Zap } from 'lucide-react';
import IndividualAxisAnalysisChart from '../components/charts/IndividualAxisAnalysisChart';
import VibrationAngleAnalysisChart from '../components/charts/VibrationAngleAnalysisChart';
import HistoricalTrendChart from '../components/charts/HistoricalTrendChart';
import { useData } from '../context/DataContext';

export default function VibrationAnalysisPage() {
  const { readings } = useData();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-teal-400" />
          Vibration &amp; Acceleration Deep Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Multi-axis waveform envelope analysis, angle phase diagnostics, and historical trends
        </p>
      </div>

      {/* Row 1: Individual Axis Analysis & Envelope */}
      <IndividualAxisAnalysisChart />

      {/* Row 2: Vibration Angle Analysis (with gaps for nulls) + Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <VibrationAngleAnalysisChart />
        <HistoricalTrendChart />
      </div>

      {/* Harmonic Spectral Estimation & Physics Info Box */}
      <div className="industrial-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Vibration Mechanics &amp; ISO 10816 Vibration Severity Baseline
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-teal-400 font-bold block mb-1">RADIAL (X-AXIS) DYNAMICS</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Primarily captures mechanical unbalance, rotor eccentricity, and bent shaft forces perpendicular to the motor shaft.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-emerald-400 font-bold block mb-1">AXIAL (Y-AXIS) DYNAMICS</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Reflects angular misalignment, worn thrust collar bearings, or coupling clearance issues parallel to the shaft center line.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-cyan-400 font-bold block mb-1">TANGENTIAL (Z-AXIS) DYNAMICS</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exhibits structural looseness, soft foot resonance, stator electromagnetic torque pulsation, and mounting foundation flexibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
