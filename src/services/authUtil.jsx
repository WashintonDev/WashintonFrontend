export const saveToken = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("token_expiration", expirationTime);
  };
  
  export const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
  };
