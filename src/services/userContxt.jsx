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
        const firebaseUserID = firebaseUser.uid;
        const fetchedRole = await fetchUserRole(firebaseUserID);

        if (fetchedRole) {
          setRole(fetchedRole);
        }

        setUser({ email: firebaseUser.email, firebaseUserID });
      } else {
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