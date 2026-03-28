import { getDatabase } from './connection.js';

export function getAll() {
  const db = getDatabase();
  return db.prepare('SELECT * FROM settings').all();
}

export function getAllAsMap() {
  const rows = getAll();
  const map = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export function get(key) {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row?.value || null;
}

export function update(key, value) {
  const db = getDatabase();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  return { key, value };
}
