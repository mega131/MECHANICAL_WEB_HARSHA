import React, { useState } from 'react';
import { Sliders, Cpu, Save, RotateCcw, Check, Compass, Radio } from 'lucide-react';

export default function SensorConfigPage() {
  const [config, setConfig] = useState({
    sensorModel: 'MPU-6050 (MEMS Accelerometer)',
    samplingRate: '100',
    fullScaleRange: '2g',
    unit: 'mm/s²',
    offsetX: '0.0',
    offsetY: '0.0',
    offsetZ: '0.0',
    filterCutoffHz: '250',
    orientation: 'DE-BEARING-MOUNT'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTare = () => {
    setConfig(prev => ({
      ...prev,
      offsetX: '0.0',
      offsetY: '0.0',
      offsetZ: '0.0'
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-400" />
          Sensor Configuration &amp; Calibration
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Configure accelerometer sensitivity range, sampling frequency, and zero-offset calibration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-8 industrial-card p-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Hardware Sampling &amp; Scale Range
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">SENSOR MODEL</label>
                <select
                  value={config.sensorModel}
                  onChange={(e) => setConfig({ ...config, sensorModel: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="MPU-6050 (MEMS Accelerometer)">MPU-6050 (MEMS 6-DOF I2C)</option>
                  <option value="ADXL345 (Digital Accelerometer)">ADXL345 (Analog Devices SPI/I2C)</option>
                  <option value="ADXL355 (Precision Industrial)">ADXL355 (Low Noise Precision)</option>
                  <option value="Piezoelectric ICP/IEPE">Custom Industrial Piezoelectric ICP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">SAMPLING FREQUENCY</label>
                <select
                  value={config.samplingRate}
                  onChange={(e) => setConfig({ ...config, samplingRate: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="50">50 Hz (Low Power Logging)</option>
                  <option value="100">100 Hz (Standard Vibration Monitoring)</option>
                  <option value="200">200 Hz (High Speed Bearing Tracking)</option>
                  <option value="500">500 Hz (Turbomachinery Harmonic Analysis)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">FULL SCALE ACCELERATION RANGE</label>
                <select
                  value={config.fullScaleRange}
                  onChange={(e) => setConfig({ ...config, fullScaleRange: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="2g">±2g (Highest Sensitivity: 16384 LSB/g)</option>
                  <option value="4g">±4g (Medium Sensitivity: 8192 LSB/g)</option>
                  <option value="8g">±8g (High Impact Vibration: 4096 LSB/g)</option>
                  <option value="16g">±16g (Extreme Shock: 2048 LSB/g)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">PRIMARY ACCELERATION UNIT</label>
                <input
                  type="text"
                  disabled
                  value="mm/s² (Millimeters per second squared)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-teal-400 opacity-90 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="border-b border-slate-800/80 pb-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Axis Zero Tare &amp; Offset Trim (mm/s²)
                </h3>
                <button
                  type="button"
                  onClick={handleTare}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Offsets</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-cyan-400 mb-1">X-AXIS OFFSET</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.offsetX}
                  onChange={(e) => setConfig({ ...config, offsetX: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-emerald-400 mb-1">Y-AXIS OFFSET</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.offsetY}
                  onChange={(e) => setConfig({ ...config, offsetY: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-teal-300 mb-1">Z-AXIS OFFSET</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.offsetZ}
                  onChange={(e) => setConfig({ ...config, offsetZ: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-mono">
                Parameters sync with ESP32 firmware when device connects.
              </span>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Sensor Profile Saved!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-glow-teal flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Info Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="industrial-card p-5">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              Axis Orientation Mapping
            </h4>
            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-cyan-400 font-bold block">X-AXIS (Radial Plane):</span>
                <span className="text-[11px] text-slate-400">Mounted horizontally on the Drive-End bearing block.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-emerald-400 font-bold block">Y-AXIS (Axial Centerline):</span>
                <span className="text-[11px] text-slate-400">Aligned parallel with the output shaft rotation axis.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-teal-300 font-bold block">Z-AXIS (Tangential Plane):</span>
                <span className="text-[11px] text-slate-400">Mounted vertically to detect housing deflection and base foot resonance.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
