import { ipcMain } from 'electron';
import * as inventoryRepo from './database/inventory-repo.js';
import * as salesRepo from './database/sales-repo.js';
import * as syncRepo from './database/sync-repo.js';
import * as settingsRepo from './database/settings-repo.js';
import { printReceipt, getAvailablePrinters, getReceiptHTML } from './printing.js';
import axios from 'axios';

export function registerAllHandlers(getMainWindow) {
  // ── Inventory ──
  ipcMain.handle('inventory:getAll', (_event, filters) => {
    return inventoryRepo.getAll(filters);
  });

  ipcMain.handle('inventory:getOne', (_event, id) => {
    return inventoryRepo.getOne(id);
  });

  ipcMain.handle('inventory:categories', () => {
    return inventoryRepo.getCategories();
  });

  ipcMain.handle('inventory:create', (_event, item) => {
    const created = inventoryRepo.create(item);
    syncRepo.logChange('inventory_items', created.id, 'INSERT', created);
    return created;
  });

  ipcMain.handle('inventory:update', (_event, id, updates) => {
    const updated = inventoryRepo.update(id, updates);
    if (updated) {
      syncRepo.logChange('inventory_items', id, 'UPDATE', updated);
    }
    return updated;
  });

  ipcMain.handle('inventory:delete', (_event, id) => {
    inventoryRepo.softDelete(id);
    syncRepo.logChange('inventory_items', id, 'DELETE', { id });
    return { success: true };
  });

  // ── Sales ──
  ipcMain.handle('sales:create', (_event, saleData) => {
    return salesRepo.createSale(saleData);
  });

  ipcMain.handle('sales:getAll', (_event, filters) => {
    return salesRepo.getAll(filters);
  });

  ipcMain.handle('sales:getDetail', (_event, id) => {
    return salesRepo.getSaleDetail(id);
  });

  // ── Dashboard ──
  ipcMain.handle('dashboard:stats', () => {
    return salesRepo.getDashboardStats();
  });

  // ── Sync ──
  ipcMain.handle('sync:push', async () => {
    const syncUrl = settingsRepo.get('sync_url');
    if (!syncUrl) {
      return { success: false, error: 'No sync URL configured. Go to Settings to set one.' };
    }

    const pendingChanges = syncRepo.getPending();
    if (pendingChanges.length === 0) {
      return { success: true, message: 'Everything is up to date', count: 0 };
    }

    try {
      const response = await axios.post(`${syncUrl}/api/sync`, {
        changes: pendingChanges.map(c => ({
          ...c,
          payload: JSON.parse(c.payload),
        })),
      }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data && response.data.success) {
        syncRepo.markSynced(pendingChanges.map(c => c.id));
        return { success: true, count: pendingChanges.length };
      } else {
        return { success: false, error: response.data?.error || 'Server rejected sync' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('sync:status', () => {
    return syncRepo.getStatus();
  });

  // ── Settings ──
  ipcMain.handle('settings:getAll', () => {
    return settingsRepo.getAllAsMap();
  });

  ipcMain.handle('settings:update', (_event, key, value) => {
    return settingsRepo.update(key, value);
  });

  // ── Printing ──
  ipcMain.handle('print:receipt', async (_event, saleId) => {
    try {
      return await printReceipt(saleId);
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('print:getPrinters', async () => {
    const mainWindow = getMainWindow();
    return await getAvailablePrinters(mainWindow);
  });

  ipcMain.handle('print:getReceiptHTML', (_event, saleId) => {
    return getReceiptHTML(saleId);
  });
}
