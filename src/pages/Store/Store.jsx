import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesTransferPage from './StoreTransfersPage';

const Store = () => {
  return (
    <Routes>
      <Route path="/" element={<SalesTransferPage />} />
    </Routes>
  );
};

export default Store;