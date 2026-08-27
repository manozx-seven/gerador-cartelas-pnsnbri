# CONTEXTO DO PROJETO — Sistema de Cartelas de Bingo (Paróquia)

> **Este é o arquivo mestre de contexto.** Sempre que abrir o terminal, leia este
> arquivo e o `ATUALIZACOES.md` antes de fazer qualquer coisa, para entender o
> projeto e saber exatamente onde paramos.

---

## 1. O que é o projeto

Um sistema para **gerar cartelas de bingo** para uma paróquia. Hoje o processo
deles é manual: montam o cartaz e colam a cartela principal no meio da folha. O
pedido original foi um "programa que gere as cartelas de bingo do jeito que a
gente quiser".

O evento de referência é o **"Super Bingão de São Pedro 2026"** (realizado na
Praça São Pedro durante o arraial, data 28/06/2026, valor R$ 5,00 por cartela,
prêmio máximo anunciado de R$ 2.000,00).

## 2. Como funciona o modelo de bingo deles (importante)

O bilhete físico é **um único papel** que serve para **5 rodadas de jogo**:

- **1 cartela grande** = a **5ª rodada** (a principal, no destaque).
- **4 cartelas menores** = 1ª, 2ª, 3ª e 4ª rodadas.
- **Todas as 5 cartelas do mesmo bilhete usam os MESMOS 25 números.** É o mesmo
  bilhete jogado em rodadas diferentes.
- Grade **5x5** com cabeçalho **B-I-N-G-O** e o **espaço central (posição 13)
  livre** (com um ícone/logo, sem número).
- Faixas dos números por coluna (bingo americano de 75 bolas):
  - **B: 1–15**
  - **I: 16–30**
  - **N: 31–45**
  - **G: 46–60**
  - **O: 61–75**

Ao lado das cartelas ficam: título/arte do evento, data, local, valor e a
**lista de prêmios de cada rodada** (1ª a 4ª, mais os prêmios da 5ª/principal).

## 3. Solução desenhada no começo (HISTÓRICO — não é o estado atual)

> ⚠️ **Esta seção e a nota da seção 4 descrevem a primeira ideia** (duas abas, `.docx` com
> tags e saída em `.zip`), que **foi abandonada**. O que existe hoje é o app da **seção 6**:
> sobreposição sobre PDF e construtor A4, com saída em PDF. Mantido aqui só como histórico.

Um **único app web em HTML/JS que roda no navegador (sem backend)**, com **duas
abas**:

### Aba "Modelo do sistema"
- Campos editáveis prontos: título, data/local, valor, prêmios de cada rodada,
  apoiadores.
- O próprio sistema **desenha e imprime** as cartelas no layout do Bingão de São
  Pedro (1 grande + 4 menores, mesmos 25 números).
- Gera **N cartelas únicas e numeradas**.

### Aba "Meu modelo"
- A paróquia sobe o **`.docx` que ela mesma criou** (o cartaz, com a arte e os
  textos do jeito que quiser).
- No arquivo, ela marca onde os números devem entrar usando **tags**:
  - `{{N1}}` até `{{N25}}` nas células da grade (posição 13 = centro, fica sem
    tag). As **mesmas tags repetidas** em várias cartelas/rodadas saem sempre com
    os **mesmos números sorteados** (garante o "mesmo bilhete em várias rodadas").
  - Tags de texto livres: `{{TITULO}}`, `{{PREMIO}}`, `{{VALOR}}`, etc.
- O sistema **lê o arquivo no navegador**, sorteia os números respeitando as
  faixas do bingo, substitui as tags e devolve um **`.zip` com todas as cartelas
  preenchidas**, prontas para imprimir. Não precisa de servidor nem voltar ao chat.

### Artefatos de apoio
- Um **arquivo-modelo de exemplo (.docx)** já com as tags posicionadas no layout
  do Bingão de São Pedro — ponto de partida para a paróquia adaptar.
- Um **script Python** (referência/validação) que lê o `.docx`, sorteia e gera as
  cartelas. A lógica do navegador foi validada contra esse script e o resultado bateu.

## 4. Arquivos nesta pasta

