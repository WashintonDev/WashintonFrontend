import axios from "axios";

const fetchUserRole = async (firebaseUserID) => {
  try {
    const response = await axios.get(
      `https://washintonbackend.store/api/user/firebase/${firebaseUserID}`
    );

    // Filtrar el usuario en el frontend basado en el firebase_user_ID
    const user = response.data.find((u) => u.firebase_user_ID === firebaseUserID);

    if (user) {
      return user.role;
    } else {
      throw new Error("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    return null;
  }
};

export default fetchUserRole;