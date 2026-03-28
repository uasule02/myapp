import React, { useEffect, useState } from 'react';
import { Layout as AntLayout, Menu, Badge, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  SettingOutlined,
  CloudSyncOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const { Sider, Content, Header } = AntLayout;
const { Title } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/pos', icon: <ShoppingCartOutlined />, label: 'Point of Sale' },
  { key: '/inventory', icon: <AppstoreOutlined />, label: 'Inventory' },
  { key: '/sales', icon: <HistoryOutlined />, label: 'Sales History' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncStatus, setSyncStatus, cartCount } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Load sync status on mount
    window.electronAPI.getSyncStatus().then(setSyncStatus).catch(() => {});
  }, [setSyncStatus]);

  const currentPage = menuItems.find(item => item.key === location.pathname)?.label || 'POS System';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Title level={collapsed ? 5 : 4} style={{ color: '#fff', margin: 0 }}>
            {collapsed ? 'POS' : 'POS System'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({
            ...item,
            label: item.key === '/pos' ? (
              <Badge count={cartCount} size="small" offset={[10, 0]}>
                {item.label}
              </Badge>
            ) : item.label,
          }))}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
        {!collapsed && (
          <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, padding: '0 16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textAlign: 'center' }}>
              <CloudSyncOutlined style={{ marginRight: 4 }} />
              {syncStatus.pendingCount > 0
                ? `${syncStatus.pendingCount} pending sync`
                : 'All synced'}
            </div>
          </div>
        )}
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}>
          <Title level={4} style={{ margin: 0 }}>{currentPage}</Title>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
