import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryPage from './CategoryPage';
import ProductPage from './ProductPage';
import RestockProductsPage from '../Suppliers/RestockProductsPage';
import StorePage from './StorePage';
import WarehousePage from './WarehousePage';
import InventoryPage from './InventoryPage';
import ProductBatchPage from './ProductBatchPage';

const Inventory = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/restock-products" element={<RestockProductsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/product-batch" element={<ProductBatchPage />} />
      </Routes>
    </div>
  );
};

export default Inventory;