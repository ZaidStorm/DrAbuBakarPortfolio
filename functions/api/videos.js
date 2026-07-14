/**
 * functions/api/videos.js - GET /api/videos
 * Cloudflare Pages Function.
 *
 * Returns all video files inside the "videos" folder shared with the service account.
 * The "videos" folder lives at the root of Drive (sibling of "portfolio", not inside it).
 *
 * Drive structure:
 *   My Drive/
 *     portfolio/       <- category folders for the portfolio grid
 *     videos/          <- hero-bg.mp4, about-video.mp4, etc.
 *
 * front-end (main.js) expects:
 *   { files: [{ id, name, type, src, link }] }
 * and matches files by name:
 *   name includes "hero"  -> hero background video
 *   name includes "about" -> about-section video
 */
import { getAccessToken, driveList, jsonResponse } from '../_driveAuth.js';

// Hardcoded videos folder ID — fill in after first run, or leave empty to search by name
const VIDEOS_FOLDER_ID = '';

export async function onRequestGet({ env }) {
  try {
    const token = await getAccessToken(env);

    let videosFolderId = (env.VIDEOS_FOLDER_ID || VIDEOS_FOLDER_ID).trim();

    // If no ID hardcoded, search Drive by folder name
    if (!videosFolderId) {
      const searchData = await driveList(token, {
        q: `name = 'videos' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id,name)',
        pageSize: '5',
      });

      const found = (searchData.files || [])[0];
      if (!found) {
        console.warn('[/api/videos] "videos" folder not found in Drive');
        return jsonResponse({ files: [] });
      }
      videosFolderId = found.id;
    }

    // List all video files inside the videos folder
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