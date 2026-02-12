const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

function getDatabase() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'pos-database.sqlite3');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
