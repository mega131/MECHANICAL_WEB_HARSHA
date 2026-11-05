import { describe, it } from 'node:test';
import assert from 'node:assert';
import { normalizeCsvRow, parseMotorVibrationCsv, parseTimeStringToIso } from '../services/csvParser.js';

describe('CSV Parser and Normalization', () => {
  it('should trim column headers with trailing spaces and map values accurately', () => {
    const rawRow = {
      'time': '"03-09-26, 12:00 am"',
      'Acc_X-mm/s2 ': '558.8',
      'Acc_Y-mm/s2 ': '1.95',
      'Acc_Z-mm/s2 ': '1922.2',
      'Vib_Ang_X ': 'null',
      'Vib_Ang_Y ': 'null',
      'Vib_Ang_Z ': 'null'
    };

    const normalized = normalizeCsvRow(rawRow, 0);
    assert.ok(normalized);
    assert.strictEqual(normalized.rawTimestamp, '03-09-26, 12:00 am');
    assert.strictEqual(normalized.accelerationX, 558.8);
    assert.strictEqual(normalized.accelerationY, 1.95);
    assert.strictEqual(normalized.accelerationZ, 1922.2);
    // Null handling: string "null" must become null, not 0 or NaN
    assert.strictEqual(normalized.vibrationAngleX, null);
    assert.strictEqual(normalized.vibrationAngleY, null);
    assert.strictEqual(normalized.vibrationAngleZ, null);
  });

  it('should calculate overall acceleration magnitude as sqrt(x^2 + y^2 + z^2)', () => {
    const rawRow = {
      'time': '03-09-26, 10:00 am',
      'Acc_X-mm/s2': '566.7',
      'Acc_Y-mm/s2': '81.4',
      'Acc_Z-mm/s2': '1916.1',
      'Vib_Ang_X': '1',
      'Vib_Ang_Y': '1',
      'Vib_Ang_Z': '1.13'
    };

    const normalized = normalizeCsvRow(rawRow, 1);
    assert.ok(normalized);
    const expectedMagnitude = parseFloat(Math.sqrt(566.7 ** 2 + 81.4 ** 2 + 1916.1 ** 2).toFixed(2));
    assert.strictEqual(normalized.vibrationMagnitude, expectedMagnitude);
    assert.strictEqual(normalized.vibrationAngleX, 1);
    assert.strictEqual(normalized.vibrationAngleY, 1);
    assert.strictEqual(normalized.vibrationAngleZ, 1.13);
  });

  it('should handle missing values without inventing fake numbers', () => {
    const rawRow = {
      'time': '03-09-26, 02:00 pm',
      'Acc_X-mm/s2': '559.7',
      'Acc_Y-mm/s2': '56.8',
      'Acc_Z-mm/s2': '1912.5',
      'Vib_Ang_X': 'null',
      'Vib_Ang_Y': '',
      'Vib_Ang_Z': '1'
    };

    const normalized = normalizeCsvRow(rawRow, 2);
    assert.ok(normalized);
    assert.strictEqual(normalized.vibrationAngleX, null);
    assert.strictEqual(normalized.vibrationAngleY, null);
    assert.strictEqual(normalized.vibrationAngleZ, 1);
  });

  it('should parse multi-line CSV string correctly', () => {
    const csvData = `time,Acc_X-mm/s2 ,Acc_Y-mm/s2 ,Acc_Z-mm/s2 ,Vib_Ang_X ,Vib_Ang_Y ,Vib_Ang_Z 
"03-09-26, 12:00 am",558.8,1.95,1922.2,null,null,null
"03-09-26, 09:00 am",577.1,26.1,1916.3,null,1,3`;

    const result = parseMotorVibrationCsv(csvData);
    assert.strictEqual(result.stats.validRecords, 2);
    assert.strictEqual(result.readings[0].accelerationX, 558.8);
    assert.strictEqual(result.readings[1].vibrationAngleZ, 3);
  });
});
