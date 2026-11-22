import type { HTMLAttributes, ReactNode } from 'react';
import { cssVars, cx } from '../../lib/cx';
import './Swatch.css';

/** Intensidade do brilho por material (06-componentes). */
export const SHEEN = { crepe: 0.25, cetim: 0.7, tule: 0.15 } as const;
export type SwatchMaterial = keyof typeof SHEEN;

export interface SwatchesProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export function Swatches({ className, children, ...rest }: SwatchesProps) {
  return (
    <ul {...rest} className={cx('at-swatches', className)} role="list">
      {children}
    </ul>
  );
}

export interface SwatchProps extends Omit<HTMLAttributes<HTMLLIElement>, 'color'> {
  /** cor do tecido (--sw) */
  cor: string;
  /** material (define --sheen) ou intensidade direta 0–1 */
  material?: SwatchMaterial;
  sheen?: number;
  textura?: 'tule' | 'risca';
  nome: ReactNode;
  nota?: ReactNode;
}

/** Amostra com bainha picotada e brilho que atravessa no hover. */
export function Swatch({ cor, material, sheen, textura, nome, nota, className, ...rest }: SwatchProps) {
  const s = sheen ?? (material ? SHEEN[material] : undefined);
  return (
    <li {...rest} className={cx('at-swatch', className)}>
      <div
        className={cx('at-swatch__cloth', textura && `at-tex-${textura}`)}
        style={cssVars({ '--sw': cor, '--sheen': s })}
      />
      <p className="at-h4">{nome}</p>
      {nota ? <p className="at-note">{nota}</p> : null}
    </li>
  );
}
