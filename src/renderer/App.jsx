import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes';

const theme = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <AppProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AppProvider>
      </AntApp>
    </ConfigProvider>
  );
}
