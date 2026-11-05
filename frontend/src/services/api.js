// In Vercel Services, the frontend and backend share one public domain.
// All /api/* calls go through Vercel's rewrite to the backend service.
// Use relative paths so they work from any domain (Vercel, local, preview).
// VITE_API_URL is only used for local dev against a separate backend server.
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL  // local dev: http://localhost:5000
  : '';                            // Vercel: use relative /api/... paths

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchReadings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/readings?${query}`);
  if (!res.ok) throw new Error(`Failed to fetch readings: ${res.statusText}`);
  return await res.json();
}

export async function fetchLatestReading() {
  const res = await fetch(`${API_BASE}/api/readings/latest`);
  if (!res.ok) throw new Error(`Failed to fetch latest reading: ${res.statusText}`);
  return await res.json();
}

export async function uploadCsvFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload-csv`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }
  return await res.json();
}

export async function resetDefaultCsv() {
  const res = await fetch(`${API_BASE}/api/reset-default-csv`, { method: 'POST' });
  if (!res.ok) throw new Error(`Reset failed: ${res.statusText}`);
  return await res.json();
}

export async function sendSensorReading(reading) {
  const res = await fetch(`${API_BASE}/api/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reading)
  });
  if (!res.ok) throw new Error(`Failed to post reading: ${res.statusText}`);
  return await res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error(`Failed to fetch alerts`);
  return await res.json();
}

export async function saveThresholds(thresholds) {
  const res = await fetch(`${API_BASE}/api/alerts/thresholds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  });
  if (!res.ok) throw new Error(`Failed to save thresholds`);
  return await res.json();
}

export async function acknowledgeAlert(alertId) {
  const res = await fetch(`${API_BASE}/api/alerts/acknowledge/${alertId}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to acknowledge alert`);
  return await res.json();
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/api/devices`);
  if (!res.ok) throw new Error(`Failed to fetch devices`);
  return await res.json();
}

export async function setBackendMode(mode) {
  const res = await fetch(`${API_BASE}/api/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  if (!res.ok) throw new Error(`Failed to set mode`);
  return await res.json();
}
