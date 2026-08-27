# ATUALIZAÇÕES — Sistema de Cartelas de Bingo

> **Registro de TODAS as mudanças, decisões e modificações do projeto.**
> Toda vez que algo mudar (arquivo criado/alterado/removido, decisão tomada,
> bug corrigido, ideia nova), registrar aqui uma nova entrada no topo da lista.
>
> Formato de cada entrada: `## AAAA-MM-DD — Título curto` seguido do que mudou e
> por quê.

---

## 2026-08-27 — Prévia que não fica re-sorteando + numeração independente por cartela

Dois ajustes pedidos logo depois da entrega da mesma data, nos **dois modos**.

- **A prévia parou de mudar os números a cada mexida.** A correção anterior deixou a prévia
  ligada, mas **re-sorteando a cada mudança** — mexer na fonte, no tamanho ou na posição do
  número embaralhava tudo de novo e ficava estranho de acompanhar.
  - Agora só re-sorteia quem **realmente invalida os números**: faixa (Nº inicial/final),
    modo de sorteio, grupo (quando o modo é "por grupo") e linhas/colunas.
  - **Estilo apenas redesenha os mesmos números:** fonte, tamanho dos números, cabeçalho,
    grade, cantos, prefixo, nº inicial, posição e tamanho da numeração, quantidade de folhas,
    mover e redimensionar a cartela. `syncStyle`/`bSyncStyle` deixaram de chamar o re-sorteio.
  - **Centro livre virou um retoque, não um sorteio:** `adaptPreviewFor()` / `bAdaptPreviewFor()`
    reaproveitam o `adaptGrid()` para só **acender ou apagar a casa do meio daquela cartela** —
    as outras cartelas e as outras colunas ficam intactas.
  - **Cartela nova não mexe nas antigas:** `fillPreviewGaps()` / `bFillPreviewGaps()` dão números
    só a quem ainda não tem, herdando do bilhete certo conforme o modo.
  - **Desfazer/refazer (modo A4):** `bPreviewStale()` checa se a grade guardada ainda bate com o
    elemento (tamanho e centro). Só re-sorteia se não bater — desfazer uma troca de fonte não
    embaralha mais nada.
- **Estilo da numeração virou POR CARTELA.** Antes, mudar posição/tamanho no passo 4 mexia em
  todas ao mesmo tempo.
  - `c.idPos` e `c.idScale` agora são de cada cartela, com os helpers **`idPosOf()`** e
    **`idScaleOf()`** (cartela sem a propriedade cai no padrão antigo: acima-esquerda, 42%).
  - Os controles **"Posição do número"** e **"Tamanho do número"** foram para o bloco de edição
    da cartela (passo 3), logo abaixo de "Numerar esta cartela", e só aparecem quando a
    numeração dela está ligada.
  - No passo 4 sobraram **prefixo** e **começar em**, que continuam da folha inteira porque a
    numeração é sequencial — com um aviso explicando isso.
  - **O modo A4 ganhou esses controles**, que lá não existiam (resolve a pendência registrada
    no `CONTEXTO.md`). `styleB.idPos`/`idScale` foram removidos.
  - Os botões de replicar viraram **"Aplicar estas opções a todas as cartelas"** e passaram a
    levar junto a posição e o tamanho da numeração.
- **Arquivo afetado:** `site/app.html`.
- **Testado no navegador com o PDF real do São Pedro:** **14 mudanças de estilo seguidas no
  modo A** (e 9 no A4, incluindo desfazer/refazer) com os números **byte a byte idênticos** do
  começo ao fim; as 3 mudanças estruturais re-sortearam como devem; ligar/desligar centro livre
  mexeu **só na coluna do meio daquela cartela** (ganhou exatamente 1 número, as outras cartelas
  intactas); cartela nova nasceu com números sem tocar nas antigas. **PDF gerado e lido de volta
  com pdf.js:** 4 cartelas com posições e tamanhos diferentes de numeração, conferidos pela
  borda (encosta na esquerda / centralizado / encosta na direita, acima ou abaixo) e pela altura
  do texto (14,4 / 8,4 / 21,6 / 4pt) — o mesmo no A4 (21 / 12 / 5,4pt). Sem erros no console.

## 2026-08-27 — Centro livre por cartela, prévia que não some e numeração menor

Três pedidos do usuário, aplicados **nos dois modos** (Sobreposição e Construtor A4).

- **"Centro livre" saiu do passo 2 (Números) e virou opção DE CADA CARTELA**, no passo 3,
  logo **acima de "Desenhar grade"** — que é onde ficam as outras opções da cartela.
  - Deixou de ser `style.freeCenter` (global) e passou a ser a propriedade `free` de cada
    cartela, lida pelo helper **`freeOf(c)`** (`c.free!==false`, então cartela sem a
    propriedade continua com o centro livre — o padrão do bingo).
  - A **imagem do centro** some do painel quando a cartela está sem centro livre (não faria
    sentido escolher imagem para uma casa que vai ter número). Vale nos dois modos.
  - O botão de replicar agora leva o centro junto: **"Aplicar centro, grade, cabeçalho e
    cantos a todas"**.
  - **Sorteio ajustado para não quebrar o "mesmo bilhete":** em *todas iguais* e em *por
    grupo*, cartelas que só divergem no centro **reaproveitam a mesma grade** via a nova
    função `adaptGrid()` — quem tem centro livre apaga a casa do meio; quem não tem ganha
    **um** número a mais, sorteado dentro da faixa da coluna do meio e sem repetir. Antes
    isso teria virado um sorteio separado, ou seja, outro bilhete.
