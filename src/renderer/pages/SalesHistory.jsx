import React, { useState, useEffect, useCallback } from 'react';
import { Card, DatePicker, Space, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SalesTable from '../components/SalesTable';
import SaleDetailModal from '../components/SaleDetailModal';

const { RangePicker } = DatePicker;

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [detailSaleId, setDetailSaleId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].startOf('day').toISOString();
        filters.endDate = dateRange[1].endOf('day').toISOString();
      }
      const data = await window.electronAPI.getSales(filters);
      setSales(data);
    } catch (err) {
      message.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleView = (saleId) => {
    setDetailSaleId(saleId);
    setDetailOpen(true);
  };

  const handlePrint = async (saleId) => {
    try {
      await window.electronAPI.printReceipt(saleId);
      message.success('Receipt sent to printer');
    } catch (err) {
      message.warning('Could not print: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '16px 24px' }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear
              presets={[
                { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
                { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
              ]}
            />
          </Space>
          <Button icon={<ReloadOutlined />} onClick={loadSales}>Refresh</Button>
        </div>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <SalesTable
          sales={sales}
          loading={loading}
          onView={handleView}
          onPrint={handlePrint}
        />
      </Card>

      <SaleDetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailSaleId(null); }}
        saleId={detailSaleId}
      />
    </div>
  );
}
