# 04 · Grid, layout, espaçamento e breakpoints

## A unidade: o ponto

Base **4px = 1 ponto**. A escala cresce como uma costura: pontos curtos para detalhe, pontos longos (alinhavo) para separar peças.

| Token | px | Uso típico |
|---|---|---|
| `--at-space-1` | 4 | ícone ↔ texto mínimo |
| `--at-space-2` | 8 | gap entre etiquetas |
| `--at-space-3` | 12 | ícone ↔ rótulo, legenda ↔ imagem |
| `--at-space-4` | 16 | gutter mobile, padding de linha |
| `--at-space-5` | 24 | entre campos, entre título de card e meta |
| `--at-space-6` | 32 | padding de painel, entre blocos de texto |
| `--at-space-7` | 48 | entre grupos dentro de uma seção |
| `--at-space-8` | 64 | título ↔ conteúdo de seção (desktop) |
| `--at-space-9` | 96 | deslocamento de coluna (ritmo de arara) |
| `--at-space-10` | 128 | topo de grupo no catálogo |
| `--at-space-11` | 192 | reservado |
| `--at-section-y` | 96 → 224 | respiro vertical entre seções |
| `--at-section-y-s` | 64 → 128 | seções compactas |

*Herança Elicyon:* respiro generoso entre seções e parágrafos estreitos em muito vazio.

## Grid

Mobile first. Colunas fluidas, gutter e margem fixos por faixa.

| Breakpoint | Largura | Colunas | Gutter | Margem |
|---|---|---|---|---|
| base | 0–479 | 4 | 16 | 20 |
| sm | 480–767 | 4 | 16 | 20 |
| md | 768–1023 | 8 | 20 | 32 |
| lg | 1024–1439 | 12 | 24 | 48 |
| xl | ≥ 1440 | 12 | 24 | 64 |
| máx. de conteúdo | | | | 1600 centrado |

```html
<div class="at-container">
  <div class="at-grid">
    <h2 class="at-col-full at-col-lg-4">…</h2>
    <div class="at-col-full at-col-lg-7 at-col-lg-start-6">…</div>
  </div>
</div>
```

Largura e início se combinam via variáveis (`--lg-span`, `--lg-start`): `.at-col-lg-7 .at-col-lg-start-6` ocupa as colunas 6 a 12. Abaixo do breakpoint, tudo volta a largura total.

## Composições recorrentes (desktop)

| Padrão | Colunas | Onde |
|---|---|---|
| **Rótulo à esquerda** | rótulo 1–3 · conteúdo 4–11 | “O ofício”, depoimentos |
| **Título + formulário** | 1–4 · 6–12 | agendamento, FAQ |
| **Texto + par de imagens** | 1–5 · 7–12 (2 col, a 2ª descida 96px) | alfaiataria |
| **Hero sobreposto** | título 1–8 sobre imagem 8–12 | hero |
| **Grade de arara** | 3 col, a do meio descida 96px | coleção |
| **Portas** | 2 painéis flex, 88vh | home |

## Forma

| Token | Valor | Uso |
|---|---|---|
| `--at-radius-corte` | 0 | Imagens, cards, botões, painéis. **Tecido é cortado, não arredondado.** |
| `--at-radius-campo` | 2px | Datas e palcos técnicos |
| `--at-radius-botao` | 999px | Só o que é redondo de verdade: botão de costura, etiqueta, alfinete |

## Proporções de imagem

3:4 peça · 4:5 hero mobile · 2:3 manequim · 1:1 detalhe · 21:9 abertura de coleção.

## Camadas (z-index)

`base 1 · sticky 50 · header 90 · menu 95 · cursor 120 · transição 200`.
