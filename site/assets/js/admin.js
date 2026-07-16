import { app, auth, db, firebaseConfig, COL_ADMINS, COL_LOGS } from './firebase.js';
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  onAuthStateChanged, signOut, getAuth, createUserWithEmailAndPassword,
  signOut as signOutApp, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, comCarregamento, REGRAS_SENHA, validarSenhaForte, olhoSenhaEm, dataHoraBR, tempoRelativo, estaOnline } from './utils.js';
import { iniciarSessao, registrarAtividade } from './session.js';

const $ = s => document.querySelector(s);
let MEU = { uid: null, email: null, role: null };

const ACOES = {
  login: 'Entrou no sistema', logout: 'Saiu do sistema',
  criar_admin: 'Criou administrador', excluir_admin: 'Removeu administrador',
  alterar_senha: 'Alterou a senha', gerar_cartelas: 'Gerou cartelas'
};

// ---------- Guarda de acesso ----------
onAuthStateChanged(auth, async (user) => {
  if (!user){ location.replace('./'); return; }
  try {
    const snap = await getDoc(doc(db, COL_ADMINS, user.uid));
    if (!snap.exists()){ await signOut(auth); location.replace('./'); return; }
    const adm = snap.data();
    if (adm.mustChangePassword){ location.replace('./'); return; }
    MEU = { uid: user.uid, email: user.email, role: adm.role || 'adm' };
    iniciarSessao(user, adm);
    $('#quemSou').innerHTML = `${MEU.email} <span class="badge ${MEU.role}">${MEU.role === 'dev' ? 'DEV' : 'ADM'}</span>`;
    // só DEV escolhe o papel; admin comum sempre cria "adm"
    if (MEU.role === 'dev') $('#wrapRole').classList.remove('hidden');
    const ov = document.getElementById('authOverlay'); if (ov) ov.remove();
    await carregarAdmins();
    await carregarHistorico();
  } catch (e){ console.error(e); toast('Erro ao carregar o painel.', 'erro'); }
});

$('#btnSair').addEventListener('click', () => comCarregamento($('#btnSair'), async () => {
  try { await registrarAtividade('logout', 'Saiu do sistema'); } catch (_){}
  await signOut(auth); location.replace('./');
}));

// ---------- Abas ----------
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  $('#tab-admins').classList.toggle('hidden', t.dataset.tab !== 'admins');
  $('#tab-historico').classList.toggle('hidden', t.dataset.tab !== 'historico');
}));

// ---------- Administradores ----------
async function carregarAdmins(){
  const qs = await getDocs(collection(db, COL_ADMINS));
  const admins = qs.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.email || '').localeCompare(b.email || ''));
  const box = $('#listaAdmins'); box.innerHTML = '';
  admins.forEach(a => {
    const ehDev = a.role === 'dev';
    const souEu = a.id === MEU.uid;
    const podeExcluir = !souEu && (MEU.role === 'dev' || (MEU.role === 'adm' && !ehDev));
    const online = estaOnline(a.ultimoAtivo);
    const presenca = online
      ? '<span class="online">online agora</span>'
      : (a.ultimoAcesso ? `<span class="acesso">último acesso: ${dataHoraBR(a.ultimoAcesso)} (${tempoRelativo(a.ultimoAcesso)})</span>` : '<span class="acesso">nunca acessou</span>');
    const div = document.createElement('div');
    div.className = 'adm-item';
    div.innerHTML = `<span class="em">${a.email || a.id}</span>
      <span class="badge ${a.role}">${ehDev ? 'DEV' : 'ADM'}</span>
      ${souEu ? '<span class="muted">(você)</span>' : ''}
      ${a.mustChangePassword ? '<span class="muted">• senha provisória</span>' : ''}
      <span class="sp"></span>${presenca}
      ${podeExcluir ? `<button class="danger" data-del="${a.id}" style="margin-left:12px">Excluir</button>` : ''}`;
    box.appendChild(div);
  });
  box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => excluirAdmin(b.dataset.del, b)));
  // alimenta o filtro de administradores do histórico
  const sel = $('#logFiltroAdmin'); const atual = sel.value;
  sel.innerHTML = '<option value="">Todos</option>' + admins.map(a => `<option value="${a.email}">${a.email}</option>`).join('');
  sel.value = atual;
}

