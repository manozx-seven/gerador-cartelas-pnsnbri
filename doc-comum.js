/* Base comum dos documentos da Murylo Dev (papel timbrado, helpers de texto
   e formatação). Usado por gerar-certificado.js e gerar-recibo.js.

   Reaproveita o pdf-lib que já vem no projeto (site/libs/pdf-lib.min.js) —
   o mesmo que o app usa para gerar as cartelas. Nada instalado.

   Atenção: as fontes padrão do PDF usam WinAnsi, que NÃO tem travessão (—).
   Acentos do português funcionam; travessão some sem dar erro. Use hífen. */
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require(path.join(__dirname, 'site/libs/pdf-lib.min.js'));

const CORES = {
  AZUL:   rgb(0.11, 0.28, 0.77),
  AZUL_E: rgb(0.13, 0.20, 0.35),
  TINTA:  rgb(0.13, 0.20, 0.35),
  CINZA:  rgb(0.42, 0.47, 0.60),
  OURO:   rgb(0.94, 0.66, 0.12),
  VERDE:  rgb(0.12, 0.55, 0.33),
  LINHA:  rgb(0.82, 0.86, 0.94),
  FUNDO:  rgb(0.965, 0.977, 0.996),
  DIVISA: rgb(0.89, 0.92, 0.97)
};

const MARCA     = 'MURYLO DEV';
const MARCA_SUB = 'SOLUÇÕES DIGITAIS';

/* ===================== datas ===================== */
/* 'DD/MM/AAAA' -> {d,m,a}. Valida de verdade (31/02 não passa). */
function lerData(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim());
  if (!m) throw new Error('Data inválida: "' + s + '". Use o formato DD/MM/AAAA.');
  const d = +m[1], mes = +m[2], a = +m[3];
  const dt = new Date(Date.UTC(a, mes - 1, d));
  if (dt.getUTCDate() !== d || dt.getUTCMonth() !== mes - 1 || dt.getUTCFullYear() !== a)
    throw new Error('Data inexistente: "' + s + '".');
  return dt;
}
const escreverData = dt => String(dt.getUTCDate()).padStart(2, '0') + '/' +
                           String(dt.getUTCMonth() + 1).padStart(2, '0') + '/' +
                           dt.getUTCFullYear();
/* Soma meses preservando o dia; se o dia não existir no mês destino, cai no
   último dia dele (31/08 + 6 meses = 28/02, e não 03/03). */
function somarMeses(dt, n) {
  const a = dt.getUTCFullYear(), m = dt.getUTCMonth(), d = dt.getUTCDate();
  const ultimo = new Date(Date.UTC(a, m + n + 1, 0)).getUTCDate();
  return new Date(Date.UTC(a, m + n, Math.min(d, ultimo)));
}
const somarDias = (dt, n) => new Date(dt.getTime() + n * 86400000);
/* Último dia coberto por uma vigência de `meses` que começa em `inicio`.
   Regra: véspera do mesmo dia N meses depois. Quando o mês destino é mais
   curto e o dia não existe (31/08 + 6 -> fevereiro), o período termina no
   último dia desse mês — sem descontar mais um dia, senão perderia 28/02. */
function fimVigencia(inicio, meses) {
  const bruto = somarMeses(inicio, meses);
  return bruto.getUTCDate() === inicio.getUTCDate() ? somarDias(bruto, -1) : bruto;
}

/* ===================== dinheiro ===================== */
const moeda = v => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const UNI = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
             'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CEN = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos',
             'setecentos', 'oitocentos', 'novecentos'];
