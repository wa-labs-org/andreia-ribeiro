import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import { Photo } from '../Photo';
import { Tag } from '../Tag';
import './Card.css';

export interface CardProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  href: string;
  titulo: ReactNode;
  /** anotação em mono, ex.: "Peça 01 · noiva · 3 provas" */
  meta?: ReactNode;
  /** etiqueta: Sob medida · Ajuste · Madrinha · Noivo · Padrinho · Renda · Tule · Civil */
  tag?: ReactNode;
  /** imagem principal (croqui ou foto) */
  src: string;
  /** a imagem é decorativa no card (o título nomeia a peça); descreva só se acrescentar informação */
  alt?: string;
  modo?: 'fig' | 'img';
  /** vista do molde que desce em elipse no hover (padrão: a mesma imagem sobre papel milimetrado) */
  vistaMolde?: string | false;
  /** peça Casimira: fundo café */
  noite?: boolean;
  /** rótulo do cursor sobre o card */
  cursorLabel?: string;
  tituloAs?: 'h2' | 'h3' | 'h4';
}

/**
 * Card de peça. Hover/foco: a imagem se alonga do ombro, a vista do molde desce em elipse,
 * marcas de corte aparecem e a seta avança 4px. Título e meta estão sempre visíveis.
 */
export function Card({
  titulo,
  meta,
  tag,
  src,
  alt = '',
  modo = 'fig',
  vistaMolde,
  noite = false,
  cursorLabel = 'Ver peça',
  tituloAs: Title = 'h3',
  className,
  ...rest
}: CardProps) {
  const molde = vistaMolde === false ? null : (vistaMolde ?? src);
  return (
    <a {...rest} className={cx('at-card', className)} data-cursor-label={cursorLabel}>
      <div className="at-card__media">
        <Photo src={src} alt={alt} modo={modo} {...(noite ? { variante: 'noite' as const } : {})} />
        {molde ? (
          <Photo className="at-card__alt" src={molde} alt="" modo={modo} variante="molde" textura="molde" />
        ) : null}
        <span className="at-crop" style={noite ? { color: 'var(--at-color-marfim)' } : undefined} />
        {tag ? <Tag className="at-card__tag">{tag}</Tag> : null}
      </div>
      <div className="at-card__body">
        <Title className="at-card__title">{titulo}</Title>
        <Icon name="seta" className="at-card__arrow" />
        {meta ? <p className="at-card__meta at-note">{meta}</p> : null}
      </div>
    </a>
  );
}
