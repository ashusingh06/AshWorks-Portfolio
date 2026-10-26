const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_FILE = path.join(__dirname, 'data_backup.json');
const DEFAULT_DATA_FILE = path.join(__dirname, 'js', 'default-data.js');
const UPLOAD_DIR = path.join(__dirname, 'images');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (handleCors(req, res)) return;

  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // ================= API ENDPOINTS =================

  // GET /api/data -> Read data.json directly from disk
  if (pathname === '/api/data' && req.method === 'GET') {
    fs.readFile(DATA_FILE, 'utf8', (err, rawData) => {
      if (err) {
        return sendJSON(res, 500, { error: 'Failed to read data.json from disk: ' + err.message });
      }
      try {
        const json = JSON.parse(rawData);
        return sendJSON(res, 200, json);
      } catch (parseErr) {
        return sendJSON(res, 500, { error: 'data.json contains invalid JSON: ' + parseErr.message });
      }
    });
    return;
  }

  // POST /api/data -> Save data directly to data.json on disk!
  if (pathname === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Safeguard: max 50MB
      if (body.length > 50 * 1024 * 1024) {
        sendJSON(res, 413, { error: 'Payload too large (limit 50MB)' });
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const updatedData = JSON.parse(body);

        // Ensure updatedAt timestamp
        updatedData.updatedAt = new Date().toISOString();

        // Safeguard: Never allow empty journey episodes or empty about lines to overwrite disk!
        if (fs.existsSync(DATA_FILE)) {
          try {
            const diskObj = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            if (diskObj && diskObj.journey && Array.isArray(diskObj.journey.seasons)) {
              const incomingSeasons = updatedData.journey && Array.isArray(updatedData.journey.seasons) ? updatedData.journey.seasons : [];
              const hasIncomingEpisodes = incomingSeasons.some(s => s.isComingSoon || (Array.isArray(s.episodes) && s.episodes.length > 0));
              if (!hasIncomingEpisodes) {
                updatedData.journey = diskObj.journey;
              } else {
                updatedData.journey.seasons.forEach((s, sIdx) => {
                  if (!s.isComingSoon && (!s.episodes || s.episodes.length === 0)) {
                    const diskSeason = diskObj.journey.seasons[sIdx] || diskObj.journey.seasons.find(ds => ds.title && ds.title.toLowerCase() === (s.title || '').toLowerCase());
                    if (diskSeason && Array.isArray(diskSeason.episodes) && diskSeason.episodes.length > 0) {
                      s.episodes = diskSeason.episodes;
                    }
                  }
                });
              }
            }
            if (diskObj && diskObj.about && Array.isArray(diskObj.about.introLines) && diskObj.about.introLines.length > 0) {
              const incomingLines = updatedData.about && Array.isArray(updatedData.about.introLines) ? updatedData.about.introLines.filter(l => l && l.trim()) : [];
              if (incomingLines.length === 0) {
                if (!updatedData.about) updatedData.about = {};
                updatedData.about.introLines = diskObj.about.introLines;
              }
            }
          } catch(eMerge) {
            console.warn('Safeguard merge note:', eMerge.message);
          }
        }

        // 1. Create a safe backup first
        if (fs.existsSync(DATA_FILE)) {
          try {
            fs.copyFileSync(DATA_FILE, BACKUP_FILE);
          } catch (bErr) {
            console.warn('Backup creation warning:', bErr.message);
          }
        }

        // 2. Write directly to data.json on disk
        const jsonString = JSON.stringify(updatedData, null, 2);
        fs.writeFileSync(DATA_FILE, jsonString, 'utf8');

        // 3. Keep default-data.js in sync so offline fallback always stays up-to-date!
        try {
          const jsContent = 'window.DEFAULT_PORTFOLIO_DATA = ' + jsonString + ';\n';
          fs.writeFileSync(DEFAULT_DATA_FILE, jsContent, 'utf8');
        } catch (jsErr) {
          console.warn('default-data.js sync warning:', jsErr.message);
        }

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Saved portfolio data directly to disk (${DATA_FILE})`);
        return sendJSON(res, 200, {
          success: true,
          message: 'Saved directly to data.json & default-data.js on disk!',
          updatedAt: updatedData.updatedAt
        });
      } catch (e) {
        console.error('Save error:', e.message);
        return sendJSON(res, 400, { error: 'Invalid JSON payload: ' + e.message });
      }
    });
    return;
  }

  // POST /api/upload -> Save base64 image or file directly into images/ folder
  if (pathname === '/api/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) {
        sendJSON(res, 413, { error: 'File upload exceeds 50MB limit' });
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { filename, data } = payload;
        if (!filename || !data) {
          return sendJSON(res, 400, { error: 'Filename and base64 data are required' });
        }

        const base64Data = data.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const ext = path.extname(filename).toLowerCase() || '.png';
        const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeFilename = `${baseName}_${Date.now()}${ext}`;
        const targetPath = path.join(UPLOAD_DIR, safeFilename);

        fs.writeFileSync(targetPath, buffer);
        console.log(`[${new Date().toLocaleTimeString()}] 📸 Saved uploaded image: ${safeFilename}`);

        return sendJSON(res, 200, {
          success: true,
          url: `images/${safeFilename}`,
          filename: safeFilename
        });
      } catch (e) {
        return sendJSON(res, 400, { error: 'Invalid upload payload: ' + e.message });
      }
    });
    return;
  }

  // GET /api/messages -> Get all messages for CEO Inbox
  if (pathname === '/api/messages' && req.method === 'GET') {
    try {
      if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
      const msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '[]');
      return sendJSON(res, 200, msgs);
    } catch (e) {
      return sendJSON(res, 200, []);
    }
  }

  // POST /api/contact -> Save incoming contact message
  if ((pathname === '/api/contact' || pathname === '/api/messages') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const msg = JSON.parse(body);
        if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
        let msgs = [];
        try { msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '[]'); } catch(e){ msgs = []; }
        const newEntry = {
          id: 'msg_' + Date.now(),
          date: new Date().toISOString(),
          firstName: msg.firstName || '',
          lastName: msg.lastName || '',
          name: ((msg.firstName || '') + ' ' + (msg.lastName || '')).trim() || msg.name || 'Anonymous',
          email: msg.email || '',
          subject: msg.subject || 'Portfolio Inquiry',
          message: msg.message || '',
          read: false
        };
        msgs.unshift(newEntry);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
        console.log(`[${new Date().toLocaleTimeString()}] 📬 Received new message from: ${newEntry.name} (${newEntry.email})`);
        return sendJSON(res, 200, { success: true, message: 'Message saved successfully', id: newEntry.id });
      } catch (err) {
        return sendJSON(res, 500, { error: 'Failed to process message: ' + err.message });
      }
    });
    return;
  }

  // DELETE /api/messages -> Delete a message by ID or clear all
  if (pathname === '/api/messages' && req.method === 'DELETE') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        if (payload.clearAll) {
          fs.writeFileSync(MESSAGES_FILE, '[]', 'utf8');
          return sendJSON(res, 200, { success: true, message: 'All messages cleared' });
        }
        if (payload.id) {
          let msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8') || '[]');
          msgs = msgs.filter(m => m.id !== payload.id);
          fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
          return sendJSON(res, 200, { success: true, message: 'Message deleted' });
        }
        return sendJSON(res, 400, { error: 'Missing message ID' });
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    });
    return;
  }

  // GET /api/health -> Health & diagnostic status
  if (pathname === '/api/health' || pathname === '/api/status') {
    return sendJSON(res, 200, {
      status: 'online',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      dataFileExists: fs.existsSync(DATA_FILE),
      dataFileSize: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).size : 0
    });
  }

  // ================= STATIC FILE SERVING =================
  let filePath = '';
  if (pathname === '/' || pathname === '/home') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/ceo' || pathname === '/admin') {
    filePath = path.join(__dirname, 'ceo.html');
  } else if (pathname === '/intro') {
    filePath = path.join(__dirname, 'intro.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  // Prevent path traversal
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Automatic fallback for image requests without 'images/' prefix
      const fallbackImagePath = path.join(UPLOAD_DIR, path.basename(pathname));
      if (fs.existsSync(fallbackImagePath) && fs.statSync(fallbackImagePath).isFile()) {
        const ext = path.extname(fallbackImagePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        return fs.createReadStream(fallbackImagePath).pipe(res);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`404 Not Found: ${pathname}`);
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Disable caching for HTML, JSON, and JS during active development
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.html' || ext === '.json' || ext === '.js') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    res.writeHead(200, headers);
    fs.createReadStream(normalizedPath).pipe(res);
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 PORTFOLIO PRODUCTION SERVER RUNNING ON NODE.JS`);
    console.log(`======================================================`);
    console.log(`  🌐 Main Website:  http://localhost:${port}`);
    console.log(`  ⚙️  CEO Portal:    http://localhost:${port}/ceo`);
    console.log(`  🎬 Intro Page:    http://localhost:${port}/intro`);
    console.log(`  📦 Data API:      http://localhost:${port}/api/data`);
    console.log(`  💾 Storage Mode:  Direct disk read/write to data.json`);
    console.log(`======================================================\n`);
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
