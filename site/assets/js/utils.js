// Utilitários compartilhados (sem dependências externas).

// ---- Toast ----
export function toast(msg, tipo = 'info', ms = 4000){
  let wrap = document.getElementById('toastWrap');
  if (!wrap){ wrap = document.createElement('div'); wrap.id = 'toastWrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, ms);
}

// ---- Botão com estado de carregamento (bloqueia clique duplo) ----
export async function comCarregamento(btn, fn){
  if (!btn || btn.dataset.busy === '1') return;
  btn.dataset.busy = '1';
  const original = btn.innerHTML;
  btn.style.minWidth = btn.offsetWidth + 'px';
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Aguarde…';
  try { return await fn(); }
  finally { btn.dataset.busy = ''; btn.disabled = false; btn.innerHTML = original; btn.style.minWidth = ''; }
}

// ---- Olho para mostrar/ocultar senha ----
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 7 11 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.1 6.1A13.3 13.3 0 0 0 1 12s4 7 11 7a9.1 9.1 0 0 0 5.9-2.1"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
export function olhoSenha(input){
  if (!input || input.dataset.eye === '1') return;
  input.dataset.eye = '1';
  const wrap = document.createElement('span'); wrap.className = 'pw-wrap';
  input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pw-toggle'; btn.tabIndex = -1;
  btn.innerHTML = EYE; wrap.appendChild(btn);
  btn.addEventListener('click', () => {
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    btn.innerHTML = mostrar ? EYE_OFF : EYE;
  });
}
export function olhoSenhaEm(...inputs){ inputs.forEach(olhoSenha); }

// ---- Regras de senha forte ----
export const REGRAS_SENHA = [
  { id: 'len',  txt: 'Pelo menos 8 caracteres',         teste: s => s.length >= 8 },
  { id: 'maiu', txt: 'Uma letra maiúscula (A–Z)',        teste: s => /[A-Z]/.test(s) },
  { id: 'minu', txt: 'Uma letra minúscula (a–z)',        teste: s => /[a-z]/.test(s) },
  { id: 'num',  txt: 'Um número (0–9)',                  teste: s => /[0-9]/.test(s) },
  { id: 'esp',  txt: 'Um caractere especial (!@#$%&*…)', teste: s => /[^A-Za-z0-9]/.test(s) }
];
export function validarSenhaForte(senha){
  const s = senha || '';
  const faltas = REGRAS_SENHA.filter(r => !r.teste(s));
  return { ok: faltas.length === 0, faltas };
}

// ---- Datas (aceita Timestamp do Firestore, {seconds}, número ou string) ----
export function paraData(v){
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v.seconds === 'number') return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
export function dataHoraBR(v){
  const d = paraData(v);
  if (!d) return '—';
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
export function tempoRelativo(v){
  const d = paraData(v);
  if (!d) return '';
  const seg = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seg < 60) return 'há poucos segundos';
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  return `há ${dias} dia${dias > 1 ? 's' : ''}`;
}
// Ativo nos últimos N minutos?
export function estaOnline(v, minutos = 2){
  const d = paraData(v);
  return d ? (Date.now() - d.getTime()) < minutos * 60000 : false;
}
