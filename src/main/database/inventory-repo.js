import { getDatabase } from './connection.js';
import { v4 as uuidv4 } from 'uuid';

export function getAll(filters = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM inventory_items WHERE deleted_at IS NULL';
  const params = [];

  if (filters.search) {
    sql += ' AND (name LIKE ? OR sku LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.category && filters.category !== 'All') {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  sql += ' ORDER BY name ASC';
  return db.prepare(sql).all(...params);
}

export function getOne(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM inventory_items WHERE id = ? AND deleted_at IS NULL').get(id);
}

export function getCategories() {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT DISTINCT category FROM inventory_items WHERE deleted_at IS NULL ORDER BY category'
  ).all();
  return rows.map(r => r.category);
}

export function create(item) {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO inventory_items (id, name, sku, price, quantity, category, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, item.name, item.sku || null, item.price, item.quantity || 0, item.category || 'General', now, now);
  return { id, name: item.name, sku: item.sku || null, price: item.price, quantity: item.quantity || 0, category: item.category || 'General', created_at: now, updated_at: now, deleted_at: null };
}

export function update(id, updates) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    if (['name', 'sku', 'price', 'quantity', 'category'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (fields.length === 0) return getOne(id);

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  db.prepare(`UPDATE inventory_items SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`).run(...params);
  return getOne(id);
}

export function softDelete(id) {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.prepare('UPDATE inventory_items SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now, now, id);
}
