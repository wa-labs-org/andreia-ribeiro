# 08 · Acessibilidade e responsividade

Meta: **WCAG 2.2 AA** em todo o site. A ansiedade de quem está escolhendo a roupa do casamento não pode ser somada à frustração de não conseguir agendar.

## Contraste
- Todas as combinações de texto previstas passam AA (ver tabela em [02-cores](02-cores.md)). Texto principal passa AAA (14.55:1).
- Feltro (3.27:1) só para texto ≥ 24px ou decorativo. Entretela (1.49:1) nunca para texto ou borda funcional.
- Bordas de campo em bronze (5.43:1 > 3:1 não-textual). O pesponto da borda tem traço de 3px e vão de 3px, ainda legível como linha.
- Texto sobre fotografia: sempre com `--at-veil-sombra`, `--at-veil-organza` ou `--at-veil-organza-lateral` (texto à esquerda) por baixo, verificado no pior ponto da imagem.

## Teclado e foco
- **Foco sempre visível:** `outline: 2px solid` bronze + `offset 3px` (dourado claro em Casimira). Nunca `outline: none` sem substituto. Campos substituem o anel pela linha giz de 1.5px **mais** a mudança de cor da borda.
- Ordem de tabulação = ordem visual. Link “Pular para o conteúdo” é o primeiro foco.
- **Menu:** `role="dialog"`, `aria-modal`, foco vai ao primeiro item, Tab fica preso, Esc fecha e devolve o foco ao botão, `inert` quando fechado.
- **FAQ:** `<button aria-expanded aria-controls>` dentro de `<h3>`, painel `role="region"` com `aria-labelledby`, `inert` quando fechado.
- **Arara:** faixa focável (`tabindex="0"`) com `aria-label`, rolável com setas; os cards são links normais.
- **Depoimentos:** botões com `aria-label`, sem autoplay, `aria-live="polite"`.
- **Formulário:** ao avançar, o título da etapa recebe foco; com erro, o foco vai ao primeiro campo inválido.

## Leitores de tela
- Rolagem de letras: o texto real fica em `.at-sr`; as cópias animadas têm `aria-hidden`.
- Divisão em linhas mantém a ordem e o texto do parágrafo; o letreiro do rodapé tem `aria-label` com o nome inteiro.
- Ícones decorativos `aria-hidden="true"`; botões só com ícone sempre têm `aria-label`.
- Croquis e fotos com `alt` descritivo (peça, tecido, detalhe); imagens puramente decorativas com `alt=""`.
- Etapas do formulário: `aria-current="step"`; confirmação em `role="status"`.
- Erro: `aria-invalid="true"` + `aria-describedby` apontando para a mensagem; a mensagem nunca depende só da cor (há ícone e texto).

## Formulários
- Rótulo **sempre visível** acima do campo (nunca só placeholder).
- Opcional marcado com “(opcional)”; nada de asterisco.
- `autocomplete` (`name`, `email`, `tel`), `inputmode="tel"`, `type="email"`, `type="date"`.
- Rádios e checkboxes são inputs reais; a aparência de etiqueta é só CSS. Alvo mínimo 44 × 44.
- Mensagens de erro dizem **o que fazer** (“Inclua o DDD”), não só o que está errado.

## Movimento
- `prefers-reduced-motion` respeitado em todo o sistema (ver [07-motion](07-motion.md#movimento-reduzido-prefers-reduced-motion--reduce)).
- Nada pisca mais de 3 vezes por segundo. Nenhum loop decorativo fora de hover (exceção: o pulso do fio do tecido, que para no modo reduzido).
- Nenhuma informação depende de animação: tudo existe no estado final.
- Seções fixadas têm conteúdo legível também sem rolagem guiada.

## Toque e alvos
- Alvo mínimo **44 × 44px** (botões 52px, chips 44px, toggle de menu 44px, botão redondo 52px).
- Cursor customizado e magnetismo só com `(hover: hover) and (pointer: fine)`.
- Hover nunca é o único caminho para uma informação (a vista do molde do card é bônus; título e meta estão sempre visíveis).

## Idioma e conteúdo
- `<html lang="pt-BR">`. Termos técnicos do ofício explicados na primeira ocorrência.
- Datas por extenso no conteúdo (“abril de 2025”); números tabulares nas anotações.

---

## Responsividade: mobile first

O CSS base é o mobile; `min-width` acrescenta. Breakpoints: **480 · 768 · 1024 · 1440** (ver [04-grid](04-grid-layout-espaco.md)).

| Componente | Mobile (base) | Tablet (≥768) | Desktop (≥1024) |
|---|---|---|---|
| Header | Marca à esquerda + Menu | + botão “Agendar prova” | Coleções à esquerda, marca ao centro |
| Hero | Título → imagem 4:5 → lead → CTAs | idem, mais respiro | Título sobre imagem 3:4, alinhavo atravessando, fio do tecido |
| Portas | Empilhadas, croqui a 30% | idem | Lado a lado, 88vh, porta que abre |
| Prova no manequim | Passos em lista, manequim a 68% com marcas à direita, tudo visível | idem | Seção fixada 360vh, passos acendem |
| Arara | Scroll horizontal com snap, 72vw por peça | 38vw por peça | Fixada, rolagem vertical → horizontal, 24rem por peça |
| Grade de coleção | 2 colunas | 2 colunas | 3 colunas com a do meio descida |
| Formulário | Campos em 1 coluna, chips quebram | Campos em 2 colunas | Formulário em 7 colunas ao lado do texto |
| Rodapé | Colunas empilhadas | idem | 4 colunas |
| Tipografia | Escala fluida por `clamp()`; nunca abaixo de 16px no corpo | | |

**Verificações:** sem rolagem horizontal em 320px; `100svh` (não `100vh`) no hero para a barra do navegador móvel; imagens com `srcset`; nenhum texto em imagem.
