import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/protectedRoutes';
import Home from '../pages/Home/Home';
import Suppliers from '../pages/Suppliers/Suppliers';
import Login from '../pages/login/Login';
import SignUp from '../pages/login/Sign-up';
import Inventory from '../pages/Inventory/Inventory';
import Sales from '../pages/Sales/Sales';
import TransferOrders from '../pages/TransferOrders/TransferOrders'

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home />} />
      <Route path="/suppliers/*" element={<Suppliers />} />
      <Route path="/inventory/*" element={<Inventory />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/sales/*" element={<Sales />} />
      <Route path="/transfer-orders/*" element={<TransferOrders/>}/>
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;