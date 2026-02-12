const { getDatabase } = require('./connection');

function runMigrations() {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      sku         TEXT UNIQUE,
      price       REAL NOT NULL CHECK(price >= 0),
      quantity    INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      category    TEXT DEFAULT 'General',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at  TEXT DEFAULT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_items_name ON inventory_items(name);
    CREATE INDEX IF NOT EXISTS idx_items_category ON inventory_items(category);

    CREATE TABLE IF NOT EXISTS sales (
      id              TEXT PRIMARY KEY,
      total_amount    REAL NOT NULL CHECK(total_amount >= 0),
      payment_method  TEXT DEFAULT 'cash',
      amount_paid     REAL NOT NULL DEFAULT 0,
      change_amount   REAL NOT NULL DEFAULT 0,
      notes           TEXT DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);

    CREATE TABLE IF NOT EXISTS sale_items (
      id          TEXT PRIMARY KEY,
      sale_id     TEXT NOT NULL REFERENCES sales(id),
      item_id     TEXT NOT NULL REFERENCES inventory_items(id),
      item_name   TEXT NOT NULL,
      item_price  REAL NOT NULL,
      quantity    INTEGER NOT NULL CHECK(quantity > 0),
      subtotal    REAL NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);

    CREATE TABLE IF NOT EXISTS sync_log (
      id              TEXT PRIMARY KEY,
      table_name      TEXT NOT NULL,
      record_id       TEXT NOT NULL,
      operation       TEXT NOT NULL,
      payload         TEXT NOT NULL,
      synced          INTEGER NOT NULL DEFAULT 0,
      synced_at       TEXT DEFAULT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sync_pending ON sync_log(synced, created_at);

    CREATE TABLE IF NOT EXISTS settings (
      key     TEXT PRIMARY KEY,
      value   TEXT NOT NULL
    );
  `);

  // Seed default settings
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  const seedSettings = db.transaction(() => {
    insertSetting.run('sync_url', '');
    insertSetting.run('business_name', 'My Business');
    insertSetting.run('business_address', '');
    insertSetting.run('business_phone', '');
    insertSetting.run('printer_name', '');
    insertSetting.run('receipt_footer', 'Thank you for your purchase!');
    insertSetting.run('currency_symbol', '\u20A6');
  });
  seedSettings();
}

module.exports = { runMigrations };
