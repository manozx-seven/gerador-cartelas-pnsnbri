// Sessão do usuário: presença (último acesso + heartbeat), auditoria (histórico)
// e expiração automática por inatividade.
import { auth, db, COL_ADMINS, COL_LOGS } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let CUR = null;
let beatTimer = null;
let idleTimer = null;
const IDLE_MS = 60 * 60 * 1000; // 1 hora sem atividade

function iniciarInatividade(){
  const expirar = async () => {
    try { await registrarAtividade('logout', 'Sessão expirada por inatividade'); } catch (_) {}
    try { await signOut(auth); } catch (_) {}
    location.replace('./?expirado=1');
  };
  const resetar = () => { if (idleTimer) clearTimeout(idleTimer); idleTimer = setTimeout(expirar, IDLE_MS); };
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev =>
    document.addEventListener(ev, resetar, { passive: true }));
  resetar();
}

// Registra uma ação no histórico (falha em silêncio para nunca quebrar a ação).
export async function registrarAtividade(acao, descricao){
  try {
    if (!CUR) return;
    await addDoc(collection(db, COL_LOGS), {
      uid: CUR.uid, email: CUR.email, role: CUR.role,
      acao, descricao: descricao || '', quando: serverTimestamp()
    });
  } catch (_) {}
}

// Inicia a sessão após o login: marca acesso, dispara heartbeat e registra o login 1x por sessão.
export function iniciarSessao(user, adm){
  CUR = { uid: user.uid, email: user.email, role: adm.role || 'adm' };
  const ref = doc(db, COL_ADMINS, user.uid);
  const marcarAcesso = () => updateDoc(ref, { ultimoAcesso: serverTimestamp(), ultimoAtivo: serverTimestamp() }).catch(() => {});
  const beat = () => updateDoc(ref, { ultimoAtivo: serverTimestamp() }).catch(() => {});
  marcarAcesso();
  if (beatTimer) clearInterval(beatTimer);
  beatTimer = setInterval(beat, 60000); // heartbeat a cada 1 min
  document.addEventListener('visibilitychange', () => { if (!document.hidden) beat(); });

  // login registrado uma vez por sessão do navegador (evita poluir com refresh)
  if (!sessionStorage.getItem('logadoBingo')){
    sessionStorage.setItem('logadoBingo', '1');
    registrarAtividade('login', 'Entrou no sistema');
  }
  // disponibiliza para scripts não-módulo (ex.: geração de PDF no app.html)
  window.registrarAtividade = registrarAtividade;
  iniciarInatividade(); // expira a sessão após 1h sem atividade
  return CUR;
}
