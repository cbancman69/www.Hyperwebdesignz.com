require('dotenv').config();
const express = require('express');
const path = require('path');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
let twilioClient = null;
try { const Twilio = require('twilio'); twilioClient = Twilio; } catch(e) { /* optional */ }
const chokidar = require('chokidar');
const fs = require('fs');
const pathModule = require('path');
const WebSocket = require('ws');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Ensure HTML index responses are not cached by browsers (helps avoid stale/duplicate renders)
app.use((req, res, next) => {
  try {
    if (req.method === 'GET') {
      const p = req.path || '';
      // apply to root and tokenized SPA routes and other likely SPA routes
      if (p === '/' || p.startsWith('/s/') || (!p.includes('.') && !p.startsWith('/admin') && !p.startsWith('/api'))) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  } catch (e) {}
  next();
});

// Simple in-memory token store
const TOKENS = {}; // { token: { expires, meta } }
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h default
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-secret';

// Serve public assets under /assets to avoid serving multiple HTML files directly
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Block direct .html requests to prevent accidental serving of multiple HTML files
app.use((req, res, next) => {
  const p = req.path || '';
  // allow API, admin routes, QR, SPA token route
  const allowHtml = p === '/' || p.startsWith('/admin') || p.startsWith('/s/') || p === '/qr' || p === '/health';
  if (p.endsWith('.html') && !allowHtml) {
    return res.status(404).send('Not Found');
  }
  next();
});

// Protected entry: serve SPA only for valid token
app.get('/s/:token', (req, res) => {
  const token = req.params.token;
  const entry = TOKENS[token];
  const now = Date.now();
  if (!entry || entry.expires < now) return res.status(403).send('Access denied or token expired.');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple admin sessions (in-memory)
const SESSIONS = {}; // { sid: { expires } }
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8 hours

function requireAdmin(req, res, next){
  const sid = req.cookies && req.cookies.admin_sid;
  if (!sid) return res.status(401).json({ error: 'Unauthorized' });
  const s = SESSIONS[sid];
  if (!s || s.expires < Date.now()) return res.status(401).json({ error: 'Session expired' });
  // refresh expiry
  s.expires = Date.now() + SESSION_TTL;
  next();
}

// Admin: generate token + QR (protected by session)
app.post('/admin/generate', requireAdmin, async (req, res) => {
  const ttl = Number(req.body.ttlMs || TOKEN_TTL_MS);
  const token = nanoid(10);
  const expires = Date.now() + ttl;
  TOKENS[token] = { expires, meta: req.body.meta || {} };

  const url = `${req.protocol}://${req.get('host')}/s/${token}`;
  try {
    const dataUrl = await QRCode.toDataURL(url, { margin: 1, color: { dark: '#00d4ff', light: '#000000' } });
    res.json({ token, url, qr: dataUrl, expires });
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed', details: err.message });
  }
});

// Admin: list tokens (protected)
app.get('/admin/list', requireAdmin, (req, res) => {
  res.json(TOKENS);
});

// Admin login endpoints (serve login or app UI)
app.get('/admin', (req, res) => {
  const sid = req.cookies && req.cookies.admin_sid;
  const s = sid && SESSIONS[sid];
  if (s && s.expires > Date.now()) {
    // serve admin app
    return res.sendFile(path.join(__dirname, 'public', 'admin', 'app.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Serve SPA entry at root to ensure single-page entry
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// optional: catch-all for other non-API routes to return index (helps client-side routing)
app.get(/^\/[^.]*$/, (req, res, next) => {
  // do not interfere with admin paths or API routes
  if (req.path.startsWith('/admin') || req.path.startsWith('/qr') || req.path.startsWith('/s/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/admin/login', (req, res) => {
  const secret = req.body && req.body.secret;
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  const sid = nanoid(16);
  SESSIONS[sid] = { expires: Date.now() + SESSION_TTL };
  res.cookie('admin_sid', sid, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

// Admin file read/write endpoints (protected)
app.get('/admin/file', requireAdmin, async (req, res) => {
  try {
    const p = req.query.path || '';
    // sanitize: only allow top-level files inside public
    const safe = p.replace(/\.\.|\//g, '');
    const full = path.join(__dirname, 'public', safe);
    if (!full.startsWith(path.join(__dirname, 'public'))) return res.status(400).json({ error: 'invalid' });
    const content = await fs.promises.readFile(full, 'utf8');
    res.type('text/plain').send(content);
  } catch (err) {
    res.status(500).json({ error: 'failed' });
  }
});

app.post('/admin/file', requireAdmin, async (req, res) => {
  try {
    const p = req.body && req.body.path;
    const content = req.body && req.body.content;
    if (!p || typeof content !== 'string') return res.status(400).json({ error: 'bad request' });
    const safe = p.replace(/\.\.|\//g, '');
    const full = path.join(__dirname, 'public', safe);
    if (!full.startsWith(path.join(__dirname, 'public'))) return res.status(400).json({ error: 'invalid' });
    await fs.promises.writeFile(full, content, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/logout', requireAdmin, (req, res) => {
  const sid = req.cookies && req.cookies.admin_sid;
  if (sid) delete SESSIONS[sid];
  res.clearCookie('admin_sid');
  res.json({ ok: true });
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Public QR for this site (styled to match theme)
app.get('/qr', async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}/`;
  try {
    const svg = await QRCode.toString(url, { type: 'svg', color: { dark: '#00d4ff', light: '#000000' } });
    res.type('image/svg+xml');
    // Wrap svg in a small container to add background via CSS if needed
    res.send(svg);
  } catch (err) {
    res.status(500).send('QR generation failed');
  }
});

// Public API: serve testimonials (DB-backed)
const db = require('./db');
app.get('/api/testimonials', async (req, res) => {
  try {
    const list = db.getTestimonials();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
});

// Admin: update testimonials (protected)
app.post('/admin/testimonials', requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!Array.isArray(body)) return res.status(400).json({ error: 'Expected array' });
    db.setTestimonials(body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contact endpoint: saves messages locally and optionally forwards via SMTP/Twilio
app.post('/contact', async (req, res) => {
  try{
    const { name, email, phone, message } = req.body || {};
    if(!message) return res.status(400).json({ error: 'Message required' });

    const entry = { id: nanoid(8), name: name||'', email: email||'', phone: phone||'', message, ts: Date.now() };
    try {
      db.addMessage(entry);
    } catch (e) {
      console.error('DB message insert failed', e && e.message);
    }

    // send email if SMTP configured
    if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
      try{
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: false, auth:{ user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
        const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
        await transporter.sendMail({ from: process.env.SMTP_USER, to, subject: `New contact from ${name||email||phone}`, text: `${message}\n\nFrom: ${name} <${email}> ${phone}` });
      }catch(e){ console.error('Email send failed', e.message); }
    }

    // send SMS if Twilio configured
    if(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM && process.env.NOTIFY_PHONE){
      try{
        const client = twilioClient(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        const text = `New message from ${name||email||phone}: ${message.substring(0,160)}`;
        await client.messages.create({ body: text, from: process.env.TWILIO_FROM, to: process.env.NOTIFY_PHONE });
      }catch(e){ console.error('SMS send failed', e.message); }
    }

    res.json({ ok:true });
  }catch(err){
    console.error('Contact handler error', err);
    res.status(500).json({ error: 'failed' });
  }
});

const DEFAULT_PORT = process.env.PORT || 3000;

function start(port = DEFAULT_PORT) {
  const chosen = port || DEFAULT_PORT;
  return new Promise((resolve, reject) => {
    const server = app.listen(chosen, async () => {
      console.log(`Server listening on port ${chosen}`);

      // attach WebSocket server for live reload
      const wss = new WebSocket.Server({ server });
      wss.broadcast = function broadcast(data) {
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      };

      // build initial manifest and write files.json
      async function buildManifest() {
        const root = pathModule.join(__dirname, 'public');
        async function walk(dir) {
          const entries = await fs.promises.readdir(dir, { withFileTypes: true });
          const files = [];
          for (const ent of entries) {
            const full = pathModule.join(dir, ent.name);
            if (ent.isDirectory()) {
              const sub = await walk(full);
              files.push(...sub);
            } else {
              const rel = pathModule.relative(pathModule.join(__dirname), full).replace(/\\/g, '/');
              const stat = await fs.promises.stat(full);
              files.push({ path: rel, size: stat.size, mtime: stat.mtimeMs });
            }
          }
          return files;
        }
        try {
          const list = await walk(root);
          await fs.promises.writeFile(pathModule.join(__dirname, 'files.json'), JSON.stringify({ updated: Date.now(), files: list }, null, 2));
        } catch (err) {
          console.error('Failed to build manifest', err);
        }
      }

      // initial manifest build
      await buildManifest();

      // watch public and server files for changes
      const watcher = chokidar.watch([pathModule.join(__dirname, 'public'), pathModule.join(__dirname, 'server.js')], { ignoreInitial: true });
      watcher.on('all', async (ev, p) => {
        console.log('File change detected:', ev, p);
        await buildManifest();
        // notify clients to reload
        try { wss.broadcast(JSON.stringify({ type: 'reload' })); } catch (e) { }
      });

      resolve({ server, port: chosen, wss, watcher });
    });
    server.on('error', err => reject(err));
  });
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { app, start, TOKENS };