| Arquivo | O que é |
|---|---|
| `CONTEXTO.md` | Este arquivo — contexto mestre do projeto. |
| `ATUALIZACOES.md` | Registro de todas as mudanças/decisões (changelog). |
| `site/` | **Pasta publicada no Netlify.** Contém o app e o sistema de login/admins. |
| `site/app.html` | **App principal** (canônico) — editor de sobreposição + construtor A4. Antes era `bingo-sobreposicao.html` na raiz (movido para cá). |
| `site/index.html` | **Tela de login** (é a página inicial; não há mais `login.html`). |
| `site/admin.html` | Painel de administração: abas **Administradores** e **Histórico**. |
| `site/assets/js/` | `firebase.js`, `utils.js`, `session.js` (presença+auditoria), `login.js`, `admin.js`, `app-guard.js`. |
| `site/libs/` · `site/fonts/` | Bibliotecas (pdf.js, pdf-lib, jszip) e fontes locais (offline). |
| `firestore.rules` · `netlify.toml` · `SETUP-FIREBASE.md` | Regras do Firestore, config do Netlify e guia de publicação. |
| `contexto-sistema-cartelas-bingo.md` | Nota de contexto original (histórico da conversa). |
| `BINGÃO DE SÃO  PEDRO- 2026 II.pdf` | Modelo real usado pela paróquia (prêmios + cartelas). |
| `WhatsApp Image 2026-07-15 at 15.36.12.jpeg` | Foto do bilhete físico impresso real. |
| `WhatsApp Image 2026-07-15 at 16.43.30.jpeg` | Cartaz de referência ("Bingão Dia das Mães"). |

> **Nota:** o app HTML e o `.docx`-modelo citados acima foram desenhados na
> conversa; confirmar se os arquivos finais já estão salvos nesta pasta e, se não,
> registrar em `ATUALIZACOES.md` quando forem adicionados.

## 5. Observações / limitações conhecidas

- **Arte religiosa:** o logo/ícone original (ex.: imagem de São Pedro) foi
  substituído por um ícone genérico no modelo de exemplo, por não reproduzir a
  arte original. A paróquia deve inserir a arte própria no `.docx` dela.
- **Fragmentação de tags no Word:** se digitarem as tags manualmente, o Word pode
  quebrar o texto da tag em formatações diferentes (ex.: `{{N` numa formatação e
  `1}}` em outra). O sistema já tenta **corrigir isso automaticamente** antes de
  substituir, mas vale **conferir o resultado** depois de gerar.

## 6. O app (`site/app.html`) — os dois modos

Foco atual do projeto. Tudo roda no navegador (offline), num arquivo só, com duas abas
no topo. **Modo A — "Sobre a folha (PDF)"**, em 5 passos:

1. **Folha base** — upload do PDF da paróquia (pdf.js; multipágina + zoom).
2. **Números** — faixa (ex. 1–75) e modo de sorteio (todas iguais / cada uma independente
   / por grupo-rodada).
3. **Cartelas** — carimba quadrados sobre os espaços vazios: arrasta para mover, puxa os
   cantos/lados para redimensionar, "Duplicar" para repetir o tamanho. Ajuste fino por
   teclado e por campos numéricos. Seleção múltipla (Ctrl/Shift+clique, Ctrl+A) move e
   escala em grupo. **Opções por cartela:** centro livre, grade, cabeçalho BINGO, cantos
   arredondados, numerar (com **posição e tamanho do número**) e imagem do centro — com botão
   para aplicar todas essas opções às demais cartelas.
4. **Estilo** — fonte e tamanho dos números, texto/fonte do cabeçalho, e o **prefixo/nº inicial**
   da numeração (sequencial, valem para a folha toda).
5. **Gerar** — quantidade de folhas, nome do arquivo, prévia com números de exemplo e
   geração de um único PDF carimbando os sorteados sobre o layout original (pdf-lib).

**Modo B — "Criar no sistema (A4)"**: mesma lógica, mas a folha é montada do zero em A4
(estruturas prontas, elementos livres de texto/imagem/cartela, fundos, desfazer/refazer).
Passos: 1 Folha A4 · 2 Números · 3 Elementos · 4 Gerar.

**Decisões:** grade 5×5 com **centro livre configurável em cada cartela** (desde 27/08/2026;
antes era uma chave global); modo de números escolhível na tela; saída em PDF primeiro.
A **prévia, uma vez ligada, não se desliga sozinha** (só pelo próprio botão, "Ocultar a prévia")
**e não fica re-sorteando à toa**: mudança de estilo apenas redesenha os mesmos números; só
faixa, modo de sorteio, grupo e linhas/colunas re-sorteiam. A **numeração de cada cartela
(posição e tamanho) é independente**; prefixo e nº inicial é que valem para a folha toda.
As pendências estão consolidadas na **seção 7**.

