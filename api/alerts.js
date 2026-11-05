// Vercel Serverless Function: GET /api/alerts  |  POST /api/alerts/thresholds
const { store } = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      alerts: store.alerts.slice(0, 100),
      thresholds: store.thresholds
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

