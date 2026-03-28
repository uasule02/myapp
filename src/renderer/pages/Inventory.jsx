import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Space, Card, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import InventoryTable from '../components/InventoryTable';
import InventoryForm from '../components/InventoryForm';

const { Search } = Input;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (categoryFilter && categoryFilter !== 'All') filters.category = categoryFilter;
      const data = await window.electronAPI.getInventoryItems(filters);
      setItems(data);
    } catch (err) {
      message.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  const loadCategories = async () => {
    try {
      const cats = await window.electronAPI.getCategories();
      setCategories(cats);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems]);

  const handleDelete = async (id) => {
    try {
      await window.electronAPI.deleteInventoryItem(id);
      message.success('Item deleted');
      loadItems();
      loadCategories();
    } catch (err) {
      message.error('Failed to delete item');
    }
  };

  const handleEdit = (record) => {
    setEditItem(record);
    setFormOpen(true);
  };

  const handleFormSaved = () => {
    loadItems();
    loadCategories();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditItem(null);
  };

  const categoryOptions = [
    { label: 'All Categories', value: 'All' },
    ...categories.map(cat => ({ label: cat, value: cat })),
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Search
              placeholder="Search items..."
              allowClear
              onSearch={setSearch}
              onChange={(e) => !e.target.value && setSearch('')}
              style={{ width: 280 }}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              style={{ width: 180 }}
            />
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadItems}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditItem(null); setFormOpen(true); }}
            >
              Add Item
            </Button>
          </Space>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <InventoryTable
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <InventoryForm
        open={formOpen}
        onClose={handleFormClose}
        onSaved={handleFormSaved}
        editItem={editItem}
        categories={categories}
      />
    </div>
  );
}
