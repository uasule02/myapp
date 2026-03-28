import React from 'react';
import { InputNumber, Button, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const subtotal = item.price * item.quantity;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0',
      gap: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text strong style={{ display: 'block', fontSize: 13 }} ellipsis>
          {item.name}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {'\u20A6'}{item.price.toLocaleString()} each
        </Text>
      </div>
      <InputNumber
        min={1}
        max={item.maxQuantity}
        value={item.quantity}
        onChange={(val) => onUpdateQuantity(item.itemId, val || 1)}
        size="small"
        style={{ width: 60 }}
      />
      <Text strong style={{ width: 90, textAlign: 'right', fontSize: 13 }}>
        {'\u20A6'}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Text>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        size="small"
        onClick={() => onRemove(item.itemId)}
      />
    </div>
  );
}
