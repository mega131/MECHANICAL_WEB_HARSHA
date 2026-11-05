// Vercel Serverless Function: GET /api/readings/latest
const { getLatestReading } = require('../_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const latest = getLatestReading();
  if (!latest) {
    return res.status(404).json({ error: 'No sensor readings found in dataset' });
  }
  return res.status(200).json(latest);
};

