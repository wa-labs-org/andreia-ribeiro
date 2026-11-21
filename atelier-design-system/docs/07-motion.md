# 07 · Motion system

O movimento é a peça central do sistema. Ele não imita a costura com ilustrações; ele **se comporta** como tecido, linha e tesoura.

## Os três gestos

| Gesto | O que acontece no ateliê | O que acontece na tela | Curva |
|---|---|---|---|
| **A linha que costura** | A agulha passa e deixa um rastro de pontos. | Traços tracejados se desenham por máscara; sublinhados viram pesponto. | `linha` |
| **O tecido que cai** | Solto do alto, o tecido despenca rápido e assenta devagar. | Imagens e textos entram de cima ou de trás de uma máscara, rápidos no início, lentos no fim. | `caimento`, `cortina` |
| **O ajuste** | O pequeno acerto final: o alfinete, o botão que entra na casa. | Leve sobrepasso e acomodação em objetos pequenos (botão, cabide, ponto selecionado). | `balanço` |

> Regra de ouro (Princípio 5): **se uma animação não une, não cai e não ajusta, ela sai.**

## Tokens

### Duração

| Token | Valor | Uso |
|---|---|---|
| `--at-dur-instante` | 120ms | Feedback de toque (escala .98), troca de cor |
| `--at-dur-ponto` | 240ms | Hover curto, ícones, opacidade de marcas de corte |
| `--at-dur-alinhavo` | 480ms | UI: fill de botão, menu toggle, acordeão, foco de campo, rolagem de letras |
| `--at-dur-caimento` | 800ms | Revelação de texto e imagem, cards, FLIP |
| `--at-dur-cerimonia` | 1200ms | Cortina de tule, queda de tecido, transição de página, portas |
| `--at-dur-bordado` | 1800ms | Desenho de linha longa, nó de arremate |

### Curvas

| Token | Valor | Uso | Origem |
|---|---|---|---|
| `--at-ease-caimento` | `cubic-bezier(.16, 1, .3, 1)` | **Entradas.** Cai rápido, assenta devagar. | Família do `power2/expo.out` do Lando, mais longa na cauda |
| `--at-ease-cortina` | `cubic-bezier(.7, 0, .2, 1)` | Wipes, menu, página, porta. Tule sendo puxado. | Próximo de `(0.65, 0.05, 0, 1)` do Lando e `(0.77, 0, 0.175, 1)` do Elicyon |
| `--at-ease-corte` | `cubic-bezier(.5, 0, .1, 1)` | **Registro Casimira.** Tesoura de alfaiate: decidida. | Novo |
| `--at-ease-linha` | `cubic-bezier(.45, .05, .25, 1)` | Traços, costuras, rolagem de letras. Ritmo de máquina, pontas suaves. | Novo |
| `--at-ease-saida` | `cubic-bezier(.55, 0, 1, .45)` | Saídas (sempre 60% da entrada) | Novo |
| `--at-ease-balanco` | `linear(0, .34 8%, .86 17%, 1.05 26%, 1.03 34%, .995 46%, 1)` | Mola leve: botão que gira, ponto selecionado, magnetismo. Só objetos pequenos. | Novo (substitui o `elastic` do Lando, mais contido) |

### Atrasos e coreografia

| Token | Valor | Uso |
|---|---|---|
| `--at-stagger-letra` | 18ms | Rolagem de letras (Lando: 20ms) |
| `--at-stagger-linha` | 80ms | Linhas de texto (60ms em Casimira) |
| `--at-stagger-peca` | 120ms | Cards na mesma fileira |
| `--at-delay-respiro` | 200ms | Intervalo entre camadas da hierarquia |
| `--at-exit-ratio` | 0.6 | Saída = 60% da entrada |

### Distâncias
`--at-move-linha: 105%` (texto sobe de trás da máscara) · `--at-move-peca: 2.5rem` · `--at-scale-tule: 1.12` · `--at-parallax: .12`.

### Registro Casimira
`[data-registro="casimira"]` troca `--at-ease-caimento` por `corte`, reduz `--at-dur-caimento` para 680ms (×0.85) e `--at-stagger-linha` para 60ms. **Mesma coreografia, gesto mais seco**: alfaiataria não esvoaça.

