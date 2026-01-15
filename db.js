const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const JSON_TESTIMONIALS = path.join(__dirname, 'public', 'data', 'testimonials.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDB() {
  ensureDir();
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { testimonials: [], messages: [] };
      try {
        if (fs.existsSync(JSON_TESTIMONIALS)) {
          const raw = fs.readFileSync(JSON_TESTIMONIALS, 'utf8');
          const arr = JSON.parse(raw || '[]');
          initial.testimonials = Array.isArray(arr) ? arr : [];
        }
      } catch (e) {}
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Failed to read DB file', e && e.message);
    return { testimonials: [], messages: [] };
  }
}

function writeDB(obj) {
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Failed to write DB file', e && e.message);
    return false;
  }
}

module.exports = {
  getTestimonials() {
    const db = readDB();
    return (db.testimonials || []).slice().sort((a,b)=> (b.created||0)-(a.created||0));
  },
  setTestimonials(arr) {
    if (!Array.isArray(arr)) throw new Error('Expected array');
    const db = readDB();
    db.testimonials = arr.map((it, i) => ({ id: it.id || `t-${Date.now()}-${i}`, name: it.name||'', title: it.title||'', body: it.body||'', src: it.src||it.image||'', created: it.created || Date.now() - i }));
    return writeDB(db);
  },
  addMessage(msg) {
    const db = readDB();
    db.messages = db.messages || [];
    const id = msg.id || (`m-${Date.now()}-${Math.floor(Math.random()*9000)}`);
    const entry = { id, name: msg.name||'', email: msg.email||'', phone: msg.phone||'', message: msg.message||'', ts: msg.ts || Date.now() };
    db.messages.unshift(entry);
    if (db.messages.length > 500) db.messages = db.messages.slice(0,500);
    writeDB(db);
    return id;
  },
  getMessages(limit = 50) {
    const db = readDB();
    return (db.messages || []).slice(0, limit);
  }
};