- **A prévia não se desliga mais sozinha.** Era a queixa central: ligar a prévia e mexer em
  qualquer configuração (centro livre, faixa, modo de sorteio) apagava os números e obrigava
  a clicar de novo.
  - `refreshPreview()` / `bRefreshPreview()` deixaram de zerar a prévia: agora **re-sorteiam
    por cima** e, se o sorteio falhar (faixa pequena demais enquanto a pessoa ainda digita),
    **mantêm os números que já estavam na tela**.
  - Todos os pontos que faziam `S.previewNums=null` / `B.preview=false` foram trocados por
    esse re-sorteio: faixa de números, modo de sorteio, centro livre, linhas/colunas, grupo,
    quantidade, e o desfazer/refazer do modo A4.
  - Como a prévia não se apaga mais por conta própria, **o botão virou liga/desliga**:
    "Prévia com números" ↔ **"Ocultar a prévia"**, com o botão afundado quando está ligada.
    Os dois botões (passo Gerar e painel da cartela) mostram sempre o mesmo estado.
- **Numeração das cartelas com tamanho ajustável:** novo controle **"Tamanho do número da
  cartela"** no passo 4 (Estilo), de 12% a 90% da altura de uma casa (`style.idScale`, padrão
  42% — exatamente o que era fixo antes). O piso do tamanho caiu de 8pt para 4pt, senão em
  cartela pequena não dava para diminuir de verdade.
- **Arquivo afetado:** `site/app.html`.
- **Testado:** sintaxe com `node --check`; **13 testes automatizados do sorteio** em Node
  (centro livre ligado/desligado, cartela sem a propriedade, 500 sorteios de "todas iguais"
  com centro misto, 500 do caso inverso, 300 por grupo, tamanhos diferentes de grade, faixa
  pequena demais e faixa exata 1–25). No navegador, com o **PDF real do São Pedro**: 15
  mudanças de configuração seguidas sem a prévia sumir, liga/desliga manual, e **PDF gerado
  de verdade e lido de volta com pdf.js** — cartela sem centro livre saiu com 25 números
  contendo todos os 24 das outras + 1 no meio, as duas com centro livre idênticas, nenhum
  repetido e tudo dentro da faixa. A numeração mediu **13pt no padrão e 4,64pt no mínimo**.

## 2026-08-09 — Proposta: prazo com datas concretas e entrega antecipada

- **§6 Prazo de desenvolvimento** virou uma tabela com datas fechadas: **início 10/08/2026**,
  **entrega final (prazo máximo) 04/09/2026**, **janela de 26 dias corridos** — dentro do limite
  de até 30 dias do contrato-padrão, então não houve conflito com a cláusula existente.
- Deixado explícito que **04/09 é o teto, não a data alvo**: o escopo já está definido e os
  fluxos de geração já foram levantados e testados com o modelo real do São Pedro, então a
  entrega pode vir antes.
- **Entrega antecipada não muda o valor.** No pagamento em 50% + 50%, o saldo continua vencendo
  **na entrega final aprovada** — na data prevista ou antes — sem cobrança adicional pela
  antecipação. Registrado em **§4 Valores**, em **§6** e na lista de **§7 Dados para o contrato**
  (novo item "Entrega antecipada").
- Cabeçalho da proposta atualizado de "julho de 2026" para **"agosto de 2026"**.
- ⚠️ **Datas corrigidas com o usuário antes de escrever:** ele pediu "de amanhã (09/08/2026) até
  04/06/2026", mas 09/08 era o próprio dia e 04/06/2026 já tinha passado. Confirmado:
  **10/08/2026 → 04/09/2026**.
- **Arquivos afetados:** `PROPOSTA.md` (fonte editável), `PROPOSTA.html` e `PROPOSTA.pdf`.
- **PDF regerado** com Chrome headless (`--print-to-pdf --no-pdf-header-footer`) a partir do
  `.html`, e **conferido extraindo o texto do PDF com pdf.js**: 5 páginas, com 10/08/2026,
  04/09/2026, "26 dias corridos", "Entrega antecipada" e "agosto de 2026" presentes, e sem
  nenhum resquício de "julho de 2026".

## 2026-08-09 — Campo para escolher o nome do arquivo gerado

- Novo campo **Nome do arquivo** no passo **Gerar** dos dois modos (`cfgFileName` na
  sobreposição, `bFileName` no construtor A4), logo abaixo da quantidade de folhas. Antes o
  PDF saía sempre como `cartelas-bingo.pdf` / `modelo-bingo.pdf`.
- Função `nomeArquivo(campo,padrao)` trata o que o usuário digitar: remove os caracteres que
  Windows/Mac não aceitam (`\ / : * ? " < > |` e caracteres de controle), colapsa espaços
  repetidos, tira ponto/espaço no fim, corta em 80 caracteres, acrescenta o `.pdf` sozinho
  (sem duplicar se a pessoa já digitou) e volta ao nome padrão se o campo ficar vazio.
- A mensagem de "Pronto!" agora mostra o nome real do arquivo baixado.
- **Arquivo afetado:** `site/app.html`.
- **Testado no navegador:** os 9 casos da limpeza do nome (vazio, só espaços, com `.pdf`,
  `.PDF` maiúsculo, caracteres proibidos, espaços repetidos, terminando em ponto, 120
  caracteres) e a geração de verdade nos dois modos — modo A baixou
  `Bingão São Pedro 2026.pdf`, modo B caiu no padrão com o campo vazio e virou
  `cartelasrodada 1.pdf` quando digitada uma barra.

## 2026-08-09 — "Quantidade de folhas a gerar" movida para o passo Gerar

- O campo **Quantidade de folhas a gerar** saiu do passo **Números** e foi para o passo
  **Gerar**, logo acima da Prévia e do botão de gerar o PDF — é a decisão que se toma na hora
  de imprimir, não na configuração inicial. Vale nos dois modos (`cfgQty` no passo 5 da
  sobreposição e `bQty` no passo 4 do construtor A4).
- A dica do passo Gerar passou a dizer só que a faixa de números e o modo de sorteio ficam no
  passo 2.
- **Arquivo afetado:** `site/app.html` (só HTML — os ids não mudaram, `syncStyle`/`bSyncStyle`
  continuam lendo os mesmos campos).