---

## Catálogo de animações

### Entrada

| Nome | Gatilho | Descrição | Valores | Quando usar |
|---|---|---|---|---|
| **Revelação de linhas** | `data-reveal="linhas"` | O texto é dividido em linhas reais (preservando `<em>`); cada linha sobe de trás de uma máscara, como a bainha sendo virada. | translateY 105% → 0 + opacidade · caimento 800ms · stagger 80ms | Títulos, leads, citações |
| **Cortina de tule** | `data-reveal="tule"` | Um véu translúcido (marfim 72% + blur 18px) sobe e revela a imagem, que assenta de 1.12 para 1. | véu: cortina 1200ms · imagem: caimento 1680ms | **A primeira imagem** de cada página (hero) e destaques |
| **Queda de tecido** | `data-reveal="queda"` | A imagem se desenrola de cima para baixo, levemente alongada (scaleY 1.08), e assenta. | clip inset(0 0 100% 0) → 0 · cortina 1200ms | Portas de coleção, imagens secundárias, abertura de coleção |
| **Corte** | `data-reveal="corte"` | Wipe reto da esquerda para a direita, curva corte. A queda traduzida para a alfaiataria. | clip inset(0 100% 0 0) → 0 · corte 680ms | Imagens no registro Casimira |
| **Alinhavo** | `svg[data-stitch]`, `hr[data-reveal="costura"]` | A linha tracejada é revelada por uma máscara (`pathLength=1`) que percorre o traço: a agulha passa. | stroke-dashoffset 1 → 0 · linha 1800ms | Ligar título e imagem, divisórias, rodapé |
| **Peças em sequência** | `data-reveal="pecas"` + `[data-reveal-item]` | Itens sobem 40px; o índice é calculado **por fileira** e para no 6º. | caimento 800ms · stagger 120ms | Grades de cards, listas, números |
| **Fade** | `data-reveal="fade"` | Só opacidade. | caimento 800ms | Eyebrows, metadados, grupos de CTA |
| **Assinatura** | `.at-footer__mark` | Letras do nome sobem uma a uma. | caimento 1200ms · 40ms | Rodapé |

### Rolagem

| Nome | Gatilho | Descrição | Quando usar |
|---|---|---|---|
| **Prova no manequim** | `.at-prova` + `[data-step]` + `[data-mark]` | Seção fixada (360vh) enquanto a rolagem “passa a peça no manequim”: cada passo acende uma marcação de ajuste com sua linha de chamada (busto → cintura → caimento → barra). Passo = ⌊progresso × 4⌋. | **Uma vez por página**, para explicar processo |
| **Linha que acompanha** | `svg[data-stitch="scrub"]` dentro de `[data-scrub-host]` | O traço é desenhado proporcionalmente à rolagem da seção (sem easing: a mão do leitor é a agulha). | Seção manifesto (“O ofício”) |
| **Arara** | `.at-arara[data-pin]` | Desktop: seção fixada, rolagem vertical → horizontal. Peças balançam no gancho com mola amortecida (k .12, atrito .8, até 5°) proporcional à velocidade. | Galeria de peças recentes |
| **Paralaxe** | `[data-parallax="0.08"]` | A imagem desliza 8–12% dentro da moldura, como a peça balançando no manequim. | Hero, abertura de coleção |
| **Fita métrica** | `.at-fita` | Progresso de leitura em dourado com marcações de centímetro. | Todas as páginas |
| **Troca de tecido do header** | `[data-registro="casimira"]` | O header inverte ao passar sobre seções Casimira. | Automático |

### Hover e interação

