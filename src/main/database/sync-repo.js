const { getDatabase } = require('./connection');
const { v4: uuidv4 } = require('uuid');

function logChange(tableName, recordId, operation, payload) {
  const db = getDatabase();
  const id = uuidv4();
  db.prepare(`
    INSERT INTO sync_log (id, table_name, record_id, operation, payload, synced, created_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
  `).run(id, tableName, recordId, operation, JSON.stringify(payload));
}

function getPending() {
  const db = getDatabase();
  return db.prepare(
    'SELECT * FROM sync_log WHERE synced = 0 ORDER BY created_at ASC'
  ).all();
}

function markSynced(ids) {
  const db = getDatabase();
  const stmt = db.prepare(
    'UPDATE sync_log SET synced = 1, synced_at = datetime(\'now\') WHERE id = ?'
  );
  const markAll = db.transaction((idList) => {
    for (const id of idList) {
      stmt.run(id);
    }
  });
  markAll(ids);
}

function getStatus() {
  const db = getDatabase();
  const pending = db.prepare('SELECT COUNT(*) as count FROM sync_log WHERE synced = 0').get();
  const lastSync = db.prepare(
    'SELECT synced_at FROM sync_log WHERE synced = 1 ORDER BY synced_at DESC LIMIT 1'
  ).get();
  return {
    pendingCount: pending.count,
    lastSyncedAt: lastSync?.synced_at || null,
  };
}

module.exports = { logChange, getPending, markSynced, getStatus };
