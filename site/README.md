# Site · Andreia Ribeiro Atelier

Biblioteca de componentes React do design system **Alinhavo** (`../atelier-design-system/`). Ainda não há páginas nem rotas: o `App.tsx` só monta os providers.

Vite + React 18 + TypeScript strict. Sem Tailwind, sem CSS-in-JS e sem bibliotecas de animação.

## Rodar

```bash
cd site
npm install
npm run dev            # servidor de desenvolvimento
npm run build          # tsc -b + vite build
npm run lint           # ESLint (typescript-eslint strict, react-hooks, jsx-a11y), zero avisos
npm run format         # Prettier (TS/TSX/JSON/MD; o CSS mantém o formato do atelier.css)
npm run tokens:check   # garante que src/styles/tokens.css é idêntico ao do design system
npm run hero:image     # gera as versões da foto do hero (AVIF + WebP) em public/hero/
```

## Estrutura

```
site/
├── index.html               # script antes do 1º paint: at-js, data-motion, at-loading/at-arriving; fontes
├── assets-src/hero/         # original da foto do hero (fora do deploy)
├── public/hero/             # versões geradas da foto (npm run hero:image)
├── scripts/                 # check-tokens.mjs, make-hero-image.mjs
└── src/
    ├── main.tsx · App.tsx
    ├── styles/
    │   ├── tokens.css       # cópia fiel de assets/tokens/tokens.css — nunca editar aqui
    │   ├── base.css         # seções 0–2 de atelier.css: base, grid, tipografia
    │   ├── costuras.css     # seção 3: costuras, piques, marcas de corte, texturas, fio do tecido
    │   └── registro.css     # tecido do registro Casimira
    ├── motion/              # motor de movimento (ver abaixo)
    ├── lib/                 # cx, cssVars, clamp, contador, session, mergeRefs
    ├── content/             # conteúdo tipado (hero.ts, site.ts), sem texto fixo no JSX
    ├── sections/            # seções do site compostas com os componentes (HeroHome)
    ├── assets/              # croquis (figurinos/) e SVGs (monograma, overlock, pique, tule)
    └── components/
        ├── <Nome>/          # Nome.tsx + Nome.css + index.ts
        └── index.ts         # exporta tudo, na ordem do atelier.css
```

**Componentes:** Icon · SkipLink · Registro · Photo · Button · Link/NavLink · Tag · Reveal/RevealItem · Stitch · Header/HeaderNav · Brand · MenuToggle · Menu (+ `useMenu`) · FitaMetrica · Cursor · Curtain · Loader · Hero · HeroSequence · Card · Doors/Door · Arara · ProvaManequim · Quotes · Faq · Swatch/Swatches · Footer · Skeleton · Field · Choice/ChoiceGroup/DateChoice (+ `proximasDatasDeProva`) · BookingForm.

Todo texto entra por props ou children. Rótulos de acessibilidade e mensagens de erro têm um padrão em pt-BR, no tom de `docs/01-principios-e-voz.md`, que pode ser substituído por prop. No BookingForm isso é feito pela prop `textos`.

## Uso mínimo

```tsx
import { MotionProvider } from './motion';
import { Button, Reveal, Registro } from './components';

<MotionProvider>
  <Reveal as="h2" tipo="linhas" className="at-h1">
    Quatro encontros, <em>uma peça</em>.
  </Reveal>
  <Registro tipo="casimira" className="at-section">
    <Button as="a" href="#agendar" variante="pesponto">
      Agendar prova de terno
    </Button>
  </Registro>
</MotionProvider>;
```

As classes utilitárias do sistema (`.at-container`, `.at-grid`, `.at-col-lg-*`, `.at-h1`, `.at-note`, `.at-section`…) continuam valendo, como no catálogo.

## Motor de movimento (`src/motion/`)

