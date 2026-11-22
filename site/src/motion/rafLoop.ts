/* ==========================================================================
   Loop único de rolagem.
   Um listener `scroll` passivo + uma rAF compartilhada para tudo que depende
   de rolagem (header, fita, paralaxe, scrub, manequim, arara). Nenhum
   componente escuta `scroll` diretamente.

   Para adotar Lenis/GSAP depois: implemente ScrollSource e chame
   setScrollSource({ getY: () => lenis.scroll, listen: (cb) => lenis.on('scroll', cb) … }).
   ========================================================================== */
import { subscribeMotion } from './motionStore';

export interface ScrollFrame {
  /** posição de rolagem atual */
  y: number;
  /** variação desde o último quadro */
  dy: number;
  /** altura e largura da viewport */
  vh: number;
  vw: number;
}

export interface ScrollSource {
  getY: () => number;
  listen: (onScroll: () => void) => () => void;
}

export type ScrollSubscriber = (frame: ScrollFrame) => void;

const windowSource: ScrollSource = {
  getY: () => window.scrollY,
  listen(cb) {
    window.addEventListener('scroll', cb, { passive: true });
    return () => {
      window.removeEventListener('scroll', cb);
    };
  },
};

let source: ScrollSource = windowSource;
const subs = new Set<ScrollSubscriber>();
let vh = window.innerHeight;
let vw = window.innerWidth;
let lastY = source.getY();
let ticking = false;
let stop: (() => void) | null = null;

function run(): void {
  ticking = false;
  const y = source.getY();
  const frame: ScrollFrame = { y, dy: y - lastY, vh, vw };
  lastY = y;
  subs.forEach((fn) => {
    fn(frame);
  });
}

export function requestScrollFrame(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(run);
}

function onResize(): void {
  vh = window.innerHeight;
  vw = window.innerWidth;
  requestScrollFrame();
}

function start(): void {
  const unlisten = source.listen(requestScrollFrame);
  window.addEventListener('resize', onResize, { passive: true });
  const unmotion = subscribeMotion(requestScrollFrame);
  stop = () => {
    unlisten();
    unmotion();
    window.removeEventListener('resize', onResize);
  };
}

/** Inscreve uma função no quadro de rolagem. Recebe um quadro logo em seguida. */
export function subscribeScroll(fn: ScrollSubscriber): () => void {
  if (subs.size === 0) start();
  subs.add(fn);
  requestScrollFrame();
  return () => {
    subs.delete(fn);
    if (subs.size === 0 && stop) {
      stop();
      stop = null;
    }
  };
}

export function setScrollSource(next: ScrollSource | null): void {
  const active = stop !== null;
  if (stop) stop();
  stop = null;
  source = next ?? windowSource;
  lastY = source.getY();
  if (active) start();
  requestScrollFrame();
}

export function getViewport(): { vh: number; vw: number } {
  return { vh, vw };
}

/* ------------------------------------------------------------ resize (debounce 200ms)
   Um único listener para quem precisa refazer medidas (divisão em linhas, arara). */
const resizeSubs = new Set<(vw: number, vh: number) => void>();
let resizeTimer = 0;
function onResizeDebounced(): void {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    resizeSubs.forEach((fn) => {
      fn(window.innerWidth, window.innerHeight);
    });
  }, 200);
}
export function subscribeResize(fn: (vw: number, vh: number) => void): () => void {
  if (resizeSubs.size === 0) window.addEventListener('resize', onResizeDebounced, { passive: true });
  resizeSubs.add(fn);
  return () => {
    resizeSubs.delete(fn);
    if (resizeSubs.size === 0) window.removeEventListener('resize', onResizeDebounced);
  };
}

/** Resolve quando as fontes carregam (as linhas medidas no fallback mudam). */
export const fontsReady: Promise<unknown> = document.fonts.ready.catch(() => undefined);
