import axios from "axios";

const fetchUserRole = async (firebaseUserID) => {
  try {
    // Obtener el usuario por Firebase ID
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/api/user/firebase/${firebaseUserID}`
    );

    // Filtrar el usuario en el frontend basado en el firebase_user_ID
    const user = response.data.find((u) => u.firebase_user_ID === firebaseUserID);

    if (user && user.role_id !== null) {
      // Almacenar el role_id en el caché (localStorage)
      localStorage.setItem("role_id", user.role_id);
      return user.role_id;
    } else {
      throw new Error("Usuario no encontrado o sin rol");
    }
  } catch (error) {
    console.error("Error al obtener el usuario o rol:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Error desconocido al obtener el usuario",
    };
  }
};

export default fetchUserRole;
