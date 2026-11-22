import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { IntroContext } from '../../motion/context';
import { useIntro } from '../../motion/useIntro';
import { useReducedMotion } from '../../motion/useReducedMotion';
import './HeroSequence.css';

/** Origem padrão: os placeholders gerados por `npm run hero:frames` (public/hero/frame-0001.svg…). */
export const heroFrameSrc = (i: number, ext = 'svg'): string =>
  `/hero/frame-${String(i + 1).padStart(4, '0')}.${ext}`;

export interface HeroSequenceProps {
  /** quantidade de frames (usa `src`) ou a lista de URLs na ordem */
  frames: number | readonly string[];
  /** URL do frame i (base 0) quando `frames` é um número. Ex.: (i) => heroFrameSrc(i, 'webp') */
  src?: (i: number) => string;
  /** quadros por segundo */
  fps?: number;
  /**
   * Repetir. Desligado por padrão: o sistema evita loops decorativos. Se a sequência repetir ou
   * passar de 5 s, um controle de pausa aparece (WCAG 2.2.2).
   */
  loop?: boolean;
  /** frame mostrado no modo reduzido (base 0; o único baixado nesse modo). No modo completo a sequência toca do frame 0. */
  frameEstatico?: number;
  /** quantos frames carregar em paralelo em segundo plano */
  concorrencia?: number;
  /** descrição, se a sequência tiver conteúdo; sem ela, o canvas é decorativo */
  alt?: string;
  rotuloPausar?: string;
  rotuloRetomar?: string;
  className?: string;
}

interface Size {
  w: number;
  h: number;
  dpr: number;
}

/**
 * Sequência de imagens tocando como vídeo num <canvas>: object-fit cover responsivo, devicePixelRatio,
 * primeiro frame imediato e o resto pré-carregado em segundo plano. Pausa fora da viewport e com a aba
 * oculta. No modo reduzido mostra só o frame estático (e não baixa os outros).
 * Dentro de uma entrada coreografada (Hero com intro), só começa a tocar quando a entrada é liberada,
 * junto com o tule (0 ms da partitura).
 */
export function HeroSequence({
  frames,
  src = heroFrameSrc,
  fps = 24,
  loop = false,
  frameEstatico = 0,
  concorrencia = 4,
  alt,
  rotuloPausar = 'Pausar movimento',
  rotuloRetomar = 'Retomar movimento',
  className,
}: HeroSequenceProps) {
  const reduced = useReducedMotion();
  const intro = useContext(IntroContext);
  const introReady = useIntro();
  const liberado = !intro || introReady;
  const liberadoRef = useRef(liberado);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const urls = useMemo(
    () => (typeof frames === 'number' ? Array.from({ length: frames }, (_, i) => src(i)) : [...frames]),
    [frames, src],
  );
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const pausedRef = useRef(false);
  const ctrl = useRef<{ play: () => void; stop: () => void } | null>(null);
  const longa = loop || urls.length / fps > 5;

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx || urls.length === 0) return;

    const total = urls.length;
    // completo: toca do frame 0 · reduzido: só o frame estático
    const first = reduced ? Math.min(Math.max(0, frameEstatico), total - 1) : 0;
    const imgs: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(total).fill(null);
    let size: Size = { w: 0, h: 0, dpr: 1 };
    let current = first;
    let raf = 0;
    let visible = true;
    let alive = true;
    let start = 0;
    let shown = first;
    let ended = false;

    const draw = (i: number): void => {
      const img = imgs[i];
      if (!img || !size.w) return;
      const { w, h } = size;
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight); // cover
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      shown = i;
    };

    const resize = (): void => {
      // caixa de layout (clientWidth/Height), não o retângulo transformado: o tule escala a imagem em 1.12
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = { w, h, dpr };
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(shown);
    };

    const load = (i: number, priority = false): Promise<void> =>
      new Promise((resolve) => {
        const url = urls[i];
        if (!url) {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        if (priority) img.setAttribute('fetchpriority', 'high');
        img.onload = () => {
          void img
            .decode()
            .catch(() => undefined)
            .then(() => {
              imgs[i] = img;
              resolve();
            });
        };
        img.onerror = () => {
          resolve();
        };
        img.src = url;
      });

    const tick = (now: number): void => {
      raf = 0;
      if (!alive || !visible || document.hidden) return;
      if (!start) start = now - (current / fps) * 1000;
      let target = Math.floor(((now - start) / 1000) * fps);
      if (target >= total) {
        if (!loop) {
          // a cena para no último frame, que fica como fundo
          current = total - 1;
          draw(current);
          ended = true;
          setPlaying(false);
          return;
        }
        start = now;
        target = 0;
      }
      if (imgs[target]) {
        current = target;
        if (current !== shown) draw(current);
      } else {
        // ainda baixando: segura o quadro e o relógio (buffer)
        start = now - (current / fps) * 1000;
      }
      raf = requestAnimationFrame(tick);
    };
    const play = (): void => {
      if (raf || ended || reduced || pausedRef.current || !liberadoRef.current) return;
      start = 0;
      setPlaying(true);
      raf = requestAnimationFrame(tick);
    };
    const stop = (): void => {
      cancelAnimationFrame(raf);
      raf = 0;
      setPlaying(false);
    };

    ctrl.current = {
      play: () => {
        if (visible) play();
      },
      stop,
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) play();
      else stop();
    });
    const onVisibility = (): void => {
      if (document.hidden) stop();
      else if (visible) play();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // 1º frame já; o resto em segundo plano, em ordem, com concorrência limitada
    void load(first, true).then(() => {
      if (!alive) return;
      draw(first);
      if (reduced) return;
      let next = 0;
      const worker = async (): Promise<void> => {
        while (alive && next < total) {
          const i = next++;
          if (!imgs[i]) await load(i);
        }
      };
      for (let k = 0; k < concorrencia; k++) void worker();
      io.observe(cv);
    });

    return () => {
      alive = false;
      ctrl.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [urls, fps, loop, frameEstatico, concorrencia, reduced]);

  // a entrada do hero foi liberada: começa a tocar
  useEffect(() => {
    liberadoRef.current = liberado;
    if (liberado) ctrl.current?.play();
  }, [liberado]);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) ctrl.current?.stop();
    else ctrl.current?.play();
  }, [paused]);

  const a11y = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true as const };
  return (
    <>
      <canvas ref={canvasRef} className={cx('at-hero-seq', 'at-photo__img', className)} {...a11y} />
      {longa && !reduced && (playing || paused) ? (
        <button
          type="button"
          className="at-btn at-btn--linha at-hero-seq__toggle"
          onClick={() => {
            setPaused((p) => !p);
          }}
        >
          <span>{paused ? rotuloRetomar : rotuloPausar}</span>
        </button>
      ) : null}
    </>
  );
}