- **Testado no navegador:** os campos continuam alimentando `style.quantity`/`styleB.quantity`
  e a geração com o PDF real do São Pedro saiu com o número certo de folhas (3 pedidas,
  3 páginas no PDF).

## 2026-08-09 — Cantos arredondados, seleção múltipla, prévia por cartela e passos reordenados

Cinco melhorias pedidas pelo usuário, aplicadas **nos dois modos** (Sobreposição e Construtor A4).

- **Cantos arredondados nas cartelas** (`c.corner`, 0–100% por cartela, slider no editor):
  - Motor de desenho ganhou o op **`rrect`** e a função `rrSegs()`, que gera o retângulo
    arredondado como segmentos (curvas de Bézier, kappa 0.5523) numa única fonte de verdade —
    o mesmo caminho alimenta a prévia no canvas (`bezierCurveTo`) e o PDF (`page.drawSvgPath`).
  - Com cantos ligados, a moldura externa vira um `rrect` e só as **linhas internas** da grade
    continuam retas. O raio é limitado a ¼ do lado menor **e** ao tamanho de uma célula, então
    as linhas internas nunca escapam da borda.
  - Cabeçalho BINGO: arredonda só os **cantos de cima** e a grade só os **de baixo**, formando
    um cartão redondo único quando os dois estão ligados.
  - "Aplicar grade + cabeçalho a todas" agora aplica **também os cantos** (renomeado). O modo A4
    ganhou esse botão, que só existia no modo sobreposição.
- **Seleção múltipla com mover/redimensionar em grupo:** `S.selIds` / `B.selIds`.
  **Ctrl (ou Shift) + clique** na folha ou na lista adiciona/remove da seleção; **Ctrl+A** e o
  botão "Selecionar todas/todos" pegam tudo. Com 2+ selecionados aparece uma **caixa tracejada
  dourada** com 8 alças: arrastar move tudo junto, puxar as alças escala tudo junto preservando
  o espaçamento relativo (no A4 o **tamanho do texto acompanha** a escala). Arrastar uma peça da
  seleção move o grupo; soltar sem mover volta à seleção simples. Setas movem todos os
  selecionados, Del apaga todos, Duplicar duplica todos.
- **Prévia dentro do editor de cada cartela** (`#previewSel` / `#bPreviewSel`) — não precisa mais
  rolar até o fim do painel. Além disso, com a prévia ligada, **cartela nova já nasce com números
  de exemplo** (`refreshPreview()` / `bRefreshPreview()`), que era a queixa original.
- **Passos reordenados** — a configuração de números subiu para o começo e a geração ficou no fim:
  - Sobreposição: 1 Folha base · **2 Números** · 3 Cartelas · 4 Estilo · **5 Gerar**
  - Construtor A4: 1 Folha A4 · **2 Números** · 3 Elementos · **4 Gerar**
  - A faixa (Nº inicial/final) e o "Centro livre" saíram do Estilo e foram para o passo 2, junto
    com o modo de sorteio e a quantidade de folhas.
- **Explicação da faixa de números** nos dois modos: Nº inicial = menor número que pode sair,
  Nº final = maior, com o exemplo do bingo de 75 bolas e a divisão por coluna (B 1–15 … O 61–75).
- **Correção de tabela:** `selectCard`/`bSelect` agora redesenham o overlay — antes, selecionar
  pela lista não atualizava o destaque na folha.
- **Arquivo afetado:** `site/app.html`.
- **Testado no navegador** com o PDF real do São Pedro e com o modelo "Tradicional" do A4:
  cantos 0%/50%/100% com e sem cabeçalho (prévia e **PDF gerado de verdade**, conferido
  renderizando o PDF de volta com pdf.js — `drawSvgPath` sai só com contorno, sem preenchimento);
  selecionar tudo, mover e escalar o grupo (13 elementos, texto acompanhando); ctrl+clique
  adicionando e removendo; apagar seleção múltipla; desfazer/refazer; geração de PDF nos dois modos.

## 2026-08-09 — Painel de edição da cartela abre logo abaixo do card (modo Sobreposição)

- **Problema:** no modo **"Sobre a folha (PDF)"**, passo 2, a lista mostrava todos os cards
  (Cartela 1, Cartela 2, …) e só depois de todos aparecia o bloco de edição da cartela
  selecionada. Ficava longe do card clicado.
- **Correção:** `refreshList()` agora envolve cada card num wrapper e **insere o `#selPanel`
  dentro do wrapper da cartela selecionada** — o bloco de edição abre imediatamente abaixo do
  respectivo card. Mesmo padrão que o construtor A4 (`bRefresh`) já usava. Antes de limpar a
  lista, o painel é "estacionado" em `document.body` com `display:none`, para não ser destruído
  pelo `innerHTML=''` e preservar todos os listeners.
- CSS: a regra `#bList .item+.selcard{margin-top:8px}` passou a valer também para `#cardList`.
- **Arquivo afetado:** `site/app.html` (`refreshList()` e a regra de CSS).
- **Testado no navegador** com o PDF real do São Pedro: selecionar cartela 1/2/3, remover a
  selecionada (painel volta escondido para o `body`), reselecionar, alternar "Desenhar grade",
  editar altura e "Duplicar" — o painel acompanha sempre o card certo e os controles continuam
  funcionando após o reposicionamento.

## 2026-08-07 — PONTO DE PARADA — Consolidação do estado e das pendências (retomar em outro PC)

> **Nesta sessão não houve alteração de código.** Foi uma sessão de retomada: revisão do
> `CONTEXTO.md` + `ATUALIZACOES.md` e consolidação, num só lugar, de tudo que está pronto,
> tudo que foi decidido e tudo que ficou pendente. Última alteração real do projeto:
> **17/07/2026** (proposta comercial).

### Estado do repositório
- Branch **`main`**, working tree **limpo**, sincronizado com o GitHub no commit **`b5522fb`**.
- Repositório: https://github.com/manozx-seven/gerador-cartelas-pnsnbri
- Nada pendente para commitar antes desta entrada.

