import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/protectedRoutes';
import Login from '../pages/Login/Login.jsx';
import Home from '../pages/Home/Home';
import Suppliers from '../pages/Suppliers/Suppliers';
import SignUp from '../pages/Login/Sign-up';
import Inventory from '../pages/Inventory/Inventory';
import Sales from '../pages/Sales/Sales';
import TransferOrders from '../pages/TransferOrders/TransferOrders'
import Dispatch from '../pages/Dispatch/dispatch';
import Admin from '../pages/Dashboard/Admin';
import Profile from '../pages/Profile/Profile';
import UserManagement from '../pages/Dashboard/UserManagement';

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
        <Route path="/dispatch/*" element={<Dispatch />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/transfer-orders/*" element={<TransferOrders />} />
        {/* Administrativas */}
        <Route path="/Admin/*" element={<Admin />} />
        <Route path="/admin/users" element={<UserManagement />} />


  
      </Route>
    </Routes>
  </Router>
);

export default AppRoutes;