/**
 * /api/videos.js — GET /api/videos
 *
 * Returns all video files inside the specifically designated "videos" Google Drive folder.
 *
 * Response shape:
 *   { files: [{ id, name, type, src }] }
 */

const { getDrive } = require('./_driveClient');

// The specific folder ID for the "videos" folder
const HARDCODED_VIDEOS_FOLDER_ID = '1Gd5SNLEMrlUBdAHFbQtnurqrKm3MnoDa';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const drive = getDrive();
    const folderId = process.env.VIDEOS_FOLDER_ID ? process.env.VIDEOS_FOLDER_ID.trim() : HARDCODED_VIDEOS_FOLDER_ID;

    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and (mimeType contains 'video/' or mimeType contains 'image/')`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name',
      pageSize: 50,
    });

    const files = (filesRes.data.files || []).map(f => {
      const isVideo = f.mimeType.startsWith('video/');
      return {
        id:   f.id,
        name: f.name,
        type: isVideo ? 'video' : 'image',
        src:  isVideo ? `/api/stream/${f.id}` : `https://lh3.googleusercontent.com/d/${f.id}=w1920`,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.json({ files });

  } catch (err) {
    console.error('[/api/videos]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
