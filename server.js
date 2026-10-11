
'use strict';

// Pog'ona v5 — statik fayllar + reyting API.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB = path.join(DATA_DIR, 'users.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const SEC = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"
};

let users = {};

try {
  users = JSON.parse(fs.readFileSync(DB, 'utf8'));
} catch (e) {}

let dirty = false;
const save = () => {
  dirty = true;
};

function flush() {
  if (!dirty) return;
  dirty = false;

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const temp = DB + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(users));
    fs.renameSync(temp, DB);
  } catch (e) {
    console.error('Saqlash xatosi:', e.message);
  }
}

setInterval(flush, 5000).unref();

const hash = t =>
  crypto.createHash('sha256').update(t).digest('hex');

const clean = s =>
  String(s || '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);

const int = (v, max) =>
  Math.max(0, Math.min(max, Math.floor(Number(v)) || 0));

const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const h = hits.get(ip) || { c: 0, t: now };

  if (now - h.t > 60000) {
    h.c = 0;
    h.t = now;
  }

  h.c++;
  hits.set(ip, h);
  return h.c > 90;
}

setInterval(() => {
  const now = Date.now();

  for (const [k, v] of hits) {
    if (now - v.t > 60000) hits.delete(k);
  }
}, 60000).unref();

function send(res, code, obj) {
  const data = JSON.stringify(obj);

  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SEC
  });

  res.end(data);
}

function body(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', chunk => {
      data += chunk;

      if (data.length > 4096) {
        reject(new Error('Katta so‘rov'));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', reject);
  });
}

function auth(req, data) {
  const user = users[data.id];
  const token = (req.headers.authorization || '')
    .replace(/^Bearer /, '');

  if (!user || !token) return null;

  const a = Buffer.from(hash(token));
  const b = Buffer.from(user.h);

  return a.length === b.length &&
    crypto.timingSafeEqual(a, b)
    ? user
    : null;
}

async function api(req, res, p) {
  try {
    if (req.method === 'GET' && p === '/api/leaderboard') {
      const list = Object.entries(users)
        .map(([id, u]) => ({
          id,
          name: u.name,
          avatar: u.avatar,
          xp: u.xp,
          tests: u.tests,
          streak: u.streak
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 300);

      return send(res, 200, {
        users: list,
        total: Object.keys(users).length
      });
    }

    if (req.method !== 'POST') {
      return send(res, 405, { error: 'method' });
    }

    const data = await body(req);

    if (p === '/api/register') {
      if (!/^u_[a-z0-9]{6,24}$/.test(data.id || '') ||
          users[data.id]) {
        return send(res, 409, { error: 'id' });
      }

      if (Object.keys(users).length >= 50000) {
        return send(res, 503, { error: 'limit' });
      }

      let name = clean(data.name);

      if (name.length < 2) {
        return send(res, 400, { error: 'name' });
      }

      const taken = n =>
        Object.values(users).some(
          u => u.name.toLowerCase() === n.toLowerCase()
        );

      while (taken(name)) {
        name = name.slice(0, 15) + ' ' +
          (100 + crypto.randomInt(900));
      }

      const token = crypto.randomBytes(24).toString('hex');

      users[data.id] = {
        name,
        avatar: String(data.avatar || '🦊').slice(0, 8),
        h: hash(token),
        xp: 0,
        tests: 0,
        streak: 0,
        day: '',
        dayXp: 0,
        at: Date.now()
      };

      save();
      return send(res, 200, { token, name });
    }

    const user = auth(req, data);

    if (!user) {
      return send(res, 401, { error: 'auth' });
    }

    if (p === '/api/sync') {
      const today = new Date().toISOString().slice(0, 10);

      if (user.day !== today) {
        user.day = today;
        user.dayXp = 0;
      }

      const want = int(data.xp, 10000000);
      let add = Math.max(0, want - user.xp);

      add = Math.min(
        add,
        800,
        Math.max(0, 4000 - user.dayXp)
      );

      user.xp += add;
      user.dayXp += add;

      user.tests = Math.max(
        user.tests,
        Math.min(int(data.tests, 100000), user.tests + 25)
      );

      user.streak = int(data.streak, 3650);

      if (data.avatar) {
        user.avatar = String(data.avatar).slice(0, 8);
      }

      save();
      return send(res, 200, { xp: user.xp });
    }

    if (p === '/api/delete') {
      delete users[data.id];
      save();
      return send(res, 200, { ok: 1 });
    }

    return send(res, 404, { error: 'yo‘q' });
  } catch (e) {
    return send(res, 400, { error: 'noto‘g‘ri so‘rov' });
  }
}

const compressedCache = new Map();

function serve(req, res, p) {
  let file;

  try {
    file = path.normalize(decodeURIComponent(p));
  } catch (e) {
    res.writeHead(400);
    return res.end();
  }

  if (file.endsWith(path.sep) || file === '.') {
    file = 'index.html';
  }

  let full = path.join(ROOT, file);

  if (!full.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end();
  }

  fs.stat(full, (err, stat) => {
    if (err || !stat.isFile()) {
      if (path.extname(file)) {
        res.writeHead(404, SEC);
        return res.end('404');
      }

      full = path.join(ROOT, 'index.html');
      stat = fs.statSync(full);
    }

    const ext = path.extname(full);
    const key = full + stat.mtimeMs;

    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      ...SEC,
      'Cache-Control':
        ext === '.html' || full.endsWith('sw.js')
          ? 'no-cache'
          : 'public, max-age=86400',
      Vary: 'Accept-Encoding'
    };

    const gzip =
      /\bgzip\b/.test(req.headers['accept-encoding'] || '') &&
      /html|js|css|svg|json|manifest/.test(ext);

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      return res.end();
    }

    fs.readFile(full, (error, buffer) => {
      if (error) {
        res.writeHead(500);
        return res.end();
      }

      if (gzip) {
        let compressed = compressedCache.get(key);

        if (!compressed) {
          compressed = zlib.gzipSync(buffer, { level: 9 });
          compressedCache.set(key, compressed);
        }

        headers['Content-Encoding'] = 'gzip';
        res.writeHead(200, headers);
        return res.end(compressed);
      }

      res.writeHead(200, headers);
      res.end(buffer);
    });
  });
}

const server = http.createServer((req, res) => {
  const p = (req.url || '/').split('?')[0];

  if (p === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  if (p.startsWith('/api/')) {
    const ip = (
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      ''
    ).split(',')[0].trim();

    if (limited(ip)) {
      return send(res, 429, { error: 'ko‘p so‘rov' });
    }

    return api(req, res, p);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }

  serve(req, res, p);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Pog‘ona :' + PORT + ' | ma’lumot: ' + DB);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    flush();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
