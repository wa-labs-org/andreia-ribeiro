# 06 · Componentes

Todos vivem em `assets/css/atelier.css` e funcionam ao vivo em `design-system.html` (aba Componentes) e no Overview. Convenção: `.at-bloco`, `.at-bloco__elemento`, `.at-bloco--variante`, `.is-estado`. Cada componente tem **um** detalhe de ofício: é o acabamento herdado do Elicyon, traduzido para costura.

---

## Botões

| Variante | Classe | Uso | Detalhe de ofício |
|---|---|---|---|
| **Primário** | `.at-btn` | Uma ação principal por vista (“Agendar prova”) | No hover, o **dourado cai** sobre a casimira (clip de cima para baixo); o **botão de costura** (`.at-btn__botao`) gira 90° |
| **Pesponto** (secundário) | `.at-btn--pesponto` + `svg.at-btn__seam` | Alternativa (“Ver coleção”) | Borda tracejada que **corre** no hover, como a máquina costurando |
| **Linha** (terciário) | `.at-btn--linha` | Navegação contextual (“Como trabalhamos →”) | O sublinhado vira pesponto em movimento; a seta avança 4px |
| **Botão** (ícone) | `.at-btn--botao` | Anterior / próximo, fechar | Círculo (o único botão redondo): preenche do centro; ícone gira; magnetismo leve com `data-magnet` |
| **Pequeno** | `.at-btn--s` | Header | 44px de altura |

**Anatomia:** altura 52px (44px no `--s`), padding lateral 32px, radius 0, rótulo Instrument 600 · wdth 85 · 13px · +0.12em · caixa-alta. Rótulo com `data-roll` ganha a rolagem de letras.

**Estados:** padrão · hover (fill cai, letras rolam) · foco (anel bronze 2px + offset 3px, o fill também cai) · pressionado (`scale .98`, 120ms) · desabilitado (`[disabled]`, 42%) · carregando (`.is-loading` + `.at-btn__loading`: três pontos de costura que avançam; `aria-busy="true"`).

**Casimira:** dentro de `[data-registro="casimira"]` o primário inverte (marfim sobre café, hover dourado claro).

```html
<a class="at-btn" href="#agendar" data-magnet>
  <svg class="at-btn__botao" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-botao"/></svg>
  <span data-roll>Agendar prova</span>
</a>
<button class="at-btn at-btn--pesponto" type="button">
  <svg class="at-btn__seam" aria-hidden="true"><rect x=".5" y=".5" width="100%" height="100%"/></svg>
  <span data-roll>Ver coleção</span>
</button>
```

## Links

| Variante | Classe | Comportamento |
|---|---|---|
| **No texto** | `.at-link` | Bronze, sublinhado 1px a .22em; hover vira **tracejado**. |
| **De navegação** | `.at-navlink` | Sem sublinhado; no hover/foco/atual um **ponto corrido se desenha da esquerda** (clip 480ms, curva linha). `aria-current="page"` mantém desenhado. |

*Herança Elicyon:* link sublinhado de 1px com linha animada. *Tradução:* a linha não “recolhe”, ela é **costurada**.

## Navegação

### Header (`.at-header`)
- Fixo, 64px (mobile) / 80px (desktop). Desktop: coleções à esquerda, marca ao centro, “Agendar prova” + Menu à direita. Mobile: marca à esquerda, Menu à direita.
- **Some ao rolar para baixo** (após 48px de rolagem acumulada) e **volta ao subir**: `translateY(-100%)`, 480ms cortina.
- Depois de 24px: véu de tule (marfim 72% + blur 14px) e costura em ponto corrido na base.
- **Troca de tecido:** quando passa sobre `[data-registro="casimira"]`, recebe `data-theme="noite"` e inverte cores (herança do `data-nav-theme` do Lando).

### Alternador de menu (`.at-menu-toggle`)
Rótulo “Menu” ↔ “Fechar” (troca vertical) + duas linhas (uma em pesponto) que **se cruzam como alfinetes**. `aria-expanded`, `aria-controls`.

### Menu (`.at-menu`)
Tela cheia em creme marfim que **cai do topo como uma cortina** (`clip-path inset(0 0 100% 0) → 0`, 800ms cortina). Itens em Fraunces grandes com número em mono, sobem em sequência (80ms). `role="dialog"`, `aria-modal`, foco preso, Esc fecha, `inert` quando fechado, rolagem do body bloqueada.

### Fita métrica (`.at-fita`)
Barra de 3px em dourado no topo, com marcações de centímetro, que cresce com a leitura (`scaleX`). Permanece no modo reduzido (é informação).

## Hero (`.at-hero`)

