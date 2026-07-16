import { auth, db, COL_ADMINS } from './firebase.js';
import {
  signInWithEmailAndPassword, updatePassword, signOut, sendPasswordResetEmail, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, REGRAS_SENHA, validarSenhaForte, comCarregamento, olhoSenhaEm } from './utils.js';

const viewLogin = document.getElementById('viewLogin');
const viewTroca = document.getElementById('viewTrocarSenha');
const novaSenhaEl = document.getElementById('novaSenha');
const novaSenha2El = document.getElementById('novaSenha2');
const btnEntrar = document.getElementById('btnEntrar');
const btnSalvarSenha = document.getElementById('btnSalvarSenha');

olhoSenhaEm(document.getElementById('senha'), novaSenhaEl, novaSenha2El);

// Se já estiver logado e for admin sem senha provisória, vai direto para o app.
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    const snap = await getDoc(doc(db, COL_ADMINS, user.uid));
    if (snap.exists() && !snap.data().mustChangePassword) location.replace('app.html');
  } catch (_) {}
});

btnEntrar.addEventListener('click', () => comCarregamento(btnEntrar, entrar));
document.getElementById('senha').addEventListener('keydown', e => { if (e.key === 'Enter') comCarregamento(btnEntrar, entrar); });
btnSalvarSenha.addEventListener('click', () => comCarregamento(btnSalvarSenha, salvarSenha));

const linkEsqueci = document.getElementById('linkEsqueci');
const viewEsqueci = document.getElementById('viewEsqueci');
linkEsqueci.addEventListener('click', () => comCarregamento(linkEsqueci, async () => {
  const email = document.getElementById('email').value.trim();
  if (!email){ toast('Digite seu e-mail no campo acima primeiro.', 'warn'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    document.getElementById('emailEnviado').textContent = email;
    viewLogin.classList.add('hidden');
    viewEsqueci.classList.remove('hidden'); viewEsqueci.classList.add('fade-in');
  } catch (e){
    const map = { 'auth/invalid-email': 'E-mail inválido.', 'auth/user-not-found': 'E-mail não encontrado.' };
    toast(map[e.code] || 'Não foi possível enviar o e-mail.', 'erro');
  }
}));
document.getElementById('btnVoltarLogin').addEventListener('click', () => {
  viewEsqueci.classList.add('hidden');
  viewLogin.classList.remove('hidden'); viewLogin.classList.add('fade-in');
});

// Voltar da tela "crie sua nova senha" (1º acesso) → sai da sessão provisória e volta ao login
document.getElementById('btnVoltarTroca').addEventListener('click', async () => {
  try { await signOut(auth); } catch (_) {}
  viewTroca.classList.add('hidden');
  viewLogin.classList.remove('hidden'); viewLogin.classList.add('fade-in');
});

// Mensagem quando a sessão expirou por inatividade
if (new URLSearchParams(location.search).get('expirado')){
  toast('Sua sessão expirou por inatividade. Entre novamente.', 'info', 6000);
}

// Lista visual de regras de senha
const listaRegras = document.getElementById('regrasSenha');
REGRAS_SENHA.forEach(r => { const li = document.createElement('li'); li.dataset.id = r.id; li.textContent = r.txt; listaRegras.appendChild(li); });
novaSenhaEl.addEventListener('input', avaliarSenha);
novaSenha2El.addEventListener('input', avaliarSenha);
function avaliarSenha(){
  const s = novaSenhaEl.value; let todasOk = true;
  REGRAS_SENHA.forEach(r => { const li = listaRegras.querySelector(`[data-id="${r.id}"]`); const ok = r.teste(s); li.classList.toggle('ok', ok); if (!ok) todasOk = false; });
  btnSalvarSenha.disabled = !(todasOk && s.length > 0 && s === novaSenha2El.value);
}

async function entrar(){
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  if (!email || !senha){ toast('Informe e-mail e senha.', 'warn'); return; }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const snap = await getDoc(doc(db, COL_ADMINS, cred.user.uid));
    if (!snap.exists()){ await signOut(auth); toast('Este usuário não tem permissão de administrador.', 'erro', 6000); return; }
    if (snap.data().mustChangePassword){
      viewLogin.classList.add('hidden');
      viewTroca.classList.remove('hidden'); viewTroca.classList.add('fade-in');
      return;
    }
    location.href = 'app.html';
  } catch (e){
    const map = {
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/user-not-found': 'Usuário não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente de novo.'
    };
    toast(map[e.code] || 'Não foi possível entrar.', 'erro');
  }
}

async function salvarSenha(){
  const s1 = novaSenhaEl.value, s2 = novaSenha2El.value;
  const { ok, faltas } = validarSenhaForte(s1);
  if (!ok){ toast('Senha fraca. Falta: ' + faltas.map(f => f.txt.toLowerCase()).join('; '), 'warn', 6000); return; }
  if (s1 !== s2){ toast('As senhas não conferem.', 'warn'); return; }
  try {
    await updatePassword(auth.currentUser, s1);
    await updateDoc(doc(db, COL_ADMINS, auth.currentUser.uid), { mustChangePassword: false });
    toast('Senha atualizada com sucesso!', 'ok');
    location.href = 'app.html';
  } catch (e){
    toast('Erro ao salvar a senha. Faça login novamente e tente de novo.', 'erro', 6000);
  }
}
