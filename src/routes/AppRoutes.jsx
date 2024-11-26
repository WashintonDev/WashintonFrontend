import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/protectedRoutes";
import Home from "../pages/Home/Home";
import Suppliers from "../pages/Suppliers/Suppliers";
import Login from "../pages/Login/Login";
import SignUp from "../pages/Login/Sign-Up";
import Inventory from "../pages/Inventory/Inventory";
import Sales from "../pages/Sales/Sales";
import TransferOrders from "../pages/TransferOrders/TransferOrders";
import Dispatch from "../pages/Dispatch/Dispatch";
import { UserProvider } from '../services/userContxt';
import Admin from '../pages/Dashboard/Admin';
import EmployeeStorePage from "../pages/Employees/EmployeeStorePage";


const AppRoutes = () => (
  <Router>
    <UserProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/suppliers/*" element={<Suppliers />} />
        <Route path="/inventory/*" element={<Inventory />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sales/*" element={<Sales />} />
        <Route path="/dispatch/*" element={<Dispatch />} />
        <Route path="/transfer-orders/*" element={<TransferOrders />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/employees/*" element={<EmployeeStorePage />} />
      </Route>
    </Routes>
    </UserProvider>
  </Router>
);

export default AppRoutes;