### O que já está PRONTO e no ar
- **Netlify:** publicado a partir da pasta `site/` (`netlify.toml`), deploy automático
  ligado ao GitHub. Domínio **`gerador-cartelas-pnsnbri.netlify.app`** autorizado no
  Firebase Auth.
- **Firebase:** projeto **`gerador-cartelas-pnsnbri`** (novo e isolado do Beruri), com
  Auth (e-mail/senha) + Firestore + **regras publicadas**. Chaves reais já commitadas em
  `site/assets/js/firebase.js` (normal e seguro para app web).
- **Login e administração** (paridade total com o projeto Paróquia Beruri): login na
  `index.html`, troca de senha obrigatória no 1º acesso (com botão "voltar"), tela de
  orientação de spam no "esqueci minha senha", reset de senha de outro admin, vínculo de
  conta já existente no Auth, papéis **DEV/ADM** (só DEV cria DEV), remoção de admin,
  **presença online em tempo real**, **histórico/auditoria** (`atividades`) e **expiração
  de sessão após 1h de inatividade**.
- **App (`site/app.html`)** com os dois modos: **sobreposição** sobre o PDF da paróquia e
  **construtor A4** no sistema (estruturas prontas, elementos livres, desfazer/refazer,
  fundos, imagem e numeração por cartela, geração de N folhas em PDF).
- **Responsividade total** (celular/tablet/computador) e **teste real no celular OK**.
- **Proposta comercial** pronta e versionada: `PROPOSTA.md` (fonte editável),
  `PROPOSTA.html` e `PROPOSTA.pdf`, alinhada ao contrato-padrão da Murylo Dev.

### Decisões tomadas (consolidado — continuam valendo)
1. **Modelo do bingo:** 1 bilhete = 5 rodadas, **mesmos 25 números** em todas; grade 5×5
   com **centro livre**; faixas B 1–15, I 16–30, N 31–45, G 46–60, O 61–75.
2. **Sem backend:** tudo roda no navegador (pdf.js, pdf-lib, jszip locais em `site/libs/`)
   — funciona offline, exceto o login.
3. **Saída em PDF primeiro** (Word e PNG/zip ficaram para depois).
4. **Modo dos números escolhível na tela:** todas iguais / independentes / por grupo (rodada).
5. **Firebase em projeto novo e isolado** do Beruri, para não misturar regras e admins.
6. **Login virou a `index.html`** (não existe mais `login.html`) — acabou o "Redirecionando…".
7. **Só DEV pode criar DEV**; administrador comum só cria administrador comum.
8. **Design:** claymorphism em azul/dourado da logo da Paróquia Nossa Senhora de Nazaré,
   fontes Quicksand + Poppins **locais** (`site/fonts/`), **ícones SVG embutidos** — nada de
   CDN (lordicon foi descartado justamente por exigir internet).
9. **Proposta é versionada** (17/07): tirada do `.gitignore`. ⚠️ Os valores comerciais estão
   no **histórico do Git** — apagar o arquivo não os remove (exigiria `git filter-repo`).
10. **Valores da proposta:** R$ 2.500 de desenvolvimento + R$ 80/mês de manutenção; Pix
    (50%+50% ou à vista) ou cartão InfinityPay 2x–6x com taxas repassadas; prazo até 30 dias
    a partir da confirmação do pagamento; 7 dias de planejamento (Art. 49 CDC); 3 rodadas de
    revisão; garantia de 30 dias; foro de Manaus/AM.
11. **`.claude/` fica fora do repositório** (config local, incluindo o hook que lê o contexto
    ao abrir o terminal) — precisa ser recriado em cada máquina, se quiser o hook lá também.

### PENDÊNCIAS (o que retomar)
**Prioridade — validação com a paróquia**
1. **Testar o modo sobreposição com o PDF real do São Pedro impresso**: conferir o encaixe
   dos quadrados, o tamanho da fonte e o alinhamento no papel; ajustar conforme o resultado.
2. Colher o retorno da paróquia sobre o app publicado (e sobre a proposta).

**Funcionalidades pendentes**
3. Ao **remover um admin**, apagar também a conta no **Firebase Authentication** (hoje só
   pelo Console; exigiria Admin SDK / Cloud Function).
4. **"Limpar histórico"** (só DEV) direto no painel.
5. **Exportar/imprimir o histórico** de atividades.
6. **Exportar em Word e em PNG/zip** (o `jszip` já está baixado em `site/libs/`).
7. Possível **"snap" automático** dos quadrados aos espaços vazios do PDF.
8. Estender **desfazer/refazer** ao modo A (sobreposição) — hoje só existe no construtor A4.
9. Reintegrar a antiga aba "Modelo do sistema" (layout pronto) num app único, se ainda fizer
   sentido depois do construtor A4.

**Operacional**
10. Sempre que o `firestore.rules` mudar, **republicar as regras** no Console do Firebase.
11. Registrar toda decisão nova neste arquivo.

### Para continuar em outro computador
1. `git clone https://github.com/manozx-seven/gerador-cartelas-pnsnbri.git`
   (ou `git pull` se a pasta já existir).
2. Ler `CONTEXTO.md` e este `ATUALIZACOES.md` — dão o histórico completo.
3. Os arquivos da proposta (`PROPOSTA.md/.html/.pdf`) **já vêm no repositório**.
4. Só **não** vem o `.claude/` (config local do assistente).
5. Ao terminar, `git push`.

## 2026-07-17 — PONTO DE PARADA — Proposta alinhada ao contrato + PDF (retomar em casa)

