# ATUALIZAÇÕES — Sistema de Cartelas de Bingo

> **Registro de TODAS as mudanças, decisões e modificações do projeto.**
> Toda vez que algo mudar (arquivo criado/alterado/removido, decisão tomada,
> bug corrigido, ideia nova), registrar aqui uma nova entrada no topo da lista.
>
> Formato de cada entrada: `## AAAA-MM-DD — Título curto` seguido do que mudou e
> por quê.

---

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
