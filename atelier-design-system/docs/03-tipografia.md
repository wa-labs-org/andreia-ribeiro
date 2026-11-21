# 03 · Tipografia

Três famílias, todas no Google Fonts, cada uma com um papel do ofício.

## Display: Fraunces (variável: opsz, wght, SOFT, WONK, itálico)

**Por quê:** serifa de alto contraste com *optical size* (fica fina e elegante em 160px, robusta em 20px) e com um eixo raro, **SOFT**, que arredonda os terminais. Com ele, **a mesma letra veste dois tecidos**:

- **SOFT 100 → registro Seda.** Terminais macios, curvas cheias: o caimento do crepe.
- **SOFT 0 → registro Casimira.** Terminais secos, cortes retos: a lapela de um paletó.

Assim noivas e noivos compartilham família, escala e hierarquia, e mudam só a *textura* da letra. O itálico com **WONK 1** (as hastes inclinadas e caprichosas da Fraunces) é o **“ponto à mão”**: uma palavra emocional por título.

*Herança Elicyon:* a postura de display serifado e fino em tamanho dramático. *Diferença:* em vez de caixa-alta e letra a letra, caixa normal + itálico pontual (mais íntimo, menos institucional).

## Texto: Instrument Sans (variável: wdth 75–100, wght 400–700)

**Por quê:** grotesca calma e legível em corpo pequeno, com **eixo de largura**. Larga (100) no corpo de texto, estreita (80–85) e espaçada em caixa-alta nos rótulos e botões, como as marcações impressas de uma **fita métrica**.

## Anotação: IBM Plex Mono

**Por quê:** é a letra da costureira no molde: medidas, códigos de peça, contadores, datas. Números tabulares, caixa-alta, 11px. **Nunca** em parágrafos.

## Escala

Fluida (`clamp`) do mobile (360) ao desktop (1440); valores em px aproximados.

| Papel | Token | Família / peso | Tamanho mobile → 1440 | Entrelinha | Tracking |
|---|---|---|---|---|---|
| Display XL | `--at-text-display-xl` | Fraunces 300 | 52 → 147 (máx 168) | 0.92 | −0.022em |
| Display L | `--at-text-display-l` | Fraunces 300 | 44 → 105 (máx 108) | 0.92 | −0.022em |
| H1 | `--at-text-h1` | Fraunces 350 | 36 → 72 | 1.04 | −0.012em |
| H2 | `--at-text-h2` | Fraunces 350 | 30 → 52 | 1.04 | −0.012em |
| H3 | `--at-text-h3` | Fraunces 400 | 24 → 36 | 1.25 | −0.012em |
| H4 / título de card | `--at-text-h4` | Fraunces 400 | 20 → 24 | 1.25 | 0 |
| Lead | `--at-text-lead` | Fraunces 300 | 20 → 28 | 1.4 | 0 |
| Body L | `--at-text-body-l` | Instrument 400 | 18 | 1.62 | 0 |
| Body | `--at-text-body` | Instrument 400 | 16 | 1.62 | 0 |
| Body S | `--at-text-body-s` | Instrument 400 | 14 | 1.55 | 0 |
| Label | `--at-text-label` | Instrument 600 · wdth 80 · CAIXA-ALTA | 12 | 1.2 | +0.16em |
| Botão | `--at-text-button` | Instrument 600 · wdth 85 · CAIXA-ALTA | 13 | 1 | +0.12em |
| Anotação | `--at-text-note` | Plex Mono 400 · CAIXA-ALTA | 11 | 1.5 | +0.04em |

Classes: `.at-display-xl`, `.at-display-l`, `.at-h1`…`.at-h4`, `.at-lead`, `.at-body-l`, `.at-body`, `.at-body-s`, `.at-label`, `.at-note`, `.at-muted`, `.at-eyebrow` (label com pique).

## Pesos

Display: 300 (títulos grandes), 350 (H1/H2), 400 (H3/H4 e cards). Nunca acima de 500: a peça é leve. Texto: 400 corpo, 500 escolhas, 600 rótulos/botões.

## Regras de uso

1. **Uma palavra em itálico por título**, a emocional: “A peça certa *começa* na primeira prova.” Nunca a frase inteira, nunca em texto corrido.
2. **Títulos em caixa normal.** Caixa-alta é exclusiva de rótulos e botões (Instrument estreita e espaçada).
3. **Comprimento de linha:** corpo até 62ch (`--at-measure`), lead até 38ch (`--at-measure-narrow`).
4. **Fraunces abaixo de 20px só em H4/cards**; abaixo disso, Instrument Sans.
5. `text-wrap: balance` em títulos, `pretty` em parágrafos.
6. **SOFT automático:** `[data-registro="casimira"]` define `--at-soft: 0`; o resto herda 100.
7. Número em destaque (ex.: “3 provas”) em Fraunces H1 + legenda em `.at-note`.
8. Hierarquia por **escala e espaço**, não por cor. Cor de texto só café (principal) e bronze (secundário e link); dourado claro apenas sobre café.

## Carregamento

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,0..100,0..1;1,9..144,300..600,0..100,0..1&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap">
```

`display=swap`: o texto aparece com o fallback (Georgia / Helvetica) e troca quando a fonte chega. O motor de motion **refaz a divisão em linhas** quando `document.fonts.ready` resolve, para que as quebras medidas no fallback não fiquem erradas. Em produção, recomenda-se auto-hospedar as fontes em WOFF2 com `subset` latino.