| Nome | Onde | Descrição | Valores |
|---|---|---|---|
| **Dourado que cai** | `.at-btn` | O preenchimento dourado cai de cima. | clip 480ms cortina |
| **Rolagem de letras** | `[data-roll]` | Letras saem por cima, a cópia entra por baixo. | 480ms linha · 18ms/letra |
| **Botão de costura** | `.at-btn__botao`, `.at-brand__mono` | Gira 90° com sobrepasso. | 480ms balanço |
| **Pesponto que corre** | `.at-btn--pesponto` | O tracejado da borda anda (loop enquanto em hover). | 500ms linear |
| **Linha que vira pesponto** | `.at-btn--linha`, `.at-link` | Sublinhado sólido → tracejado em movimento. | 600ms linear |
| **Ponto corrido que se desenha** | `.at-navlink` | Sublinhado tracejado entra da esquerda. | 480ms linha |
| **Caimento do card** | `.at-card` | Alongamento do ombro + vista do molde que desce em elipse + marcas de corte. | 800ms caimento / cortina |
| **Porta que abre** | `.at-door` | Flex 1 → 1.35, a outra recua. | 1200ms cortina |
| **Brilho do tecido** | `.at-swatch` | Reflexo diagonal atravessa a amostra. | 1200ms caimento |
| **Alfinetes** | `.at-faq__icon`, `.at-menu-toggle` | Duas linhas giram e se cruzam. | 480ms cortina |
| **Magnetismo** | `[data-magnet]` | O botão segue o cursor até 8px e volta com balanço. | balanço 480ms |

### Cursor: agulha e linha
- O **cursor do sistema permanece** (acessibilidade). Um ponto (agulha) segue o mouse; um anel segue com atraso (lerp .2).
- Sobre links/botões: o anel cresce. Sobre `[data-cursor-label]`: o anel vira uma etiqueta preenchida (“Ver peça”, “Abrir”).
- Em `[data-cursor-thread]` (hero): uma **linha tracejada dourada** de 22 pontos é puxada atrás do cursor (canvas, lerp .38), e se recolhe ao sair.
- Sobre Casimira: cores invertem.
- Só com `(hover: hover) and (pointer: fine)`. Desligado em toque e em movimento reduzido.

### Transição de página: a cortina
Links com `data-transition`:
1. **Cobre:** a cortina de morim **cai do topo** (`clip-path inset(0 0 100% 0) → 0`, 720ms cortina), e uma linha de alinhavo atravessa o centro (1200ms linha).
2. **Navega** (aos ~1080ms).
3. **Revela:** na página nova a cortina já começa fechada (classe `at-arriving` aplicada no `<head>`, sem piscar) e **sobe** (900ms cortina). Aos 35%, a entrada do hero começa.

