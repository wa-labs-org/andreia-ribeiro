import type { RefObject } from 'react';
import type { ScrollFrame } from './rafLoop';
import { DESKTOP, useMediaQuery } from './useMediaQuery';
import { useReducedMotion } from './useReducedMotion';
import { useScrollProgress } from './useScrollProgress';

/**
 * Seção fixada (manequim, arara). Só ativa no desktop e fora do modo reduzido;
 * fora disso a seção vira fluxo normal (o CSS cuida do layout).
 * Devolve se a fixação está ativa.
 */
export function usePin(
  ref: RefObject<Element | null>,
  onProgress: (p: number, frame: ScrollFrame) => void,
  { enabled = true, query = DESKTOP }: { enabled?: boolean; query?: string } = {},
): boolean {
  const desk = useMediaQuery(query);
  const reduced = useReducedMotion();
  const active = enabled && desk && !reduced;
  useScrollProgress(ref, onProgress, { mode: 'pin', enabled: active });
  return active;
}
