import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { casimiraElements } from '../../motion/registroRegistry';
import { useScrollFrame } from '../../motion/useScrollFrame';
import './Header.css';

export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** esquerda no desktop: coleções (HeaderNav). Some no mobile. */
  start?: ReactNode;
  /** marca: ao centro no desktop, à esquerda no mobile */
  brand: ReactNode;
  /** direita: CTA (Button tamanho="s" className="at-header__cta") + MenuToggle */
  end?: ReactNode;
  /** desliga a reação à rolagem (demonstração estática) */
  estatico?: boolean;
}

interface HeaderState {
  scrolled: boolean;
  hidden: boolean;
  noite: boolean;
}

/**
 * Fixo, 64/80px. Some ao descer (48px acumulados) e volta ao subir; véu de tule depois de 24px;
 * vira data-theme="noite" sobre seções Casimira (registradas por <Registro tipo="casimira">).
 */
export function Header({ start, brand, end, estatico = false, className, ...rest }: HeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const acc = useRef(0);
  const [state, setState] = useState<HeaderState>({ scrolled: false, hidden: false, noite: false });

  useScrollFrame(({ y, dy }) => {
    const h = ref.current;
    if (!h) return;
    let hidden = state.hidden;
    if (!document.body.classList.contains('at-menu-open')) {
      acc.current = dy > 0 === acc.current > 0 ? acc.current + dy : dy;
      if (y < 120 || acc.current < -24) hidden = false;
      else if (acc.current > 48) hidden = true;
    }
    const mid = h.offsetHeight / 2;
    let noite = false;
    for (const el of casimiraElements()) {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        noite = true;
        break;
      }
    }
    const scrolled = y > 24;
    if (scrolled !== state.scrolled || hidden !== state.hidden || noite !== state.noite)
      setState({ scrolled, hidden, noite });
  }, !estatico);

  return (
    <header
      {...rest}
      ref={ref}
      className={cx('at-header', state.scrolled && 'is-scrolled', state.hidden && 'is-hidden', className)}
      data-theme={state.noite ? 'noite' : undefined}
    >
      <div className="at-header__inner">
        <div className="at-header__start">{start}</div>
        {brand}
        <div className="at-header__end">{end}</div>
      </div>
    </header>
  );
}

export interface HeaderNavProps extends HTMLAttributes<HTMLElement> {
  /** rótulo da navegação, ex.: "Coleções" */
  'aria-label': string;
  children: ReactNode;
}

/** Navegação do lado esquerdo do header (NavLinks). */
export function HeaderNav({ className, children, ...rest }: HeaderNavProps) {
  return (
    <nav {...rest} className={cx('at-header__nav', className)}>
      {children}
    </nav>
  );
}
