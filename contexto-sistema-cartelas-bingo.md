# Contexto: Sistema de Cartelas de Bingo (Paróquia)

## Origem do pedido
Um contato de uma paróquia pediu um orçamento por um "programa que gere as
cartelas de bingo do jeito que a gente quiser", porque atualmente o processo é
manual: eles montam o formato do cartaz e colam a cartela principal no meio da
folha.

## Evolução da ideia (nesta conversa)

1. **Primeira versão**: um app web simples (HTML/JS) que gera cartelas de
   bingo estilo americano (75 números, grade 5x5, letras B-I-N-G-O, espaço
   "LIVRE" no meio), com campo pra quantidade e título, e botão de
   imprimir/salvar PDF — cada cartela centralizada em uma folha A4.

2. **Segunda versão**: o usuário mandou uma foto e um PDF de um modelo real
   já usado pela paróquia — o "Super Bingão de São Pedro 2026". Esse modelo
   tem um formato específico: um cartaz A4 com lista de prêmios de 4 rodadas
   e informações do evento do lado esquerdo, e do lado direito uma cartela
   grande (5ª rodada, a principal) mais quatro cartelas menores (1ª a 4ª
   rodada) — todas com os **mesmos 25 números**, porque é o mesmo bilhete
   físico usado em várias rodadas de jogo. Foi construído um app com esse
   layout, com campos editáveis (título, data/local, valor, prêmios de cada
   rodada, apoiadores) e geração de N cartelas únicas numeradas.

3. **Mudança de abordagem, sugerida pelo usuário**: em vez do sistema impor
   um layout fixo, ele propôs que a **paróquia crie o próprio arquivo** (o
   cartaz, com prêmios, textos, design, do jeito que ela quiser) e o
   **sistema apenas preencha os números do bingo** nos lugares certos desse
   arquivo.
   - Foi definido um formato de **tags** dentro de um arquivo Word (.docx):
     a paróquia digita `{{N1}}` até `{{N25}}` nas células onde os números
     devem aparecer (em qualquer posição, em quantas cartelas/rodadas
     quiser — as mesmas tags repetidas saem sempre com os mesmos números
     sorteados). O espaço central (posição 13) fica livre, sem tag. Outras
     tags livres tipo `{{TITULO}}`, `{{PREMIO}}`, `{{VALOR}}` etc. também
     podem ser usadas para texto.
   - Foi criado um arquivo-modelo de exemplo (.docx) já com essas tags no
     layout do Bingão de São Pedro, e um script Python que lê esse arquivo,
     sorteia os números respeitando as faixas do bingo (B:1-15, I:16-30,
     N:31-45, G:46-60, O:61-75) e gera N cartelas únicas e numeradas.
   - Isso foi testado gerando cartelas de exemplo e conferindo visualmente
     (convertendo para PDF) que o preenchimento saiu correto.

4. **Versão final pedida pelo usuário**: juntar as duas ideias em **um único
   sistema com duas opções/abas**:
   - **Aba "Modelo do sistema"**: os campos editáveis prontos (título,
     prêmios, valor, rodadas) — o próprio sistema desenha e imprime as
     cartelas.
   - **Aba "Meu modelo"**: a paróquia sobe o `.docx` que ela mesma criou
     (com as tags `{{N1}}`–`{{N25}}` e outras tags de texto), o sistema lê o
     arquivo, sorteia e substitui os números direto no navegador (sem
     precisar de servidor ou de voltar ao chat), e devolve um `.zip` com
     todas as cartelas preenchidas, prontas pra imprimir.
   - A lógica de preenchimento no navegador foi validada rodando uma
     simulação equivalente localmente contra o arquivo-modelo real, e o
     resultado bateu certinho com o que o script Python gerava.

## Estado atual
Existe um único app (HTML, roda no navegador, sem backend) com as duas
abas acima. Existe também um arquivo-modelo de exemplo em .docx com as tags
já posicionadas no layout do Bingão de São Pedro, que serve de ponto de
partida para a paróquia adaptar o próprio cartaz.

## Observações / limitações conhecidas
- Ícone/logo (ex: imagem de São Pedro) foi substituído por um ícone genérico
  no modelo de exemplo, por não reproduzir a arte religiosa original.
- Se a paróquia digitar as tags manualmente no Word, existe risco de o Word
  fragmentar o texto da tag em formatações diferentes; o sistema já tenta
  corrigir isso automaticamente antes de substituir, mas vale conferir o
  resultado depois de gerar.