- **O que foi feito nesta sessão:**
  - **`PROPOSTA.md` alinhada ao contrato** (`contrato.html` da pasta `Contratos Murylo Dev`,
    contrato-padrão da Murylo Dev — contratado: Murylo Neves, Manaus/AM). Ajustadas as seções:
    - **§4 Valores/Pagamento:** trocado o texto genérico pelas opções reais do contrato —
      **Pix com entrada (50% + 50%)**, Pix à vista e **cartão InfinityPay (2x a 6x, taxas
      repassadas)**; manutenção mensal **à vista, sem parcelamento**.
    - **§6 Prazo:** "a partir da confirmação do pagamento", com os **7 dias de planejamento**
      (Art. 49 CDC), **3 rodadas de revisão** e **garantia de 30 dias**.
    - **§7 Dados p/ contrato:** incluídos Contratado (Manaus/AM), pagamento detalhado,
      **prazo p/ pagar (3 dias após assinatura)**, revisões, garantia, manutenção à vista e
      **foro de Manaus/AM**. (Valores R$ 2.500 dev + R$ 80/mês mantidos — o contrato não os define.)
  - **Gerado `PROPOSTA.html`** (layout A4 estilizado) e **`PROPOSTA.pdf`** (via Chrome headless
    `--print-to-pdf`). Fonte editável = `.md`; para regerar o PDF, abrir o `.html` e imprimir.
- **Decisão importante:** a proposta **passou a ser versionada**. Removida a linha `PROPOSTA.md`
  do `.gitignore` (antes marcada como "documento comercial — não publicar"). Agora
  `PROPOSTA.md/.html/.pdf` estão no repositório. Commit `ba9a80d`, **pushado** para `main`.
  - ⚠️ **Atenção:** o conteúdo comercial (valores/pagamento) agora está no **histórico do Git**.
    Apagar o arquivo depois não o remove do histórico — precisaria reescrever (`git filter-repo`).
- **Para continuar em casa:** `git pull` na pasta do projeto → os 3 arquivos da proposta já vêm
  junto (não precisa mais copiar à parte). O `.claude/` continua fora do repo (config local).

## 2026-07-16 — PONTO DE PARADA (retomar em outro computador)

- **Estado:** sistema **funcional, publicado e testado no celular** (login, geração de
  cartelas nos dois modos, painel de administradores, histórico, presença/tempo real,
  responsividade — tudo OK). Repositório **sincronizado** com o GitHub (branch `main`,
  commit `8903d84`).
- **Repositório:** https://github.com/manozx-seven/gerador-cartelas-pnsnbri
- **Firebase:** projeto `gerador-cartelas-pnsnbri` configurado (Auth + Firestore + regras
  publicadas). Chaves já estão em `site/assets/js/firebase.js` (versionadas — normal e seguro).
- **Netlify:** conectado ao GitHub (deploy automático); domínio
  `gerador-cartelas-pnsnbri.netlify.app` autorizado no Firebase Auth.

**Para continuar em outro computador:**
1. `git clone https://github.com/manozx-seven/gerador-cartelas-pnsnbri.git`
2. Abrir a pasta e editar normalmente. `CONTEXTO.md` e `ATUALIZACOES.md` estão no repo
   (dão todo o histórico). Fazer `git pull` antes de começar e `git push` ao terminar.
3. **Atenção — o que NÃO está no repositório** (ficam só nesta máquina, por estarem no
   `.gitignore`): **`PROPOSTA.md`** (documento comercial) e **`.claude/`** (config local,
   incluindo o hook que lê o contexto ao abrir o terminal). Se quiser a proposta no outro PC,
   copie o arquivo à parte.

**Ideias/pendências futuras (registradas):**
- Ao remover um admin, apagar também a conta no Firebase Authentication (hoje exige o Console).
- Possível "limpar histórico" (só DEV) direto no painel.
- Exportar/imprimir o próprio histórico, se necessário.

## 2026-07-16 — Paridade total com o login de Beruri + site 100% responsivo

- **Login/painel idênticos ao projeto de Beruri (em funcionamento):**
  - **Tempo real:** `session.js` vigia o próprio doc (`onSnapshot`). Se outro admin **remove
    seu acesso** ou **reinicia sua senha** com você logado, você é **deslogado na hora** e o
    login mostra o aviso (`avisoLogin` via `sessionStorage`). Vale no app e no painel.
  - **Reiniciar senha de outro admin:** botão na lista (dev reinicia qualquer um; adm reinicia
    quem não é dev) — envia e-mail de redefinição + marca `mustChangePassword`. Ação `reset_senha`.
  - **Criar admin robusto:** se já existe conta de login com o e-mail (sobra do Auth), tenta
    entrar com a senha informada e **vincula** ao sistema (mensagem "Vinculou/Criou").
  - **Tela de spam** com os **4 passos** e o texto igual ao de Beruri.
- **Responsividade total:** breakpoints no `app.html` (header quebra, abas viram largura total,
  layout empilha viewer + painel, editor usável no toque) e no `ui.css` (login, topbar e painel
  adaptáveis). Funciona em celular/tablet/computador (editor mais preciso no computador).
- **Proposta (`PROPOSTA.md`, fora do git):** adicionada a responsividade (é responsivo, mas
  recomenda computador para precisão) e reescrita como **sistema a ser feito**, com prazo de
  **até 30 dias**.

## 2026-07-16 — Botão voltar no 1º acesso + expiração de sessão (1h inativo)

- **Tela "Crie sua nova senha" (1º acesso)** ganhou o botão **"Voltar à página inicial"**
  (`btnVoltarTroca`): faz `signOut` da sessão provisória e volta ao formulário de login.
- **Expiração por inatividade:** `session.js` desloga automaticamente após **1h sem
  atividade** (mouse/teclado/scroll/touch/click reiniciam o timer). Ao expirar, registra
  `logout` e volta ao login com `?expirado=1` (mostra aviso "Sua sessão expirou…").
- **Nota (dado, não código):** o 1º acesso só pede troca de senha se `mustChangePassword`
  for **boolean `true`** no doc `admins/{uid}`. O usuário recriou o DEV com esse campo
  correto e o fluxo passou a funcionar.