async function excluirAdmin(uid, btn){
  if (!confirm('Excluir este administrador? O acesso dele será removido do sistema.')) return;
  await comCarregamento(btn, async () => {
    try {
      const alvo = (await getDoc(doc(db, COL_ADMINS, uid))).data() || {};
      await deleteDoc(doc(db, COL_ADMINS, uid));
      await registrarAtividade('excluir_admin', alvo.email || uid);
      toast('Administrador removido.', 'ok', 5000);
      toast('Obs.: a conta de login continua no Firebase Auth até ser apagada no Console.', 'info', 8000);
      await carregarAdmins(); await carregarHistorico();
    } catch (e){ console.error(e); toast('Erro ao excluir. Verifique sua permissão.', 'erro'); }
  });
}

const btnCriarAdm = $('#btnCriarAdm');
btnCriarAdm.addEventListener('click', () => comCarregamento(btnCriarAdm, async () => {
  const email = $('#admEmail').value.trim();
  const senha = $('#admSenha').value;
  // segurança: só DEV pode criar DEV; admin comum sempre cria "adm"
  const role = MEU.role === 'dev' ? $('#admRole').value : 'adm';
  if (!email || senha.length < 6){ toast('Informe e-mail e senha (mín. 6 caracteres).', 'warn'); return; }
  const secApp = initializeApp(firebaseConfig, 'sec_' + Date.now());
  const secAuth = getAuth(secApp);
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, senha);
    await setDoc(doc(db, COL_ADMINS, cred.user.uid), {
      email, role, mustChangePassword: true, criadoEm: serverTimestamp()
    });
    await signOutApp(secAuth);
    $('#admEmail').value = ''; $('#admSenha').value = '';
    await registrarAtividade('criar_admin', `${email} (${role === 'dev' ? 'DEV' : 'ADM'})`);
    toast('Administrador criado! Ele trocará a senha no primeiro acesso.', 'ok', 6000);
    await carregarAdmins(); await carregarHistorico();
  } catch (e){
    console.error(e);
    const map = { 'auth/email-already-in-use': 'Este e-mail já está em uso.', 'auth/invalid-email': 'E-mail inválido.', 'auth/weak-password': 'Senha muito fraca (mín. 6 caracteres).' };
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
    await registrarAtividade('alterar_senha', 'Alterou a própria senha');
    toast('Senha alterada com sucesso!', 'ok');
    await carregarHistorico();
  } catch (e){
    console.error(e);
    const map = { 'auth/invalid-credential': 'Senha atual incorreta.', 'auth/wrong-password': 'Senha atual incorreta.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente de novo.' };
    toast(map[e.code] || 'Não foi possível alterar a senha.', 'erro');
  }
}));

// ---------- Histórico (auditoria) ----------
let LOGS = [];
async function carregarHistorico(){
  try {
    const qs = await getDocs(query(collection(db, COL_LOGS), orderBy('quando', 'desc'), limit(300)));
    LOGS = qs.docs.map(d => d.data());
    // filtro de ações
    const selA = $('#logFiltroAcao'); const atualA = selA.value;
    const acoesPresentes = [...new Set(LOGS.map(l => l.acao))];
    selA.innerHTML = '<option value="">Todas</option>' + acoesPresentes.map(a => `<option value="${a}">${ACOES[a] || a}</option>`).join('');
    selA.value = atualA;
    renderHistorico();
  } catch (e){
    console.error(e);
    $('#listaLog').innerHTML = '<p class="muted">Não foi possível carregar o histórico. Confirme se as regras do Firestore (coleção <b>atividades</b>) foram publicadas.</p>';
  }
}
function renderHistorico(){
  const fA = $('#logFiltroAdmin').value, fAc = $('#logFiltroAcao').value;
  const lista = LOGS.filter(l => (!fA || l.email === fA) && (!fAc || l.acao === fAc));
  $('#logContador').textContent = `${lista.length} registro(s).`;
  const box = $('#listaLog'); box.innerHTML = '';
  lista.forEach(l => {
    const label = ACOES[l.acao] || l.acao;
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `<div class="log-dot">${(l.email || '?')[0].toUpperCase()}</div>
      <div class="m"><div class="ac">${label}${l.descricao ? ` <span class="muted" style="font-weight:400">— ${l.descricao}</span>` : ''}</div>
        <div class="ds">${l.email || '—'} <span class="badge ${l.role}" style="font-size:9px">${l.role === 'dev' ? 'DEV' : 'ADM'}</span></div></div>
      <div class="qd">${dataHoraBR(l.quando)}</div>`;
    box.appendChild(div);
  });
  if (!lista.length) box.innerHTML = '<p class="muted">Nenhum registro.</p>';
}
$('#logFiltroAdmin').addEventListener('change', renderHistorico);
$('#logFiltroAcao').addEventListener('change', renderHistorico);
$('#btnAtualizarLog').addEventListener('click', () => comCarregamento($('#btnAtualizarLog'), carregarHistorico));
