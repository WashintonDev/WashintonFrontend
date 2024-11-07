// src/pages/Suppliers/Suppliers.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SuppliersTable from './suppliersTable';

const Suppliers = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SuppliersTable />} />
      </Routes>
    </div>
  );
};

export default Suppliers;