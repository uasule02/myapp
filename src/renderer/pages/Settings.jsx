import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Divider, Typography, message, Spin, Row, Col, Tag } from 'antd';
import { SaveOutlined, CloudSyncOutlined, PrinterOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';
import SyncButton from '../components/SyncButton';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printers, setPrinters] = useState([]);
  const { syncStatus, setSyncStatus } = useApp();

  useEffect(() => {
    loadSettings();
    loadPrinters();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      form.setFieldsValue(settings);
    } catch (err) {
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadPrinters = async () => {
    try {
      const list = await window.electronAPI.getPrinters();
      setPrinters(list);
    } catch (err) {
      // ignore - printers not available
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      for (const [key, value] of Object.entries(values)) {
        if (value !== undefined && value !== null) {
          await window.electronAPI.updateSetting(key, String(value));
        }
      }
      message.success('Settings saved successfully');
    } catch (err) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const refreshSyncStatus = async () => {
    try {
      const status = await window.electronAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    refreshSyncStatus();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  const printerOptions = [
    { label: 'System Default', value: '' },
    ...printers.map(p => ({
      label: `${p.name}${p.isDefault ? ' (Default)' : ''}`,
      value: p.name,
    })),
  ];

  return (
    <div style={{ maxWidth: 700 }}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Business Information */}
        <Card title="Business Information" style={{ marginBottom: 16 }}>
          <Form.Item name="business_name" label="Business Name">
            <Input placeholder="My Business" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="business_address" label="Address">
                <Input placeholder="123 Main Street" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="business_phone" label="Phone">
                <Input placeholder="+234 800 000 0000" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Receipt Settings */}
        <Card title="Receipt Settings" style={{ marginBottom: 16 }}>
          <Form.Item name="receipt_footer" label="Receipt Footer Message">
            <Input placeholder="Thank you for your purchase!" />
          </Form.Item>
          <Form.Item name="printer_name" label="Printer">
            <Select options={printerOptions} placeholder="Select printer" />
          </Form.Item>
          <Button icon={<PrinterOutlined />} onClick={loadPrinters} style={{ marginTop: -8 }}>
            Refresh Printers
          </Button>
        </Card>

        {/* Sync Settings */}
        <Card title="Data Sync" style={{ marginBottom: 16 }}>
          <Form.Item
            name="sync_url"
            label="Remote Server URL"
            extra="The URL of your remote server. Data will be sent to /api/sync endpoint."
          >
            <Input placeholder="https://your-server.com" />
          </Form.Item>

          <div style={{
            background: '#fafafa',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div>
                <Text type="secondary">Pending Changes: </Text>
                <Tag color={syncStatus.pendingCount > 0 ? 'orange' : 'green'}>
                  {syncStatus.pendingCount}
                </Tag>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary">Last Synced: </Text>
                <Text>
                  {syncStatus.lastSyncedAt
                    ? dayjs(syncStatus.lastSyncedAt).format('MMM D, YYYY h:mm A')
                    : 'Never'}
                </Text>
              </div>
            </div>
            <SyncButton />
          </div>
        </Card>

        {/* Save Button */}
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          size="large"
          loading={saving}
        >
          Save Settings
        </Button>
      </Form>
    </div>
  );
}
