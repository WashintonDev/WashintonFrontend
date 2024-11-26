import React from "react";
import { Routes,Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import RoleHistoryDialog from "./RolHistory";
import RoleManagement from "./RolManagment";
import UserManagement from "./UserManagement";
import Profile from "./Profile";
import EmployeeStorePage from "../Employees/EmployeeStorePage";

const Admin = () => {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rolem" element={<RoleManagement />} />
          <Route path="/roles" element={<RoleHistoryDialog />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/employees" element={<EmployeeStorePage />} />
        </Routes>

      </div>
    );
  };
  
  export default Admin;
