const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.jpg':  'image/jpeg',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
};

// Solo se publican estas rutas. Todo lo demás (server.js, package.json, .git, etc.)
// no se sirve y cae a la página principal.
const PUBLIC_FILES = new Set(['/index.html', '/logo.svg']);
const PUBLIC_DIRS = ['/assets/'];

const SECURITY_HEADERS = {
  'X-Content-Type-Options':    'nosniff',
  'X-Frame-Options':           'DENY',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "script-src 'self' 'unsafe-inline'; " +
    "connect-src 'none'; " +
    "object-src 'none'; base-uri 'self'; form-action 'self';",
};

function resolvePublic(rawUrl) {
  let p;
  try { p = decodeURIComponent(rawUrl.split('?')[0]); } catch (e) { return null; }
  if (p === '/') p = '/index.html';
  if (p.includes('..') || p.includes('\0')) return null;
  const allowed = PUBLIC_FILES.has(p) || PUBLIC_DIRS.some((d) => p.startsWith(d));
  if (!allowed) return null;
  const full = path.join(ROOT, p);
  return full.startsWith(ROOT + path.sep) ? full : null;
}

function sendIndex(res) {
  fs.readFile(path.join(ROOT, 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); res.end('Error'); return; }
    res.writeHead(200, { 'Content-Type': MIME['.html'], ...SECURITY_HEADERS });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const filePath = resolvePublic(req.url);

  if (!filePath) { sendIndex(res); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (req.url.startsWith('/assets/')) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
        res.end('No encontrado');
        return;
      }
      sendIndex(res);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`MarthyIAM landing running on port ${PORT}`);
});
