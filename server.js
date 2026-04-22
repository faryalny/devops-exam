const express = require('express');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, 'messages.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing DB file if it exists, otherwise create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create messages table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  saveDB();
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/messages - returns all messages
app.get('/api/messages', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM messages ORDER BY created_at DESC');
    if (!result.length) return res.json([]);
    const { columns, values } = result[0];
    const messages = values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages - adds a new message
app.post('/api/messages', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Message text is required' });
    }
    db.run('INSERT INTO messages (text) VALUES (?)', [text.trim()]);
    saveDB();

    const result = db.exec('SELECT * FROM messages ORDER BY id DESC LIMIT 1');
    const { columns, values } = result[0];
    const newMessage = {};
    columns.forEach((col, i) => { newMessage[col] = values[0][i]; });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server after DB is ready
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
