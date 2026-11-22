import type { AnchorHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import './SkipLink.css';

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** destino: o id do <main> */
  href?: string;
}

/** Primeiro foco da página. */
export function SkipLink({
  href = '#conteudo',
  className,
  children = 'Pular para o conteúdo',
  ...rest
}: SkipLinkProps) {
  return (
    <a {...rest} href={href} className={cx('at-skip', className)}>
      {children}
    </a>
  );
}
