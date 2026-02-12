import React from 'react';
import dayjs from 'dayjs';

export default function ReceiptPreview({ sale, settings = {} }) {
  if (!sale) return null;

  const currency = settings.currency_symbol || '\u20A6';

  return (
    <div className="receipt-preview" style={{ fontFamily: "'Courier New', monospace", fontSize: 12 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{settings.business_name || 'My Business'}</div>
        {settings.business_address && <div style={{ fontSize: 10 }}>{settings.business_address}</div>}
        {settings.business_phone && <div style={{ fontSize: 10 }}>{settings.business_phone}</div>}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      <div style={{ fontSize: 11 }}>Date: {dayjs(sale.created_at).format('MMM D, YYYY h:mm A')}</div>
      <div style={{ fontSize: 11 }}>Receipt #: {sale.id.substring(0, 8).toUpperCase()}</div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', fontSize: 10, padding: '2px 0' }}>Item</th>
            <th style={{ textAlign: 'center', fontSize: 10 }}>Qty</th>
            <th style={{ textAlign: 'right', fontSize: 10 }}>Price</th>
            <th style={{ textAlign: 'right', fontSize: 10 }}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items || []).map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '2px 0', fontSize: 11 }}>{item.item_name}</td>
              <td style={{ textAlign: 'center', fontSize: 11 }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', fontSize: 11 }}>{currency}{item.item_price.toFixed(2)}</td>
              <td style={{ textAlign: 'right', fontSize: 11 }}>{currency}{item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>
          TOTAL: {currency}{sale.total_amount.toFixed(2)}
        </div>
        <div style={{ fontSize: 11 }}>
          Paid ({sale.payment_method}): {currency}{sale.amount_paid.toFixed(2)}
        </div>
        {sale.change_amount > 0 && (
          <div style={{ fontSize: 11 }}>
            Change: {currency}{sale.change_amount.toFixed(2)}
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

      <div style={{ textAlign: 'center', fontSize: 10 }}>
        {settings.receipt_footer || 'Thank you for your purchase!'}
      </div>
    </div>
  );
}
