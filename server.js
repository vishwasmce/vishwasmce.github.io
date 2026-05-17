const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - File Not Found</h1>');
        return;
      }

      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
      return;
    }

    const headers = { 'Content-Type': contentType };
    // Cache images and fonts for 1 day to improve performance
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=86400';
    }
    res.writeHead(200, headers);
    res.end(content);
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  let pathname;

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request\n');
    return;
  }

  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.resolve(ROOT_DIR, `.${pathname}`);

  if (filePath !== ROOT_DIR && !filePath.startsWith(ROOT_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden\n');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      serveFile(filePath, res);
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    serveFile(filePath, res);
  });
});

// Start server with port conflict handling
function startServer(port) {
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`🚀 Server running at ${url}`);
    console.log(`Press Ctrl+C to stop the server\n`);

    // Open in default browser
    const platform = process.platform;
    let command;

    switch (platform) {
      case 'darwin':
        command = `open "${url}"`;
        break;
      case 'win32':
        command = `start ${url}`;
        break;
      case 'linux':
        command = `xdg-open "${url}"`;
        break;
      default:
        console.log(`Please open ${url} in your browser`);
        return;
    }

    exec(command, (error) => {
      if (error) {
        console.log(`Please open ${url} in your browser manually`);
      }
    });
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
