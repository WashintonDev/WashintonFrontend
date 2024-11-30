import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../services/authUtil";

const ProtectedRoute = () => {
  const userToken = getToken();
  const userRole = localStorage.getItem("role");
  const location = useLocation(); // Usamos useLocation para obtener la ruta actual

  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es admin, le permitimos acceder a cualquier ruta protegida
  if (userRole === "admin") {
    return <Outlet />;
  }

  // Si el usuario es de tipo store, puede acceder solo a rutas de inventario
  if (userRole === "store") {
    // Si intenta acceder a algo fuera de /sales, lo redirigimos a /sales
    if (!location.pathname.includes("/sales")) {
      return <Navigate to="/sales" replace />;
    }
    return <Outlet />;
  }

  if (userRole === "logistics_coordinator") {
    // Si intenta acceder a algo fuera de /sales, lo redirigimos a /sales
    if (!location.pathname.includes("/dispatch", "/transfer-orders")) {
      return <Navigate to="/dispatch" replace />;
    }
    return <Outlet />;
  }
  if (userRole === "supplies_admin") {
    if (!location.pathname.includes("/suppliers", "/inventory")) {
      return <Navigate to="/suppliers" replace />;
    }
    return <Outlet />;
  }
  if (userRole === "warehouse_employee") {
    if (!location.pathname.includes("/inventory")) {
      return <Navigate to="/inventory" replace />;
    }
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
