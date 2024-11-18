import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/authUtil";

const ProtectedRoute = () => {
  const userRole = localStorage.getItem("token"); // Verifica que el token 
  const userToken = getToken()


  if (!userToken || !userRole) {
    return <Navigate to="/login" replace />; 
  }

  return <Outlet />; 
};

export default ProtectedRoute;