| Peça                             | O que faz                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `index.html`                     | Antes do 1º paint, põe `at-js` e `data-motion` no `<html>` e, se for o caso, `at-loading`/`at-arriving`. Sem JS, nada fica escondido.                                                                                                |
| `motionStore` + `MotionProvider` | Mantém `html[data-motion]` em sincronia com `prefers-reduced-motion` e com uma escolha forçada (`setMotion('reduce' \| 'full' \| null)`, salva em `sessionStorage['at-motion']`).                                                    |
| `introStore` + `useIntro`        | A entrada do hero espera o loader ou a cortina. Sem nenhum dos dois, libera em 2 quadros; há um fallback de 3,5 s.                                                                                                                   |
| `rafLoop`                        | **Um** listener `scroll` passivo e **uma** rAF para tudo que depende de rolagem (`subscribeScroll`), mais um único resize com debounce (`subscribeResize`).                                                                          |
| `observe`                        | **Um** IntersectionObserver compartilhado: cada elemento é revelado uma vez e liberado.                                                                                                                                              |
| hooks                            | `useReveal`, `useLines` (divisão em linhas reais, preservando `<em>`), `useStitch`, `useScrollFrame`, `useScrollProgress`, `usePin`, `useParallax`, `useMagnet`, `useRoll`/`Roll`, `useReducedMotion`, `useMediaQuery`, `useMotion`. |

No modo reduzido, o sistema degrada sozinho pelos tokens: distâncias zeradas e durações curtas, como em `tokens.css`. As regras explícitas da seção 19 do atelier.css ficam no fim do CSS de cada componente. Seções fixadas viram fluxo normal, a sequência do hero mostra um frame estático, o cursor desliga e a fita métrica continua.

Algumas regras de desempenho que valem para toda a biblioteca:

- só se animam `transform`, `opacity`, `clip-path` e `stroke-dashoffset`;
- o que muda a cada quadro é escrito direto no estilo do elemento (via ref), sem re-render;
- estados que mudam raramente, como as classes do header ou o passo do manequim, usam state.

**Trocar por GSAP + Lenis depois:**

1. Chame `setScrollSource({ getY: () => lenis.scroll, listen: (cb) => { lenis.on('scroll', cb); return () => lenis.off('scroll', cb); } })`. Todos os hooks passam a ser movidos pelo Lenis, sem outra mudança.
2. As curvas e as durações já são tokens. `tokenEase('--at-ease-caimento')` e `tokenMs('--at-dur-caimento', 800)` leem os valores já resolvidos para o modo e o registro atuais, e servem de entrada para `CustomEase`.
3. `usePin` é o ponto único para trocar a fixação por `ScrollTrigger`.

## Como adicionar um componente

1. **Procure no design system.** Leia `docs/06-componentes.md` e a seção correspondente de `assets/css/atelier.css`. Se o componente não existe lá, ele precisa de decisão de design antes de código.
2. **Crie `src/components/Nome/`** com `Nome.tsx`, `Nome.css` e `index.ts`. Exporte o componente em `src/components/index.ts`, na posição em que o CSS dele aparece no atelier.css (a ordem do CSS segue a do barrel).
3. **CSS:**
   - copie as regras do atelier.css **sem alterar valores**;
   - mantenha as classes `.at-bloco__elemento--variante` e os estados `.is-*`;
   - ponha as regras de `[data-motion="reduce"]` desse componente no fim do arquivo;
   - estados ocultos de entrada só valem sob `.at-js`;
   - não crie tokens: se faltar um, ele entra primeiro no design system.
4. **TSX:**
   - props tipadas e conteúdo por props/children;
   - textos de acessibilidade com padrão pt-BR que pode ser substituído;
   - movimento só pelos hooks de `src/motion/`: nunca `addEventListener('scroll')` no componente;
   - revelações com `<Reveal>` ou `useReveal`;
   - Casimira com `<Registro>` ou `useRegistro`, para o header trocar de tecido.
5. **Acessibilidade (WCAG 2.2 AA):**
   - funciona só com teclado;
   - foco visível (o anel vem de `:focus-visible` no base.css);
   - alvos de 44px;
   - ícones `aria-hidden` (o padrão do `<Icon>`) e botões só com ícone com `aria-label`;
   - nenhuma informação depende de animação.
6. Rode `npm run build && npm run lint`.

## Onde o port difere do vanilla (de propósito)

