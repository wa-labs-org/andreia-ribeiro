# Decisões: o que veio de cada referência e o que é novo

**Alinhavo** não é uma mistura dos dois sistemas. É a **postura** do Elicyon somada à **infraestrutura de movimento** do Lando Norris, ambas reescritas na linguagem do ateliê. Resumo das leituras em [docs/00-leitura-das-referencias.md](docs/00-leitura-das-referencias.md).

## Herdado do Elicyon: classe

| Elicyon | Como virou no Alinhavo |
|---|---|
| Chão creme quente (`#F4F2EE`) e cor delegada à fotografia | **Creme marfim** `#FDF7E7` e **creme manteiga** `#F9F1D8`: mesmo papel de chão claro e quente. |
| Display serifado fino em escala dramática | **Fraunces 300** em até 168px. Caixa normal em vez de caixa-alta: mais íntimo. |
| Rótulos e botões em caixa-alta espaçada (0.1–0.15em) | **Instrument Sans estreita** (wdth 80) a +0.16em, “marcações de fita métrica”. |
| Respiro enorme entre seções, parágrafos estreitos | `--at-section-y` 96 → 224px, `--at-measure` 62ch, lead 38ch. |
| Campos só com borda inferior | Mantido, mas a borda é **pesponto** e o foco é visível (bronze), por acessibilidade. |
| Link sublinhado de 1px animado | O sublinhado é **costurado** (ponto corrido que se desenha / vira pesponto). |
| Header que some ao descer e volta ao subir | Mantido + véu de **tule** + costura na base. |
| Assinatura gigante no rodapé, letras subindo | Mantido, em Fraunces SOFT 100, sobre borda **overlock**. |
| Tom editorial, sem urgência | Princípio 3, **Silêncio de ateliê**, com regras de microcopy. |

## Herdado do Lando Norris: movimento

| Lando | Como virou no Alinhavo |
|---|---|
| Token global de curva + duração (`--animation-default`) | **Sistema de tokens** com 6 durações e 6 curvas nomeadas por gestos (`caimento`, `cortina`, `corte`, `linha`, `saida`, `balanço`). |
| *Line highlight reveal* (clip por linha + bloco de cor que se retrai) | **Revelação de linhas** (máscara por linha) + **cortina de tule** (o bloco de cor virou véu translúcido). |
| *Text roll* nos botões (0.02s/letra) | **Rolagem de letras** (18ms/letra, curva linha). |
| *Helmet reveal*: `clip-path ellipse(… at 50% 0%)` | **A saia que desce**: a vista do molde cai em elipse sobre o card. |
| Navbar que troca de tema por seção (`data-nav-theme`) | **Troca de tecido**: o header vira “noite” sobre seções Casimira. |
| ScrollTrigger com scrub, seções fixadas, galeria horizontal | **Prova no manequim** (fixada), **linha que acompanha** (scrub), **arara** (horizontal fixada). |
| Transição de página (Rive) | **Cortina de marfim** que cai, costura no centro, sobe na página nova. |
| Cursor como instrumento (shader no hero) | **Agulha e linha**: ponto + anel + linha dourada puxada no hero. |
| Staggers curtos, UI rápida, cenas lentas | Mesmo ritmo: 18 / 80 / 120ms; UI 240–480ms; cenas 1200–1800ms. |

## O que é novo (nascido da costura)

1. **Conceito “Alinhavo”:** a interface prova, ajusta e arremata. Os princípios, tokens e componentes têm nomes do ofício.
2. **Dois registros, um sistema: Seda e Casimira.** Noivas/madrinhas e noivos/padrinhos compartilham grid, componentes e voz; `[data-registro="casimira"]` troca fundo, contraste, o **eixo SOFT da Fraunces** (100 → 0) e a curva de motion (caimento → corte, ×0.85).
3. **Paleta de celebração com disciplina de ateliê:** cremes como chão, café e bronze para texto, rosé como detalhe e três dourados (brilho, marca, traços) usados como fio, botão e reflexo, nunca como letra sobre fundo claro.
4. **Costuras como sistema gráfico:** ponto corrido, alinhavo, pesponto, overlock, piques, marcas de corte, fio do tecido, cada um com função definida.
5. **Desenho de linha por máscara** (`svg[data-stitch]`): a linha tracejada é percorrida pela agulha, sem que os pontos apareçam um a um.
6. **Queda de tecido** e **corte** como pares de entrada (Seda / Casimira).
7. **Prova no manequim:** marcações de ajuste que acendem com a rolagem.
8. **Arara com balanço** físico proporcional à velocidade.
9. **Fita métrica** como barra de progresso.
10. **Botão de costura:** monograma (botão pregado em X) e ícone do CTA que gira 90°.
11. **Pesponto que corre** no botão secundário; **etiqueta tecida** nos depoimentos; **alfinetes** no FAQ; **bainha picotada** e **brilho de tecido** no mostruário.
12. **Loader “enfiar a agulha”** e esqueleto com **brilho de cetim**.
13. **Anotação em mono** como letra da costureira no molde.
14. **Croquis com linhas de construção** como placeholders de fotografia.
15. **Movimento reduzido por tokens:** zerar distâncias e encurtar durações faz o sistema inteiro degradar sozinho para fades.

## O que foi deliberadamente evitado
- Dourado como texto ou em gradiente “folha de ouro”, script cursiva, corações, alianças, “vestido dos sonhos”.
- Caixa-alta nos títulos (Elicyon), cor neon e WebGL (Lando): não combinam com o silêncio do ateliê nem com o desempenho em celular.
- Cursor que esconde o ponteiro do sistema (Elicyon): mantemos o nativo por acessibilidade.
- Autoplay em depoimentos e loops decorativos permanentes.