## 2026-07-16 — Histórico (auditoria), presença online, spam, favicon e redirect

Paridade com o projeto Paróquia Beruri (entrada de 16/07 lá) + ajustes pedidos:

- **Redirect resolvido:** o "Redirecionando…" sumiu — o **login virou a `index.html`**
  (login.html removido). Raiz do site abre direto no login, com URL limpa. Os redirects
  passaram a apontar para `./` (login) e `app.html`.
- **Favicon:** logo da paróquia (`logo-paroquia.jpeg`) como ícone da aba em index/app/admin.
- **Orientação de spam:** ao clicar em "Esqueci minha senha", abre uma tela (`#viewEsqueci`)
  mostrando o e-mail e orientando a checar **Spam/Lixo** e marcar "Não é spam".
- **Permissão restrita:** só **DEV** vê o seletor de papel e pode criar DEV; **Administrador
  comum só cria Administrador** (forçado no JS, `role = dev ? escolha : 'adm'`).
- **Histórico de atividades (auditoria):** nova coleção **`atividades`**; `session.js` com
  `registrarAtividade(acao, descricao)`. Ações: **login, logout, criar_admin, excluir_admin,
  alterar_senha, gerar_cartelas** (o app registra as gerações de PDF). Login registrado 1x
  por sessão (`sessionStorage`). Nova **aba "Histórico"** no painel: lista (até 300, recentes
  primeiro), filtros por administrador e por ação, botão Atualizar e contador.
- **Presença / último acesso:** campos `ultimoAcesso` e `ultimoAtivo` (heartbeat a cada 1 min
  + `visibilitychange`) nos docs de `admins`. A lista de admins mostra **"online agora"**
  (ativo nos últimos 2 min) ou **"último acesso: dd/mm/aaaa HH:MM (há X)"**.
- **Regras:** `firestore.rules` ganhou a coleção `atividades` (read p/ admin; create só do
  próprio uid; update proibido; delete só DEV). **Precisa republicar as regras no Console.**
- Novos helpers em `utils.js` (`paraData`, `dataHoraBR`, `tempoRelativo`, `estaOnline`) e
  módulo **`session.js`** (presença + auditoria), usado por `app-guard.js` e `admin.js`.

## 2026-07-16 — Login (Firebase) + estrutura para publicar no Netlify

- **Reestruturado para deploy:** criada a pasta **`site/`** (publicada pelo Netlify via
  `netlify.toml`). O app virou **`site/app.html`** (o antigo `bingo-sobreposicao.html` da
  raiz foi movido/renomeado; removidas as duplicatas de `libs/`, `fonts/`, `logo` da raiz).
- **Login restrito a administradores**, na **mesma dinâmica do projeto Paróquia Beruri**
  (Firebase Auth e-mail/senha + Firestore, coleção `admins` com `role` dev/adm e
  `mustChangePassword`):
  - `site/login.html` + `login.js` (entra, confere admin, força troca de senha no 1º acesso).
  - `site/app.html` protegido por `app-guard.js` (overlay de carregamento; redireciona p/
    login se não autorizado). Barra no topo com usuário, badge DEV/ADM, botão **Admins** e **Sair**.
  - `site/admin.html` + `admin.js`: adicionar admin (via app secundário, sem deslogar),
    remover (dev remove qualquer um; adm só remove `adm`) e trocar a própria senha.
  - `site/assets/js/firebase.js` (chaves com placeholders), `utils.js`, `assets/css/ui.css`.
  - `firestore.rules` (só a coleção `admins`; resto negado) e `SETUP-FIREBASE.md` (guia).
- **Decisão:** Firebase em **projeto novo, isolado** do Beruri (recomendado por mim, para
  não misturar regras/admins dos dois sistemas).
- **Entrega da publicação:** usuário vai criar o repositório no GitHub, configurar o Firebase
  pelo guia e conectar o Netlify ao GitHub. Deixei tudo pronto (`.gitignore`, `netlify.toml`).
- **Teste local:** `site/app.html` por `file://` abre sem login (módulos não rodam offline);
  no site publicado o login é obrigatório.

## 2026-07-16 — Construtor: painel inline, desfazer/refazer, fundos, estruturas renomeadas

- **Painel de edição inline:** ao selecionar um elemento na lista, os controles de edição
  abrem **logo abaixo do próprio item** (o painel `#bSel` é movido para dentro do item
  selecionado), em vez de aparecer no fim da lista.
- **Desfazer / Refazer:** histórico de estados (elementos + fundo + orientação) com botões
  na caixa Elementos e atalhos **Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z**. Também **Ctrl+D**
  (duplicar), **Ctrl+C / Ctrl+V** (copiar/colar elemento), **Del/Backspace** (remover),
  setas (mover). Commit no fim de cada ação (mover, redimensionar, editar campo, etc.).
- **Fundo da folha:** presets do sistema (branco, creme, azul, cinza, rosa, moldura
  dourada, moldura azul, festivo) + **imagem de fundo** personalizada + "remover fundo".
  Vale na prévia e no PDF.
- **Estruturas renomeadas e livres** (sem "São Pedro"/"Dia das Mães"): **Tradicional**
  (prêmios à esquerda + 1 cartela grande e 4 menores à direita — layout ajustado para bater
  com o modelo do PDF), **Quatro cantos**, **Cartela única**, **Em branco**. Cores puxadas
  para o azul da paróquia.
- **Observação:** o desfazer/refazer por enquanto é do construtor (modo B). Dá para
  estender ao editor de sobreposição (modo A) depois, se quiser.

## 2026-07-16 — Modo B: construtor "Modelo do sistema" (A4) em abas + marca/dourado

- **Duas abas no topo:** "Sobre a folha (PDF)" (modo A, o editor de sobreposição) e
  "Criar no sistema (A4)" (modo B, novo construtor). Tudo no mesmo arquivo.
