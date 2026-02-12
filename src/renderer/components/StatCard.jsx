import React from 'react';
import { Card, Statistic } from 'antd';

export default function StatCard({ title, value, prefix, suffix, color, icon }) {
  return (
    <Card className="stat-card" bodyStyle={{ padding: '20px 24px' }}>
      <Statistic
        title={<span style={{ fontSize: 13, color: '#8c8c8c' }}>{title}</span>}
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color: color || '#1677ff', fontSize: 28, fontWeight: 600 }}
        formatter={(val) => {
          if (prefix) return `${prefix}${Number(val).toLocaleString()}`;
          return Number(val).toLocaleString();
        }}
      />
    </Card>
  );
}
