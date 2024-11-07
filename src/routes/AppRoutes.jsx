import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Suppliers from '../pages/Suppliers/Suppliers';
import CategoryPage from '../pages/Inventory/CategoryPage';
import ProductPage from '../pages/Inventory/ProductPage';
import RestockProductsPage from '../pages/Inventory/RestockProductsPage';
import StorePage from '../pages/Inventory/StorePage';
import SupplierPage from '../pages/Inventory/SupplierPage';
import WarehousePage from '../pages/Inventory/WarehousePage';
import InventoryPage from '../pages/Inventory/InventoryPage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/suppliers/*" element={<Suppliers />} />
      <Route path="/inventory/category" element={<CategoryPage />} />
      <Route path="/inventory/product" element={<ProductPage />} />
      <Route path="/inventory/restock-products" element={<RestockProductsPage />} />
      <Route path="/inventory/store" element={<StorePage />} />
      <Route path="/inventory/supplier" element={<SupplierPage />} />
      <Route path="/inventory/warehouse" element={<WarehousePage />} />
      <Route path="/inventory/inventory" element={<InventoryPage />} />
    </Routes>
  </Router>
);

export default AppRoutes;