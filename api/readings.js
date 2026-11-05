// Vercel Serverless Function: GET /api/readings  &  POST /api/readings
const { getReadings, getLatestReading, addReading, store } = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // GET /api/readings
    try {
      const { limit, offset, search, startDate, endDate } = req.query;
      const result = getReadings({
        limit: limit ? parseInt(limit, 10) : 500,
        offset: offset ? parseInt(offset, 10) : 0,
        search, startDate, endDate
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve sensor readings', details: error.message });
    }
  }

  if (req.method === 'POST') {
    // POST /api/readings  (ESP32 IoT ingestion endpoint)
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid reading payload. Expected JSON object.' });
      }
      const { reading, alert } = addReading(payload);
      return res.status(201).json({ success: true, reading, alert: alert || null });
    } catch (error) {
      return res.status(400).json({ error: 'Failed to process sensor reading', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

