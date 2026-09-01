# RESTAURAR — como deixar o projeto igual em outro PC

> Documento gerado em **01/09/2026**.
> Leia isto depois de clonar o repositório em uma máquina nova.
>
> Repositório: `https://github.com/manozx-seven/gerador-cartelas-pnsnbri.git`

---

## 1. Resumo rápido

**Boa notícia:** quase tudo que importa está no Git. O `.gitignore` só esconde
**duas coisas**, e nenhuma delas é necessária para o sistema funcionar:

| Item ignorado | Precisa levar? | Por quê |
|---|---|---|
| `.claude/settings.json` | **Sim** (ou recriar — ver §4) | Hook que faz o Claude Code ler `CONTEXTO.md` + `ATUALIZACOES.md` ao abrir. Sem isso o Claude começa "sem memória" do projeto. |
| `cartelas-bingo.pdf` | Opcional | É **saída gerada** pelo app (12 MB). Some quando você gera cartelas de novo. Só leve se quiser o arquivo exato de referência. |

Além disso existe **uma pasta fora do projeto** que também não vai no Git e vale
a pena levar (memória do Claude Code) — ver §5.

**Não existe `npm install`.** O projeto é site estático puro: HTML + JS + libs já
versionadas em `site/libs/`. Não há `package.json`, não há build.

---

## 2. O que levar no pendrive

Crie no pendrive uma pasta chamada **`arquivos-bingo`** com esta estrutura:

```
arquivos-bingo/
├── claude-settings.json          <- cópia de  .claude/settings.json
├── cartelas-bingo.pdf            <- (OPCIONAL) cópia da raiz do projeto
└── memoria-claude/
    ├── MEMORY.md
    └── sem-custo-extra-de-infra.md
```

### De onde copiar cada um (no PC atual)

| Arquivo do pendrive | Origem no PC atual |
|---|---|
| `claude-settings.json` | `C:\Users\murylo.neves\Desktop\BINGO\.claude\settings.json` |
| `cartelas-bingo.pdf` | `C:\Users\murylo.neves\Desktop\BINGO\cartelas-bingo.pdf` |
| `memoria-claude\*` | `C:\Users\murylo.neves\.claude\projects\C--Users-murylo-neves-Desktop-BINGO\memory\` |

> A pasta `.claude` é oculta no Explorer. Ative **Exibir → Itens ocultos**, ou
> cole o caminho direto na barra de endereço.

---

## 3. Passo a passo no PC novo

```bash
# 1) clonar
git clone https://github.com/manozx-seven/gerador-cartelas-pnsnbri.git
cd gerador-cartelas-pnsnbri

