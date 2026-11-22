import type { RefObject } from 'react';
import { clamp } from '../lib/cx';
import type { ScrollFrame } from './rafLoop';
import { useScrollFrame } from './useScrollFrame';

export type ProgressMode =
  /** seção fixada: 0 quando o topo encosta no topo da viewport, 1 quando a base chega à base */
  | 'pin'
  /** linha que acompanha: começa a 85% da viewport, termina a 90% da altura da seção */
  | 'scrub'
  /** documento inteiro (fita métrica) */
  | 'page';

export function progressOf(mode: ProgressMode, el: Element | null, f: ScrollFrame): number {
  if (mode === 'page') {
    const max = document.documentElement.scrollHeight - f.vh;
    return max > 0 ? clamp(f.y / max, 0, 1) : 0;
  }
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  if (mode === 'pin') return clamp(-r.top / Math.max(1, r.height - f.vh), 0, 1);
  return clamp((f.vh * 0.85 - r.top) / (r.height * 0.9), 0, 1);
}

/** Chama onProgress(p) a cada quadro de rolagem, pela rAF compartilhada. */
export function useScrollProgress(
  ref: RefObject<Element | null> | null,
  onProgress: (p: number, frame: ScrollFrame) => void,
  { mode = 'scrub', enabled = true }: { mode?: ProgressMode; enabled?: boolean } = {},
): void {
  useScrollFrame((f) => {
    onProgress(progressOf(mode, ref?.current ?? null, f), f);
  }, enabled);
}
