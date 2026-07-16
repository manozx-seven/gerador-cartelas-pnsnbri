import { app, auth, db, firebaseConfig, COL_ADMINS } from './firebase.js';
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  onAuthStateChanged, signOut, getAuth, createUserWithEmailAndPassword,
  signOut as signOutApp, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, comCarregamento, REGRAS_SENHA, validarSenhaForte, olhoSenhaEm } from './utils.js';

const $ = s => document.querySelector(s);
let MEU = { uid: null, email: null, role: null };

// ---------- Guarda de acesso ----------
onAuthStateChanged(auth, async (user) => {
  if (!user){ location.replace('login.html'); return; }
  try {
    const snap = await getDoc(doc(db, COL_ADMINS, user.uid));
    if (!snap.exists()){ await signOut(auth); location.replace('login.html'); return; }
    const adm = snap.data();
    if (adm.mustChangePassword){ location.replace('login.html'); return; }
    MEU = { uid: user.uid, email: user.email, role: adm.role || 'adm' };
    $('#quemSou').innerHTML = `${MEU.email} <span class="badge ${MEU.role}">${MEU.role === 'dev' ? 'DEV' : 'ADM'}</span>`;
    const ov = document.getElementById('authOverlay'); if (ov) ov.remove();
    await carregarAdmins();
  } catch (e){ console.error(e); toast('Erro ao carregar o painel.', 'erro'); }
});

$('#btnSair').addEventListener('click', () => comCarregamento($('#btnSair'), async () => {
  await signOut(auth); location.replace('login.html');
}));

// ---------- Lista de administradores ----------
async function carregarAdmins(){
  const qs = await getDocs(collection(db, COL_ADMINS));
  const admins = qs.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
  const box = $('#listaAdmins'); box.innerHTML = '';
  admins.forEach(a => {
    const ehDev = a.role === 'dev';
    const souEu = a.id === MEU.uid;
    const podeExcluir = !souEu && (MEU.role === 'dev' || (MEU.role === 'adm' && !ehDev));
    const div = document.createElement('div');
    div.className = 'adm-item';
    div.innerHTML = `<span class="em">${a.email || a.id}</span>
      <span class="badge ${a.role}">${ehDev ? 'DEV' : 'ADM'}</span>
      ${souEu ? '<span class="muted">(você)</span>' : ''}
      ${a.mustChangePassword ? '<span class="muted">• senha provisória</span>' : ''}
      <span class="sp"></span>
      ${podeExcluir ? `<button class="danger" data-del="${a.id}">Excluir</button>` : ''}`;
    box.appendChild(div);
  });
  box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => excluirAdmin(b.dataset.del, b)));
}

async function excluirAdmin(uid, btn){
  if (!confirm('Excluir este administrador? O acesso dele será removido do sistema.')) return;
  await comCarregamento(btn, async () => {
    try {
      await deleteDoc(doc(db, COL_ADMINS, uid));
      toast('Administrador removido.', 'ok', 5000);
      toast('Obs.: a conta de login continua no Firebase Auth até ser apagada no Console.', 'info', 8000);
      await carregarAdmins();
    } catch (e){ console.error(e); toast('Erro ao excluir. Verifique sua permissão.', 'erro'); }
  });
}

// ---------- Criar administrador ----------
const btnCriarAdm = $('#btnCriarAdm');
btnCriarAdm.addEventListener('click', () => comCarregamento(btnCriarAdm, async () => {
  const email = $('#admEmail').value.trim();
  const senha = $('#admSenha').value;
  const role = $('#admRole').value;
  if (!email || senha.length < 6){ toast('Informe e-mail e senha (mín. 6 caracteres).', 'warn'); return; }
  // Cria a conta num app secundário para NÃO deslogar o admin atual.
  const secApp = initializeApp(firebaseConfig, 'sec_' + Date.now());
  const secAuth = getAuth(secApp);
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, senha);
    await setDoc(doc(db, COL_ADMINS, cred.user.uid), {
      email, role, mustChangePassword: true, criadoEm: serverTimestamp()
    });
    await signOutApp(secAuth);
    $('#admEmail').value = ''; $('#admSenha').value = '';
    toast('Administrador criado! Ele trocará a senha no primeiro acesso.', 'ok', 6000);
    await carregarAdmins();
  } catch (e){
    console.error(e);
    const map = {
      'auth/email-already-in-use': 'Este e-mail já está em uso.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/weak-password': 'Senha muito fraca (mín. 6 caracteres).'
    };
    toast(map[e.code] || 'Erro ao criar administrador.', 'erro');
  } finally { try { await deleteApp(secApp); } catch (_){} }
}));

// ---------- Alterar minha senha ----------
const pwAtual = $('#pwAtual'), pwNova = $('#pwNova'), pwNova2 = $('#pwNova2');
const btnTrocarSenha = $('#btnTrocarSenha'), pwLista = $('#pwRegras');
olhoSenhaEm(pwAtual, pwNova, pwNova2, $('#admSenha'));
REGRAS_SENHA.forEach(r => { const li = document.createElement('li'); li.dataset.id = r.id; li.textContent = r.txt; pwLista.appendChild(li); });
function avaliarPw(){
  const s = pwNova.value; let todasOk = true;
  REGRAS_SENHA.forEach(r => { const li = pwLista.querySelector(`[data-id="${r.id}"]`); const ok = r.teste(s); li.classList.toggle('ok', ok); if (!ok) todasOk = false; });
  btnTrocarSenha.disabled = !(todasOk && s.length > 0 && s === pwNova2.value && pwAtual.value.length > 0);
}
[pwAtual, pwNova, pwNova2].forEach(el => el.addEventListener('input', avaliarPw));
btnTrocarSenha.addEventListener('click', () => comCarregamento(btnTrocarSenha, async () => {
  const s1 = pwNova.value, s2 = pwNova2.value;
  const { ok, faltas } = validarSenhaForte(s1);
  if (!ok){ toast('Senha fraca. Falta: ' + faltas.map(f => f.txt.toLowerCase()).join('; '), 'warn', 6000); return; }
  if (s1 !== s2){ toast('As senhas não conferem.', 'warn'); return; }
  try {
    const cred = EmailAuthProvider.credential(MEU.email, pwAtual.value);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, s1);
    pwAtual.value = ''; pwNova.value = ''; pwNova2.value = ''; avaliarPw();
    toast('Senha alterada com sucesso!', 'ok');
  } catch (e){
    console.error(e);
    const map = { 'auth/invalid-credential': 'Senha atual incorreta.', 'auth/wrong-password': 'Senha atual incorreta.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente de novo.' };
    toast(map[e.code] || 'Não foi possível alterar a senha.', 'erro');
  }
}));
