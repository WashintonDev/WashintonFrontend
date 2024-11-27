import { useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { useContext } from "react";
import { UserContext } from "../services/userContxt";

const useLogout = () => {
  const navigate = useNavigate();
  const { logout: contextLogout } = useContext(UserContext);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiration");

    const auth = getAuth();
    signOut(auth)
      .then(() => {
        if (contextLogout) {
          contextLogout(); // Llama al logout del contexto si existe
        }

        // Redirigir al login
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión en Firebase:", error);
      });
  };

  return logout;
};

export default useLogout;