// Vercel Serverless Function: POST /api/reset-default-csv
const path = require('path');
const fs = require('fs');
const { setDataset, store } = require('./_store');
const { parseMotorVibrationCsv } = require('./_csvParser');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const csvPath = path.join(__dirname, '..', 'backend', 'data', 'Motor Vibration.csv');
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Default CSV not found on server. The frontend will use its bundled copy.' });
    }
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const { readings } = parseMotorVibrationCsv(csvContent);
    setDataset(readings, 'csv');

    return res.status(200).json({
      message: 'Reset to default Motor Vibration.csv completed',
      count: readings.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset default CSV', details: err.message });
  }
};

