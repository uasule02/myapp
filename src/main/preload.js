const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Inventory
  getInventoryItems: (filters) => ipcRenderer.invoke('inventory:getAll', filters),
  getInventoryItem: (id) => ipcRenderer.invoke('inventory:getOne', id),
  getCategories: () => ipcRenderer.invoke('inventory:categories'),
  createInventoryItem: (item) => ipcRenderer.invoke('inventory:create', item),
  updateInventoryItem: (id, item) => ipcRenderer.invoke('inventory:update', id, item),
  deleteInventoryItem: (id) => ipcRenderer.invoke('inventory:delete', id),

  // Sales
  createSale: (sale) => ipcRenderer.invoke('sales:create', sale),
  getSales: (filters) => ipcRenderer.invoke('sales:getAll', filters),
  getSaleDetail: (id) => ipcRenderer.invoke('sales:getDetail', id),

  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('dashboard:stats'),

  // Sync
  syncToServer: () => ipcRenderer.invoke('sync:push'),
  getSyncStatus: () => ipcRenderer.invoke('sync:status'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  updateSetting: (key, value) => ipcRenderer.invoke('settings:update', key, value),

  // Printing
  printReceipt: (saleId) => ipcRenderer.invoke('print:receipt', saleId),
  getPrinters: () => ipcRenderer.invoke('print:getPrinters'),
});
