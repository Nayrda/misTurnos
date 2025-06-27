import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Reemplaza esto con la configuración de tu proyecto de Firebase
// Puedes encontrarla en la consola de Firebase > Configuración del proyecto.
const firebaseConfig = {
  apiKey: "AIzaSyDgHvjQ5i-JyyRKV0I-00MYi0qii8rj7xM",
  authDomain: "misturnos-89df3.firebaseapp.com",
  projectId: "misturnos-89df3",
  storageBucket: "misturnos-89df3.firebasestorage.app",
  messagingSenderId: "826671321882",
  appId: "1:826671321882:web:cb1111757403176e5b12a3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
