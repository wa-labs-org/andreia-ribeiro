# Alinhavo · Design System do Atelier

Design system para o site de um ateliê de trajes festivos: vestidos de noiva e madrinha, trajes de noivo e padrinho, sob medida e ajustes.

> **Alinhavo** é o ponto provisório que segura o tecido antes da costura definitiva. Na prova, ele ainda pode ser desfeito e refeito. O sistema leva essa ideia para a tela: *a interface prova, ajusta e só então arremata.*

## Como ver

Abra **`design-system.html`** no navegador (funciona direto do disco):

- **Overview**: a home do ateliê com o sistema aplicado e todas as animações (`assets/overview/index.html`). Dali, os links de coleção levam a `colecao.html` pela transição de cortina.
- **Componentes**: o catálogo com tokens, princípios, cores (com contraste), tipografia, grid, texturas, ícones, **motion** (curvas, durações, partitura e demonstrações ao vivo com “Repetir”) e todos os componentes com estados.
- O botão **Movimento completo / reduzido** no topo simula `prefers-reduced-motion` no catálogo e no Overview.

## Estrutura

Segue a organização dos sistemas de referência (`design-system.html` na raiz, `assets/overview/` com a página aplicada e `STACK.md`, `assets/components/` com o comportamento do catálogo), acrescida de tokens e documentação:

```
atelier-design-system/
├── design-system.html            # catálogo: abas Overview + Componentes
├── DECISOES.md                   # o que veio de cada referência e o que é novo
├── README.md
├── assets/
│   ├── tokens/
│   │   ├── tokens.css            # CSS custom properties (fonte da verdade)
│   │   └── tokens.json           # mesmo conteúdo em W3C Design Tokens
│   ├── css/atelier.css           # base + componentes + motion
│   ├── js/
│   │   ├── atelier.js            # motor de movimento (vanilla, sem dependências)
│   │   └── icons.js              # sprite de ícones injetado inline
│   ├── components/
│   │   ├── components.css        # moldura do catálogo
│   │   └── components.js         # abas, barra lateral, palcos, alternador de movimento
│   ├── overview/
│   │   ├── index.html            # home aplicada
│   │   ├── colecao.html          # página de coleção (Noivas)
│   │   └── STACK.md
│   └── images/
│       ├── svg/                  # monograma, icons.svg, tule, overlock, pique
│       └── figurinos/            # croquis usados como placeholders de foto
└── docs/
    ├── 00-leitura-das-referencias.md
    ├── 01-principios-e-voz.md
    ├── 02-cores.md
    ├── 03-tipografia.md
    ├── 04-grid-layout-espaco.md
    ├── 05-texturas-e-imagem.md
    ├── 06-componentes.md
    ├── 07-motion.md              # a peça central
    ├── 08-acessibilidade-responsividade.md
    └── 09-aplicacao.md
```

## Usar em um projeto

```html
<html lang="pt-BR">
<head>
  <!-- 1. estado de movimento e JS antes do primeiro paint -->
  <script>(function(h){h.classList.add('at-js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)h.setAttribute('data-motion','reduce')})(document.documentElement)</script>
  <!-- 2. fontes, tokens, sistema -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,0..100,0..1;1,9..144,300..600,0..100,0..1&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap">
  <link rel="stylesheet" href="assets/tokens/tokens.css">
  <link rel="stylesheet" href="assets/css/atelier.css">
  <script src="assets/js/icons.js" defer></script>
  <script src="assets/js/atelier.js" defer></script>
</head>
```

Animações são **declarativas**:

```html
<h2 class="at-h1" data-reveal="linhas">Quatro encontros, <em>uma peça</em>.</h2>
<div data-reveal="tule"><div class="at-photo">…</div></div>
<section data-registro="casimira">…</section>   <!-- registro alfaiataria -->
<a href="colecao.html" data-transition>…</a>      <!-- cortina entre páginas -->
```

Valores de `data-reveal`: `linhas` · `tule` · `queda` · `corte` · `pecas` (+ `data-reveal-item`) · `fade` · `costura`. Também: `svg[data-stitch]`, `svg[data-stitch="scrub"]`, `[data-parallax]`, `[data-roll]`, `[data-magnet]`, `[data-cursor-label]`, `[data-cursor-thread]`, `[data-intro]`.

## Notas

- O nome “Andreia Ribeiro” vem do nome do repositório e é usado como marca de exemplo. Endereço, depoimentos e números de prazo são **conteúdo fictício** para demonstrar tom de voz e componentes.
- As imagens são **croquis-placeholder**; a direção de fotografia está em `docs/05-texturas-e-imagem.md`.
- As fontes vêm do Google Fonts; sem conexão, o sistema cai para Georgia / Helvetica sem quebrar o layout.
