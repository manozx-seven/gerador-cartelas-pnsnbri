// Inicialização do Firebase (SDK modular via CDN).
// Chaves do projeto "gerador-cartelas-pnsnbri".
// Passo a passo completo em SETUP-FIREBASE.md
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAb5ItIaC1YXvg0eyblPPj6J29y_hJRvpI",
  authDomain: "gerador-cartelas-pnsnbri.firebaseapp.com",
  projectId: "gerador-cartelas-pnsnbri",
  storageBucket: "gerador-cartelas-pnsnbri.firebasestorage.app",
  messagingSenderId: "631032400231",
  appId: "1:631032400231:web:b87654078c7de78a0347c2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Coleção de administradores (id do documento = uid do Auth).
export const COL_ADMINS = "admins";
