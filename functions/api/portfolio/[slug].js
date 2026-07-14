/**
 * functions/api/portfolio/[slug].js — GET /api/portfolio/:slug
 * Cloudflare Pages Function — lists image/video files inside a category folder.
 */
import { getAccessToken, driveList, nameToSlug, slugMatches, getRootFolderId, jsonResponse } from '../../_driveAuth.js';

const imgUrl = (id, w) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;

export async function onRequestGet({ env, params }) {
  const { slug } = params;
  if (!slug) return jsonResponse({ error: 'Missing slug' }, 400);

  try {
    const token  = await getAccessToken(env);
    const rootId = getRootFolderId(env);

    // Find the matching subfolder
    const foldersData = await driveList(token, {
      q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name)',
      pageSize: '200',
    });

    const folder = (foldersData.files || []).find(f => slugMatches(f.name, slug));
    if (!folder) return jsonResponse({ error: `Category "${slug}" not found` }, 404);

    // List image/video files inside the folder
    const filesData = await driveList(token, {
      q: `'${folder.id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
      fields: 'files(id,name,mimeType)',
      orderBy: 'name',
      pageSize: '500',
    });

    const filterClass = `filter-${nameToSlug(folder.name)}`;
    const gallery     = `portfolio-gallery-${nameToSlug(folder.name).split('-').pop()}`;

    const files = (filesData.files || []).map(f => {
      const isVideo = f.mimeType.startsWith('video/');
      return {
        id:  f.id,
        name: f.name,
        type: isVideo ? 'video' : 'image',
        src:  isVideo ? `/api/stream/${f.id}` : imgUrl(f.id, 800),
        link: isVideo ? `/api/stream/${f.id}` : imgUrl(f.id, 1920),
        filterClass,
        gallery,
      };
    });

    const res = jsonResponse({ name: folder.name, slug, files });
    res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res;

  } catch (err) {
    console.error(`[/api/portfolio/${slug}]`, err.message);
    return jsonResponse({ error: err.message }, 500);
  }
}