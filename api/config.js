// Vercel Serverless Function: GET /api/config  |  POST /api/mode
const { store } = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    mode: store.mode,
    thresholds: store.thresholds,
    supportedUnits: { acceleration: 'mm/s²', angle: 'degrees / rad (as provided)' },
    version: '1.0.0-vercel'
  });
};

