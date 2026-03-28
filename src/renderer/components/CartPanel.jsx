import React from 'react';
import { Card, Button, Typography, Empty, Divider } from 'antd';
import { ShoppingCartOutlined, ClearOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import CartItem from './CartItem';

const { Title, Text } = Typography;

export default function CartPanel({ onCheckout }) {
  const { cart, cartTotal, cartCount, updateCartQuantity, removeFromCart, clearCart } = useApp();

  return (
    <Card
      title={
        <span>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Cart ({cartCount} items)
        </span>
      }
      extra={
        cart.length > 0 && (
          <Button type="text" size="small" icon={<ClearOutlined />} onClick={clearCart}>
            Clear
          </Button>
        )
      }
      bodyStyle={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {cart.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Cart is empty"
            style={{ marginTop: 40 }}
          />
        ) : (
          cart.map(item => (
            <CartItem
              key={item.itemId}
              item={item}
              onUpdateQuantity={updateCartQuantity}
              onRemove={removeFromCart}
            />
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Title level={4} style={{ margin: 0 }}>Total</Title>
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
              {'\u20A6'}{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            block
            onClick={onCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Card>
  );
}
