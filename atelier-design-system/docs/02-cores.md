# 02 · Cores

Paleta definida pela marca: **dois cremes, um rosé, três dourados, bronze e café.** É uma paleta de celebração: calor de vela, brilho de cetim, ouro de botão e de linha metálica. O sistema a usa com disciplina de ateliê. Os cremes são o chão, o café e o bronze escrevem, e **os dourados e o rosé enfeitam mas nunca carregam texto** sobre fundo claro. É isso que separa o acabamento premium do “template de casamento”: o dourado aparece como fio, botão e reflexo, não como letra cursiva sobre fundo rosa.

Contraste calculado pela fórmula WCAG 2.1 (luminância relativa). **AA** = 4.5:1 texto normal, 3:1 texto ≥ 24px (ou 18.66px bold) e elementos não-textuais.

## A paleta

| Nome | HEX | Token | Papel | Leitura no ofício |
|---|---|---|---|---|
| **Creme marfim** | `#FDF7E7` | `--at-color-marfim` | Fundo da página; texto sobre café | O cetim marfim do vestido |
| **Creme manteiga** | `#F9F1D8` | `--at-color-manteiga` | Fundo 2: seções alternadas, cards, formulário, rodapé, hover de superfície | O forro, um tom abaixo |
| **Rosé blush** | `#F3DFD2` | `--at-color-rose` | Detalhe: passe-partout de imagem, porta “Noivas & madrinhas”, realces | O tule rosado da madrinha |
| **Dourado claro** | `#C6AF6C` | `--at-color-dourado-claro` | Brilho: reflexos; sobre café, texto secundário, link e foco | A luz no cetim |
| **Dourado principal** | `#B99847` | `--at-color-dourado` | Marca: monograma, costuras desenhadas, fita de progresso, item ativo, hover do botão | O fio metálico, o botão dourado |
| **Dourado antigo** | `#B19F6E` | `--at-color-dourado-antigo` | Traços: divisórias, linhas de construção, numeração decorativa | O alfinete de latão, a fita métrica gasta |
| **Bronze** | `#7A6230` | `--at-color-bronze` | Texto secundário, links, anel de foco, borda de campo, sucesso | O dedal |
| **Café** | `#3D3226` | `--at-color-cafe` | Texto principal, botão primário, ícones, fundo do registro Casimira | A lã escura do terno |

**Funcional (fora da paleta de marca):** `--at-color-erro` `#9A3B2E`, terracota. Nenhuma das oito cores sinaliza erro com contraste suficiente sem se confundir com o bronze dos links; por isso existe uma única cor extra, usada **só** em mensagens de erro e sempre com ícone.

## Contraste

### Texto sobre fundos claros

| Cor do texto | Marfim | Manteiga | Rosé | Uso permitido |
|---|---|---|---|---|
| **Café** | **11.67** AAA | 11.05 | 9.69 | qualquer texto |
| **Bronze** | **5.43** AA | 5.14 | 4.51 | qualquer texto (no rosé, no limite: evitar texto pequeno) |
| Erro | 6.46 | 6.12 | — | mensagens de erro |
| Dourado principal | 2.57 | 2.43 | 2.13 | ✗ nunca texto; traço e preenchimento |
| Dourado antigo | 2.44 | 2.31 | 2.02 | ✗ nunca texto; traço decorativo |
| Dourado claro | 2.01 | 1.91 | 1.67 | ✗ nunca texto; reflexo |

### Sobre café (registro Casimira, botão primário)

| Cor | Contraste | Uso |
|---|---|---|
| Marfim | **11.67** | texto principal |
| Manteiga | 11.05 | rótulo do botão primário |
| Rosé | 9.69 | detalhe |
| Dourado claro | **5.79** | texto secundário, link, foco |
| Dourado antigo | 4.79 | traços, legendas grandes |
| Dourado principal | 4.54 | costuras, detalhes |

### Combinações de botão

| Estado | Fundo | Texto | Contraste |
|---|---|---|---|
| Primário | Café | Manteiga | 11.05 |
| Primário · hover | **Dourado** | Café | 4.54 AA |
| Primário Casimira | Marfim | Café | 11.67 |
| Primário Casimira · hover | Dourado claro | Café | 5.79 |

## Distribuição

Proporção de área típica numa tela: **~70% cremes · ~15% café/bronze (texto) · ~10% rosé (imagens, detalhe) · ≤ 5% dourados.** O dourado vale mais quanto menos aparece: no monograma, na linha que costura a tela, no botão que gira, na fita de progresso.

## Véus (overlays)

| Token | Valor | Uso |
|---|---|---|
| `--at-veil-tule` | Marfim a 72% + `backdrop-filter: blur(14px)` | Header rolado, cortina de entrada de imagem |
| `--at-veil-tule-noite` | Café a 72% | Header sobre seções Casimira |
| `--at-veil-sombra` | Café a 28% | Escurecer foto sob texto claro |
| `--at-veil-organza` | gradiente café 0 → 45% | Base de imagem com legenda |
| `--at-veil-organza-lateral` | gradiente horizontal: café 45% até 42% da largura, 0 em 46% | Texto claro à esquerda sobre fotografia (o assunto da foto fica da metade para a direita) |

## Estados

| Estado | Tratamento |
|---|---|
| Hover (botão primário) | O **dourado cai** sobre o café (clip de cima para baixo, 480ms); texto vira café |
| Hover (superfície) | Fundo → Manteiga |
| Foco | `outline: 2px solid` bronze, `offset 3px` (dourado claro sobre café) |
| Pressionado | `scale(.98)` em 120ms |
| Desabilitado | Opacidade 42% + `cursor: not-allowed`; em escolhas, texto riscado |
| Selecionado (escolha) | Fundo café, texto manteiga, ponto dourado |
| Erro | Linha do campo em terracota + ícone de alerta + mensagem |
| Válido | Linha do campo em bronze |

## Não faça

- Texto em qualquer dourado sobre creme ou rosé (todos abaixo de 3:1).
- Dourado como cor de link ou de anel de foco sobre fundo claro (use bronze).
- Gradientes dourados, “folha de ouro”, brilho animado em texto.
- Rosé em grandes áreas com texto corrido longo (o bronze cai para 4.51:1).
- Erro só pela cor: sempre ícone + frase.
