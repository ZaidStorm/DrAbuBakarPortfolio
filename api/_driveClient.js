/**
 * _driveClient.js - shared Google Drive v3 client for all /api/* serverless functions.
 *
 * Auth: uses a service-account JSON stored as the GOOGLE_SERVICE_ACCOUNT_KEY env var.
 * Store the full JSON string (no Base64) in your Vercel project settings under
 * Settings -> Environment Variables.
 *
 * Root folder: the Drive folder named "portfolio" that has been shared with
 * the service account. Its ID is hardcoded below and can be overridden via
 * PORTFOLIO_ROOT_FOLDER_ID env var.
 */

const { google } = require('googleapis');

// Drive client (singleton per warm lambda instance)
let _drive = null;

function getDrive() {
  if (_drive) return _drive;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var is not set.');

  const credentials = JSON.parse(raw.trim());

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  _drive = google.drive({ version: 'v3', auth });
  return _drive;
}

// Root folder ID resolver
// Hardcoded ID of the "portfolio" Google Drive folder.
// Taken directly from: https://drive.google.com/drive/folders/1jAaGhxBxoy-7bl2KwhXxlBtQpp3d1KnO
// Override via PORTFOLIO_ROOT_FOLDER_ID env var if the folder ever changes.
const HARDCODED_ROOT_ID = '1jAaGhxBxoy-7bl2KwhXxlBtQpp3d1KnO';

let _rootFolderId = null;

async function getRootFolderId() {
  // 1. Env var override (takes highest priority, trim any accidental whitespace/newlines)
  if (process.env.PORTFOLIO_ROOT_FOLDER_ID) {
    return process.env.PORTFOLIO_ROOT_FOLDER_ID.trim();
  }

  // 2. In-memory cache (warm lambda reuse)
  if (_rootFolderId) return _rootFolderId;

  // 3. Use hardcoded ID - no Drive search needed
  _rootFolderId = HARDCODED_ROOT_ID;
  return _rootFolderId;
}

// Slug helper
function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

function slugMatches(folderName, slug) {
  return nameToSlug(folderName) === slug;
}

module.exports = { getDrive, getRootFolderId, nameToSlug, slugMatches };