import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesPage from './SalesPage';


const Sales = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SalesPage/>} />
      </Routes>
    </div>
  );
};

export default Sales;