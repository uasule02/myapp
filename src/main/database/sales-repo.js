import { getDatabase } from './connection.js';
import { v4 as uuidv4 } from 'uuid';
import { logChange } from './sync-repo.js';

export function createSale(saleData) {
  const db = getDatabase();
  const { items, paymentMethod, amountPaid, notes } = saleData;

  const createSaleTransaction = db.transaction(() => {
    const saleId = uuidv4();
    let totalAmount = 0;

    const itemDetails = [];
    for (const cartItem of items) {
      const inventoryItem = db.prepare(
        'SELECT * FROM inventory_items WHERE id = ? AND deleted_at IS NULL'
      ).get(cartItem.itemId);

      if (!inventoryItem) {
        throw new Error(`Item not found: ${cartItem.itemId}`);
      }
      if (inventoryItem.quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for "${inventoryItem.name}". Available: ${inventoryItem.quantity}, Requested: ${cartItem.quantity}`);
      }

      const subtotal = inventoryItem.price * cartItem.quantity;
      totalAmount += subtotal;
      itemDetails.push({ ...inventoryItem, cartQuantity: cartItem.quantity, subtotal });
    }

    const changeAmount = Math.max(0, (amountPaid || totalAmount) - totalAmount);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO sales (id, total_amount, payment_method, amount_paid, change_amount, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(saleId, totalAmount, paymentMethod || 'cash', amountPaid || totalAmount, changeAmount, notes || '', now);

    for (const detail of itemDetails) {
      const saleItemId = uuidv4();
      db.prepare(`
        INSERT INTO sale_items (id, sale_id, item_id, item_name, item_price, quantity, subtotal, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(saleItemId, saleId, detail.id, detail.name, detail.price, detail.cartQuantity, detail.subtotal, now);

      db.prepare(
        'UPDATE inventory_items SET quantity = quantity - ?, updated_at = ? WHERE id = ?'
      ).run(detail.cartQuantity, now, detail.id);

      logChange('sale_items', saleItemId, 'INSERT', {
        id: saleItemId, sale_id: saleId, item_id: detail.id, item_name: detail.name,
        item_price: detail.price, quantity: detail.cartQuantity, subtotal: detail.subtotal
      });
      logChange('inventory_items', detail.id, 'UPDATE', {
        id: detail.id, quantity: detail.quantity - detail.cartQuantity
      });
    }

    logChange('sales', saleId, 'INSERT', {
      id: saleId, total_amount: totalAmount, payment_method: paymentMethod || 'cash',
      amount_paid: amountPaid || totalAmount, change_amount: changeAmount, notes: notes || '', created_at: now
    });

    return {
      saleId,
      totalAmount,
      amountPaid: amountPaid || totalAmount,
      changeAmount,
      created_at: now
    };
  });

  return createSaleTransaction();
}

export function getAll(filters = {}) {
  const db = getDatabase();
  let sql = `
    SELECT s.*, COUNT(si.id) as item_count
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
  `;
  const params = [];
  const conditions = [];

  if (filters.startDate) {
    conditions.push('s.created_at >= ?');
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push('s.created_at <= ?');
    params.push(filters.endDate);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY s.id ORDER BY s.created_at DESC';
  return db.prepare(sql).all(...params);
}

export function getSaleDetail(id) {
  const db = getDatabase();
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
  if (!sale) return null;

  const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ? ORDER BY item_name').all(id);
  return { ...sale, items };
}

export function getDashboardStats() {
  const db = getDatabase();

  const today = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
    FROM sales WHERE date(created_at) = date('now')
  `).get();

  const totalProducts = db.prepare(
    'SELECT COUNT(*) as count FROM inventory_items WHERE deleted_at IS NULL'
  ).get();

  const lowStock = db.prepare(
    'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= 5 AND deleted_at IS NULL'
  ).get();

  const topSellers = db.prepare(`
    SELECT si.item_name, SUM(si.quantity) as total_sold
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.created_at >= datetime('now', '-30 days')
    GROUP BY si.item_id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all();

  const recentSales = db.prepare(`
    SELECT s.*, COUNT(si.id) as item_count
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT 5
  `).all();

  return {
    todaySalesCount: today.count,
    todayRevenue: today.total,
    totalProducts: totalProducts.count,
    lowStockCount: lowStock.count,
    topSellers,
    recentSales,
  };
}
