/* Recibo de Pagamento (PDF).

   Uso:
     node gerar-recibo.js                          usa DADOS.pagamento abaixo
     node gerar-recibo.js 05/09/2026               informa a data na hora
     node gerar-recibo.js 05/09/2026 saida.pdf     escolhe o arquivo de saída

   A data do pagamento NÃO é a data de hoje: ou vem preenchida em
   DADOS.pagamento, ou vem pelo argumento. Sem ela o script não emite nada.

   A vigência da hospedagem é calculada a partir da data do pagamento:
   plano 'semestral' cobre 6 meses; plano 'mensal' cobre 1 mês.

   Para reaproveitar numa venda futura, altere só o bloco DADOS. */
const fs = require('fs');
const path = require('path');
const { CORES, abrirFolha, lerData, escreverData, fimVigencia, moeda, extensoReais }
  = require('./doc-comum.js');

/* ============================ DADOS ============================ */
const D = {
  cliente:   'Paróquia Nossa Senhora de Nazaré (Beruri/AM)',
  sistema:   'Sistema Gerador de Cartelas de Bingo',

  /* Data do pagamento, no formato DD/MM/AAAA.
     Deixe null para ser obrigado a informar pelo argumento da linha de
     comando — evita emitir recibo com data errada por descuido. */
  pagamento: null,

  /* Discriminação do valor. O total é conferido: se aquisicao + manutencao
     não fechar com total, o script aborta em vez de emitir recibo errado. */
  total:     2400.00,
  aquisicao: 2000.00,
  manutencao: 400.00,
  plano:     'semestral',        // 'semestral' (6 meses) ou 'mensal' (1 mês)

  local:     'Manaus/AM',
  whatsapp:  '(92) 99286-6146',
  email:     'murylo.neves@gmail.com'
};

const PLANOS = {
  semestral: { meses: 6, rotulo: 'semestral', porExtenso: '6 (seis) meses' },
  mensal:    { meses: 1, rotulo: 'mensal',    porExtenso: '1 (um) mês' }
};

(async () => {
  /* ---------- validação dos parâmetros ---------- */
  const dataArg = process.argv[2] || D.pagamento;
  if (!dataArg) {
    console.error('Informe a data do pagamento (DD/MM/AAAA).\n' +
                  '  node gerar-recibo.js 05/09/2026\n' +
                  'Ou preencha DADOS.pagamento no topo do arquivo.');
    process.exit(1);
  }
  const plano = PLANOS[D.plano];
  if (!plano) { console.error('Plano inválido: "' + D.plano + '". Use "semestral" ou "mensal".'); process.exit(1); }

  const soma = +(D.aquisicao + D.manutencao).toFixed(2);
  if (soma !== +D.total.toFixed(2)) {
    console.error('Discriminação não fecha: aquisição ' + moeda(D.aquisicao) + ' + manutenção ' +
                  moeda(D.manutencao) + ' = ' + moeda(soma) + ', mas o total informado é ' +
                  moeda(D.total) + '. Corrija antes de emitir.');
    process.exit(1);
  }

  const pago  = lerData(dataArg);
  const inicio = escreverData(pago);
  const fim    = escreverData(fimVigencia(pago, plano.meses));

  /* ---------- documento ---------- */
  const F = await abrirFolha({
    titulo:  'Recibo de Pagamento — ' + D.sistema,
    autor:   'Murylo Dev — Soluções Digitais',
    assunto: 'Recibo de ' + moeda(D.total) + ' referente ao ' + D.sistema,
    emissao: D.local + ', ' + inicio
  });
  const { bold } = F.fontes;

  let y = F.tituloPrincipal('Recibo de Pagamento', F.y - 44);

  y = F.caixaDados([
    ['Cliente',              D.cliente],
    ['Sistema',              D.sistema],
    ['Data do pagamento',    inicio],
    ['Valor total recebido', moeda(D.total)]
  ], y - 30, [0, 1, 3]) - 24;

  /* declaração de recebimento */
  y = F.paragrafo('Recebi de ' + D.cliente + ' a importância de ' + moeda(D.total) +
                  ' (' + extensoReais(D.total) + '), referente ao ' + D.sistema +
                  ', conforme a discriminação abaixo.', y) - 12;

  /* ---------- discriminação ---------- */
  y = F.secao('Discriminação do valor', y);
  y = F.linhaValor('Aquisição do sistema (licença de uso)', moeda(D.aquisicao), y);
  y = F.linhaValor('Manutenção e hospedagem - plano ' + plano.rotulo, moeda(D.manutencao), y);
  F.regua(y + 6, CORES.DIVISA, 0.7, F.M + 18);
  y = F.linhaValor('TOTAL RECEBIDO', moeda(D.total), y - 4, { font: bold });

  /* ---------- vigência ---------- */
  y = F.secao('Vigência da hospedagem coberta por este pagamento', y - 8);
  y = F.caixaDados([
    ['Plano contratado', 'Manutenção e hospedagem - ' + plano.rotulo + ' (' + plano.porExtenso + ')'],
    ['Período coberto',  'de ' + inicio + ' a ' + fim]
  ], y + 4, [1]) - 20;

  y = F.paragrafo('Ao fim da vigência, em ' + fim + ', é necessário renovar para manter o ' +
                  'sistema no ar: contratando novamente o plano semestral ou passando a pagar ' +
                  'a manutenção mês a mês.', y, { font: bold });

  F.rodape({
    rotulo: 'Contato',
    whatsapp: D.whatsapp, email: D.email,
    nota: 'Recibo referente ao ' + D.sistema + '. Hospedagem coberta de ' + inicio + ' a ' + fim + '.'
  });
  F.conferirEspaco(y);

  const saida = process.argv[3] || path.join(__dirname, 'RECIBO-PAGAMENTO.pdf');
  fs.writeFileSync(saida, await F.doc.save());
  console.log('OK -> ' + saida);
})().catch(e => { console.error('FALHOU:', e.message); process.exit(1); });
