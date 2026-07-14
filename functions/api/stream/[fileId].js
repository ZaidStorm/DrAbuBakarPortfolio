/**
 * functions/api/stream/[fileId].js — GET /api/stream/:fileId
 * Cloudflare Pages Function — Range-aware video proxy for Google Drive files.
 */
import { getAccessToken, jsonResponse } from '../../_driveAuth.js';

export async function onRequest({ env, params, request }) {
  const { fileId } = params;
  if (!fileId) return jsonResponse({ error: 'Missing fileId' }, 400);

  try {
    const token = await getAccessToken(env);

    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // Forward Range header if present (enables video seeking)
    const headers = { Authorization: `Bearer ${token}` };
    const range = request.headers.get('Range');
    if (range) headers['Range'] = range;

    const driveRes = await fetch(driveUrl, { headers });

    // Build response headers
    const resHeaders = new Headers();
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach(h => {
      const v = driveRes.headers.get(h);
      if (v) resHeaders.set(h, v);
    });
    resHeaders.set('Accept-Ranges', 'bytes');
    resHeaders.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    resHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(driveRes.body, {
      status: driveRes.status,
      headers: resHeaders,
    });

  } catch (err) {
    console.error(`[/api/stream/${fileId}]`, err.message);
    return jsonResponse({ error: err.message }, 500);
  }
}