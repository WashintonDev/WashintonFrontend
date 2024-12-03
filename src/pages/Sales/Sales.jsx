import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesPage from './SalesPage';
import SalesReport from './SalesReport';
import SalesByStoreChart from './SaleChart';

const Sales = () => {
  return (
    <Routes>
      <Route path="/" element={<SalesPage />} />
      <Route path="/sales-report" element={<SalesReport />} />
      <Route path="/sales-chart" element={<SalesByStoreChart />} />
    </Routes>
  );
};

export default Sales;