- **Construtor A4 (modo B):**
  - Folha A4 com **orientação escolhível** (retrato/paisagem).
  - **4 estruturas prontas:** Estilo São Pedro (prêmios à esquerda + 1 cartela grande e 4
    menores à direita), Estilo Dia das Mães (4 cartelas nos cantos + arte central +
    prêmios), 1 cartela grande, e Em branco.
  - **Elementos livres:** Texto, Imagem e Cartela (bingo). Cada um pode ser **arrastado e
    redimensionado** (8 alças) e ajustado por campos X/Y/L/A e teclado.
  - **Texto:** conteúdo multi-linha, fonte, tamanho, negrito, alinhamento e **cor**.
  - **Imagem:** upload/troca, redimensionável.
  - **Cartela:** colunas/linhas, grade, cabeçalho, numeração, grupo, imagem do centro (com
    tamanho) — tudo por cartela.
  - **"Adicionar rodada"** cria cartela + bloco de prêmios e passa para modo "por grupo".
  - **Geração:** N folhas A4 em PDF (`modelo-bingo.pdf`), com os números sorteados
    conforme o modo (iguais/independentes/por grupo). Prévia com números de exemplo.
- **Motor de desenho parametrizado** (`cardOps/makeGrid/buildSets` aceitam um `style`),
  reusado pelos dois modos; `opsToCanvas` virou independente do modo (recebe conversor);
  textos agora têm **cor**. Marca da paróquia (logo + nome) e **dourado nos botões de
  destaque** (Gerar/Escolher PDF).
- **Observação:** o construtor é uma 1ª versão; as posições das estruturas prontas são
  aproximadas (dá para arrastar/ajustar). Ajustes finos de layout conforme o uso.

## 2026-07-16 — Marca da paróquia, dourado nos destaques, imagem/numeração por cartela

- **Dourado nos botões de destaque:** "Gerar PDF" e "Escolher PDF" (tela inicial) agora
  são dourados (gradiente com texto marrom escuro), puxando a identidade da paróquia.
- **Marca da Paróquia Nossa Senhora de Nazaré:** header passou a exibir a **logo real**
  (`logo-paroquia.jpeg`) e o nome "PARÓQUIA NOSSA SENHORA DE NAZARÉ" (com fallback de
  ícone caso a imagem falte).
- **Imagem do centro agora é POR CARTELA:** cada cartela pode ter uma imagem diferente no
  centro livre (upload + tamanho, no painel da cartela). Removidos os controles globais de
  imagem. Na geração, cada imagem distinta é embutida uma vez (cache) e mapeada por cartela.
- **Numeração agora é POR CARTELA:** toggle "Numerar esta cartela" em cada uma (dá para
  numerar só uma). O prefixo/início/posição continuam globais (passo 3).
- Motor de desenho ajustado: op de imagem carrega `imgEl` (prévia) + `imgKey` (PDF);
  `opsToPdf` recebe mapa `imagesByCard`.

## 2026-07-16 — Design claymorphism azul, imagem contida, alças no meio dos lados

- **Imagem central nunca vaza:** o tamanho agora é limitado ao "contain" da célula
  (maior tamanho que cabe inteiro, preservando proporção) e o slider passou a ir de
  20%–100% (100% = maior possível dentro da célula). Clamp `min(centerScale,1)` garante
  que nunca ultrapassa o quadrado.
- **Alças de redimensionamento nos 4 cantos E no meio dos 4 lados** (n/e/s/w), além dos
  vértices — permite esticar por um lado só.
- **Grupo / rodada virou campo condicional:** só aparece quando o modo "Por grupo/rodada"
  está selecionado E há uma cartela selecionada.
- **Novo design — CLAYMORPHISM em tons de azul/dourado da logo da Paróquia Nossa Senhora
  de Nazaré:** superfícies "clay" (gradiente + sombra dupla externa azulada e realce
  branco), campos afundados (inset), switches e botões táteis, cantos bem arredondados,
  paleta azul-cobalto. Fontes melhores **Quicksand** (títulos) + **Poppins** (texto),
  baixadas para `fonts/` (funciona offline).
- **Pasta bugs:** print do bug da imagem vazando foi **apagado** (resolvido). A logo da
  paróquia foi **movida** de `bugs/` para a raiz como `logo-paroquia.jpeg` (recurso útil,
  serviu de referência de cor).

## 2026-07-16 — Grade/cabeçalho por cartela, imagem redimensionável, novo design "papel"

- **Grade e cabeçalho agora são POR CARTELA** (antes eram globais): cada quadrado tem seus
  próprios toggles no painel da cartela selecionada. Desligar em uma não afeta as outras.
  Botão **"Aplicar grade + cabeçalho a todas"** para replicar de uma vez. A lista de
  cartelas mostra pills ("grade", "BINGO") de cada uma. Contexto do usuário: a 5ª rodada
  (bingo colado) vem só com a marcação → precisa desenhar grade/cabeçalho; as outras já
  vêm impressas → grade desligada. As opções continuam disponíveis para todas.
- **Tamanho da imagem central** ajustável (slider 40%–260%, pode ultrapassar a célula),
  centralizada na casa central; vale na prévia e no PDF.
- **Fonte separada só do cabeçalho "BINGO"** (além da fonte dos números). Textos das ops
  passaram a carregar `family`, e a geração embute as fontes usadas (números + cabeçalho).
- **Textos dos modos reescritos:** "Todas iguais" = "o mesmo bilhete, jogado em todas as
  rodadas" (removido "5 rodadas" e "igual ao PDF do São Pedro"); adicionada explicação
  clara do **"Por grupo / rodada"**.
- **Novo design (menos "cara de IA"):** trocado o tema escuro com gradiente roxo/glow por
  um visual **editorial claro estilo papel** — fundo bege, painéis brancos com hairlines,
  títulos em serifa, paleta sóbria com um único acento verde-tinta, mesa de trabalho com
  textura sutil. Ícones SVG de linha mantidos (sem emoji).
