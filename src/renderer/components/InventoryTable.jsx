import React from 'react';
import { Table, Button, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function InventoryTable({ items, loading, onEdit, onDelete }) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => sku || <span style={{ color: '#bfbfbf' }}>-</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>,
    },
    {
      title: 'Price (\u20A6)',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price) => `\u20A6${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      align: 'right',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty) => (
        <Tag color={qty === 0 ? 'red' : qty <= 5 ? 'orange' : 'green'}>
          {qty}
        </Tag>
      ),
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this item?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            okType="danger"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={items}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 15,
        showSizeChanger: false,
        showTotal: (total) => `${total} items`,
      }}
      size="middle"
      locale={{ emptyText: 'No inventory items. Click "Add Item" to get started.' }}
    />
  );
}
