/**
 * functions/api/videos.js - GET /api/videos
 * Cloudflare Pages Function.
 *
 * Returns all video files inside the "videos" subfolder of the portfolio Drive folder.
 * The front-end (main.js) expects:
 *   { files: [{ id, name, type, src, link }] }
 *
 * Drive folder structure expected:
 *   portfolio/
 *     videos/
 *       hero-bg.mp4      <-- matched by name includes "hero"
 *       about-video.mp4  <-- matched by name includes "about"
 */
import { getAccessToken, driveList, getRootFolderId, jsonResponse } from '../_driveAuth.js';

export async function onRequestGet({ env }) {
  try {
    const token  = await getAccessToken(env);
    const rootId = getRootFolderId(env);

    // 1. Find the "videos" subfolder inside portfolio/
    const foldersData = await driveList(token, {
      q: `'${rootId}' in parents and name = 'videos' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name)',
      pageSize: '5',
    });

    const folders = foldersData.files || [];

    if (folders.length === 0) {
      // No videos folder found — return empty so main.js gracefully skips
      return jsonResponse({ files: [] });
    }

    const videosFolderId = folders[0].id;

    // 2. List all video files inside it
    const filesData = await driveList(token, {
      q: `'${videosFolderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'files(id,name,mimeType)',
      orderBy: 'name',
      pageSize: '50',
    });

    const files = (filesData.files || []).map(f => ({
      id:   f.id,
      name: f.name,
      type: 'video',
      src:  `/api/stream/${f.id}`,
      link: `/api/stream/${f.id}`,
    }));

    const res = jsonResponse({ files });
    res.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');
    return res;

  } catch (err) {
    console.error('[/api/videos]', err.message);
    return jsonResponse({ error: err.message }, 500);
  }
}