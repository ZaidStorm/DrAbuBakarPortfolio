/**
 * /api/debug.js — temporary diagnostic endpoint
 * DELETE this file after confirming everything works.
 */
module.exports = function handler(req, res) {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const rootId = process.env.PORTFOLIO_ROOT_FOLDER_ID;

  if (!key) {
    return res.status(500).json({
      error: 'GOOGLE_SERVICE_ACCOUNT_KEY is NOT set',
      fix: 'Go to Vercel > Settings > Environment Variables and add it'
    });
  }

  let parsed = false;
  let parseError = null;
  try {
    JSON.parse(key);
    parsed = true;
  } catch(e) {
    parseError = e.message;
  }

  return res.json({
    key_set: true,
    key_length: key.length,
    key_valid_json: parsed,
    key_parse_error: parseError,
    key_starts_with: key.substring(0, 20),
    root_folder_id_env: rootId || '(not set — using hardcoded ID)',
    hardcoded_id: '1jAaGhxBxoy-7bl2KwhXxlBtQpp3d1KnO'
  });
};