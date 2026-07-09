/**
 * _driveClient.js — shared Google Drive v3 client for all /api/* serverless functions.
 *
 * Auth: uses a service-account JSON stored as the GOOGLE_SERVICE_ACCOUNT_KEY env var.
 * Store the full JSON string (no Base64) in your Vercel project settings under
 * Settings → Environment Variables.
 *
 * Root folder: the Drive folder named "portfolio" that has been shared with
 * the service account.  Its ID is resolved once per warm instance and cached in memory.
 * You can also short-circuit by setting PORTFOLIO_ROOT_FOLDER_ID as an env var.
 */

const { google } = require('googleapis');

// ── Drive client (singleton per warm lambda instance) ────────────────────────
let _drive = null;

function getDrive() {
  if (_drive) return _drive;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var is not set.');

  const credentials = JSON.parse(raw);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  _drive = google.drive({ version: 'v3', auth });
  return _drive;
}

// ── Root folder ID resolver ──────────────────────────────────────────────────
let _rootFolderId = null;

async function getRootFolderId() {
  // 1. Env var short-circuit (fastest path — set this after first deploy)
  if (process.env.PORTFOLIO_ROOT_FOLDER_ID) {
    return process.env.PORTFOLIO_ROOT_FOLDER_ID;
  }

  // 2. In-memory cache (warm lambda reuse)
  if (_rootFolderId) return _rootFolderId;

  // 3. Search Drive by folder name
  const drive = getDrive();
  const res = await drive.files.list({
    q: `name = 'portfolio' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 1,
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    throw new Error(
      'Drive folder "portfolio" not found. ' +
      'Make sure the folder exists and is shared with the service account.'
    );
  }

  _rootFolderId = files[0].id;
  return _rootFolderId;
}

// ── Slug helper (mirrors Sync-Portfolio.ps1 logic) ───────────────────────────
function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

function slugMatches(folderName, slug) {
  return nameToSlug(folderName) === slug;
}

module.exports = { getDrive, getRootFolderId, nameToSlug, slugMatches };
