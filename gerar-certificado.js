/* Certificado de Garantia (PDF).
   Uso:  node gerar-certificado.js
   Saída: CERTIFICADO-GARANTIA.pdf na raiz do projeto.

   O papel timbrado e os helpers ficam em doc-comum.js (compartilhados com o
   recibo). Para emitir um novo certificado, altere só o bloco DADOS. */
const fs = require('fs');
const path = require('path');
const { CORES, abrirFolha } = require('./doc-comum.js');

/* ============================ DADOS ============================ */
const D = {
  cliente:    'Paróquia Nossa Senhora de Nazaré (Beruri/AM)',
  sistema:    'Sistema Gerador de Cartelas de Bingo',
  entrega:    '01/09/2026',
  fim:        '01/10/2026',
  prazo:      '30 (trinta) dias corridos',
  local:      'Manaus/AM',
  responsavel:'Murylo Neves - Murylo Dev',
  whatsapp:   '(92) 99286-6146',
  email:      'murylo.neves@gmail.com'
};

/* Verificações de segurança feitas ANTES da entrega.
   REGRA: só entra aqui o que foi realmente testado e está registrado no
   ATUALIZACOES.md. Não incluir item por existir no código — existir não é
   o mesmo que ter sido testado. Fonte de cada item abaixo:
     1 e 2 -> ponto de parada de 16/07/2026: "publicado e testado no celular
              (login, ..., painel de administradores, histórico,
              presença/tempo real ... tudo OK)".
     3     -> mesma entrada (histórico OK) + regras do Firestore publicadas
              com `allow update: if false` na coleção `atividades`.
   NÃO incluído: expiração de sessão por inatividade (1h). O recurso existe
   em session.js, mas não há registro de teste — e ele não aparece na lista
   do "tudo OK" de 16/07. */
const SEGURANCA = [
  'Autenticação e painel de administradores testados no sistema publicado, ' +
  'incluindo login, criação e remoção de administradores.',

  'Desconexão imediata do administrador que tem o acesso removido ou a senha ' +
  'redefinida por outro administrador, com aviso do motivo na tela de login.',

  'Registro de auditoria das ações (autor, ação e data/hora), com alteração ' +
  'de registros bloqueada pelas regras de segurança publicadas no servidor.'
];

const COBRE = [
  'Falhas que impeçam o uso normal do sistema ou de qualquer de suas funções.',
  'Erros na geração das cartelas, na numeração ou no sorteio dos números.',
  'Problemas de acesso, login ou controle de administradores.',
  'Falhas de exibição que comprometam o uso em computador, tablet ou celular.',
  'Correções necessárias para que o sistema volte a funcionar conforme entregue.'
];

const NAO_COBRE = [
  'Mudanças de escopo em relação ao que foi contratado e entregue.',
  'Novas funcionalidades, novos modelos de cartela ou redesenho do sistema.',
  'Problemas causados por uso fora do previsto ou alteração por terceiros.',
  'Falhas de internet, de equipamento do cliente ou de serviços externos.'
];

(async () => {
  const F = await abrirFolha({
    titulo:  'Certificado de Garantia — ' + D.sistema,
    autor:   'Murylo Dev — Soluções Digitais',
    assunto: 'Certificado de garantia de ' + D.prazo,
    emissao: D.local + ', ' + D.entrega
  });

  let y = F.tituloPrincipal('Certificado de Garantia', F.y - 44);

  y = F.caixaDados([
    ['Cliente',             D.cliente],
    ['Sistema',             D.sistema],
    ['Data de entrega',     D.entrega],
    ['Prazo de garantia',   D.prazo],
    ['Vigência',            'de ' + D.entrega + ' a ' + D.fim],
    ['Responsável técnico', D.responsavel]
  ], y - 30, [0, 1, 3]) - 22;

  y = F.secao('O que a garantia cobre', y);
  y = F.paragrafo('Durante a vigência, a correção dos defeitos abaixo é feita sem custo ' +
                  'adicional para o cliente:', y) - 4;
  y = F.lista(COBRE, y, CORES.AZUL);

  y = F.secao('Testes de segurança realizados antes da entrega', y - 10);
  y = F.paragrafo('Antes da publicação, o sistema de login e controle de acesso passou pelas ' +
                  'seguintes verificações:', y) - 4;
  y = F.lista(SEGURANCA, y, CORES.VERDE);

  y = F.secao('O que a garantia não cobre', y - 10);
  y = F.paragrafo('Os itens abaixo não são defeitos e, se solicitados, são orçados ' +
                  'separadamente:', y) - 4;
  y = F.lista(NAO_COBRE, y, CORES.OURO);

  y = F.paragrafo('Para acionar a garantia, comunique o problema pelos contatos do rodapé, ' +
                  'descrevendo o que aconteceu.', y - 12, { font: F.fontes.bold });

  F.rodape({
    rotulo: 'Contato para acionar a garantia',
    whatsapp: D.whatsapp, email: D.email,
    nota: 'Este certificado é parte integrante da entrega do ' + D.sistema +
          ' e tem validade de ' + D.entrega + ' a ' + D.fim + '.'
  });
  F.conferirEspaco(y);

  const saida = path.join(__dirname, 'CERTIFICADO-GARANTIA.pdf');
  fs.writeFileSync(saida, await F.doc.save());
  console.log('OK -> ' + saida);
})().catch(e => { console.error('FALHOU:', e.message); process.exit(1); });