function ate999(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100), r = n % 100, p = [];
  if (c) p.push(CEN[c]);
  if (r < 20) { if (r) p.push(UNI[r]); }
  else { const d = Math.floor(r / 10), u = r % 10; p.push(u ? DEZ[d] + ' e ' + UNI[u] : DEZ[d]); }
  return p.join(' e ');
}
function extensoInt(n) {
  if (n === 0) return 'zero';
  const mi = Math.floor(n / 1000000), mil = Math.floor((n % 1000000) / 1000), un = n % 1000, p = [];
  if (mi)  p.push(mi === 1 ? 'um milhão' : ate999(mi) + ' milhões');
  if (mil) p.push(mil === 1 ? 'mil' : ate999(mil) + ' mil');
  if (un)  p.push(ate999(un));
  if (p.length <= 1) return p.join('');
  /* "e" antes do último grupo quando ele é menor que 100 ou centena redonda;
     senão vírgula (dois mil e quatrocentos / mil, duzentos e trinta e quatro) */
  const usaE = un > 0 ? (un < 100 || un % 100 === 0) : true;
  return p.slice(0, -1).join(', ') + (usaE ? ' e ' : ', ') + p[p.length - 1];
}
function extensoReais(v) {
  const inteiro = Math.floor(v + 1e-9), cent = Math.round((v - inteiro) * 100), p = [];
  if (inteiro) {
    /* milhão/bilhão redondo pede "de reais": "um milhão DE reais" */
    const de = inteiro >= 1000000 && inteiro % 1000000 === 0 ? ' de' : '';
    p.push(extensoInt(inteiro) + de + (inteiro === 1 ? ' real' : ' reais'));
  }
  if (cent) p.push(extensoInt(cent) + (cent === 1 ? ' centavo' : ' centavos'));
  return p.length ? p.join(' e ') : 'zero real';
}

/* ===================== folha ===================== */
/* Abre um documento A4 já com o papel timbrado e devolve os helpers de
   desenho. `y` anda de cima para baixo conforme o chamador escreve. */
