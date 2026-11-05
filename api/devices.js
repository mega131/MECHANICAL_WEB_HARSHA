// Vercel Serverless Function: GET /api/devices
const { store } = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const now = Date.now();
  const devices = store.devices.map(dev => {
    let status = dev.status;
    if (status === 'online' && dev.lastSeen) {
      if (now - new Date(dev.lastSeen).getTime() > 30000) status = 'offline';
    }
    return { ...dev, status };
  });

  return res.status(200).json({ devices });
};

