import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';

export default function InventoryForm({ open, onClose, onSaved, editItem, categories }) {
  const [form] = Form.useForm();
  const isEditing = !!editItem;

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.setFieldsValue(editItem);
      } else {
        form.resetFields();
      }
    }
  }, [open, editItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing) {
        await window.electronAPI.updateInventoryItem(editItem.id, values);
        message.success('Item updated successfully');
      } else {
        await window.electronAPI.createInventoryItem(values);
        message.success('Item added successfully');
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err.errorFields) return; // validation error
      message.error(err.message || 'Failed to save item');
    }
  };

  const categoryOptions = (categories || ['General']).map(cat => ({ label: cat, value: cat }));

  return (
    <Modal
      title={isEditing ? 'Edit Item' : 'Add New Item'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEditing ? 'Update' : 'Add Item'}
      destroyOnClose
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ category: 'General', quantity: 0, price: 0 }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="Item Name"
          rules={[{ required: true, message: 'Please enter the item name' }]}
        >
          <Input placeholder="e.g. Rice (50kg bag)" autoFocus />
        </Form.Item>

        <Form.Item name="sku" label="SKU / Barcode (Optional)">
          <Input placeholder="e.g. RICE-50KG-001" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="price"
            label="Price (\u20A6)"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, message: 'Must be positive' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.00"
              min={0}
              step={100}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/,/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 0, message: 'Must be positive' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: '100%' }} placeholder="0" min={0} step={1} />
          </Form.Item>
        </div>

        <Form.Item name="category" label="Category">
          <Select
            placeholder="Select or type a category"
            options={categoryOptions}
            showSearch
            allowClear
            mode={undefined}
            dropdownRender={(menu) => menu}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
