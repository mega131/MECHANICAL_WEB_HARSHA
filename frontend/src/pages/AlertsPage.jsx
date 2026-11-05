import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  Sliders, 
  Check, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AlertsPage() {
  const { 
    alerts, 
    thresholds, 
    updateThresholds, 
    motorCondition, 
    acknowledgeAlert 
  } = useData();

  // Form state for thresholds
  const [formData, setFormData] = useState({
    warnX: thresholds?.warning?.accelerationX ?? 600,
    warnY: thresholds?.warning?.accelerationY ?? 100,
    warnZ: thresholds?.warning?.accelerationZ ?? 1925,
    warnMag: thresholds?.warning?.magnitude ?? 2050,
    critX: thresholds?.critical?.accelerationX ?? 650,
    critY: thresholds?.critical?.accelerationY ?? 300,
    critZ: thresholds?.critical?.accelerationZ ?? 1935,
    critMag: thresholds?.critical?.magnitude ?? 2150,
    isConfigured: thresholds?.isConfigured ?? true
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateThresholds({
      isConfigured: formData.isConfigured,
      provisionalNotice: "Thresholds are provisional and require engineering validation against motor specifications (e.g. ISO 10816)",
      warning: {
        accelerationX: parseFloat(formData.warnX),
        accelerationY: parseFloat(formData.warnY),
        accelerationZ: parseFloat(formData.warnZ),
        magnitude: parseFloat(formData.warnMag)
      },
      critical: {
        accelerationX: parseFloat(formData.critX),
        accelerationY: parseFloat(formData.critY),
        accelerationZ: parseFloat(formData.critZ),
        magnitude: parseFloat(formData.critMag)
      }
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getConditionColor = () => {
    switch (motorCondition.level) {
      case 'critical': return 'border-rose-500/50 bg-rose-950/30 text-rose-300';
      case 'warning': return 'border-amber-500/50 bg-amber-950/30 text-amber-300';
      case 'normal': return 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300';
      default: return 'border-slate-800 bg-slate-900 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Motor Condition &amp; Alert Management
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Customizable warning/critical thresholds and historical telemetry violation logs
        </p>
      </div>

      {/* Mandatory Engineering Disclaimer Notice */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs font-mono text-amber-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200">ENGINEERING PROVISIONAL THRESHOLD NOTICE:</span>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            Default thresholds presented below are strictly provisional initial approximations. In accordance with ISO 10816 / ISO 20816 standards, vibration velocity and acceleration trip limits must be validated against the specific motor's frame size, power rating, and rigid/flexible mounting foundation specifications. If limits have not been reviewed, disable configuration below to display "Thresholds not configured".
          </p>
        </div>
      </div>

      {/* Current Motor Condition Assessment Card */}
      <div className={`p-6 rounded-2xl border transition-all ${getConditionColor()}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono opacity-80">
              Active Motor Health Status
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight mt-1">
              {motorCondition.status.toUpperCase()}
            </div>
            <div className="text-xs mt-1 opacity-90 font-mono">
              {motorCondition.level === 'critical'
                ? 'One or more axes have exceeded configured critical threshold limit.'
                : motorCondition.level === 'warning'
                  ? 'Sensor reading is operating within the alert zone above warning threshold.'
                  : motorCondition.level === 'normal'
                    ? 'All acceleration and magnitude readings are below configured warning limits.'
                    : 'Thresholds not configured. Configure limits below to enable health evaluation.'}
            </div>
          </div>

          <div className="text-right font-mono text-xs opacity-75">
            <div>Evaluation Method: Vector Boundary Check</div>
            <div>Model: Deterministic Threshold Rules (No unvalidated ML claims)</div>
          </div>
        </div>
      </div>

      {/* Configurable Thresholds Form */}
      <div className="industrial-card p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Threshold Configuration (mm/s²)
            </h3>
          </div>
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isConfigured}
              onChange={(e) => setFormData(p => ({ ...p, isConfigured: e.target.checked }))}
              className="rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0"
            />
            <span>Enable Threshold Monitoring</span>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warning Limits Column */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning Thresholds (Early Alert)</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc X-Axis Warning Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.warnX}
                  onChange={(e) => setFormData({ ...formData, warnX: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc Y-Axis Warning Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.warnY}
                  onChange={(e) => setFormData({ ...formData, warnY: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc Z-Axis Warning Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.warnZ}
                  onChange={(e) => setFormData({ ...formData, warnZ: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Calculated Magnitude Warning Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.warnMag}
                  onChange={(e) => setFormData({ ...formData, warnMag: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Critical Limits Column */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                <AlertOctagon className="w-4 h-4" />
                <span>Critical Thresholds (Immediate Action)</span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc X-Axis Critical Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.critX}
                  onChange={(e) => setFormData({ ...formData, critX: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc Y-Axis Critical Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.critY}
                  onChange={(e) => setFormData({ ...formData, critY: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Acc Z-Axis Critical Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.critZ}
                  onChange={(e) => setFormData({ ...formData, critZ: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Calculated Magnitude Critical Limit (mm/s²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.critMag}
                  onChange={(e) => setFormData({ ...formData, critMag: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Values automatically update condition badges across all dashboard views.
            </span>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Thresholds Saved Successfully!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-glow-teal transition-all"
              >
                Save &amp; Apply Thresholds
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Alert Event History Table */}
      <div className="industrial-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Alert Event Log &amp; Threshold Crossings ({alerts.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Chronological Audit History
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Affected Axis</th>
                <th className="py-2.5 px-3 text-right">Measured Value</th>
                <th className="py-2.5 px-3 text-right">Limit Threshold</th>
                <th className="py-2.5 px-4">Message / Description</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">
                    {alt.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {alt.severity === 'critical' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-500/40">
                        CRITICAL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/40">
                        WARNING
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-teal-300 font-bold">
                    {alt.axis}
                  </td>
                  <td className="py-2.5 px-3 text-right text-white font-bold">
                    {alt.value} mm/s²
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {alt.threshold} mm/s²
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 text-[11px] max-w-xs truncate">
                    {alt.message}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {alt.acknowledged ? (
                      <span className="text-[10px] text-slate-500 font-mono">Acknowledged</span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alt.id)}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 transition-all"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {alerts.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No threshold alerts recorded. All telemetry within configured bounds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
