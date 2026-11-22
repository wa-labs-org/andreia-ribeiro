import type { AnchorHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import './Brand.css';

export interface BrandProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  href: string;
  /** nome em Fraunces, ex.: "Andreia Ribeiro" */
  nome: string;
  /** rótulo pequeno, ex.: "Atelier · sob medida" (some abaixo de 480px) */
  complemento?: string;
  /** nome acessível do link, ex.: "Andreia Ribeiro Atelier — início" */
  'aria-label': string;
}

/** Monograma (botão pregado com linha dourada em X, gira 90° no hover) + nome. */
export function Brand({ nome, complemento, className, ...rest }: BrandProps) {
  return (
    <a {...rest} className={cx('at-brand', className)}>
      <svg
        className="at-brand__mono"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="24" cy="24" r="20" />
        <circle cx="24" cy="24" r="15" strokeDasharray="2.4 2.4" />
        <circle cx="19.5" cy="19.5" r="2" />
        <circle cx="28.5" cy="19.5" r="2" />
        <circle cx="19.5" cy="28.5" r="2" />
        <circle cx="28.5" cy="28.5" r="2" />
        <path
          d="M20.9 20.9 27.1 27.1M27.1 20.9 20.9 27.1"
          style={{ stroke: 'var(--at-color-dourado)' }}
          strokeWidth={1.5}
        />
      </svg>
      <span className="at-brand__name">
        <b>{nome}</b>
        {complemento ? <small>{complemento}</small> : null}
      </span>
    </a>
  );
}
