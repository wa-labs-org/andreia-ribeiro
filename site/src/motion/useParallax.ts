import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useScrollFrame } from './useScrollFrame';

/** A imagem desliza dentro da moldura (8–12%). Desligado no modo reduzido. */
export function useParallax(ref: RefObject<HTMLElement | null>, k = 0.12, enabled = true): void {
  const reduced = useReducedMotion();
  const active = enabled && !reduced;

  useEffect(() => {
    if (!active && ref.current) ref.current.style.transform = '';
  }, [active, ref]);

  useScrollFrame((f) => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const r = host.getBoundingClientRect();
    if (r.bottom < -100 || r.top > f.vh + 100) return;
    const off = (r.top + r.height / 2 - f.vh / 2) * -k;
    el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
  }, active);
}