Implementado sem framework (sessionStorage + classe no `<html>`). Em SPA, o mesmo par cobre/revela vale para os hooks do router; a [View Transitions API](https://developer.mozilla.org/docs/Web/API/View_Transition_API) é um caminho futuro.

### Loading
| Nome | Descrição | Regras |
|---|---|---|
| **Enfiar a agulha** | Agulha estática; a linha dourada se desenha e passa pelo buraco; contador mede “000 → 100 cm”. | Só na **primeira visita da sessão** e só em páginas com `<html data-loader>`. Mínimo 1.4s (para não piscar), máximo 3s, termina quando `document.fonts.ready` resolve. |
| **Brilho de cetim** | Esqueleto em Papel molde com reflexo diagonal lento (2.4s). | Imagens e cards carregando. |
| **Pontos de costura** | Três traços que acendem em sequência dentro do botão. | Envio de formulário (`.is-loading`). |

---

## Coreografia

1. **Hierarquia do tecido.** A ordem de entrada é sempre: ① chão e imagem (tule/queda) → ② título, linha a linha → ③ costura que liga as partes → ④ corpo e CTA. Cada camada começa ~200ms após a anterior (`--at-delay-respiro`).
2. **No máximo três coisas em movimento ao mesmo tempo** por viewport. Mais que isso, agrupe.
3. **Stagger para no 6º item.** Depois disso, a sequência só atrasa a leitura.
4. **Uma única peça grande ligada à rolagem por tela** (paralaxe, arara *ou* manequim). Nunca duas no mesmo viewport.
5. **Entrada uma vez só.** O tecido não cai duas vezes: revelações não se repetem ao rolar de volta.
6. **A interação responde em ≤ 120ms.** O ornamento pode vir depois; o feedback, não.
7. **Saídas são mais curtas** (60%) e usam a curva `saida`.
8. **Casimira é mais seca:** mesma ordem, curva corte, ×0.85.
9. **Objetos grandes não quicam.** Balanço só em objetos ≤ 56px (botão, ponto, ícone).

### Partitura do hero

| ms | 0 | 150 | 500 | 600 | 700 | 850 | 1200 | 1680 | 2500 |
|---|---|---|---|---|---|---|---|---|---|
| Cortina de tule (sobe) | ▶ | | | | | | ■ | | |
| Imagem assenta 1.12 → 1 | ▶ | | | | | | | ■ | |
| Título (3 linhas, 80ms) | | ▶ | | | | | ■ | | |
| Eyebrow (fade) | | | ▶ | | | | | | |
| Lead (linhas) | | | | ▶ | | | | | |
| Alinhavo atravessa | | | | | ▶ | | | | ■ |
| CTAs (fade) | | | | | | ▶ | | | |

---

## Movimento reduzido (`prefers-reduced-motion: reduce`)

O fallback é **por tokens** primeiro e por regra depois:

1. Os tokens zeram deslocamento, escala, paralaxe e stagger, e encurtam durações (`--at-move-linha: 0%`, `--at-scale-tule: 1`, `--at-dur-caimento: 200ms`…). Assim, todo componente que usa tokens **degrada sozinho para um fade curto**.
2. Regras explícitas em `[data-motion="reduce"]`:
   - Clip-paths (queda, corte, costura) viram opacidade; o véu de tule some em opacidade.
   - Costuras SVG aparecem **já desenhadas**.
   - **Nada em loop:** pesponto, pulso do fio, brilho de cetim, pontos de carregamento.
   - Nada gira (botão de costura, monograma) nem alonga (card, porta).
   - **Seções fixadas viram fluxo normal** (manequim mostra todos os passos e marcas; a arara volta a scroll-snap nativo).
   - Cursor customizado e linha desligados.
   - Transição de página → crossfade de 160ms; loader → 200ms com a linha já passada.
   - A **fita métrica permanece**: é informação, não ornamento.
3. `html[data-motion]` é definido no `<head>` a partir da media query (ou de uma escolha salva), antes do primeiro paint. O catálogo tem um alternador para simular o modo.

## Performance

- **Só se animam** `transform`, `opacity`, `clip-path` e `stroke-dashoffset`. Nada de `width/height/top/left/margin`. Exceções conscientes: `flex-grow` nas portas e `grid-template-rows` no FAQ (áreas pequenas, sem conteúdo pesado).
- **Uma única rAF** para tudo que depende de rolagem (header, fita, paralaxe, scrub, manequim, arara), com listener `passive`. Cursor e balanço da arara têm loops próprios que **param quando não há movimento**.
- Revelações por **IntersectionObserver**, observadas uma vez e liberadas. Elementos que recortam a si mesmos (`clip-path` com área zero) são observados pelo pai.
- `will-change` só em `[data-parallax]`.
- `backdrop-filter` só no header, no menu e no véu do hero (nunca em listas ou cards).
- **Sem JS, nada some:** os estados iniciais ocultos exigem `html.at-js`.
- A divisão em linhas é refeita quando as fontes carregam e em resize de largura (> 40px, com debounce de 200ms).
- Orçamento: hero interativo em < 2.5s LCP (imagem com `fetchpriority="high"`), CLS 0, INP < 200ms; JS do sistema ≈ 25 KB sem minificar, sem dependências.

## Adoção em produção

O motor `assets/js/atelier.js` é vanilla e cobre o necessário. Se o site for construído com GSAP (como as referências), os tokens mapeiam diretamente:

| Token | GSAP |
|---|---|
| caimento | `CustomEase.create("caimento", ".16,1,.3,1")` |
| cortina | `CustomEase.create("cortina", ".7,0,.2,1")` |
| scrub do manequim | `ScrollTrigger.create({ pin: true, scrub: true, end: "+=260%" })` |
| rolagem suave | Lenis com `lerp: .1` (desligar em movimento reduzido) |
