/**
 * /api/portfolio.js — GET /api/portfolio
 *
 * Returns an array of all portfolio categories (subfolders inside portfolio/).
 * "Random" folder is always sorted first when present; the rest are alphabetical.
 *
 * Response shape:
 *   [{ id, name, slug }, ...]
 */

const { getDrive, getRootFolderId, nameToSlug } = require('./_driveClient');

module.exports = async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const drive     = getDrive();
    const rootId    = await getRootFolderId();

    const result = await drive.files.list({
      q: `'${rootId}' in parents
            and mimeType = 'application/vnd.google-apps.folder'
            and trashed = false`,
      fields:  'files(id, name)',
      orderBy: 'name',
      pageSize: 200,
    });

    const folders = result.data.files || [];

    // Exclude 'videos' or 'video' folder from being a portfolio category
    const categoryFolders = folders.filter(f => f.name.toLowerCase() !== 'videos' && f.name.toLowerCase() !== 'video');
    // Mirror Sync-Portfolio.ps1: Random first, then alphabetical
    const random = categoryFolders.filter(f => f.name === 'Random');
    const others = categoryFolders.filter(f => f.name !== 'Random');

    const ordered = [...random, ...others].map(f => ({
      id:   f.id,
      name: f.name,
      slug: nameToSlug(f.name),
    }));

    // Edge-cache for 10 minutes
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.json(ordered);

  } catch (err) {
    console.error('[/api/portfolio]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
