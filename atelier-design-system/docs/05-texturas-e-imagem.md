# 05 · Textura, elementos gráficos e imagem

Nenhum ornamento é decorativo: cada elemento gráfico é **uma ferramenta ou marca real do ateliê**, usada onde faz o mesmo trabalho que faz no tecido.

## Costuras (linhas)

| Elemento | Padrão | Classe | Onde | Por quê |
|---|---|---|---|---|
| **Ponto corrido** | traço 6 / vão 5, Dourado antigo | `.at-stitch` | Divisórias, base do header rolado | A costura simples que junta duas partes. |
| **Alinhavo** | 14 / 8, Dourado principal | `.at-stitch--alinhavo`, `.at-thread__seam` | Linhas de movimento, cortina, hero | O ponto provisório, longo e em linha de contraste. É a assinatura do sistema. |
| **Pesponto** | 3 / 3 | `.at-stitch--pesponto` | Borda de campo, botão secundário | O pesponto aparente: acabamento visível. |
| **Costura sólida** | 1px, 25% | `.at-stitch--solida` | Tabelas, listas | Quando a linha não deve chamar atenção. |
| **Overlock** | zigue-zague 16 × 8 | `.at-overlock` | Borda superior do rodapé | O acabamento da borda interna: o “fim” do tecido. |

Linhas curvas são SVG (`svg.at-thread[data-stitch]`) e se desenham por máscara (ver [07-motion](07-motion.md)).

## Marcas de molde

| Elemento | Classe | Uso | Por quê |
|---|---|---|---|
| **Pique** (entalhe triangular) | `.at-pique`, `.at-eyebrow::before` | Antes de rótulos de seção, topo de CTA | No molde, indica onde duas peças se encontram: aqui, onde o leitor entra na seção. |
| **Marcas de corte** | `.at-crop` | Hover de cards, destaques | Mostram “a área que será cortada”: a peça está sendo escolhida. |
| **Fio do tecido** (seta dupla vertical) | `.at-grain` | Indicador de rolagem | No molde, indica a direção do fio. Aqui, a direção da leitura. |
| **Marcação de prova** | `.at-prova__mark` | Pontos de ajuste com linha de chamada | Como os alfinetes e marcas de giz da prova. |
| **Etiqueta tecida** | `.at-label-woven` | Assinatura de depoimento | A etiqueta presa por dois pontos dentro da peça. |
| **Etiqueta-pílula** | `.at-tag` | Status da peça (Sob medida, Ajuste…) | A etiqueta de papel presa à peça na arara. |

## Texturas de fundo

| Textura | Classe | Registro | Intensidade |
|---|---|---|---|
| **Tule** (rede hexagonal) | `.at-tex-tule` | Seda | traço 9% (SVG 14 × 24) |
| **Risca de giz** | `.at-tex-risca` | Casimira | 1px a 7% a cada 28px |
| **Papel milimetrado** | `.at-tex-molde` | Ambos (vista do molde) | bronze 7%, 24px |

Regra: **no máximo uma textura por seção**, sempre abaixo de 10% de opacidade. Textura nunca sob texto corrido longo.

## Ícones

24 × 24, traço **1.25px** (a espessura de uma linha de costura vista de perto), cantos vivos, sem preenchimento, `currentColor`. Os ícones de ofício (agulha, carretel, botão) carregam um trecho em pesponto. Sprite em `assets/images/svg/icons.svg` e `assets/js/icons.js` (injeta inline, funciona via `file://`).

Conjunto: agulha, alfinete, tesoura, fita, botão, cabide, manequim, carretel, calendário, seta, seta-esq, fio, mais, fechar, check, alerta, local, relógio, menu.

```html
<svg class="at-icon" aria-hidden="true"><use href="#i-agulha"/></svg>
```

## Monograma

Um **botão de quatro furos pregado com linha dourada em X** (`assets/images/svg/monograma.svg`): o primeiro ponto que prende uma peça ao corpo de quem a veste. Gira 90° no hover, como o botão passando pela casa. Acompanha o nome em Fraunces + rótulo “Atelier · sob medida”.

## Fotografia

### Direção
- **Luz natural lateral**, da janela do ateliê. Sombra macia que mostra o volume do tecido.
- **Fundo de morim**, papel de molde ou parede crua. A peça é a única cor forte do quadro.
- **Três planos por peça:** inteira (manequim ou corpo), **macro** (bordado, casa de botão, barra, renda) e **mãos trabalhando**.
- **Noivas e noivos na mesma luz e no mesmo enquadramento.** Muda o tecido, não a direção de arte.
- Pessoas de corpos, idades e tons de pele diversos. A peça sob medida existe porque os corpos são diferentes.

### Tratamento
- Sombras levemente erguidas, saturação −10, temperatura neutra a quente, grão fino opcional.
- Sem filtros “vintage”, sem vinheta, sem bokeh dourado.
- Recorte sempre reto (radius 0). Passe-partout em rosé blush (Seda) ou café (Casimira).
- Legenda em `.at-note`: “Foto 01 · prova final · luz da janela”.

### Não
- Casal ao pôr do sol, véu ao vento, alianças em close: é a foto do fotógrafo de casamento, não do ateliê.
- Fundo infinito branco de e-commerce.
- Corações, flores digitais, molduras ornamentais sobrepostas.
- Rosto em primeiro plano roubando a atenção do caimento.

### Placeholders
Enquanto não há fotografia, o sistema usa **croquis em linha** (`assets/images/figurinos/*.svg`) com linhas de construção em dourado e fio do tecido em bronze: o “molde” da imagem que virá. A versão `noiva-prova.svg` é limpa, para receber as marcações do componente “prova no manequim”.

### Técnico
AVIF/WebP com fallback JPEG · `srcset` 480/960/1440/1920 · `loading="lazy"` fora do primeiro viewport · `fetchpriority="high"` na imagem do hero · `width`/`height` sempre declarados (CLS zero) · `alt` descrevendo peça, tecido e detalhe, não “foto de vestido”.
