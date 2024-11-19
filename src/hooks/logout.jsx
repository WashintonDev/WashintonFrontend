import { useNavigate } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';


const useLogout = () => {
  const navigate = useNavigate();
  const logout = () => {
   
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");  
    
    const auth = getAuth();
    signOut(auth);

   navigate("/login"); 
  };

  return logout;
};

export default useLogout;