- **Menu sobre o header.** No vanilla o menu (`z 95`) cobre o header (`z 90`) e o botão "Fechar" fica invisível. Aqui o header sobe acima do menu enquanto ele está aberto (`Header.css`, só com tokens de camada).
- **Cursor.** A regra `.at-has-cursor [data-cursor-label] { cursor: none }` não foi portada: o ponteiro nativo nunca some (DECISOES.md, 08-acessibilidade).
- **Hero em tela cheia** (`mediaMode="tela-cheia"`, o padrão). A seção tem **exatamente a altura da tela** (`height: 100svh`, com `100vh` de fallback, e `overflow: hidden`). O espaço de cima vem da altura do header mais `--at-space-4`, e o de baixo é `--at-space-5` (folga mínima de 24 px). Ela veste "noite": texto marfim, e header e cursor escuros sobre ela. São três arranjos, com as mesmas media queries de `HERO_IMAGEM` em `content/hero.ts`:
  - **paisagem** (desktop e tablet deitado): a foto cobre a seção, o título fica em cima e o aside embaixo à esquerda (colunas 1–3), sobre `--at-veil-organza-lateral`. A paralaxe só tem sobra em cima (`inset: -8% 0 0`), porque o deslocamento é sempre para baixo; a cauda nunca é cortada;
  - **retrato** (celular e tablet em pé): texto em cima sobre café e foto inteira embaixo (`contain`), com degradê do café no topo da foto e laterais fundidas. Sem paralaxe, que cortaria a cauda;
  - **celular deitado** (`max-height: 480px`): texto à esquerda sobre café, foto à direita, título em `--at-text-h2`, sem eyebrow.

  Regras de altura (só tokens):
  - `max-height: 820px`: título em `--at-text-display-l`, e no desktop só o CTA primário;
  - retrato até 700 px: só o CTA primário;
  - retrato até 680 px: lead curto (em paisagem ele é sempre o curto).

  Outras regras:
  - Abaixo de 480 px de largura, o título usa `--at-text-display-l`.
  - O cue "Fio do tecido" não entra na tela cheia.
  - Enquanto a Fraunces não carrega (`html` sem `.at-fontes`), no desktop com mais de 820 px de altura saem eyebrow e lead, porque o título na fonte de fallback quebraria uma linha e vazaria da tela.

  `mediaMode="coluna"` reproduz o layout do doc 06.

- **HeroSequence** (na biblioteca, fora da home por ora). Não repete por padrão (o sistema evita loops decorativos) e para no último frame. No modo completo toca do frame 0; `frameEstatico` é o frame do modo reduzido, e nesse modo é o único baixado. Dentro do Hero, só começa quando a entrada é liberada, junto com o tule. Se repetir ou passar de 5 s, mostra um controle de pausa (WCAG 2.2.2), renderizado no espaço `.at-hero__controls` do Hero, acima do véu.
- **Assinatura do rodapé.** O nome completo fica em `.at-sr` em vez de `aria-label` num `<p>`.
- **Arara.** A faixa no mobile tem um listener `scroll` próprio, coalescido por quadro, porque é a rolagem horizontal do elemento e não a da página. No desktop fixado, o foco e as setas levam a página até a peça.

## Foto do hero

Tudo fica em `src/content/hero.ts` (`HERO_IMAGEM`): arquivo de origem, recortes, larguras, qualidade, `object-position`, alt e media queries. A foto atual está marcada como **provisória** (`provisoria: true`).

- **Trocar a foto:** substitua o arquivo em `assets-src/hero/` (fora do `public/`, não vai para o deploy) e rode `npm run hero:image`. O script precisa do Node ≥ 22.18, porque importa o `.ts` direto. Se o enquadramento mudar, revise `recorte` e `posicao`.
- **Desktop:** recorte de 0–75% da largura (2064 × 1536), em 1280, 1920 e 2064 px, com `object-fit: cover` e `object-position: 0% 100%`. A noiva fica entre ~55% e 63% da tela, livre do texto, e a cauda nunca é cortada.
- **Mobile:** recorte de 1229 × 1024, da cabeça à ponta da cauda, em 828 e 1229 px (sem ampliar), com `contain` e `50% 100%`.
- **Entrega:** `<picture>` com AVIF e WebP, `sizes="100vw"`, `fetchpriority="high"`, sem lazy e com `width`/`height`. O plugin do `vite.config.ts` injeta o preload só do AVIF (`imagesrcset` + `media`) por resolução.
- As versões não levam metadados (EXIF/GPS) do original.