- **Mobile:** título Display XL → imagem 4:5 → eyebrow → lead → CTAs. `min-height: 100svh`.
- **Desktop:** título (colunas 1–8) **sobrepõe** a imagem (8–12, 3:4); eyebrow, lead e CTAs nas colunas 1–5; uma **linha de alinhavo** SVG atravessa de lado a lado e passa por trás do título; indicador “fio do tecido” ao centro, embaixo.
- Título com linhas manuais (`.at-line > span`) para controlar a quebra.
- `[data-intro]`: tudo espera o loader ou a cortina de chegada e entra **inteiro**, mesmo abaixo da dobra.
- `[data-cursor-thread]`: o cursor puxa uma linha.
- Coreografia em [07-motion](07-motion.md#partitura-do-hero).

## Cards

### Card de peça (`.at-card`)
- **Anatomia:** `.at-card__media` (imagem 3:4 + `.at-card__alt` + `.at-crop` + `.at-tag`) e `.at-card__body` (título H4 Fraunces, seta, anotação mono).
- **Hover/foco:** (1) a imagem **se alonga do ombro** (`scale(1.02, 1.045)`, origem no topo), como tecido pendurado; (2) a **vista do molde** (papel milimetrado) desce como uma saia sendo solta (`clip-path ellipse 120% 0% → 120% 120% at 50% 0%`, herança do *helmet reveal*); (3) **marcas de corte** aparecem; (4) seta avança.
- Rótulo do cursor: `data-cursor-label="Ver peça"`.
- Variações de etiqueta: Sob medida · Ajuste · Madrinha · Noivo · Padrinho · Renda · Tule · Civil.
- Variação de fundo: `.at-photo--noite` para peças Casimira.

### Porta de coleção (`.at-doors > .at-door`)
Dois painéis lado a lado (Seda / Casimira), 88vh. No desktop, o painel em foco **se alarga** (flex 1 → 1.35, 1200ms cortina) como uma cortina sendo aberta; o outro recua. Croqui ao fundo assenta no hover. Mobile: empilhados, croqui a 30% para não competir com o texto.

### Mostruário de tecidos (`.at-swatch`)
Amostra quadrada com **bainha picotada** (tesoura de picotar) e **brilho** que atravessa no hover; a intensidade varia por material (`--sheen`: crepe .25, cetim .7, tule .15).

## Galeria: arara (`.at-arara`)

- Barra fina no topo (`.at-arara__rail`), cada peça com um **gancho**.
- **Mobile/tablet:** rolagem horizontal nativa com `scroll-snap`.
- **Desktop com `data-pin`:** seção fixada; a rolagem vertical move a arara horizontalmente.
- **Balanço:** as peças giram até 5° com mola amortecida proporcional à velocidade, com origem no gancho.
- Contador “05 / 08” em mono. Faixa focável (`tabindex="0"`) e rolável por teclado.
- **Grade de coleção:** 2 col (base), 3 col (≥1024) com a coluna do meio descida 96px; filtros por silhueta em `.at-choice`; ao filtrar, reposição animada (FLIP, 800ms).
- **Lightbox (recomendação):** abre com cortina de tule, imagem em `contain` sobre creme marfim, setas `.at-btn--botao`, Esc fecha, foco devolvido.

## Formulário de agendamento de prova (`[data-booking]`)

**Fluxo em 4 etapas:** 01 Peça → 02 O dia → 03 Prova → 04 Contato → confirmação.

| Etapa | Conteúdo | Validação |
|---|---|---|
| 01 Peça | Para quem (Noiva / Madrinha / Noivo / Padrinho / Outra) + Sob medida ou Ajuste | grupo obrigatório |
| 02 O dia | Data do evento, cerimônia (opcional), referências (opcional) | data obrigatória |
| 03 Prova | Próximos 10 dias de prova (qui/sex/sáb; “lotado” desabilitado) + horário | ambos obrigatórios |
| 04 Contato | Nome, e-mail, WhatsApp | `required`, `type=email`, `minlength=10` |

- **Progresso como fita** (`.at-form__steps`): etapas feitas em linha firme, a atual em alinhavo dourado.
- **Campo** (`.at-field`): sem caixa; rótulo em label sempre visível acima; linha inferior em **pesponto** que vira **costura firme** (bronze) ao focar (`.at-field__line`, scaleX 480ms). Hint abaixo. Erro: linha em terracota + ícone + frase que diz o que fazer (`aria-invalid`, `aria-describedby`).
- **Escolhas** (`.at-choice`): rádio/checkbox reais (acessíveis) com aparência de etiqueta de prova, 44px; selecionada em casimira com ponto dourado que cresce (curva balanço).
- **Datas** (`.at-dates`): dia da semana em mono, número em Fraunces, mês ou “lotado”.
- Ao avançar: a nova etapa sobe (caimento 800ms) e o título da etapa recebe foco. Erro: foco no primeiro campo inválido.
- **Envio:** botão em `.is-loading` (pontos de costura) → painel de confirmação `role="status"` onde **o nó de arremate se desenha** (1800ms).

*Herança Elicyon:* campos só com borda inferior, sem anel. *Diferença:* a borda é pesponto, e o foco é visível (giz), por acessibilidade.

## Depoimentos (`[data-quotes]`)

- Citação em H2 Fraunces com aspa dourada; uma palavra em itálico.
- Assinatura como **etiqueta tecida** (`.at-label-woven`): nome, ocasião, data, nº de provas, presa por dois pespontos laterais.
- Troca **manual** (botões `.at-btn--botao`, sem autoplay), contador “01 / 03”, `aria-live="polite"`, `aria-roledescription="carrossel"`. A cada troca, as linhas se revelam de novo.

## FAQ (`.at-faq`)

- Pergunta em `<h3><button aria-expanded aria-controls>` (H4 Fraunces).
- Ícone: **dois alfinetes** que giram de + para ×.
- Painel por `grid-template-rows: 0fr → 1fr` (480ms cortina), **costura dourada** se desenha sob a pergunta, resposta entra em fade + 8px. Painel fechado recebe `inert`.

## Rodapé (`.at-footer`)

- Borda superior em **overlock**. Fundo creme manteiga.
- 4 colunas (≥1024): frase-assinatura + link · Coleções · Ateliê · Visite (endereço, horário, “somente com hora marcada”).
- **Assinatura gigante** em Fraunces SOFT 100 (até 15rem), letras sobem uma a uma (1200ms, 40ms de intervalo). *Herança Elicyon.*
- Costura final que se desenha + linha legal em mono.

## Utilitários de imagem

`.at-photo` (proporção via `--at-ratio`), `--molde`, `--noite`, `__fig` (croqui), `__img` (foto), `__inner[data-parallax]` (paralaxe), `__caption` (legenda mono). `.at-skeleton` para carregamento.
