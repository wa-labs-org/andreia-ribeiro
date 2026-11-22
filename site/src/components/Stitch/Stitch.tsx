import { useId, useRef, type RefObject, type SVGProps } from 'react';
import { cssVars, cx } from '../../lib/cx';
import { useStitch, type StitchMode } from '../../motion/useStitch';
import './Stitch.css';

export type StitchVariante = 'alinhavo' | 'corrido' | 'pesponto';

export interface StitchProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'ref' | 'mode' | 'd'> {
  /** um ou mais traços (atributo d) */
  d: string | readonly string[];
  viewBox: string;
  /** alinhavo 14/8 (padrão) · corrido 6/5 · pesponto 3/3 */
  variante?: StitchVariante;
  /** reveal: desenha ao entrar na viewport (1800ms, curva linha) · scrub: acompanha a rolagem */
  modo?: StitchMode;
  /** atraso em ms (--at-delay) */
  delay?: number;
  /** seção cuja rolagem desenha o traço no modo scrub (padrão: o [data-scrub-host] mais próximo) */
  hostRef?: RefObject<Element | null>;
}

const SEAM: Record<StitchVariante, string> = {
  alinhavo: 'at-thread__seam',
  corrido: 'at-thread__seam--corrido',
  pesponto: 'at-thread__seam--pesponto',
};

/** Costura desenhada por máscara (pathLength=1): a agulha percorre o traço, os pontos não surgem um a um. */
export function Stitch({
  d,
  viewBox,
  variante = 'alinhavo',
  modo = 'reveal',
  delay,
  hostRef,
  className,
  style,
  ...rest
}: StitchProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const masks = useRef<(SVGPathElement | null)[]>([]);
  const { isIn, maskWidth } = useStitch(svgRef, masks, { modo, ...(hostRef ? { hostRef } : {}) });
  const paths = typeof d === 'string' ? [d] : d;

  return (
    <svg
      {...rest}
      ref={svgRef}
      className={cx('at-thread', className, isIn && 'is-in')}
      data-stitch={modo === 'scrub' ? 'scrub' : ''}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      style={cssVars({ '--at-delay': delay === undefined ? undefined : `${delay}ms` }, style)}
    >
      <defs>
        {paths.map((p, i) => (
          <mask
            key={p}
            id={`at-stitch-${id}-${i}`}
            maskUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <path
              ref={(el) => {
                masks.current[i] = el;
              }}
              className="at-stitch-mask"
              d={p}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={maskWidth}
            />
          </mask>
        ))}
      </defs>
      {paths.map((p, i) => (
        <path key={p} className={SEAM[variante]} d={p} mask={`url(#at-stitch-${id}-${i})`} />
      ))}
    </svg>
  );
}
