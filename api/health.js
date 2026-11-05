// Vercel Serverless Function: GET /api/health
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { store } = require('./_store');

  res.status(200).json({
    status: 'ok',
    system: 'Smart Motor Vibration Monitoring Service (Vercel)',
    timestamp: new Date().toISOString(),
    mode: store.mode,
    totalReadings: store.readings.length,
    devices: store.devices.length
  });
};
