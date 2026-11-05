// Vercel Serverless Function: POST /api/alerts/acknowledge/[id]
const { store } = require('../../_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const alert = store.alerts.find(a => a.id === id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.acknowledged = true;
  return res.status(200).json({ success: true, alert });
};

