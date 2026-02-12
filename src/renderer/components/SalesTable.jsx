import React from 'react';
import { Table, Button, Tag, Space, Tooltip } from 'antd';
import { EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function SalesTable({ sales, loading, onView, onPrint }) {
  const columns = [
    {
      title: 'Receipt #',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <strong>{id.substring(0, 8).toUpperCase()}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
      render: (date) => dayjs(date).format('MMM D, YYYY h:mm A'),
    },
    {
      title: 'Items',
      dataIndex: 'item_count',
      key: 'item_count',
      width: 80,
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (val) => (
        <strong>{'\u20A6'}{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 110,
      render: (method) => (
        <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : method === 'transfer' ? 'purple' : 'orange'}>
          {method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => onView(record.id)} size="small" />
          </Tooltip>
          <Tooltip title="Print Receipt">
            <Button type="text" icon={<PrinterOutlined />} onClick={() => onPrint(record.id)} size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={sales}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 15,
        showSizeChanger: false,
        showTotal: (total) => `${total} sales`,
      }}
      size="middle"
      locale={{ emptyText: 'No sales records yet.' }}
    />
  );
}
