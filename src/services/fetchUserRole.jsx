import axios from "axios";

const fetchUserRole = async (firebaseUserID) => {
  try {
    // Obtener el usuario por Firebase ID
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/api/user/firebase/${firebaseUserID}`
    );

    const user = userResponse.data;

    // Verificar que el usuario tenga rol
    if (user && user.role) {
      // Acceder al nombre del rol desde la respuesta
      const roleName = user.role.name;

      // Almacenar el nombre del rol en localStorage
      localStorage.setItem("role", roleName);

      return roleName; // Retorna solo el nombre del rol
    } else {
      throw new Error("Rol no encontrado para el usuario");
    }
  } catch (error) {
    console.error(
      "Error al obtener el usuario o rol:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error desconocido al obtener el usuario",
    };
  }
};

export default fetchUserRole;
