/**
 * functions/_driveAuth.js
 * Shared Google Drive auth for Cloudflare Pages Functions.
 *
 * Uses the Web Crypto API (available in all CF Workers) to sign a JWT
 * for the service account, then exchanges it for an OAuth2 access token.
 * No googleapis npm package needed — pure fetch().
 */

const ROOT_FOLDER_ID = '1jAaGhxBxoy-7bl2KwhXxlBtQpp3d1KnO';

function b64url(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function createJWT(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const signingInput = `${b64url(header)}.${b64url(payload)}`;

  // Strip PEM headers and decode base64
  const pem = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyBytes = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${signingInput}.${sigB64}`;
}

export async function getAccessToken(env) {
  const raw = env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY env var is not set');

  const sa = JSON.parse(raw.trim());
  const jwt = await createJWT(sa);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export async function driveList(token, params) {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API error ${res.status}: ${err}`);
  }
  return res.json();
}

export function nameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
}

export function slugMatches(folderName, slug) {
  return nameToSlug(folderName) === slug;
}

export function getRootFolderId(env) {
  return (env.PORTFOLIO_ROOT_FOLDER_ID || ROOT_FOLDER_ID).trim();
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}