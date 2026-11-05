import Papa from 'papaparse';

/**
 * Normalizes a row from the Motor Vibration CSV file.
 * Preserves exact original timestamps and handles nulls safely.
 */
export function normalizeCsvRow(row, index) {
  const cleanRow = {};
  for (const [key, val] of Object.entries(row)) {
    cleanRow[key.trim()] = val;
  }

  const rawTime = cleanRow['time'] || cleanRow['Time'] || '';
  if (!rawTime || typeof rawTime !== 'string') {
    return null;
  }

  const parseVal = (v) => {
    if (v === null || v === undefined) return null;
    const str = String(v).trim().toLowerCase();
    if (str === '' || str === 'null' || str === 'nan' || str === 'n/a') return null;
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  const accX = parseVal(cleanRow['Acc_X-mm/s2'] ?? cleanRow['Acc_X'] ?? cleanRow['accX']);
  const accY = parseVal(cleanRow['Acc_Y-mm/s2'] ?? cleanRow['Acc_Y'] ?? cleanRow['accY']);
  const accZ = parseVal(cleanRow['Acc_Z-mm/s2'] ?? cleanRow['Acc_Z'] ?? cleanRow['accZ']);

  const angX = parseVal(cleanRow['Vib_Ang_X'] ?? cleanRow['vibAngX']);
  const angY = parseVal(cleanRow['Vib_Ang_Y'] ?? cleanRow['vibAngY']);
  const angZ = parseVal(cleanRow['Vib_Ang_Z'] ?? cleanRow['vibAngZ']);

  if (accX === null && accY === null && accZ === null) {
    return null;
  }

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

export function parseTimeStringToIso(timeStr) {
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
        if (!isNaN(d.getTime())) {
          return d.toISOString();
        }
      }
    }
  } catch (e) {
    // Return original string if error
  }
  return timeStr;
}

export function parseMotorVibrationCsvClient(csvContent) {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const readings = [];
  let skipped = 0;

  parsed.data.forEach((row, i) => {
    const normalized = normalizeCsvRow(row, i);
    if (normalized) {
      readings.push(normalized);
    } else {
      skipped++;
    }
  });

  return {
    readings,
    stats: {
      totalParsed: parsed.data.length,
      validRecords: readings.length,
      skippedRecords: skipped,
      errors: parsed.errors
    }
  };
}
