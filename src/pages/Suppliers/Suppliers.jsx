// src/pages/Suppliers/Suppliers.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuppliersTable from './suppliersTable';
import RestockProductsPage from './RestockProductsPage';

const Suppliers = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SuppliersTable />} />
        <Route path="/request-restock" element={<RestockProductsPage/>}/>
      </Routes>
    </div>
  );
};

export default Suppliers;