// On Vercel, the frontend and API share the same domain — use relative /api paths.
// When running locally against a separate backend, set VITE_API_URL=http://localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || '';

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
  // Send the raw CSV text so it works with both the Express backend (multipart)
  // and the Vercel serverless function (raw text/csv body).
  const csvText = await file.text();
  const res = await fetch(`${API_BASE}/api/upload-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/csv' },
    body: csvText
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