- Criada a pasta **`bugs/`** (com `LEIA-ME.md`): usuário deixa prints de bugs lá; após
  resolver, as imagens tratadas são apagadas.

## 2026-07-16 — Reescrita do app: motor de desenho único, design novo e correções

Feedback do usuário atendido (mesmo arquivo `bingo-sobreposicao.html`):

- **Prévia = PDF (bug resolvido):** criado um **motor de desenho único** (`cardOps`) que
  gera "operações" em coordenadas PDF e é renderizado igual no canvas (prévia) e no
  pdf-lib (saída). Agora o que aparece na tela é exatamente o que sai no PDF.
- **"Sem grades" no PDF (resolvido):** adicionada a opção **"Desenhar a grade (linhas)"**
  (ligada por padrão) — o app carimba as linhas da grade, cabeçalho e números. Funciona
  tanto em folha em branco quanto sobre grade já impressa (aí é só desligar).
- **Mover o quadrado (bug resolvido):** o clique caía nas células-filhas; agora usa
  `closest('.irect')`, então dá para **arrastar de qualquer ponto** do quadrado. Cantos
  redimensionam; setas/Shift/Del ajustam.
- **Imagem no centro livre:** upload de imagem (PNG/JPG) que é embutida na casa central
  (respeita proporção), tanto na prévia quanto no PDF (`embedPng`/`embedJpg`).
- **Fonte:** escolha de família (Sans/Serif/Mono), **negrito** on/off e **tamanho**
  ajustável (30–120% da célula).
- **Cabeçalho B I N G O:** opção de desenhar o cabeçalho (texto configurável) acima da grade.
- **Número da cartela com posição escolhível:** acima esq/centro/dir ou abaixo esq/dir;
  prefixo e nº inicial configuráveis; numeração sequencial por folha.
- **Design novo, sofisticado:** tema escuro com gradientes, tipografia refinada, switches,
  segmented controls, cards e **ícones SVG de linha embutidos (estilo Lucide) — sem emojis**.
  - Observação sobre **lordicon**: ele carrega os ícones da internet (CDN), o que quebraria
    o funcionamento **offline**. Por isso foram usados SVGs embutidos. Dá para trocar
    destaques por lordicon animado depois, se o uso online for aceitável.
- **PDF menor:** geração passou a usar `embedPages`/`drawPage` (a folha vira um objeto
  reutilizado) em vez de duplicar o conteúdo por cópia — arquivo de saída muito mais leve.

## 2026-07-16 — App do "Meu modelo": editor de sobreposição + gerador (bingo-sobreposicao.html)

- Criado `bingo-sobreposicao.html` — app de página única, **sem backend, funciona
  offline**, focado na 2ª versão (a paróquia cria a folha, o sistema carimba as cartelas).
- **Fluxo (4 passos):**
  1. **Carregar folha:** faz upload do PDF que a paróquia criou; renderiza com pdf.js
     (suporta múltiplas páginas, zoom, "ajustar").
  2. **Marcar cartelas:** botão "Nova cartela" cria um quadrado 5×5 sobre a folha; o
     usuário **arrasta para posicionar e puxa os cantos para redimensionar** até
     encaixar no espaço vazio da cartela. Botão **"Duplicar"** para repetir o mesmo
     tamanho nas 5 cartelas. Ajuste fino por teclado (setas / Shift / Del) e por campos
     numéricos (X, Y, largura, altura, linhas, colunas). Mostra a subdivisão 5×5 e a
     casa central "livre".
  3. **Configuração dos números:** faixa (número inicial/final, ex. 1–75), centro livre
     on/off, e **modo dos números entre as cartelas da mesma folha** (as 3 opções da
     pergunta: *todas iguais* / *cada uma independente* / *por grupo/rodada*), quantidade
     de folhas, numeração sequencial opcional e tamanho da fonte.
  4. **Prévia e geração:** botão "Prévia com números" preenche números de exemplo nos
     quadrados; "Gerar PDF" produz um **único PDF com N folhas**, carimbando os números
     sorteados (via pdf-lib) direto sobre o layout original — fica idêntico ao da paróquia.
- **Sorteio:** divide a faixa em 5 colunas (B-I-N-G-O) e sorteia números distintos por
  coluna, respeitando o centro livre. Valida se a faixa é grande o suficiente.
- **Bibliotecas** baixadas para `libs/` (funciona sem internet): pdf.js 3.11.174
  (+ worker), pdf-lib 1.17.1, jszip 3.10.1 (reservado p/ exportar PNG/zip no futuro).
- Sintaxe do JS validada com `node --check`. App aberto no navegador para teste manual.
- **Decisões confirmadas pelo usuário:** grade 5×5 com centro livre; modo de números
  escolhível na tela; saída em PDF primeiro (Word/PNG ficam para depois).

## 2026-07-16 — Criação dos arquivos de contexto e do fluxo de leitura automática

- Criado `CONTEXTO.md` (arquivo mestre de contexto), consolidando o histórico da
  conversa, o modelo de bingo da paróquia (5 rodadas no mesmo bilhete, mesmos 25
  números), a solução de duas abas ("Modelo do sistema" e "Meu modelo") e as
  limitações conhecidas.
- Criado este `ATUALIZACOES.md` como changelog do projeto.
- Configurada a **tarefa fixa**: ao abrir o terminal (início de sessão), o
  assistente lê automaticamente `CONTEXTO.md` e `ATUALIZACOES.md` para saber onde
  paramos (via hook `SessionStart` em `.claude/settings.json`).
- Base já existente na pasta ao começar: `contexto-sistema-cartelas-bingo.md`,
  o PDF `BINGÃO DE SÃO  PEDRO- 2026 II.pdf` e duas imagens de referência
  (bilhete físico e cartaz "Dia das Mães").

---

<!--
Modelo para novas entradas (copie e preencha):

## AAAA-MM-DD — Título curto
- O que mudou:
- Por quê:
- Arquivos afetados:
-->
