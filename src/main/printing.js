import { BrowserWindow } from 'electron';
import * as salesRepo from './database/sales-repo.js';
import * as settingsRepo from './database/settings-repo.js';

function generateReceiptHTML(sale, settings) {
  const currency = settings.currency_symbol || '\u20A6';

  const itemRows = sale.items.map(item => `
    <tr>
      <td style="text-align:left;padding:2px 0">${item.item_name}</td>
      <td style="text-align:center;padding:2px 4px">${item.quantity}</td>
      <td style="text-align:right;padding:2px 0">${currency}${item.item_price.toFixed(2)}</td>
      <td style="text-align:right;padding:2px 0">${currency}${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 72mm; padding: 4mm; }
  .center { text-align: center; }
  .business-name { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 2px; }
  .info { font-size: 10px; text-align: center; margin: 1px 0; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 10px; text-align: left; padding: 2px 0; border-bottom: 1px solid #000; }
  .total-row td { font-weight: bold; font-size: 14px; padding-top: 4px; }
  .summary td { padding: 1px 0; }
  .footer { text-align: center; font-size: 10px; margin-top: 8px; }
</style></head><body>
  <div class="business-name">${settings.business_name || 'My Business'}</div>
  <p class="info">${settings.business_address || ''}</p>
  <p class="info">${settings.business_phone || ''}</p>
  <hr/>
  <p style="font-size:11px">Date: ${new Date(sale.created_at).toLocaleString()}</p>
  <p style="font-size:11px">Receipt #: ${sale.id.substring(0, 8).toUpperCase()}</p>
  <hr/>
  <table>
    <tr>
      <th style="text-align:left">Item</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Price</th>
      <th style="text-align:right">Amount</th>
    </tr>
    ${itemRows}
  </table>
  <hr/>
  <table>
    <tr class="total-row">
      <td>TOTAL</td>
      <td style="text-align:right">${currency}${sale.total_amount.toFixed(2)}</td>
    </tr>
    <tr class="summary">
      <td>Paid (${sale.payment_method})</td>
      <td style="text-align:right">${currency}${sale.amount_paid.toFixed(2)}</td>
    </tr>
    <tr class="summary">
      <td>Change</td>
      <td style="text-align:right">${currency}${sale.change_amount.toFixed(2)}</td>
    </tr>
  </table>
  <hr/>
  <p class="footer">${settings.receipt_footer || 'Thank you for your purchase!'}</p>
</body></html>`;
}

export async function printReceipt(saleId) {
  const sale = salesRepo.getSaleDetail(saleId);
  if (!sale) throw new Error('Sale not found');

  const settings = settingsRepo.getAllAsMap();
  const receiptHTML = generateReceiptHTML(sale, settings);

  const printWindow = new BrowserWindow({
    show: false,
    width: 300,
    height: 800,
    webPreferences: { contextIsolation: true },
  });

  await printWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`
  );

  const configuredPrinter = settings.printer_name;

  return new Promise((resolve, reject) => {
    const printOptions = {
      silent: true,
      printBackground: true,
      margins: { marginType: 'none' },
    };

    if (configuredPrinter) {
      printOptions.deviceName = configuredPrinter;
    }

    printWindow.webContents.print(printOptions, (success, failureReason) => {
      printWindow.destroy();
      if (success) {
        resolve({ success: true });
      } else {
        reject(new Error(failureReason || 'Print failed'));
      }
    });
  });
}

export async function getAvailablePrinters(mainWindow) {
  if (mainWindow) {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map(p => ({ name: p.name, isDefault: p.isDefault }));
  }
  return [];
}

export function getReceiptHTML(saleId) {
  const sale = salesRepo.getSaleDetail(saleId);
  if (!sale) return null;
  const settings = settingsRepo.getAllAsMap();
  return generateReceiptHTML(sale, settings);
}
