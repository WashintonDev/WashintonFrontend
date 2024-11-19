import { useEffect, useState } from "react";
import { getToken, clearToken } from "../utils/authUtils";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    const interval = setInterval(() => {
      if (!getToken()) {
        setIsAuthenticated(false);
        clearToken();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return isAuthenticated;
};

export default useAuth;
