const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.css':  'text/css',
  '.js':   'application/javascript',
};

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
    "img-src 'self' data: https://images.unsplash.com; " +
    "script-src 'self' 'unsafe-inline'; " +
    "connect-src 'none';",
};

http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(__dirname, url);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`MarthyIAM landing running on port ${PORT}`);
});
