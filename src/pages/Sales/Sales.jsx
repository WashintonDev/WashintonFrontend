import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesPage from './SalesPage';
import SalesReport from './SalesReport';

const Sales = () => {
  return (
    <Routes>
      <Route path="/" element={<SalesPage />} />
      <Route path="/sales-report" element={<SalesReport />} />
    </Routes>
  );
};

export default Sales;