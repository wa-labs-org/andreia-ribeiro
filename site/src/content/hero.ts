/* ==========================================================================
   Conteúdo do hero da home (fonte: <section class="at-hero"> do Overview).
   Módulo puro (sem React nem DOM): também é lido pelo vite.config.ts (preload)
   e por scripts/make-hero-image.mjs (versões da foto).
   ========================================================================== */

/** Trecho de texto; `{ em }` é a palavra em itálico ("ponto à mão": uma por título). */
export type Trecho = string | { readonly em: string };
export type Linha = readonly Trecho[];

export type HeroResolucao = 'desktop' | 'mobile';
export type HeroFormato = 'avif' | 'webp';

interface Recorte {
  /** em px do original */
  left: number;
  top: number;
  width: number;
  height: number;
}

interface HeroVersao {
  /** larguras geradas (nunca acima da largura do recorte: sem ampliar) */
  larguras: readonly number[];
  /** recorte do original; null = foto inteira */
  recorte: Recorte | null;
  /** object-position (ver o PR para a justificativa dos valores) */
  posicao: string;
}

/**
 * Foto do hero.
 * PROVISÓRIA: a origem desta foto ainda não foi confirmada como trabalho do ateliê (o arquivo
 * recebido tem a marca ✦ de imagem gerada no canto inferior direito, fora dos recortes usados).
 * Para trocar: substitua `fonte` em assets-src/hero/ (mesmo nome, ou ajuste aqui) e rode
 * `npm run hero:image`. Se o enquadramento mudar, revise `recorte` e `posicao`.
 */
export const HERO_IMAGEM = {
  provisoria: true,
  /** relativo a site/; fora de public/, não vai para o deploy */
  fonte: 'assets-src/hero/noiva-igreja.jpg',
  original: { largura: 2752, altura: 1536 },
  nome: 'noiva-igreja',
  base: '/hero',
  formatos: ['avif', 'webp'] as readonly HeroFormato[],
  qualidade: { avif: 50, webp: 72 },
  alt: 'Noiva de vestido branco com cauda longa de tule e véu, segurando um buquê de flores brancas, diante do altar de uma igreja na penumbra.',
  desktop: {
    /** 2064 = largura do recorte (sem ampliar); não há 2560 */
    larguras: [1280, 1920, 2064],
    /** 0–75% da largura (2064 × 1536): a noiva vai para ~63% da tela e a área escura à esquerda cresce de ~22% para ~29% */
    recorte: { left: 0, top: 0, width: 2064, height: 1536 },
    /** x: 0% (noiva entre ~55% e 63% da tela). O y é calculado no CSS pela proporção da tela. */
    posicao: '0%',
  } satisfies HeroVersao as HeroVersao,
  mobile: {
    larguras: [828, 1229],
    /** 1229 × 1024 (1,2:1): noiva da cabeça (y 39%) à ponta da cauda (y 96%), centrada nela */
    recorte: { left: 679, top: 512, width: 1229, height: 1024 },
    posicao: '50% 100%',
  } satisfies HeroVersao as HeroVersao,
  /**
   * Recorte mobile (foto inteira em contain): telas em pé (texto em cima, foto embaixo) e paisagem
   * baixa (≤ 480px), estreita (< 768px) ou larga (≥ 2,28:1), com texto à esquerda e foto à direita.
   * Mesmas queries do Hero.css.
   */
  mobileQuery:
    '(orientation: portrait), (orientation: landscape) and (max-height: 480px), (orientation: landscape) and (max-width: 767.98px), (orientation: landscape) and (min-aspect-ratio: 228/100)',
  /** complemento de mobileQuery: a foto cobre a seção, texto à esquerda */
  desktopQuery:
    '(orientation: landscape) and (min-width: 768px) and (min-height: 480.02px) and (max-aspect-ratio: 22799/10000)',
  /**
   * Topo da cabeça da noiva (cabelo), em fração da altura do original. No desktop, o object-position
   * vertical é calculado para ele ficar sempre abaixo do header + --at-space-5 (ver Hero.css).
   */
  cabeca: 0.38,
} as const;

const MIME: Record<HeroFormato, string> = { avif: 'image/avif', webp: 'image/webp' };
export const heroMime = (f: HeroFormato): string => MIME[f];

/** Dimensões de saída na maior largura (para width/height do <img>/<source>). */
export function heroDimensoes(res: HeroResolucao): { width: number; height: number } {
  const v = HERO_IMAGEM[res];
  const r = v.recorte ?? { width: HERO_IMAGEM.original.largura, height: HERO_IMAGEM.original.altura };
  const width = Math.max(...v.larguras);
  return { width, height: Math.round((width * r.height) / r.width) };
}

export function heroArquivo(res: HeroResolucao, formato: HeroFormato, largura: number): string {
  return `${HERO_IMAGEM.nome}-${res}-${largura}.${formato}`;
}

export function heroSrc(res: HeroResolucao, formato: HeroFormato, largura: number): string {
  return `${HERO_IMAGEM.base}/${heroArquivo(res, formato, largura)}`;
}

export function heroSrcset(res: HeroResolucao, formato: HeroFormato): string {
  return HERO_IMAGEM[res].larguras.map((w) => `${heroSrc(res, formato, w)} ${w}w`).join(', ');
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
  /** versão curta do lead, para telas baixas (mesma informação essencial, sem line-clamp) */
  leadCurto: Linha;
  acoes: { primaria: HeroAcao; secundaria: HeroAcao };
}

export const heroHome: HeroConteudo = {
  titulo: [['A peça certa'], [{ em: 'começa' }, ' na'], ['primeira prova.']],
  eyebrow: 'Atelier de trajes festivos · sob medida e ajustes',
  lead: [
    'Vestidos de noiva e madrinha, trajes de noivo e padrinho, cortados e ajustados no seu corpo, ',
    { em: 'prova a prova' },
    '.',
  ],
  leadCurto: [
    'Noiva, madrinha, noivo e padrinho: cada peça cortada e ajustada no seu corpo, ',
    { em: 'prova a prova' },
    '.',
  ],
  acoes: {
    primaria: { label: 'Agendar prova', href: '#agendar' },
    secundaria: { label: 'Ver coleções', href: '/colecoes' },
  },
};
