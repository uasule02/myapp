import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import PointOfSale from './pages/PointOfSale';
import SalesHistory from './pages/SalesHistory';
import Settings from './pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/pos" element={<PointOfSale />} />
        <Route path="/sales" element={<SalesHistory />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
