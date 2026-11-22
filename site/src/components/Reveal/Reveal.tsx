import {
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cssVars, cx } from '../../lib/cx';
import { useLines } from '../../motion/useLines';
import { useReveal } from '../../motion/useReveal';
import './Reveal.css';

export type RevealTipo = 'linhas' | 'tule' | 'queda' | 'corte' | 'pecas' | 'fade' | 'costura';

export type RevealTag =
  | 'div'
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'blockquote'
  | 'figure'
  | 'section'
  | 'article'
  | 'ul'
  | 'ol'
  | 'li'
  | 'hr';

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  tipo: RevealTipo;
  as?: RevealTag;
  /** atraso em ms (--at-delay), para coreografar camadas */
  delay?: number;
  /** índice na sequência (--i), ex.: segunda porta */
  index?: number;
  /** Linhas manuais (controle da quebra): cada item vira .at-line > span. Só em tipo="linhas". */
  linhas?: readonly ReactNode[];
  children?: ReactNode;
}

/** Revelações que recortam o próprio elemento: observadas pelo pai. */
const SELF_CLIPPING: ReadonlySet<RevealTipo> = new Set(['queda', 'corte', 'costura']);

/**
 * Revelação declarativa: `<Reveal as="h2" tipo="linhas">Quatro encontros, <em>uma peça</em>.</Reveal>`.
 * Sem JS (sem html.at-js) todo o conteúdo aparece; o JS só adiciona .is-in.
 */
export function Reveal({
  tipo,
  as = 'div',
  delay,
  index,
  linhas,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);
  const isIn = useReveal(ref, { observeParent: SELF_CLIPPING.has(tipo) });
  const split = useLines(children, ref, tipo === 'linhas' && !linhas);

  // peças: índice por fileira, parando no 6º (calculado uma vez, depois do layout)
  useLayoutEffect(() => {
    if (tipo !== 'pecas' || !ref.current) return;
    const rows = new Map<number, HTMLElement[]>();
    ref.current.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((it) => {
      const top = Math.round(it.getBoundingClientRect().top + window.scrollY);
      const row = rows.get(top) ?? [];
      row.push(it);
      rows.set(top, row);
    });
    rows.forEach((row) => {
      row
        .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .forEach((it, i) => {
          it.style.setProperty('--i', String(Math.min(i, 5)));
        });
    });
  }, [tipo]);

  let content: ReactNode = children;
  if (tipo === 'linhas') {
    content = linhas
      ? linhas.map((linha, i) => (
          // a ordem das linhas é a identidade delas
          <span className="at-line" key={i}>
            <span style={cssVars({ '--i': i })}>{linha}</span>
          </span>
        ))
      : split;
  }

  const Tag: ElementType = as;
  return (
    <Tag
      {...rest}
      ref={setRef}
      data-reveal={tipo}
      className={cx(className, isIn && 'is-in')}
      style={cssVars({ '--at-delay': delay === undefined ? undefined : `${delay}ms`, '--i': index }, style)}
    >
      {as === 'hr' ? undefined : content}
    </Tag>
  );
}

export interface RevealItemProps extends HTMLAttributes<HTMLElement> {
  as?: Exclude<RevealTag, 'hr'>;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Item de `<Reveal tipo="pecas">`: sobe 40px em sequência, cada um quando entra na viewport. */
export function RevealItem({ as = 'div', className, children, ...rest }: RevealItemProps) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);
  const seen = useReveal(ref);
  const Tag: ElementType = as;
  return (
    <Tag {...rest} ref={setRef} data-reveal-item="" className={cx(className, seen && 'is-in')}>
      {children}
    </Tag>
  );
}
