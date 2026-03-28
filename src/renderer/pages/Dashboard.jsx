import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  AppstoreOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import StatCard from '../components/StatCard';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const topSellerColumns = [
    { title: 'Item', dataIndex: 'item_name', key: 'item_name' },
    {
      title: 'Units Sold',
      dataIndex: 'total_sold',
      key: 'total_sold',
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
  ];

  const recentSalesColumns = [
    {
      title: 'Receipt #',
      dataIndex: 'id',
      key: 'id',
      render: (id) => id.substring(0, 8).toUpperCase(),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM D, h:mm A'),
    },
    {
      title: 'Items',
      dataIndex: 'item_count',
      key: 'item_count',
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val) => `\u20A6${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Payment',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => (
        <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'orange'}>
          {method.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Today's Sales"
            value={stats?.todaySalesCount || 0}
            color="#1677ff"
            icon={<ShoppingCartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Today's Revenue"
            value={stats?.todayRevenue || 0}
            prefix={'\u20A6'}
            color="#52c41a"
            icon={<DollarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            color="#722ed1"
            icon={<AppstoreOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Low Stock Alerts"
            value={stats?.lowStockCount || 0}
            color={stats?.lowStockCount > 0 ? '#ff4d4f' : '#8c8c8c'}
            icon={<WarningOutlined />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Items (Last 30 Days)" size="small">
            <Table
              dataSource={stats?.topSellers || []}
              columns={topSellerColumns}
              rowKey="item_name"
              pagination={false}
              size="small"
              locale={{ emptyText: 'No sales data yet' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Sales" size="small">
            <Table
              dataSource={stats?.recentSales || []}
              columns={recentSalesColumns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'No sales yet' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
