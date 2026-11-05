/**
 * Shared CSV parser for Vercel Serverless Functions (CommonJS compatible).
 * Replicates the backend csvParser logic without file system dependencies.
 */

function parseVal(v) {
  if (v === null || v === undefined) return null;
  const str = String(v).trim().toLowerCase();
  if (str === '' || str === 'null' || str === 'nan' || str === 'n/a') return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseTimeStringToIso(timeStr) {
  try {
    const parts = timeStr.split(',');
    if (parts.length >= 2) {
      const datePart = parts[0].trim();
      const timePart = parts[1].trim();
      const dParts = datePart.split('-');
      if (dParts.length === 3) {
        let day = parseInt(dParts[0], 10);
        let month = parseInt(dParts[1], 10);
        let year = parseInt(dParts[2], 10);
        if (year < 100) year += 2000;
        let [time, modifier] = timePart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (modifier && modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
        const d = new Date(Date.UTC(year, month - 1, day, hours, minutes || 0));
        if (!isNaN(d.getTime())) return d.toISOString();
      }
    }
  } catch (e) { /* fall through */ }
  return timeStr;
}

function normalizeCsvRow(row, index) {
  const cleanRow = {};
  for (const [key, val] of Object.entries(row)) {
    cleanRow[key.trim()] = val;
  }
  const rawTime = cleanRow['time'] || cleanRow['Time'] || '';
  if (!rawTime || typeof rawTime !== 'string') return null;

  const accX = parseVal(cleanRow['Acc_X-mm/s2'] ?? cleanRow['Acc_X'] ?? cleanRow['accX']);
  const accY = parseVal(cleanRow['Acc_Y-mm/s2'] ?? cleanRow['Acc_Y'] ?? cleanRow['accY']);
  const accZ = parseVal(cleanRow['Acc_Z-mm/s2'] ?? cleanRow['Acc_Z'] ?? cleanRow['accZ']);
  const angX = parseVal(cleanRow['Vib_Ang_X'] ?? cleanRow['vibAngX']);
  const angY = parseVal(cleanRow['Vib_Ang_Y'] ?? cleanRow['vibAngY']);
  const angZ = parseVal(cleanRow['Vib_Ang_Z'] ?? cleanRow['vibAngZ']);

  if (accX === null && accY === null && accZ === null) return null;

  let magnitude = null;
  if (accX !== null && accY !== null && accZ !== null) {
    magnitude = parseFloat(Math.sqrt(accX * accX + accY * accY + accZ * accZ).toFixed(2));
  }

  return {
    id: `csv-${index + 1}`,
    rawTimestamp: rawTime.trim().replace(/^"|"$/g, ''),
    timestamp: parseTimeStringToIso(rawTime.trim().replace(/^"|"$/g, '')),
    accelerationX: accX,
    accelerationY: accY,
    accelerationZ: accZ,
    vibrationMagnitude: magnitude,
    vibrationAngleX: angX,
    vibrationAngleY: angY,
    vibrationAngleZ: angZ,
    deviceId: 'CSV-HISTORICAL',
    source: 'csv'
  };
}

/**
 * Parse a CSV string into readings array.
 */
function parseMotorVibrationCsv(csvContent) {
  // Simple CSV parser (no external dependency needed in serverless)
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { readings: [], stats: { totalParsed: 0, validRecords: 0, skippedRecords: 0 } };

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const readings = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted fields (e.g. timestamps with commas inside quotes)
    const fields = [];
    let current = '';
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') {
        inQuote = !inQuote;
      } else if (line[c] === ',' && !inQuote) {
        fields.push(current.trim());
        current = '';
      } else {
        current += line[c];
      }
    }
    fields.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => { row[h] = fields[idx] || ''; });

    const normalized = normalizeCsvRow(row, i - 1);
    if (normalized) {
      readings.push(normalized);
    } else {
      skipped++;
    }
  }

  return {
    readings,
    stats: { totalParsed: lines.length - 1, validRecords: readings.length, skippedRecords: skipped }
  };
}

module.exports = { parseMotorVibrationCsv, normalizeCsvRow };

