import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/authUtil";

const ProtectedRoute = () => {
  const userToken = getToken(); 
  const userRole = localStorage.getItem("role");

  if (!userToken || !userRole) {
    // Redirige al login si no hay token o rol
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Si hay token, muestra la ruta protegida
};

export default ProtectedRoute;