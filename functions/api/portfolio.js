/**
 * functions/api/portfolio.js — GET /api/portfolio
 * Cloudflare Pages Function — lists all subfolders in the Drive portfolio folder.
 */
import { getAccessToken, driveList, nameToSlug, getRootFolderId, jsonResponse } from '../_driveAuth.js';

export async function onRequestGet({ env }) {
  try {
    const token  = await getAccessToken(env);
    const rootId = getRootFolderId(env);

    const data = await driveList(token, {
      q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name)',
      orderBy: 'name',
      pageSize: '200',
    });

    const folders = data.files || [];
    const random  = folders.filter(f => f.name === 'Random');
    const others  = folders.filter(f => f.name !== 'Random');

    const ordered = [...random, ...others].map(f => ({
      id:   f.id,
      name: f.name,
      slug: nameToSlug(f.name),
    }));

    const res = jsonResponse(ordered);
    res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
    return res;

  } catch (err) {
    console.error('[/api/portfolio]', err.message);
    return jsonResponse({ error: err.message }, 500);
  }
}