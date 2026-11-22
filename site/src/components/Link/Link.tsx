import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import './Link.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

/** Link no texto: bronze, sublinhado 1px que vira tracejado no hover. */
export function Link({ className, children, ...rest }: LinkProps) {
  return (
    <a {...rest} className={cx('at-link', className)}>
      {children}
    </a>
  );
}

export interface NavLinkProps extends LinkProps {
  /** página atual: aria-current="page" e o ponto corrido fica desenhado */
  current?: boolean;
}

/** Link de navegação: ponto corrido que se desenha da esquerda no hover/foco. */
export function NavLink({ current = false, className, children, ...rest }: NavLinkProps) {
  return (
    <a {...rest} className={cx('at-navlink', className)} aria-current={current ? 'page' : undefined}>
      {children}
    </a>
  );
}
