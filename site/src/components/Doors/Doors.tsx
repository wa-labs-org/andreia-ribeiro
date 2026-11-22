import { useRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cssVars, cx } from '../../lib/cx';
import { useReveal } from '../../motion/useReveal';
import { Icon } from '../Icon';
import { useRegistro } from '../Registro';
import './Doors.css';

export interface DoorsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Dois painéis lado a lado (Seda / Casimira), 88vh. No desktop o painel em foco se alarga. */
export function Doors({ className, children, ...rest }: DoorsProps) {
  return (
    <div {...rest} className={cx('at-doors', className)}>
      {children}
    </div>
  );
}

export interface DoorProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  href: string;
  registro: 'seda' | 'casimira';
  /** anotação do topo, ex.: "Registro Seda" */
  rotulo?: ReactNode;
  /** Display L, uma palavra em <em> */
  titulo: ReactNode;
  texto?: ReactNode;
  /** texto da ação, ex.: "Ver vestidos" */
  acao: ReactNode;
  /** croqui ao fundo (decorativo) */
  fig?: string;
  cursorLabel?: string;
  /** posição na sequência da queda (a segunda porta cai 120ms depois) */
  index?: number;
}

/** Porta de coleção: cai como tecido (queda) e abre como cortina no hover. */
export function Door({
  registro,
  rotulo,
  titulo,
  texto,
  acao,
  fig,
  cursorLabel = 'Abrir',
  index,
  className,
  style,
  ...rest
}: DoorProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const isIn = useReveal(ref, { observeParent: true });
  useRegistro(ref, registro);
  return (
    <a
      {...rest}
      ref={ref}
      className={cx('at-door', `at-door--${registro}`, isIn && 'is-in', className)}
      data-registro={registro === 'casimira' ? 'casimira' : undefined}
      data-cursor-label={cursorLabel}
      data-reveal="queda"
      style={cssVars({ '--i': index }, style)}
    >
      {fig ? <img className="at-door__fig" src={fig} alt="" loading="lazy" decoding="async" /> : null}
      <div className="at-door__top">{rotulo ? <span className="at-note">{rotulo}</span> : null}</div>
      <div className="at-door__bottom">
        <h2 className="at-display-l">{titulo}</h2>
        {texto ? <p className="at-body at-measure-narrow">{texto}</p> : null}
        <span className="at-btn at-btn--linha">
          <span>{acao}</span>
          <Icon name="seta" size="s" className="at-btn__seta" />
        </span>
      </div>
    </a>
  );
}
