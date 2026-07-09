/**
 * /api/debug.js — temporary diagnostic endpoint
 * DELETE this file after confirming everything works.
 */
const { getDrive, getRootFolderId } = require('./_driveClient');

module.exports = async function handler(req, res) {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const rootId = process.env.PORTFOLIO_ROOT_FOLDER_ID;

  // 1. Check env vars
  if (!key) {
    return res.status(500).json({ step: 'env', error: 'GOOGLE_SERVICE_ACCOUNT_KEY is NOT set' });
  }

  let parsed = false;
  let parseError = null;
  try { JSON.parse(key); parsed = true; } catch(e) { parseError = e.message; }

  if (!parsed) {
    return res.status(500).json({ step: 'parse', error: 'Key is not valid JSON', detail: parseError });
  }

  // 2. Try resolving the root folder
  let resolvedId = null;
  try {
    resolvedId = await getRootFolderId();
  } catch(e) {
    return res.status(500).json({ step: 'folder_id', error: e.message });
  }

  // 3. Try actually listing subfolders
  let folders = null;
  try {
    const drive = getDrive();
    const result = await drive.files.list({
      q: `'${resolvedId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 10,
    });
    folders = result.data.files;
  } catch(e) {
    return res.status(500).json({
      step: 'drive_list',
      error: e.message,
      hint: 'Share the portfolio folder with: portfolio-drive-reader@refined-area-501906-r8.iam.gserviceaccount.com'
    });
  }

  return res.json({
    status: 'ALL OK',
    key_valid: true,
    resolved_folder_id: resolvedId,
    root_folder_env: rootId || '(using hardcoded ID)',
    subfolders_found: folders.length,
    subfolders: folders.map(f => f.name),
  });
};