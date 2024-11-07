// firebaseConfig.jsx
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase

const firebaseConfig = {
    apiKey: "AIzaSyC6cHOjph8nI0ErmSLnvj-57NGycgIcFmw",
    authDomain: "washinton-20dda.firebaseapp.com",
    databaseURL: "https://washinton-20dda-default-rtdb.firebaseio.com",
    projectId: "washinton-20dda",
    storageBucket: "washinton-20dda.firebasestorage.app",
    messagingSenderId: "459721239473",
    appId: "1:459721239473:web:b22eb2b758a59e64122b90"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Inicializa la autenticación

export { auth };
