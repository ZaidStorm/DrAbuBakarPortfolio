/**
 * /api/stream/[fileId].js — GET /api/stream/:fileId
 *
 * Video streaming proxy with Range-request support so <video> seeking works.
 * The browser sends a Range header; we forward it to Drive and pipe the
 * partial content back — enabling native HTML5 video scrubbing.
 *
 * Also works for images when lh3.googleusercontent.com is not accessible
 * (i.e. before you set "Anyone with the link can view" on the Drive folder).
 */

const { getDrive } = require('../_driveClient');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: 'Missing fileId' });

  const range = req.headers['range'];

  try {
    const drive = getDrive();

    // Build request options — forward Range header if present
    const requestOptions = { responseType: 'stream' };
    if (range) requestOptions.headers = { Range: range };

    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      requestOptions
    );

    const statusCode =
      driveRes.headers['content-range'] ? 206 : driveRes.status || 200;

    // Forward relevant headers
    const forward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ];
    forward.forEach(h => {
      if (driveRes.headers[h]) res.setHeader(h, driveRes.headers[h]);
    });

    // Always advertise range support so the browser knows it can seek
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');

    res.status(statusCode);
    driveRes.data.pipe(res);

  } catch (err) {
    // Drive returns 416 if the Range is out of bounds — forward it properly
    if (err.response?.status) {
      return res.status(err.response.status).json({ error: err.message });
    }
    console.error(`[/api/stream/${fileId}]`, err.message);
    return res.status(500).json({ error: err.message });
  }
};