async function abrirFolha({ titulo, autor, assunto, emissao }) {
  const doc = await PDFDocument.create();
  doc.setTitle(titulo); doc.setAuthor(autor); doc.setSubject(assunto);

  const reg  = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const obl  = await doc.embedFont(StandardFonts.HelveticaOblique);

  const page = doc.addPage([595.28, 841.89]);
  const W = 595.28, H = 841.89, M = 54, LARG = W - M * 2, CORPO = 9.8;

  const txt = (t, x, yy, o = {}) => page.drawText(t, {
    x, y: yy, size: o.size || CORPO, font: o.font || reg, color: o.color || CORES.TINTA
  });
  const larguraDe = (t, o = {}) => (o.font || reg).widthOfTextAtSize(t, o.size || CORPO);
  const centro = (t, yy, o = {}) => txt(t, (W - larguraDe(t, o)) / 2, yy, o);
  const dir    = (t, yy, o = {}) => txt(t, W - M - larguraDe(t, o), yy, o);
  const regua = (yy, cor = CORES.LINHA, esp = 0.8, x0 = M, x1 = W - M) =>
    page.drawLine({ start: { x: x0, y: yy }, end: { x: x1, y: yy }, thickness: esp, color: cor });

  const quebrar = (t, f, s, larg) => {
    const out = [];
    t.split('\n').forEach(par => {
      let linha = '';
      par.split(' ').forEach(p => {
        const tent = linha ? linha + ' ' + p : p;
        if (f.widthOfTextAtSize(tent, s) > larg && linha) { out.push(linha); linha = p; }
        else linha = tent;
      });
      out.push(linha);
    });
    return out;
  };
  const paragrafo = (t, yy, o = {}) => {
    const f = o.font || reg, s = o.size || CORPO, lh = o.lh || 13.5;
    const x = o.x != null ? o.x : M, larg = o.larg || LARG;
    quebrar(t, f, s, larg).forEach(l => { txt(l, x, yy, { font: f, size: s, color: o.color }); yy -= lh; });
    return yy;
  };
  const item = (t, yy, cor = CORES.AZUL) => {
    const x = M + 4;
    page.drawRectangle({ x, y: yy + 2.4, width: 4.2, height: 4.2, color: cor });
    return paragrafo(t, yy, { x: x + 14, larg: LARG - 18, lh: 13 });
  };
  const lista = (arr, yy, cor) => { arr.forEach(t => { yy = item(t, yy, cor); yy -= 1.5; }); return yy; };
  const secao = (t, yy) => {
    txt(t.toUpperCase(), M, yy, { font: bold, size: 9.5, color: CORES.AZUL });
    regua(yy - 6.5, CORES.LINHA, 0.7);
    return yy - 18;
  };
  /* Caixa de dados: pares [rótulo, valor]. `destaque` = índices em negrito. */
  const caixaDados = (linhas, topo, destaque = []) => {
    const ALT = 20, ALTURA = linhas.length * ALT + 12;
    page.drawRectangle({ x: M, y: topo - ALTURA, width: LARG, height: ALTURA, color: CORES.FUNDO });
    page.drawRectangle({ x: M, y: topo - ALTURA, width: 3.5, height: ALTURA, color: CORES.AZUL });
    let yl = topo - 19;
    linhas.forEach(([r, v], i) => {
      txt(r.toUpperCase(), M + 19, yl, { font: bold, size: 7.4, color: CORES.CINZA });
      txt(v, M + 162, yl, { font: destaque.includes(i) ? bold : reg });
      if (i < linhas.length - 1) regua(yl - 6.8, CORES.DIVISA, 0.6, M + 19, W - M - 19);
      yl -= ALT;
    });
    return topo - ALTURA;
  };
  /* Linha de valor: descrição à esquerda, valor alinhado à direita. */
  const linhaValor = (desc, valor, yy, o = {}) => {
    const f = o.font || reg;
    txt(desc, M + 18, yy, { font: f });
    dir(valor, yy, { font: f });
    return yy - (o.lh || 17);
  };

  /* ---------- papel timbrado ---------- */
  page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: CORES.AZUL });
  let y = H - M - 22;
  txt(MARCA, M, y, { font: bold, size: 21, color: CORES.AZUL_E });
  y -= 15;
  txt(MARCA_SUB.split('').join(' '), M, y, { size: 7.6, color: CORES.CINZA });
  if (emissao) dir('Documento emitido em ' + emissao, y, { size: 8.5, color: CORES.CINZA });

  /* Título centralizado com o filete dourado embaixo. */
  const tituloPrincipal = (t, yy) => {
    centro(t.toUpperCase(), yy, { font: bold, size: 22, color: CORES.AZUL_E });
    regua(yy - 14, CORES.OURO, 2.2, (W - 74) / 2, (W + 74) / 2);
    return yy - 14;
  };

  /* Rodapé: contatos à esquerda, faixa dourada no pé e nota em itálico.
     Sem espaço de assinatura (decisão de padrão dos documentos).
     Devolve o Y-teto do rodapé, para o chamador conferir se o corpo invadiu. */
  const RODAPE_TOPO = 120;
  const rodape = ({ whatsapp, email, nota, rotulo }) => {
    const RY = 76;
    regua(RODAPE_TOPO, CORES.LINHA, 0.8);
    txt((rotulo || 'CONTATO').toUpperCase(), M, RY + 30, { font: bold, size: 7.4, color: CORES.CINZA });
    txt('WhatsApp: ' + whatsapp, M, RY + 14);
    txt('E-mail: ' + email, M, RY);
    /* a nota é centralizada: se não couber na largura útil, quebra em linhas
       em vez de vazar pelas margens */
    if (nota) {
      const ln = quebrar(nota, obl, 8.5, LARG);
      let yn = 54 + (ln.length - 1) * 10;
      ln.forEach(l => { centro(l, yn, { font: obl, size: 8.5, color: CORES.CINZA }); yn -= 10; });
    }
    page.drawRectangle({ x: 0, y: 0, width: W, height: 5, color: CORES.OURO });
    return RODAPE_TOPO;
  };
  /* Aborta se o corpo desceu por cima do rodapé, em vez de emitir um PDF
     com texto sobreposto. */
  const conferirEspaco = (yFinal) => {
    const fim = yFinal + 13.5;
    if (fim < RODAPE_TOPO) {
      console.error('ATENÇÃO: o corpo invadiu o rodapé (corpo em ' + fim.toFixed(0) +
                    ', rodapé em ' + RODAPE_TOPO + '). Encurte algum item e rode de novo.');
      process.exit(1);
    }
    console.log('Corpo termina em y=' + fim.toFixed(0) + ' | rodapé em y=' + RODAPE_TOPO +
                ' | folga de ' + (fim - RODAPE_TOPO).toFixed(0) + 'pt');
  };

  return { doc, page, W, H, M, LARG, CORPO, fontes: { reg, bold, obl }, y,
           txt, centro, dir, regua, paragrafo, item, lista, secao,
           caixaDados, linhaValor, tituloPrincipal, rodape, conferirEspaco };
}

module.exports = { CORES, MARCA, MARCA_SUB, abrirFolha, lerData, escreverData,
                   somarMeses, somarDias, fimVigencia, moeda, extensoReais, extensoInt };
