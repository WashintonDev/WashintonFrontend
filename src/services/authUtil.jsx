export const saveToken = (token) => {
    const expirationTime = new Date().getTime() + 3600 * 1000; // 1 hora
    localStorage.setItem("token", token);
    localStorage.setItem("token_expiration", expirationTime);
  };
  
  export const getToken = () => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("token_expiration");
  
    if (new Date().getTime() > expirationTime) {
      clearToken();
      return null;
    }
    return token;
  };
  
  export const clearToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiration");
  };
  