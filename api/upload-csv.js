// Vercel Serverless Function: POST /api/upload-csv
// Note: Vercel serverless supports multipart uploads via formidable or busboy.
// For simplicity, we also support raw text/csv body upload.
const { setDataset, store } = require('./_store');
const { parseMotorVibrationCsv } = require('./_csvParser');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let csvContent = '';

    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      // Raw CSV body
      csvContent = await readBody(req);
    } else if (contentType.includes('application/json')) {
      // JSON body with csvContent field: { "csvContent": "..." }
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      csvContent = parsed.csvContent || '';
    } else {
      // Try to read raw body as text (fallback)
      csvContent = await readBody(req);
    }

    if (!csvContent || csvContent.trim().length < 10) {
      return res.status(400).json({ error: 'No valid CSV content received. Send raw CSV as request body with Content-Type: text/csv' });
    }

    const { readings, stats } = parseMotorVibrationCsv(csvContent);

    if (readings.length === 0) {
      return res.status(422).json({ error: 'No valid records found in uploaded CSV', stats });
    }

    setDataset(readings, 'csv');

    return res.status(200).json({
      message: 'CSV parsed and imported successfully',
      stats,
      importedCount: readings.length,
      sample: readings.slice(0, 3)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk.toString(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

