// Vercel Serverless Function: POST /api/mode
const { store } = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mode } = req.body || {};
  if (!['csv', 'live', 'simulation'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode. Supported: csv, live, simulation' });
  }
  store.mode = mode;
  return res.status(200).json({ success: true, mode: store.mode });
};