# 2) conferir que veio tudo
git log --oneline -1
```

Depois, plugue o pendrive e **abra o Claude Code dentro da pasta clonada** e diga:

> "Leia o `RESTAURAR.md` e faça a restauração. Os arquivos estão em
> `E:\arquivos-bingo` (ajuste a letra do pendrive)."

---

## 4. INSTRUÇÕES PARA O CLAUDE CODE (restauração)

Claude: execute os passos abaixo, nesta ordem.

### 4.1 — Recriar `.claude/settings.json`

Crie a pasta `.claude/` na raiz do projeto e escreva dentro dela o arquivo
`settings.json` com **exatamente** este conteúdo (versão portátil, que usa a
variável `$CLAUDE_PROJECT_DIR` em vez de caminho fixo da máquina):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "shell": "bash",
            "statusMessage": "Lendo CONTEXTO.md e ATUALIZACOES.md...",
            "command": "printf '=== TAREFA FIXA: contexto do projeto BINGO lido automaticamente. Leia abaixo antes de agir. ===\\n\\n'; cat \"$CLAUDE_PROJECT_DIR/CONTEXTO.md\" \"$CLAUDE_PROJECT_DIR/ATUALIZACOES.md\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

**Não é preciso copiar `claude-settings.json` do pendrive** — o conteúdo acima já
é a versão correta e portátil. O arquivo do pendrive serve só como conferência:
ele é idêntico, exceto que usa o caminho absoluto do PC antigo
(`C:/Users/murylo.neves/Desktop/BINGO/...`), que **não deve** ser reaproveitado.

Depois de criar, **reinicie o Claude Code** para o hook passar a valer.

### 4.2 — Restaurar a memória do Claude Code

A memória fica **fora** do projeto, numa pasta cujo nome deriva do caminho do
projeto. No PC novo:

1. Descubra o caminho real da pasta clonada (ex.: `C:\Users\FULANO\Desktop\gerador-cartelas-pnsnbri`).
2. Converta esse caminho para o formato de slug usado pelo Claude Code:
   troque `:` e `\` por `-`. O exemplo acima vira
   `C--Users-FULANO-Desktop-gerador-cartelas-pnsnbri`.
3. Copie os dois arquivos de `arquivos-bingo\memoria-claude\` para:

   ```
   C:\Users\FULANO\.claude\projects\<SLUG>\memory\
   ```

Se a pasta `memory` não existir, crie. Se já existir um `MEMORY.md`, **una** o
conteúdo em vez de sobrescrever.

> Conteúdo esperado: `MEMORY.md` (índice, 1 linha) e
> `sem-custo-extra-de-infra.md` (regra: o usuário recusa soluções que custem
> dinheiro extra de infraestrutura — nada de Cloud Functions ou Admin SDK;
> preferir o que roda no navegador ou no plano grátis).

### 4.3 — (Opcional) Restaurar `cartelas-bingo.pdf`

Se o arquivo estiver no pendrive, copie `arquivos-bingo\cartelas-bingo.pdf` para
a **raiz** do projeto. Ele já está no `.gitignore`, então não será commitado.

Se **não** estiver, ignore: é apenas uma saída antiga do gerador e pode ser
regerada pelo próprio app.

### 4.4 — Conferir

```bash
git status --ignored --porcelain
```

O resultado esperado é apenas:

```
!! .claude/
!! cartelas-bingo.pdf     (só se você copiou o PDF)
```

Se aparecer qualquer arquivo **não ignorado** como modificado ou novo, algo saiu
do lugar — investigue antes de continuar.

### 4.5 — Ler o contexto

Por fim, leia `CONTEXTO.md` e `ATUALIZACOES.md` para saber o estado do projeto e
onde o trabalho parou.

---

## 5. Como rodar o projeto

O site é estático. Basta servir a pasta `site/` por HTTP (abrir o arquivo direto
com `file://` **não funciona**, porque os JS são módulos ES e o Firebase exige
origem HTTP).

Qualquer uma destas serve:

```bash
# Python (já vem no Windows via Store, ou instale)
python -m http.server 8000 --directory site

# Node
npx serve site
```

Depois abra `http://localhost:8000`.

Fluxo das páginas:
- `index.html` — login (Firebase Auth)
- `app.html` — gerador de cartelas (o app em si)
- `admin.html` — painel de administradores

---

## 6. O que NÃO é arquivo (não vai no pendrive)

Estas coisas são contas/serviços — não há nada para copiar, só é preciso ter
acesso no PC novo:

| Serviço | O que você precisa |
|---|---|
| **GitHub** | Credencial de `git push` (login no Git Credential Manager na primeira vez). Repo: `manozx-seven/gerador-cartelas-pnsnbri`. |
| **Firebase** | Projeto `gerador-cartelas-pnsnbri`. As chaves públicas já estão versionadas em `site/assets/js/firebase.js` — não precisa configurar nada. Só é preciso o login de admin (Firebase Auth) para entrar no sistema. Detalhes em `SETUP-FIREBASE.md`. |
| **Netlify** | Deploy automático a partir do GitHub (`netlify.toml` já versionado). Nada a instalar localmente. |

---

## 7. Checklist final

- [ ] `git clone` feito e `git log` bate com o PC antigo
- [ ] `.claude/settings.json` criado (versão `$CLAUDE_PROJECT_DIR`)
- [ ] Claude Code reiniciado e o contexto aparecendo sozinho ao abrir
- [ ] Pasta `memory/` restaurada no caminho com o slug correto
- [ ] `git status --ignored` mostrando só os itens esperados
- [ ] Site abrindo em `http://localhost:8000`
- [ ] Login de admin funcionando (Firebase)
