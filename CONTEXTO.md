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

## 3. Solução construída (estado atual)

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
| `site/login.html` · `site/admin.html` · `site/index.html` | Login, painel de administradores e redirecionamento. |
| `site/assets/js/` | `firebase.js`, `utils.js`, `login.js`, `admin.js`, `app-guard.js`. |
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

## 6. App "Meu modelo" — editor de sobreposição (`bingo-sobreposicao.html`)

Foco atual do projeto. Fluxo em 4 passos, tudo no navegador (offline):

1. **Carregar folha** — upload do PDF da paróquia (pdf.js; multipágina + zoom).
2. **Marcar cartelas** — carimba quadrados 5×5 sobre os espaços vazios: arrasta para
   mover, puxa os cantos para redimensionar, "Duplicar" para repetir o tamanho nas 5
   cartelas. Ajuste fino por teclado e por campos numéricos (X/Y/larg/alt/linhas/colunas).
3. **Configurar** — faixa de números (ex. 1–75), centro livre on/off, modo dos números
   (todas iguais / independentes / por grupo), quantidade de folhas, numeração e fonte.
4. **Prévia + Gerar** — prévia com números de exemplo e geração de um único PDF com N
   folhas, carimbando os sorteados sobre o layout original (pdf-lib).

**Decisões:** grade 5×5 com centro livre; modo de números escolhível na tela; saída em
PDF primeiro. **Pendências/ideias:** exportar Word e PNG/zip (jszip já baixado);
possível "snap" automático aos espaços do PDF; testar o carimbo em impressão real.

## 6.1. Publicação (Netlify) e login (Firebase)

O sistema é publicado no **Netlify** a partir da pasta `site/` (definido no `netlify.toml`).
O acesso é **restrito a administradores** via **Firebase Authentication (e-mail/senha)** +
Firestore, na **mesma dinâmica do projeto Paróquia Beruri**:

- Coleção **`admins`** no Firestore (id do doc = UID do Auth), com campos `email`,
  `role` (`dev` ou `adm`) e `mustChangePassword`.
- **`login.html`**: entra, confere se é admin, e força troca de senha no 1º acesso.
- **`app.html`**: protegido por `app-guard.js` (redireciona para o login se não autorizado);
  topo mostra o usuário, botão **Admins** e **Sair**.
- **`admin.html`**: cria admins (via app secundário, sem deslogar), remove (dev remove
  qualquer um; adm só remove `adm`) e troca a própria senha.
- Regras em `firestore.rules`. Firebase = **projeto NOVO só do bingo** (isolado do Beruri).
- Chaves do Firebase ficam em `site/assets/js/firebase.js` (placeholders `COLE_AQUI`).
- Passo a passo completo em **`SETUP-FIREBASE.md`**.
- **Teste local:** abrir `site/app.html` por `file://` libera o app sem login (os módulos
  não rodam em file://); no site publicado (http/https) o login é obrigatório.

## 7. Próximos passos em aberto

- Testar `bingo-sobreposicao.html` com o PDF real do São Pedro (encaixe dos quadrados e
  impressão) e ajustar tamanhos/fonte conforme o resultado.
- Reintegrar a aba "Modelo do sistema" (layout pronto) num app único, se desejado.
- (Registrar cada decisão nova no `ATUALIZACOES.md`.)
