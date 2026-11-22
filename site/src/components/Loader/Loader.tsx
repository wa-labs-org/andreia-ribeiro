import { useContext } from 'react';
import { cx } from '../../lib/cx';
import { LoaderContext } from './LoaderContext';
import './Loader.css';

export interface LoaderProps {
  /** 0–1. Dentro da Curtain, vem dela; fora, informe aqui. */
  progress?: number;
  /** microcopy de referência */
  rotulo?: string;
  /** a fita mede de 000 a 100 nesta unidade */
  unidade?: string;
  className?: string;
}

/**
 * "Enfiar a agulha": agulha estática, a linha dourada passa pelo buraco, a fita mede 000 → 100 cm.
 * Use dentro de <Curtain loader={<Loader />}>: só aparece na primeira visita da sessão.
 */
export function Loader({ progress, rotulo = 'Enfiando a agulha', unidade = 'cm', className }: LoaderProps) {
  const fromCurtain = useContext(LoaderContext);
  const p = progress ?? fromCurtain ?? 0;
  return (
    <div className={cx('at-loader', className)}>
      <svg
        className="at-loader__needle"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 86 74 26" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <path
          d="M72.2 22.6a3.6 3.6 0 0 1 5.1 5.1"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          className="at-loader__thread"
          pathLength={1}
          d="M4 62C16 44 40 58 54 44S70 18 76 25s14 10 20 22"
        />
      </svg>
      <span className="at-note at-loader__count">
        {String(Math.round(p * 100)).padStart(3, '0')} {unidade}
      </span>
      <span className="at-label">{rotulo}</span>
    </div>
  );
}
