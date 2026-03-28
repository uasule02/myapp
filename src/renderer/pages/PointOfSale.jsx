import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Input, Select, Tag, Typography, Badge, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import CartPanel from '../components/CartPanel';
import CheckoutModal from '../components/CheckoutModal';

const { Search } = Input;
const { Text, Title } = Typography;

export default function PointOfSale() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { addToCart, cart } = useApp();

  const loadItems = useCallback(async () => {
    try {
      const filters = {};
      if (search) filters.search = search;
      if (categoryFilter && categoryFilter !== 'All') filters.category = categoryFilter;
      const data = await window.electronAPI.getInventoryItems(filters);
      setItems(data);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    window.electronAPI.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleAddToCart = (item) => {
    if (item.quantity <= 0) {
      message.warning('Item is out of stock');
      return;
    }

    // Check if adding would exceed stock
    const inCart = cart.find(c => c.itemId === item.id);
    if (inCart && inCart.quantity >= item.quantity) {
      message.warning(`Only ${item.quantity} in stock`);
      return;
    }

    addToCart(item);
    message.success({ content: `${item.name} added to cart`, duration: 1 });
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    loadItems(); // Refresh items after sale
  };

  const categoryOptions = [
    { label: 'All', value: 'All' },
    ...categories.map(cat => ({ label: cat, value: cat })),
  ];

  return (
    <div>
      <Row gutter={16} style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left - Product Grid */}
        <Col span={15}>
          <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
            <Search
              placeholder="Search products..."
              allowClear
              onSearch={setSearch}
              onChange={(e) => !e.target.value && setSearch('')}
              style={{ flex: 1 }}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              style={{ width: 160 }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 200px)',
            paddingRight: 4,
          }}>
            {items.map(item => {
              const inCart = cart.find(c => c.itemId === item.id);
              const outOfStock = item.quantity <= 0;

              return (
                <Card
                  key={item.id}
                  className={`product-card ${outOfStock ? 'out-of-stock' : ''}`}
                  size="small"
                  onClick={() => !outOfStock && handleAddToCart(item)}
                  bodyStyle={{ padding: '12px 14px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.3 }}>{item.name}</Text>
                    {inCart && (
                      <Badge count={inCart.quantity} size="small" style={{ backgroundColor: '#1677ff' }} />
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Title level={5} style={{ margin: 0, color: '#1677ff' }}>
                      {'\u20A6'}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Title>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={outOfStock ? 'red' : item.quantity <= 5 ? 'orange' : 'green'} style={{ fontSize: 11 }}>
                      {outOfStock ? 'Out of Stock' : `${item.quantity} in stock`}
                    </Tag>
                  </div>
                </Card>
              );
            })}

            {items.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
                {search || categoryFilter !== 'All'
                  ? 'No items match your search'
                  : 'No inventory items. Go to Inventory to add products.'}
              </div>
            )}
          </div>
        </Col>

        {/* Right - Cart */}
        <Col span={9}>
          <CartPanel onCheckout={() => setCheckoutOpen(true)} />
        </Col>
      </Row>

      <CheckoutModal open={checkoutOpen} onClose={handleCheckoutClose} />
    </div>
  );
}
