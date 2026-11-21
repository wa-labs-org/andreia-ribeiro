# 01 · Princípios e tom de voz

**Alinhavo** é o ponto provisório, longo e geralmente vermelho, que segura o tecido antes da costura definitiva. Na prova ele ainda pode ser desfeito e refeito. O sistema leva essa ideia para a tela: *a interface prova, ajusta e só então arremata.*

## Os cinco princípios

### 1. Prova antes de pronto
Mostre o processo antes do resultado. A cliente compra confiança no caminho, não só a peça final. Toda página diz o que acontece a seguir.

| Assim | Assim não |
|---|---|
| “Três provas: o molde em morim, o tecido alinhavado e a final, com os sapatos do dia.” | “Seu vestido dos sonhos, pronto em poucas semanas!” |
| “Depois da primeira conversa você recebe um orçamento por escrito, com tecido, número de provas e prazo.” | “Peça já seu orçamento!” |

*No design:* a seção “Do molde ao arremate” é fixa e acende passo a passo; o formulário mostra as 4 etapas como uma fita.

### 2. A mão aparece
Nomeie o gesto, o material e o tempo. Um número concreto vale mais que um adjetivo. As anotações em mono são a letra da costureira no molde.

| Assim | Assim não |
|---|---|
| “Cerca de 40 horas de bordado por corpete.” | “Acabamento impecável de altíssima qualidade.” |
| “Recortamos cada flor da renda chantilly e a costuramos à mão sobre o tule.” | “Renda premium exclusiva.” |

*No design:* `.at-note` (IBM Plex Mono) para medidas e códigos; croquis com linhas de construção; marcas de corte no hover.

### 3. Silêncio de ateliê
Espaço em branco é tempo de respiro. Sem urgência, sem exclamação, sem caixa-alta gritada. Quem está escolhendo a roupa de um casamento já tem ansiedade suficiente.

| Assim | Assim não |
|---|---|
| “A agenda de março tem provas às quintas e aos sábados.” | “ÚLTIMAS VAGAS!!! Garanta já a sua data!” |
| “Pode ser só uma palavra. A gente conversa sobre o resto na prova.” | “Preencha todos os campos obrigatórios.” |

*No design:* respiro entre seções de 96 a 224px; um CTA primário por vista; nada pisca.

### 4. Dois tecidos, um ofício
Noivas e madrinhas (**registro Seda**) e noivos e padrinhos (**registro Casimira**) recebem a mesma voz e o mesmo cuidado. Muda o tecido, não o tom. A linguagem padrão é neutra quanto a gênero.

| Assim | Assim não |
|---|---|
| “Para quem é a peça? Noiva · Madrinha · Noivo · Padrinho · Outra ocasião” | “Encontre o vestido perfeito. (Noivos, cliquem aqui.)” |
| “Para quem vai ao altar *de terno*.” | “Para ele.” |

*No design:* `[data-registro="casimira"]` troca fundo, contraste, eixo SOFT da Fraunces (100 → 0) e curva de motion (caimento → corte), mantendo componentes, grid e voz.

### 5. Cada ponto tem função
Movimento só onde algo **se une** (linha que se desenha), **cai** (tecido revelado) ou **se ajusta** (o assentamento final da curva). Se uma animação não conta uma dessas três coisas, ela sai.

| Assim | Assim não |
|---|---|
| A costura se desenha entre o título e a imagem do hero: liga as duas ideias. | Ícones girando sem parar para “chamar atenção”. |
| O botão de costura gira 90° no hover, como o botão passando pela casa. | Botões que pulam (bounce) ao carregar. |

## Tom de voz

**Calmo, preciso, próximo.** Fala como a costureira que está com a fita métrica no seu ombro: segura do que sabe, sem pressa, sem jargão gratuito.

| Atributo | É | Não é |
|---|---|---|
| Calmo | frases curtas, ponto final | exclamação, urgência, contagem regressiva |
| Preciso | números, materiais, verbos do ofício | adjetivos vazios (“perfeito”, “impecável”) |
| Próximo | “você”, presente do indicativo | “a noiva”, terceira pessoa, formalidade fria |
| Cuidadoso | explica o termo técnico na 1ª vez | jargão sem explicação |

### Vocabulário

- **Usamos:** prova, molde, toile/morim, alinhavo, caimento, barra, arremate, *ponto de partida* (em vez de “modelo”), “o dia que não se repete”.
- **Evitamos:** “vestido dos sonhos”, “princesa”, “o dia mais feliz da sua vida”, “perfeito”, “impecável”, “exclusivo”, “garanta já”, emojis.

### Microcopy de referência

| Situação | Texto |
|---|---|
| CTA primário | Agendar prova |
| CTA secundário | Ver coleções · Ver trajes · Como trabalhamos |
| Erro de e-mail | Confira o e-mail: falta o @ ou o domínio. |
| Erro de telefone | Inclua o DDD para confirmarmos a prova. |
| Campo opcional | (opcional), nunca asterisco para obrigatório |
| Dia sem vaga | lotado |
| Confirmação | Prova agendada. Se puder, traga os sapatos que pretende usar no dia: a barra começa por eles. |
| Loader | Enfiando a agulha |
| 404 (sugestão) | Esta página saiu da arara. Volte ao início ou agende uma prova. |