## 6.1. Publicação (Netlify) e login (Firebase)

O sistema é publicado no **Netlify** a partir da pasta `site/` (definido no `netlify.toml`).
O acesso é **restrito a administradores** via **Firebase Authentication (e-mail/senha)** +
Firestore, na **mesma dinâmica do projeto Paróquia Beruri**:

- Coleção **`admins`** no Firestore (id do doc = UID do Auth), com campos `email`,
  `role` (`dev` ou `adm`) e `mustChangePassword`.
- **`index.html`**: tela de login (entra, confere admin, força troca de senha no 1º acesso,
  tela de orientação de spam no "esqueci minha senha").
- **`app.html`**: protegido por `app-guard.js` (redireciona para o login se não autorizado);
  topo mostra o usuário, botão **Admins** e **Sair**. Registra as gerações de PDF no histórico.
- **`admin.html`**: abas **Administradores** (cria via app secundário sem deslogar; remove —
  dev remove qualquer um, adm só remove `adm`; mostra online/último acesso; troca a própria
  senha) e **Histórico** (auditoria de tudo que os admins fazem).
- **Permissões:** só **DEV** escolhe DEV/Administrador ao criar; admin comum só cria `adm`.
- **Presença/auditoria:** `session.js` grava `ultimoAcesso`/`ultimoAtivo` (heartbeat) e a
  coleção `atividades`. **As regras precisam ser republicadas** quando o `firestore.rules` muda.
- Regras em `firestore.rules`. Firebase = **projeto NOVO só do bingo** (isolado do Beruri).
- Chaves do Firebase ficam em `site/assets/js/firebase.js` — **já são as chaves reais e estão
  commitadas** (normal e seguro para app web; a proteção fica nas regras do Firestore).
- Passo a passo completo em **`SETUP-FIREBASE.md`**.
- **Teste local:** abrir `site/app.html` por `file://` libera o app sem login (os módulos
  não rodam em file://); no site publicado (http/https) o login é obrigatório.

## 7. Próximos passos em aberto

> Lista consolidada em **27/08/2026**. O detalhamento de cada item (o que já está pronto,
> as decisões e os testes) está nas entradas do `ATUALIZACOES.md`.
> Última alteração de código: **27/08/2026** (centro livre por cartela, prévia que não
> some, numeração ajustável). Repositório sincronizado com o GitHub no commit `562dcfb`.

**Prioridade — validação com a paróquia**
- Testar o **modo sobreposição com o PDF real do São Pedro impresso** (encaixe dos
  quadrados, tamanho da fonte, alinhamento no papel) e ajustar conforme o resultado.
  Continua sendo o único item que **não dá para validar sem imprimir**.
- Colher o retorno da paróquia sobre o app publicado e sobre a proposta comercial.
- ⚠️ **Prazo da proposta:** desenvolvimento de **10/08/2026 a 04/09/2026** (04/09 é o teto,
  não a data alvo). A entrega pode vir antes, sem mudar o valor.

**Funcionalidades pendentes**
- Ao remover um admin, apagar também a conta no **Firebase Authentication** (hoje só pelo
  Console; exigiria Admin SDK / Cloud Function).
- **"Limpar histórico"** (só DEV) direto no painel.
- **Exportar/imprimir o histórico** de atividades.
- **Exportar em Word e em PNG/zip** (`jszip` já está em `site/libs/`).
- Possível **"snap" automático** dos quadrados aos espaços vazios do PDF.
- Estender **desfazer/refazer** ao modo A (sobreposição) — hoje só no construtor A4.
- **Prefixo e nº inicial da numeração no construtor A4:** o modo A4 já tem posição e tamanho
  do número (por cartela), mas o **prefixo** e o **"começar em"** continuam fixos no `styleB`
  (`Nº ` e 1). Expor esses dois campos no passo 4 do A4 se a paróquia sentir falta.
- Reintegrar a aba "Modelo do sistema" (layout pronto) num app único, se ainda desejado.

**Operacional**
- Republicar as **regras do Firestore** no Console sempre que o `firestore.rules` mudar.
- Registrar cada decisão nova no `ATUALIZACOES.md`.
