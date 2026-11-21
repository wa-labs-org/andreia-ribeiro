# 00 · Leitura das referências

Antes de desenhar qualquer coisa, os dois design systems foram lidos por completo: `design-system.html` (abas Overview + Components), `assets/overview/` (site capturado e `STACK.md`) e, no Lando, `assets/components/components.{css,js}` e o bundle de animação do site (`lando-by-OFF+BRAND.05.js`). Este é o resumo usado como base de decisão.

## 1. O que o Elicyon faz de melhor: classe e acabamento

| Eixo | O que observamos | Por que importa |
|---|---|---|
| **Tom** | Editorial, contido, quase silencioso. Frases curtas, nenhuma urgência. Cada seção tem um título, um parágrafo de até 380px e um link sublinhado. | Luxo aqui é *não insistir*. |
| **Tipografia** | Um display serifado de traço fino (Elicyon, peso 400) em caixa-alta e caixa mista, às vezes letra por letra (11vw no slide de projetos, 19.8vw no rodapé). Rótulos, botões e corpo em Antique Legacy com tracking 0.1–0.15em. Pouquíssimos tamanhos (64 / 48 / 35 / 26 / 22 / 16 / 14 / 12 / 10). | A hierarquia é feita por **escala e espaço**, não por peso nem cor. |
| **Paleta** | Creme quente `#F4F2EE` como chão, preto puro para texto, um azul acinzentado `#6E89C8` só no rodapé e no painel de cookies, acentos terrosos pontuais (terracota `#8d5d52`, ouro do cursor `#907533`). | A cor vem da **fotografia**; a interface é papel. |
| **Espaçamento** | Hero `100svh`, seções full-bleed, molduras enormes (borda creme de 148 × 115px na chamada final), parágrafos estreitos dentro de muito vazio. | O vazio é um material, não sobra. |
| **Componentes** | Link sublinhado de 1px que se recolhe para a direita no hover (0.3s); header que some ao descer, volta ao subir e passa a `mix-blend-exclusion` depois do hero; campos só com borda inferior preta, sem anel; cards de jornal (label + título + corpo + “Read More”); assinatura do rodapé com letras subindo uma a uma. | Componentes mínimos, com **um** detalhe de acabamento cada. |
| **Motion (secundário)** | Revelação linha a linha nos títulos, hero que abre de `clip inset 50%` e assenta de `scale 1.2 → 1`, curva `cubic-bezier(0.77,0,0.175,1)` em 0.5–0.7s, statement fixado com palavras que somem. | Movimento lento e raro, sempre a serviço da leitura. |

## 2. O que o Lando Norris faz de melhor: movimento como linguagem

| Eixo | O que observamos | Por que importa |
|---|---|---|
| **Token de movimento** | Um default global: `--cubic-default: cubic-bezier(0.65, 0.05, 0, 1)` e `--duration-default: 0.75s`, combinados em `--animation-default`, usado em cor, fill, clip-path e opacidade. | Tudo parece da mesma família porque **compartilha a mesma curva**. |
| **Entradas** | *Line highlight reveal*: cada linha abre por `clip-path inset(0 100% 0 0) → 0` (0.6s power2.out) enquanto um bloco de cor se retrai (`scaleX 1 → 0`, 0.6s power2.inOut, +0.3s), stagger 0.15s, gatilho em `top 90%`, uma vez só. | Texto que entra **com intenção**, não só com fade. |
| **Hover** | *Text roll*: letras sobem `translateY -100%`, 0.6s power3.out, stagger 0.02s (cópia via `text-shadow`). *Helmet reveal*: imagem secundária abre por `clip-path ellipse(100% 120% at 50% 0%)`, capacete `scale 1.1`, moldura acende, 0.75s. Botões e hambúrguer em Rive. | Micro-interações com **personalidade física** (o capacete “desce” como viseira). |
| **Rolagem** | ScrollTrigger com `scrub` em paralaxe, cenas WebGL fixadas, galeria horizontal; a navbar troca de tema conforme a seção abaixo (`data-nav-theme`, 0.75s). | A rolagem é **coreografada**, não só percorrida. |
| **Transição de página** | Rive (`page-transition.riv`) cobrindo a tela entre rotas; Lenis para rolagem suave. | Continuidade entre páginas. |
| **Ritmo e easing** | Staggers curtos (0.015–0.05s para letras, 0.15s para linhas), UI em 0.3–0.8s, cenas em 1.5–2.5s; curvas `power2.out` (a mais usada), `expo.inOut`, `power3.out`, um `elastic.out` raro. | Rápido no detalhe, **lento no cenário**. |
| **Cursor** | Efeito de cursor dentro do shader WebGL do hero. | O cursor como **instrumento**, não só ponteiro. |

## 3. Como isso vira decisão

1. **Do Elicyon** herdamos a *postura*: chão claro e quente, serifa de display com escala dramática, rótulos em caixa-alta espaçada, campos só com linha inferior, link sublinhado animado, header que some e volta, assinatura gigante no rodapé, cor delegada à fotografia.
2. **Do Lando** herdamos a *infraestrutura de movimento*: tokens globais de curva e duração, revelação por máscara linha a linha, rolagem de letras, clip elíptico em hover, navbar que troca de tema por seção, rolagem com scrub e seções fixadas, transição de página, staggers curtos.
3. **Nenhum dos dois** fala de costura. Então cada herança foi *traduzida para um gesto do ofício* (ver [DECISOES.md](../DECISOES.md)): o sublinhado vira pesponto, o bloco de cor do Lando vira véu de tule, o clip do capacete vira a saia que desce, a navbar que troca de tema vira a troca de tecido (Seda ↔ Casimira).
