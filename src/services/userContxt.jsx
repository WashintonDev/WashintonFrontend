import React, { createContext, useState, useEffect } from "react";


export const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedRole && storedToken) {
      setUser({
        email: storedUser,
        role: storedRole,
        token: storedToken,
      });
    }
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    localStorage.setItem("user", userData.email);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("token", userData.token);
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};