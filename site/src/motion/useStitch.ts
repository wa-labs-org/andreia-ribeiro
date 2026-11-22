import { useLayoutEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useReveal } from './useReveal';
import { useScrollProgress } from './useScrollProgress';

export type StitchMode = 'reveal' | 'scrub';

/**
 * Costura por máscara (pathLength=1).
 *  - reveal: devolve isIn quando o SVG entra na viewport (o CSS leva o dashoffset 1 → 0);
 *  - scrub: o traço acompanha a rolagem do host, sem easing (a mão do leitor é a agulha).
 * Devolve também a espessura do traço da máscara, compensando a escala do viewBox.
 */
export function useStitch(
  svgRef: RefObject<SVGSVGElement | null>,
  masks: RefObject<(SVGPathElement | null)[]>,
  { modo = 'reveal', hostRef }: { modo?: StitchMode; hostRef?: RefObject<Element | null> } = {},
): { isIn: boolean; maskWidth: number } {
  const reduced = useReducedMotion();
  const isIn = useReveal(svgRef, { disabled: modo === 'scrub' });
  const [maskWidth, setMaskWidth] = useState(8);

  useLayoutEffect(() => {
    const m = svgRef.current?.getScreenCTM();
    if (m?.a) setMaskWidth(8 / m.a);
  }, [svgRef]);

  const host: RefObject<Element | null> = {
    get current() {
      const own = svgRef.current;
      return hostRef?.current ?? own?.closest('[data-scrub-host]') ?? own;
    },
  };

  useScrollProgress(
    host,
    (p) => {
      const off = (1 - (reduced ? 1 : p)).toFixed(4);
      masks.current?.forEach((m) => {
        if (m) m.style.strokeDashoffset = off;
      });
    },
    { mode: 'scrub', enabled: modo === 'scrub' },
  );

  return { isIn, maskWidth };
}
