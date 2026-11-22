/* ==========================================================================
   Conteúdo do hero da home (fonte: <section class="at-hero"> do Overview).
   Módulo puro (sem React nem DOM): também é lido pelo vite.config.ts para
   gerar o preload do primeiro frame.
   ========================================================================== */

/** Trecho de texto; `{ em }` é a palavra em itálico ("ponto à mão": uma por título). */
export type Trecho = string | { readonly em: string };
export type Linha = readonly Trecho[];

export type HeroResolucao = 'desktop' | 'mobile';

/**
 * Sequência do fundo. Para os frames reais: troque `extensao` para 'webp' (e `quantidade`/`fps`
 * se a cena mudar). A troca é só aqui; o preload do index.html acompanha.
 */
export const HERO_FRAMES = {
  base: '/hero',
  /** 40 frames por resolução (orçamento: desktop 1600 px q≈60 ≈ 3,6 MB · mobile 828 px ≈ 1,8 MB) */
  quantidade: 40,
  /** 40 / 24 ≈ 1,7 s: abaixo de 5 s, sem controle de pausa (WCAG 2.2.2 só exige acima disso) */
  fps: 24,
  /** sem loop: o sistema evita loops decorativos; a cena para no último frame */
  loop: false,
  /** placeholders de `npm run hero:frames`; frames reais: 'webp' */
  extensao: 'svg',
  resolucoes: {
    desktop: { pasta: 'desktop', largura: 1600, altura: 900 },
    mobile: { pasta: 'mobile', largura: 828, altura: 1472 },
  },
  /** recorte vertical 9:16 no celular e no tablet em retrato */
  mobileQuery: '(max-width: 767.98px), (max-width: 1023.98px) and (orientation: portrait)',
  /** complemento exato de mobileQuery */
  desktopQuery: '(min-width: 1024px), (min-width: 768px) and (orientation: landscape)',
} as const;

/**
 * Frame do modo reduzido: o último. É onde a cena para — o mesmo fundo que todo mundo vê ao fim
 * da reprodução —, então é também o frame cujo contraste sob o texto precisa estar garantido.
 */
export const HERO_FRAME_ESTATICO = HERO_FRAMES.quantidade - 1;

/** URL do frame i (base 0) na resolução escolhida. */
export function heroFrameUrl(res: HeroResolucao, i: number): string {
  const { base, extensao, resolucoes } = HERO_FRAMES;
  return `${base}/${resolucoes[res].pasta}/frame-${String(i + 1).padStart(4, '0')}.${extensao}`;
}

export interface HeroAcao {
  label: string;
  href: string;
}

export interface HeroConteudo {
  /** linhas manuais do título (a quebra é controlada por elas) */
  titulo: readonly Linha[];
  eyebrow: string;
  lead: Linha;
  acoes: { primaria: HeroAcao; secundaria: HeroAcao };
  /** indicador "fio do tecido" (desktop) */
  cue: string;
  /**
   * Descrição da sequência. null = decorativa: hoje os frames são placeholders (luz atravessando
   * o croqui) e não trazem informação que o título e o lead não deem. Com o vídeo real, descreva
   * peça, tecido e gesto aqui.
   */
  alt: string | null;
}

export const heroHome: HeroConteudo = {
  titulo: [['A peça certa'], [{ em: 'começa' }, ' na'], ['primeira prova.']],
  eyebrow: 'Atelier de trajes festivos · sob medida e ajustes',
  lead: [
    'Vestidos de noiva e madrinha, trajes de noivo e padrinho, cortados e ajustados no seu corpo, ',
    { em: 'prova a prova' },
    '.',
  ],
  acoes: {
    primaria: { label: 'Agendar prova', href: '#agendar' },
    secundaria: { label: 'Ver coleções', href: '/colecoes' },
  },
  cue: 'Fio do tecido',
  alt: null,
};
