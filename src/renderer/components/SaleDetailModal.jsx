import React, { useState, useEffect } from 'react';
import { Modal, Table, Descriptions, Tag, Spin, Typography, Divider, Button, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export default function SaleDetailModal({ open, onClose, saleId }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && saleId) {
      setLoading(true);
      window.electronAPI.getSaleDetail(saleId)
        .then(setSale)
        .catch(() => message.error('Failed to load sale details'))
        .finally(() => setLoading(false));
    }
  }, [open, saleId]);

  const handlePrint = async () => {
    try {
      await window.electronAPI.printReceipt(saleId);
      message.success('Receipt sent to printer');
    } catch (err) {
      message.warning('Could not print: ' + (err.message || 'Unknown error'));
    }
  };

  const columns = [
    { title: 'Item', dataIndex: 'item_name', key: 'item_name' },
    {
      title: 'Price',
      dataIndex: 'item_price',
      key: 'item_price',
      render: (p) => `\u20A6${p.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      align: 'right',
    },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (s) => `\u20A6${s.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      align: 'right',
    },
  ];

  return (
    <Modal
      title={`Sale Detail ${sale ? '- #' + sale.id.substring(0, 8).toUpperCase() : ''}`}
      open={open}
      onCancel={onClose}
      width={560}
      footer={[
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print Receipt
        </Button>,
        <Button key="close" onClick={onClose}>Close</Button>,
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : sale ? (
        <div>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Date">
              {dayjs(sale.created_at).format('MMM D, YYYY h:mm A')}
            </Descriptions.Item>
            <Descriptions.Item label="Payment">
              <Tag color={sale.payment_method === 'cash' ? 'green' : 'blue'}>
                {sale.payment_method.toUpperCase()}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Table
            dataSource={sale.items || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ marginTop: 12 }}
          />

          <Divider style={{ margin: '12px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <div><Text type="secondary">Subtotal:</Text> <Text>{'\u20A6'}{sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></div>
            <div><Text type="secondary">Paid:</Text> <Text>{'\u20A6'}{sale.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></div>
            {sale.change_amount > 0 && (
              <div><Text type="secondary">Change:</Text> <Text strong style={{ color: '#52c41a' }}>{'\u20A6'}{sale.change_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></div>
            )}
            <Divider style={{ margin: '8px 0' }} />
            <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
              Total: {'\u20A6'}{sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Title>
          </div>
          {sale.notes && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Notes: {sale.notes}</Text>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
