import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import './Tag.css';

/** Variações de etiqueta previstas no design system (06-componentes · Card de peça). */
export const TAG_VARIACOES = [
  'Sob medida',
  'Ajuste',
  'Madrinha',
  'Noivo',
  'Padrinho',
  'Renda',
  'Tule',
  'Civil',
] as const;
export type TagVariacao = (typeof TAG_VARIACOES)[number];

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/** Etiqueta-pílula: a etiqueta de papel presa à peça na arara. */
export function Tag({ className, children, ...rest }: TagProps) {
  return (
    <span {...rest} className={cx('at-tag', className)}>
      {children}
    </span>
  );
}
