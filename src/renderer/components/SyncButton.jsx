import React, { useState } from 'react';
import { Button, Badge, message, Tooltip } from 'antd';
import { CloudSyncOutlined, LoadingOutlined } from '@ant-design/icons';
import { useApp } from '../context/AppContext';

export default function SyncButton({ size = 'middle' }) {
  const { syncStatus, setSyncStatus } = useApp();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await window.electronAPI.syncToServer();
      if (result.success) {
        if (result.count > 0) {
          message.success(`Synced ${result.count} changes successfully`);
        } else {
          message.info(result.message || 'Everything is up to date');
        }
      } else {
        message.error(result.error || 'Sync failed');
      }
      // Refresh sync status
      const status = await window.electronAPI.getSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      message.error('Sync failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Tooltip title={`${syncStatus.pendingCount} pending changes`}>
      <Badge count={syncStatus.pendingCount} size="small" offset={[-4, 4]}>
        <Button
          icon={syncing ? <LoadingOutlined /> : <CloudSyncOutlined />}
          onClick={handleSync}
          loading={syncing}
          size={size}
        >
          Sync Now
        </Button>
      </Badge>
    </Tooltip>
  );
}
