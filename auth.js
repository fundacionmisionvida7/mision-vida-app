// Agrega estas exportaciones que faltan
//export { loginWithEmail } from './auth.js';
//export { registerWithEmail } from './auth.js';
//export { loginAnonymously } from './auth.js';
//export { logout } from './auth.js';


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";



// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAU55H5Bp3NWHm2U9ftFJ8ekNLyKBP6AaE",
  authDomain: "mision-vida-app.firebaseapp.com",
  projectId: "mision-vida-app",
  storageBucket: "mision-vida-app.appspot.com",
  messagingSenderId: "521021841760",
  appId: "1:521021841760:web:096110780a2a9e68593e05",
  measurementId: "G-ZD0ZMSYWJ1"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);


// Función para detectar cambios de autenticación
export const onAuthStateChange = (callback) => onAuthStateChanged(auth, callback);

// Funciones de autenticación
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export async function registerWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}



export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
}




export async function loginAnonymously() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}
