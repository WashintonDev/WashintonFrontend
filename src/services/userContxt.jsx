import React, { createContext, useState, useEffect } from "react";
import fetchUserRole from "../services/fetchUserRole";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado en Firebase
        const firebaseUserID = firebaseUser.uid;

        // Obtener el rol desde el backend
        const fetchedRole = await fetchUserRole(firebaseUserID);

        if (fetchedRole) {
          setRole(fetchedRole); // Almacena el rol
        }

        setUser({ email: firebaseUser.email, firebaseUserID }); // Almacena el usuario
      } else {
        // Usuario no autenticado
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, role }}>
      {children}
    </UserContext.Provider>
  );
};
