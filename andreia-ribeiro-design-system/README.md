# Andréia Ribeiro Atelier — Design System

Design system de trajes sob medida para locação, construído a partir de duas referências:

- **ØDE**: fundo claro de pedra, linhas estruturais, índices em mono, contador de abertura, marquee guiado pela velocidade, índice de coleções com prévia no cursor, processo horizontal fixo, lâminas cinematográficas, preenchimento de palavras, cards com inclinação 3D, CTA magnético, cursor próprio e Lenis.
- **Soma**: display serifado com itálico dourado, lótus que se desenha, botões com halo que "respira", superfícies com brilho, abas de agenda, preços com índice fixo, depoimentos, formulário de contato e textura de ruído.

## Abrir

Abra `design-system.html` no navegador. Funciona por `file://`, sem servidor (fontes, GSAP e Lenis vêm de CDN; os ícones são locais).

- **Overview**: a landing page completa (`assets/overview/index.html`)
- **Components**: tokens, fundações e componentes ao vivo

## Estrutura

```
design-system.html        catálogo (Overview | Components)
assets/ar.css             tokens + todos os componentes
assets/lotus.js           lótus em vetor   → <span data-lotus></span> | data-lotus="solid"
assets/croquis.js         croquis de silhueta → <span data-croqui="noiva|princesa|sereia|coluna|smoking">
assets/icons.js           ícones em linha → <ar-icon name="arrow-right"></ar-icon>
assets/silk.js            fundo de seda WebGL → ARSilk(canvas, { colors, sheen, scale, speed })
assets/overview/          landing page
assets/brand/             logo e paleta originais enviados
```

## Tokens principais

| Token | Valor | Uso |
|---|---|---|
| `--marfim` | #FDF7E7 | marca; texto sobre escuro |
| `--marfim-claro` | #FFFDF8 | fundo do site (`--bg`) |
| `--manteiga` | #F9F1D8 | fundo 2 |
| `--rose` | #F3DFD2 | detalhe |
| `--ouro-claro` | #C6AF6C | brilho |
| `--ouro` | #B99847 | marca |
| `--ouro-antigo` | #B19F6E | traços |
| `--bronze` | #7A6230 | texto dourado sobre claro |
| `--cafe` | #3D3226 | seções escuras, texto |

Fontes: **Cormorant Garamond** (display), **Jost** (texto e caixa-alta), **IBM Plex Mono** (etiquetas).

## Antes de publicar

- Substituir os painéis `.fabric` (marcam o lugar das fotos) por fotografia real nas proporções indicadas.
- Os textos de exemplo precisam ser trocados pelos reais: números, nomes e referências de peças, horários, formatos de locação ("Sob consulta"), endereço, contatos e depoimentos.
- O lótus foi redesenhado em vetor a partir do logo enviado. Se existir o arquivo vetorial original, ele deve substituir o redesenho.
