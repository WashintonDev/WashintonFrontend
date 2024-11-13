import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const userToken = localStorage.getItem("user"); // Verifica que el token esté almacenado y sea el nombre correcto

  if (!userToken) {
    return <Navigate to="/login" replace />; // Redirige al login si no hay token
  }

  return <Outlet />; // Si hay token, muestra la ruta protegida
};

export default ProtectedRoute;
