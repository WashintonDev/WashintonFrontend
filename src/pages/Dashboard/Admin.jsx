import React from "react";
import { Routes,Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import RoleHistoryDialog from "./RolHistory";
import RoleManagement from "./RolManagment";
import UserManagement from "./UserManagement";


const Admin = () => {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rolem" element={<RoleManagement />} />
          <Route path="/admin/roles" element={<RoleHistoryDialog />} />
        

        </Routes>

      </div>
    );
  };
  
  export default Admin;