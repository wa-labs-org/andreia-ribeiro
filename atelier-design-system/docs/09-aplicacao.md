# 09 · Exemplos de aplicação

As duas páginas abaixo estão implementadas e funcionando em `assets/overview/index.html` (home, aba **Overview** do catálogo) e `assets/overview/colecao.html` (coleção Noivas). A transição de página entre elas usa a cortina.

## Home

O arco da página segue o arco da cliente: **desejo → confiança no processo → escolha → ação**.

| # | Seção | Componentes | Animações | Por quê nesta ordem |
|---|---|---|---|---|
| 0 | **Loader** (1ª visita) | `.at-curtain` + `.at-loader` | Enfiar a agulha (1.4–3s) → cortina sobe | Cobre o carregamento das fontes; marca o ritual de “começar”. |
| — | **Header + fita** | `.at-header`, `.at-menu-toggle`, `.at-menu`, `.at-fita` | Some/volta, tule, troca de tecido, fita métrica | Sempre presente, nunca no caminho. |
| 1 | **Hero** | `.at-hero`, Display XL, `.at-photo`, `.at-btn` + `.at-btn--linha`, `.at-grain` | Cortina de tule, linhas, alinhavo atravessando, paralaxe 8%, cursor com linha (partitura completa em [07](07-motion.md#partitura-do-hero)) | Promessa + ação imediata. “A peça certa *começa* na primeira prova.” |
| 2 | **O ofício** (manifesto) | Rótulo + H2 + três números (`.at-h1` + `.at-note`) | Linhas; **linha que acompanha** a rolagem; números em sequência | Diz o que o ateliê é (e o que não é) antes de mostrar produto. |
| 3 | **Portas Seda / Casimira** | `.at-doors`, `.at-door--seda`, `.at-door--casimira` | Queda de tecido (stagger 120ms); porta que abre no hover | Divide o público com igual peso: dois tecidos, um ofício. |
| 4 | **Do molde ao arremate** | `.at-prova` (manequim + 4 passos + 4 marcas) | **Prova no manequim** fixada (360vh) | Constrói confiança mostrando o processo (Princípio 1). |
| 5 | **Alfaiataria** (registro Casimira) | `[data-registro="casimira"]` `.at-tex-risca`, lista de serviços em ponto corrido, `.at-btn--pesponto`, 2 `.at-photo--noite` | Corte (wipe seco), linhas a 60ms, header vira noite | Noivos e padrinhos com seção própria, não nota de rodapé. |
| 6 | **Na arara** | `.at-arara[data-pin]` + 8 `.at-card` | Arara fixada, balanço por velocidade; caimento do card no hover; contador | Prova social visual: peças reais que saíram do ateliê. |
| 7 | **Quem já provou** | `[data-quotes]`, `.at-quote`, `.at-label-woven`, `.at-btn--botao` | Linhas a cada troca; magnetismo nos botões | Voz de quem passou pelo processo, depois de ver as peças. |
| 8 | **Agendamento** | `[data-booking]` (4 etapas), `.at-field`, `.at-choice`, `.at-dates` | Etapas sobem; linha do campo vira costura; pontos no envio; nó de arremate | A ação, já com toda a confiança construída. |
| 9 | **Perguntas** | `.at-faq` | Alfinetes, painel em cortina, costura sob a pergunta | Remove as últimas objeções (prazo, provas, orçamento). |
| 10 | **Rodapé** | `.at-footer`, `.at-overlock`, `.at-footer__mark` | Letras da assinatura sobem; costura final | Arremate. |

**Ritmo de fundos:** Marfim → Marfim → (Rosé | Café) → Marfim → **Café** → Marfim → Manteiga → Manteiga → Marfim → Manteiga. A seção escura (café) aparece no meio para que o público masculino não fique só no fim, e para quebrar a página em dois “tecidos”.

**Uma peça de rolagem por tela:** paralaxe (hero), linha (ofício), manequim (processo) e arara (galeria) nunca dividem o viewport.

## Página de coleção: Noivas

| # | Seção | Componentes | Animações | Por quê |
|---|---|---|---|---|
| — | Header (item atual com ponto corrido desenhado) + fita | `.at-header`, `.at-navlink[aria-current]` | Chega pela **cortina** (sobe) | Continuidade com a home. |
| 1 | **Abertura da coleção** | Breadcrumb em mono, Display XL “Vestidos de *noiva*”, lead, 3 metadados, imagem 21:9 (4:5 no mobile) | Linhas; **queda de tecido** na imagem larga + paralaxe 10% | “Cada vestido aqui é um ponto de partida, não um modelo fechado.” |
| 2 | **Escolha pela silhueta** | Costura que se desenha, H2, filtros `.at-choice` (Todas, Evasê, Coluna, Sereia, Civil/midi), contador `aria-live` | Ao filtrar: reposição **FLIP** (800ms caimento); entradas em fade | O vocabulário da cliente é a silhueta, não o “modelo”. |
| 3 | **Grade de peças** | 9 `.at-card` em 2/3 colunas, coluna do meio descida 96px | Peças em sequência por fileira; caimento no hover | Ritmo de arara; a vista do molde mostra o ofício por trás. |
| 4 | **O detalhe** | Imagem macro 1:1 com textura de tule e 2 marcas de prova, H1, alinhavo, texto, anotação “40 horas de bordado” | Cortina de tule; alinhavo se desenha | Princípio 2: a mão aparece. Justifica valor sem falar de preço. |
| 5 | **Mostruário** | `.at-swatches` (crepe, duchesse, zibeline, tule, renda, organza) | Sequência; brilho do tecido no hover | Toque digital antes do toque real na prova. |
| 6 | **Chamada** | Pique, Display L “Um ponto de partida *já basta*.”, lead, `.at-btn` + `.at-btn--pesponto` sobre papel milimetrado | Linhas, fade | Baixa a barreira: “traga uma foto, um tecido ou só a data”. Ponte para a alfaiataria. |
| 7 | **Rodapé** | idem home | idem | |

### Página de peça (próxima etapa, recomendação)
Galeria vertical à esquerda (imagem inteira → macro → mãos) com **cortina de tule** na primeira e **queda** nas demais; coluna direita fixa com nome, “ponto de partida”, tecidos possíveis (mostruário compacto), prazo e nº de provas em mono, CTA “Agendar prova com esta peça” (pré-preenche a etapa 1 do formulário). Abaixo: “Como ela foi ajustada”, um mini-manequim com 2–3 marcas reais da cliente (com autorização).
