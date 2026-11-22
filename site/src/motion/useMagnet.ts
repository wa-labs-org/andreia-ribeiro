import { useEffect, type RefObject } from 'react';
import { FINE_POINTER, useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';

/** O botão segue o cursor até 8px e volta com balanço. Só com mouse, fora do modo reduzido. */
export function useMagnet(ref: RefObject<HTMLElement | null>, enabled = true): void {
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useReducedMotion();
  const active = enabled && fine && !reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let t = 0;
    const move = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / r.width;
      const y = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.transform = `translate(${(x * 8).toFixed(1)}px,${(y * 8).toFixed(1)}px)`;
    };
    const leave = (): void => {
      el.style.transition = 'transform var(--at-dur-alinhavo) var(--at-ease-balanco)';
      el.style.transform = '';
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        el.style.transition = '';
      }, 500);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      window.clearTimeout(t);
      el.style.transform = '';
      el.style.transition = '';
    };
  }, [active, ref]);
}
