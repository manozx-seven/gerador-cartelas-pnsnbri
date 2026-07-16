# Passo a passo — Login, Firebase e Netlify (Gerador de Cartelas)

Este guia liga a pasta `site/` ao Firebase (login/admins) e publica no Netlify.
Siga na ordem. Não precisa saber programar.

O que é publicado: **só a pasta `site/`**. O restante (contexto, PDFs de exemplo) fica de fora.

---

## Parte 1 — Criar o projeto no Firebase
1. Acesse **https://console.firebase.google.com** e faça login com sua conta Google.
2. **"Criar um projeto"** → nome sugerido: `bingo-nazare`. Pode desativar o Google Analytics.
3. Aguarde criar e **Continuar**.

## Parte 2 — Ativar o banco (Firestore)
1. Menu: **Criação → Firestore Database → Criar banco de dados**.
2. Local: `southamerica-east1` (São Paulo) → avançar.
3. **"Iniciar no modo de produção"** → Criar.
4. Aba **Regras (Rules)**: **apague tudo** e cole o conteúdo do arquivo `firestore.rules`
   (na raiz deste projeto). Clique em **Publicar**.

## Parte 3 — Ativar o login (Authentication)
1. Menu: **Criação → Authentication → Começar**.
2. Provedor **E-mail/senha** → **ativar** → salvar.

## Parte 4 — Pegar as chaves e colar no site
1. Engrenagem ⚙️ → **Configurações do projeto**.
2. Em **"Seus apps"**, clique no ícone **`</>` (Web)**, apelido `site`, **Registrar app**.
3. Copie os valores do bloco `const firebaseConfig = { ... }`.
4. Abra **`site/assets/js/firebase.js`** e cole os valores no lugar dos `COLE_AQUI`
   (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

## Parte 5 — Criar o primeiro usuário DEV (você)
1. **Authentication → Users → Adicionar usuário**: seu e-mail + uma senha provisória. Criar.
2. Copie o **UID** que aparece na lista.
3. **Firestore → Dados → Iniciar coleção**: ID da coleção **`admins`**.
4. ID do documento: **cole o UID** copiado.
5. Adicione os campos:
   - `email` (string) → seu e-mail
   - `role` (string) → `dev`
   - `mustChangePassword` (boolean) → `true`
6. Salvar. Ao entrar no site com esse e-mail, ele pedirá para você criar sua senha.

> Depois, dentro do sistema (botão **Admins** no topo do app → página Administradores),
> você e outros admins podem criar novos administradores sem mexer no Console.

## Parte 6 — Publicar no Netlify (via GitHub)
1. Suba este projeto para um repositório no **GitHub** (a pasta inteira, com `site/`,
   `netlify.toml` e `firestore.rules`).
2. No **Netlify**: **Add new site → Import from Git** → escolha o repositório.
3. O `netlify.toml` já define `publish = "site"`. Confirme e faça o deploy.
4. (Alternativa sem Git: **Add new site → Deploy manually** e arraste **a pasta `site/`**.)

## Parte 7 — Autorizar o domínio do Netlify no Firebase
1. Copie o endereço final (ex.: `bingo-nazare.netlify.app`).
2. Firebase: **Authentication → Settings → Authorized domains → Add domain** e cole o endereço.
   (Sem isso o login pode falhar no site publicado.)

---

## ⚠️ Se você já tinha publicado as regras antes
O arquivo `firestore.rules` ganhou a coleção **`atividades`** (histórico) e o app passou a
gravar **presença/último acesso** nos docs de `admins`. **Republique as regras**: Firebase →
**Firestore → Regras** → cole de novo o conteúdo de `firestore.rules` → **Publicar**.
Sem isso, a aba **Histórico** dá erro de permissão.

## Como usar depois
- Abrir o site → cai direto na tela de **Entrar** (a página inicial já é o login).
- Entrar com e-mail e senha (só administradores). No 1º acesso o sistema pede para criar a senha.
- No app, botão **Admins** (topo) → aba **Administradores** (adicionar/remover, ver quem está
  online / último acesso, trocar sua senha) e aba **Histórico** (tudo que os admins fizeram).
- **Permissões:** só o **DEV** escolhe DEV/Administrador ao criar; um Administrador comum só
  consegue criar outro **Administrador**.

## Observações
- **Excluir um administrador** pelo painel remove o acesso (o doc em `admins` some), mas a
  conta de login continua no **Authentication** até ser apagada manualmente no Console.
- `role`: **dev** pode excluir qualquer admin; **adm** só exclui outros `adm`.
- O app funciona 100% no navegador (gera os PDFs localmente). O Firebase é usado **apenas**
  para o login e a lista de administradores.
