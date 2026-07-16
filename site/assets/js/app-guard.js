// Guarda de acesso do app.html: só entra quem está logado E é administrador.
import { auth, db, COL_ADMINS } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user){ location.replace('login.html'); return; }
  try {
    const snap = await getDoc(doc(db, COL_ADMINS, user.uid));
    if (!snap.exists()){ await signOut(auth); location.replace('login.html'); return; }
    const adm = snap.data();
    if (adm.mustChangePassword){ location.replace('login.html'); return; }
    // Autorizado: revela o app e preenche a barra.
    const em = document.getElementById('authEmail'); if (em) em.textContent = user.email;
    const rl = document.getElementById('authRole');
    if (rl){ rl.textContent = adm.role === 'dev' ? 'DEV' : 'ADM'; rl.className = 'badge ' + (adm.role === 'dev' ? 'dev' : 'adm'); }
    const ov = document.getElementById('authOverlay'); if (ov) ov.remove();
  } catch (e){
    console.error(e); location.replace('login.html');
  }
});

const btnSair = document.getElementById('btnSair');
if (btnSair) btnSair.addEventListener('click', async () => { await signOut(auth); location.replace('login.html'); });
