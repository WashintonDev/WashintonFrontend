// src/pages/Suppliers/Suppliers.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuppliersTable from './suppliersTable';
import RestockProductsPage from './RestockProductsPage';
import HistorySupplier from './HistorySupplier';
const Suppliers = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SuppliersTable />} />
        <Route path="/request-restock" element={<RestockProductsPage/>}/>
        <Route path="/history-supplier" element={<HistorySupplier/>}/>
      </Routes>
    </div>
  );
};

export default Suppliers;