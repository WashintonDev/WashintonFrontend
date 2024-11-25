// src/pages/Suppliers/Suppliers.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuppliersTable from './SuppliersTable';
import RestockProductsPage from './RestockProductsPage';
import HistorySupplier from './HistorySupplier';
import HistoryGlobalSupplier from './HistoryGlobalSupplier';
const Suppliers = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SuppliersTable />} />
        <Route path="/request-restock" element={<RestockProductsPage />} />
        <Route path="/history-supplier" element={<HistorySupplier />} />
        <Route
          path="/historyglobalsupplier"
          element={<HistoryGlobalSupplier />}
        />
      </Routes>
    </div>
  );
};

export default Suppliers;