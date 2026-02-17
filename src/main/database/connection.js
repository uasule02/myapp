import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db = null;

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'pos-database.sqlite3');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
