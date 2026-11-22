import type { CSSProperties } from 'react';
import { cx } from '../../lib/cx';
import './Skeleton.css';

export interface SkeletonProps {
  /** proporção, ex.: "3 / 4" (imagem de card) */
  ratio?: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

/** Esqueleto em papel molde com brilho de cetim (estático no modo reduzido). Marque o contêiner com aria-busy. */
export function Skeleton({ ratio, width, height, className }: SkeletonProps) {
  return (
    <div
      className={cx('at-skeleton', className)}
      style={{ aspectRatio: ratio, width, height }}
      aria-hidden="true"
    />
  );
}
