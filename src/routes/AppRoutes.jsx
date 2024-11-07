import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Suppliers from '../pages/Suppliers/Suppliers';
import Inventory from '../pages/Inventory/Inventory';


const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/suppliers/*" element={<Suppliers />} />
      <Route path="/inventory/*" element={<Inventory />} />

    </Routes>
  </Router>
);

export default AppRoutes;