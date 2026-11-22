import { useEffect, useRef } from 'react';
import { FINE_POINTER, useMediaQuery } from '../../motion/useMediaQuery';
import { useReducedMotion } from '../../motion/useReducedMotion';
import './Cursor.css';

const ACTIVE = 'a, button, label, [role="button"], input, select, textarea';
const NOITE = '[data-registro="casimira"], .at-header[data-theme="noite"], .at-hero--tela-cheia';
const N = 22;

function goldRgb(): string {
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--at-color-dourado').trim();
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m?.[1] || !m[2] || !m[3]) return '185,152,71';
  return [m[1], m[2], m[3]].map((h) => parseInt(h, 16)).join(',');
}

/**
 * Agulha e linha. O ponteiro do sistema continua visível (acessibilidade): um ponto segue o mouse,
 * um anel segue com atraso (lerp .2) e cresce sobre links/botões ou vira etiqueta em [data-cursor-label].
 * Em [data-cursor-thread] uma linha tracejada dourada de 22 pontos é puxada atrás do cursor (canvas).
 * Só com (hover: hover) and (pointer: fine); desligado em toque e no modo reduzido.
 * O loop para quando não há movimento.
 */
export function Cursor() {
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useReducedMotion();
  const active = fine && !reduced;
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const cv = canvasRef.current;
    const ring = box?.firstElementChild as HTMLElement | null | undefined;
    const dot = box?.lastElementChild as HTMLElement | null | undefined;
    const label = ring?.firstElementChild as HTMLElement | null | undefined;
    const ctx = cv?.getContext('2d');
    if (!active || !box || !cv || !ring || !dot || !label || !ctx) return;

    const html = document.documentElement;
    const rgb = goldRgb();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let visible = false;
    let raf = 0;
    let threadOn = false;
    let alpha = 0;
    const pts = Array.from({ length: N }, () => ({ x: -100, y: -100 }));

    const size = (): void => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      cv.width = vw * dpr;
      cv.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const loop = (): void => {
      raf = 0;
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx.toFixed(2)}px,${ry.toFixed(2)}px) translate(-50%,-50%)`;
      alpha += ((threadOn ? 1 : 0) - alpha) * 0.08;
      ctx.clearRect(0, 0, vw, vh);
      let moving = Math.abs(mx - rx) + Math.abs(my - ry) > 0.3;
      const head = pts[0];
      const tail = pts[N - 1];
      if (alpha > 0.01 && head && tail) {
        head.x += (mx - head.x) * 0.5;
        head.y += (my - head.y) * 0.5;
        for (let k = 1; k < N; k++) {
          const p = pts[k];
          const prev = pts[k - 1];
          if (!p || !prev) continue;
          p.x += (prev.x - p.x) * 0.38;
          p.y += (prev.y - p.y) * 0.38;
        }
        ctx.beginPath();
        ctx.moveTo(head.x, head.y);
        for (let j = 1; j < N - 1; j++) {
          const a = pts[j];
          const b = pts[j + 1];
          if (!a || !b) continue;
          ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = `rgba(${rgb},${(alpha * 0.9).toFixed(3)})`;
        ctx.stroke();
        const t = Math.abs(head.x - tail.x) + Math.abs(head.y - tail.y);
        moving = moving || t > 0.5 || Math.abs(alpha - (threadOn ? 1 : 0)) > 0.01;
      } else {
        for (const p of pts) {
          p.x = mx;
          p.y = my;
        }
      }
      if (moving) raf = requestAnimationFrame(loop);
    };
    const kick = (): void => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx;
        ry = my;
        html.classList.add('at-has-cursor');
      }
      kick();
    };
    const onOver = (e: PointerEvent): void => {
      const t = e.target instanceof Element ? e.target : null;
      const lab = t?.closest<HTMLElement>('[data-cursor-label]');
      box.classList.toggle('is-label', !!lab);
      label.textContent = lab?.dataset.cursorLabel ?? '';
      box.classList.toggle('is-hover', !lab && !!t?.closest(ACTIVE));
      box.classList.toggle('is-noite', !!t?.closest(NOITE));
      threadOn = !!t?.closest('[data-cursor-thread]');
      kick();
    };
    const onDown = (): void => {
      box.classList.add('is-down');
    };
    const onUp = (): void => {
      box.classList.remove('is-down');
    };
    const onLeave = (): void => {
      visible = false;
      threadOn = false;
      html.classList.remove('at-has-cursor');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', size, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', size);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      html.classList.remove('at-has-cursor');
      ctx.clearRect(0, 0, vw, vh);
    };
  }, [active]);

  if (!active) return null;
  return (
    <>
      <div ref={boxRef} className="at-cursor" aria-hidden="true">
        <div className="at-cursor__ring">
          <span className="at-cursor__label" />
        </div>
        <div className="at-cursor__dot" />
      </div>
      <canvas ref={canvasRef} className="at-cursor-thread" aria-hidden="true" />
    </>
  );
}
