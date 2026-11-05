// Vercel Serverless Function: POST /api/alerts/thresholds
const { store } = require('../_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    store.thresholds = { ...store.thresholds, ...req.body, isConfigured: true };
    return res.status(200).json({ success: true, thresholds: store.thresholds });
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update thresholds', details: error.message });
  }
};

