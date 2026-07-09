/**
 * /api/portfolio/[slug].js — GET /api/portfolio/:slug
 *
 * Returns all image and video files inside the subfolder whose name
 * slug-matches the :slug parameter (case-insensitive, space->dash).
 *
 * Images:  served via Google lh3 CDN — requires "Anyone with the link can view"
 *          on the Portfolio/ folder in addition to the service-account share.
 *          (See README for the one-click Drive sharing step.)
 *
 * Videos:  always served through /api/stream/:fileId (Range-request proxy).
 *
 * Response: { name, slug, files: [{ id, name, type, src, link, filterClass, gallery }] }
 */

const { getDrive, getRootFolderId, nameToSlug, slugMatches } = require('../_driveClient');

const imgUrl = (id, w) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  try {
    const drive  = getDrive();
    const rootId = await getRootFolderId();

    const foldersRes = await drive.files.list({
      q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 200,
    });

    const folder = (foldersRes.data.files || []).find(f => slugMatches(f.name, slug));
    if (!folder) return res.status(404).json({ error: `Category "${slug}" not found` });

    const filesRes = await drive.files.list({
      q: `'${folder.id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
      fields: 'files(id, name, mimeType)',
      orderBy: 'name',
      pageSize: 500,
    });

    const filterClass = `filter-${nameToSlug(folder.name)}`;
    const gallery     = `portfolio-gallery-${nameToSlug(folder.name).split('-').pop()}`;

    const files = (filesRes.data.files || []).map(f => {
      const isVideo = f.mimeType.startsWith('video/');
      return {
        id:   f.id,
        name: f.name,
        type: isVideo ? 'video' : 'image',
        src:  isVideo ? `/api/stream/${f.id}` : imgUrl(f.id, 800),
        link: isVideo ? `/api/stream/${f.id}` : imgUrl(f.id, 1920),
        filterClass,
        gallery,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res.json({ name: folder.name, slug, files });

  } catch (err) {
    console.error(`[/api/portfolio/${slug}]`, err.message);
    return res.status(500).json({ error: err.message });
  }
};