import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Upload, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function HistoricalDataPage() {
  const { 
    csvReadings, 
    uploadCsv, 
    resetDefaultCsv, 
    isLoading, 
    errorMsg,
    searchQuery,
    setSearchQuery 
  } = useData();

  // Filters & Pagination State
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState('index');
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Column visibility toggles
  const [visibleCols, setVisibleCols] = useState({
    time: true,
    accX: true,
    accY: true,
    accZ: true,
    mag: true,
    angX: true,
    angY: true,
    angZ: true,
  });

  // Filter & Sort Readings
  const filteredReadings = useMemo(() => {
    let list = [...(csvReadings || [])];

    // Global Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.rawTimestamp && r.rawTimestamp.toLowerCase().includes(q)) ||
        (r.deviceId && r.deviceId.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }

    // Date Filter (e.g., '03-09-26' or '04-09-26')
    if (dateFilter.trim()) {
      const df = dateFilter.toLowerCase();
      list = list.filter(r => r.rawTimestamp && r.rawTimestamp.toLowerCase().includes(df));
    }

    // Sorting
    list.sort((a, b) => {
      let vA = a[sortField];
      let vB = b[sortField];

      // Special handling for index or timestamp
      if (sortField === 'index') {
        const idA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
        const idB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
        return sortAsc ? idA - idB : idB - idA;
      }

      if (sortField === 'rawTimestamp') {
        return sortAsc 
          ? (a.rawTimestamp || '').localeCompare(b.rawTimestamp || '')
          : (b.rawTimestamp || '').localeCompare(a.rawTimestamp || '');
      }

      // Numeric comparison
      if (vA == null && vB == null) return 0;
      if (vA == null) return sortAsc ? 1 : -1;
      if (vB == null) return sortAsc ? -1 : 1;

      return sortAsc ? vA - vB : vB - vA;
    });

    return list;
  }, [csvReadings, searchQuery, dateFilter, sortField, sortAsc]);

  // Pagination calculation
  const totalRecords = filteredReadings.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReadings.slice(start, start + pageSize);
  }, [filteredReadings, currentPage, pageSize]);

  // Handle CSV file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type. Please upload a comma-separated .csv file.');
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadCsv(file);
      setUploadSuccess(`Successfully imported ${res.importedCount || res.readings?.length || 'all'} records from ${file.name}`);
      setCurrentPage(1);
    } catch (err) {
      setUploadError(err.message || 'Failed to process CSV file');
    }
  };

  // Download filtered data as CSV
  const handleExportCsv = () => {
    if (filteredReadings.length === 0) return;

    const headers = [
      'time',
      'Acc_X-mm/s2',
      'Acc_Y-mm/s2',
      'Acc_Z-mm/s2',
      'Calculated_Magnitude-mm/s2',
      'Vib_Ang_X',
      'Vib_Ang_Y',
      'Vib_Ang_Z'
    ];

    const rows = filteredReadings.map(r => [
      `"${r.rawTimestamp}"`,
      r.accelerationX ?? '',
      r.accelerationY ?? '',
      r.accelerationZ ?? '',
      r.vibrationMagnitude ?? '',
      r.vibrationAngleX ?? '',
      r.vibrationAngleY ?? '',
      r.vibrationAngleZ ?? ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `motor_vibration_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-industrial-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            Historical Sensor Records &amp; CSV Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Search, filter, validate, and export calibrated historical motor telemetry
          </p>
        </div>

        {/* Action Buttons: Upload CSV, Export CSV, Reset Default */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Button */}
          <label className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-glow-teal flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={filteredReadings.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Reset to default Motor Vibration.csv */}
          <button
            onClick={resetDefaultCsv}
            title="Reload initial Motor Vibration.csv"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dataset</span>
          </button>
        </div>
      </div>

      {/* Upload Success / Error Notifications */}
      {uploadSuccess && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {(uploadError || errorMsg) && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-center gap-2 text-xs font-mono text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError || errorMsg}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="industrial-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by timestamp or sample..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          {/* Date Selector */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-mono"
          >
            <option value="">All Dates</option>
            <option value="03-09-26">Date: 03-09-26 (Day 1)</option>
            <option value="04-09-26">Date: 04-09-26 (Day 2)</option>
          </select>
        </div>

        {/* Rows per page & record counter */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Showing {filteredReadings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
          </span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => handleSort('index')}
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort('rawTimestamp')}
                >
                  <div className="flex items-center gap-1">
                    <span>Original Time</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('accelerationX')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Acc X (mm/s²)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('accelerationY')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Acc Y (mm/s²)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('accelerationZ')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Acc Z (mm/s²)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort('vibrationMagnitude')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Magnitude</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Vib Ang X</th>
                <th className="py-3 px-3 text-center">Vib Ang Y</th>
                <th className="py-3 px-3 text-center">Vib Ang Z</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedRows.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 font-medium whitespace-nowrap">
                    {r.rawTimestamp}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">
                    {r.accelerationX != null ? r.accelerationX.toFixed(1) : <span className="text-slate-600">null</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">
                    {r.accelerationY != null ? r.accelerationY.toFixed(2) : <span className="text-slate-600">null</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-teal-300">
                    {r.accelerationZ != null ? r.accelerationZ.toFixed(1) : <span className="text-slate-600">null</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    {r.vibrationMagnitude != null ? `${r.vibrationMagnitude} mm/s²` : '---'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.vibrationAngleX != null ? `${r.vibrationAngleX}°` : <span className="text-slate-600">N/A</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.vibrationAngleY != null ? `${r.vibrationAngleY}°` : <span className="text-slate-600">N/A</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {r.vibrationAngleZ != null ? `${r.vibrationAngleZ}°` : <span className="text-slate-600">N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedRows.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              No matching records found.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Page <strong className="text-slate-200">{currentPage}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
