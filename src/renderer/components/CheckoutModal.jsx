import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Select, Input, Typography, Divider, message, Button, Result } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';

const { Title, Text } = Typography;

export default function CheckoutModal({ open, onClose }) {
  const { cart, cartTotal, clearCart } = useApp();
  const [form] = Form.useForm();
  const [amountPaid, setAmountPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saleResult, setSaleResult] = useState(null);

  useEffect(() => {
    if (open) {
      setAmountPaid(cartTotal);
      setSaleResult(null);
      form.setFieldsValue({
        paymentMethod: 'cash',
        amountPaid: cartTotal,
        notes: '',
      });
    }
  }, [open, cartTotal, form]);

  const changeAmount = Math.max(0, amountPaid - cartTotal);

  const handleComplete = async () => {
    try {
      const values = await form.validateFields();
      if (values.paymentMethod === 'cash' && values.amountPaid < cartTotal) {
        message.error('Amount paid cannot be less than total');
        return;
      }

      setLoading(true);
      const result = await window.electronAPI.createSale({
        items: cart.map(item => ({ itemId: item.itemId, quantity: item.quantity })),
        paymentMethod: values.paymentMethod,
        amountPaid: values.amountPaid || cartTotal,
        notes: values.notes || '',
      });

      setSaleResult(result);
      clearCart();
    } catch (err) {
      message.error(err.message || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (saleResult?.saleId) {
      try {
        await window.electronAPI.printReceipt(saleResult.saleId);
        message.success('Receipt sent to printer');
      } catch (err) {
        message.warning('Could not print receipt: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleDone = () => {
    setSaleResult(null);
    onClose();
  };

  // Sale completed view
  if (saleResult) {
    return (
      <Modal open={open} onCancel={handleDone} footer={null} width={420} closable={false}>
        <Result
          status="success"
          title="Sale Completed!"
          subTitle={
            <div>
              <p>Total: {'\u20A6'}{saleResult.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              {saleResult.changeAmount > 0 && (
                <p style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                  Change: {'\u20A6'}{saleResult.changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          }
          extra={[
            <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
              Print Receipt
            </Button>,
            <Button key="done" onClick={handleDone}>
              Done
            </Button>,
          ]}
        />
      </Modal>
    );
  }

  // Checkout form
  return (
    <Modal
      title="Checkout"
      open={open}
      onCancel={onClose}
      onOk={handleComplete}
      okText="Complete Sale"
      confirmLoading={loading}
      width={480}
      okButtonProps={{ disabled: cart.length === 0 }}
    >
      {/* Order Summary */}
      <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Order Summary</Text>
        {cart.map(item => (
          <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Text>{item.name} x{item.quantity}</Text>
            <Text>{'\u20A6'}{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </div>
        ))}
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>Total</Title>
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
            {'\u20A6'}{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Title>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item name="paymentMethod" label="Payment Method" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Cash', value: 'cash' },
              { label: 'Card / POS', value: 'card' },
              { label: 'Bank Transfer', value: 'transfer' },
              { label: 'Other', value: 'other' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="amountPaid"
          label="Amount Paid (\u20A6)"
          rules={[{ required: true, message: 'Enter amount paid' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={100}
            onChange={(val) => setAmountPaid(val || 0)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/,/g, '')}
          />
        </Form.Item>

        {amountPaid > cartTotal && (
          <div style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 16,
          }}>
            <Text style={{ color: '#52c41a', fontSize: 16, fontWeight: 'bold' }}>
              Change: {'\u20A6'}{changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </div>
        )}

        <Form.Item name="notes" label="Notes (Optional)">
          <Input.TextArea rows={2} placeholder="Any additional notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
